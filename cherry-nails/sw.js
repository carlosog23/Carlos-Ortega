// Cherry Nails: usa la red cuando hay y guarda copia para abrir sin internet
const C='cherry-nails-v5';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png','icon-512.png'])))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const k=r.clone();caches.open(C).then(c=>c.put(e.request,k))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});

/* ---------- Recordatorios una hora antes ----------
   El servidor solo «despierta» al celular; aquí se lee qué cita toca (guardada por la app en este celular) y se muestra el aviso. */
function recDB(){return new Promise((ok,no)=>{const r=indexedDB.open('cherry-nails-rec',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function recLee(db,k){return new Promise(ok=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(undefined)})}
function recPon(db,k,v){return new Promise(ok=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>ok();t.onerror=()=>ok()})}
async function recAvisar(){
  const ic={icon:'icon-192.png',badge:'icon-192.png'},ahora=Date.now();let db=null,n=0;
  try{db=await recDB();
    const prueba=await recLee(db,'prueba');
    if(prueba&&ahora-prueba<3*60000){await recPon(db,'prueba',0);n++;await self.registration.showNotification('Cherry Nails · aviso de prueba',Object.assign({body:'Los recordatorios funcionan. Así llegará el aviso una hora antes de cada cita.',tag:'cn-prueba'},ic))}
    const d=await recLee(db,'lista')||{},ya=await recLee(db,'avisadas')||{};
    for(const c of (d.lista||[])){const falta=(c.ini-ahora)/60000;
      if(falta<5||falta>75||ya[c.id]===c.ini)continue;
      ya[c.id]=c.ini;n++;
      await self.registration.showNotification('Cita en 1 hora · '+c.hora,Object.assign({body:c.nombre+(c.serv?' — '+c.serv:'')+'\n'+(c.wa?'Toca para mandarle su recordatorio por WhatsApp.':'No tiene WhatsApp guardado.'),tag:'cn-'+c.id,requireInteraction:true,data:{id:c.id,wa:c.wa}},ic))}
    Object.keys(ya).forEach(k=>{if(ya[k]<ahora-2*86400000)delete ya[k]});await recPon(db,'avisadas',ya);
  }catch(e){}
  if(db)try{db.close()}catch(e){}
  if(!n)await self.registration.showNotification('Cherry Nails',Object.assign({body:'Revisa tu agenda: tienes una cita próxima.',tag:'cn-agenda'},ic));
}
self.addEventListener('push',e=>e.waitUntil(recAvisar()));
self.addEventListener('notificationclick',e=>{
  const d=e.notification.data||{};e.notification.close();
  const ios=/iphone|ipad|ipod/i.test(self.navigator.userAgent);
  e.waitUntil((async()=>{
    if(d.wa&&!ios){try{return await self.clients.openWindow(d.wa)}catch(x){}}
    const url=self.registration.scope+(d.id?'#rec='+encodeURIComponent(d.id):'');
    const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of cs){if(c.url.indexOf(self.registration.scope)===0){try{await c.focus();if(d.id)c.postMessage({rec:d.id});return}catch(x){}}}
    return self.clients.openWindow(url);
  })());
});
