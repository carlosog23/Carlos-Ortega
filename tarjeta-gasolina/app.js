/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP). Todos los derechos reservados.
   Registro, alertas de despacho (Firebase), mapa y avisos. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const H=36e5, VIGENCIA=6*H, VENTANA=24*H;
const APP_URL=location.origin+location.pathname.replace(/index\.html$/,'');
const DEMO=/[?&]demo\b/.test(location.search);
const iniciales=n=>String(n||'').replace(/^(mtr[oa]\.?|profr?a?\.?|lic\.?|dr[a]?\.?)\s+/i,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
const hace=ms=>{const m=Math.max(0,Math.round((Date.now()-ms)/6e4));if(m<1)return'hace un momento';if(m<60)return'hace '+m+' min';const h=Math.floor(m/60);if(h<24)return'hace '+h+' h'+(m%60&&h<3?' '+(m%60)+' min':'');return'hace '+Math.floor(h/24)+' d'};
const hora=ms=>new Date(ms).toLocaleTimeString('es-MX',{hour:'numeric',minute:'2-digit'});
const dist=(a,b,c,d)=>{const R=6371e3,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const fdist=m=>m<1000?Math.round(m/10)*10+' m':(m/1000).toLocaleString('es-MX',{maximumFractionDigits:m<10000?1:0})+' km';
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)}
const ic=id=>'<svg class="i"><use href="#i-'+id+'"/></svg>';
const conTiempo=(p,ms,msg)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(Object.assign(new Error(msg||'tiempo'),{code:'timeout'})),ms))]);

/* ================= Perfil (registro) ================= */
const LSP='tarjetaGasolina.perfil';
let perfil=null;try{perfil=JSON.parse(localStorage.getItem(LSP)||'null')}catch(e){}
function guardarPerfil(p){perfil=p;try{localStorage.setItem(LSP,JSON.stringify(p))}catch(e){}}

function mostrarRegistro(editar){
  $('#registro').hidden=false;$('#app').hidden=true;window.scrollTo(0,0);
  $('#regTit').textContent=editar?'Editar mis datos':'Regístrate para entrar';
  $('#rBtn').textContent=editar?'Guardar cambios':'Entrar';
  $('#rCancel').hidden=!editar;
  if(perfil){$('#rNombre').value=perfil.nombre||'';$('#rCargo').value=perfil.cargo||'';$('#rMun').value=perfil.municipio||'';$('#rZona').value=perfil.zona||'';$('#rTel').value=perfil.whatsapp||''}
}
$('#rCancel').onclick=()=>{$('#registro').hidden=true;$('#app').hidden=false;irA('perfil')};
$('#fReg').addEventListener('submit',e=>{
  e.preventDefault();
  const p={nombre:$('#rNombre').value.trim().replace(/\s+/g,' '),cargo:$('#rCargo').value,municipio:$('#rMun').value,zona:$('#rZona').value.trim(),whatsapp:$('#rTel').value.replace(/\D/g,'')};
  let err='';
  if(p.nombre.split(' ').length<2||p.nombre.length<6)err='Escribe tu nombre completo.';
  else if(!p.cargo)err='Elige tu cargo.';else if(!p.municipio)err='Elige tu municipio.';else if(!p.zona)err='Escribe tu zona escolar.';
  else if(p.whatsapp&&p.whatsapp.length!==10&&p.whatsapp.length!==12)err='El WhatsApp debe tener 10 dígitos.';
  $('#rErr').textContent=err;$('#rErr').hidden=!err;if(err)return;
  if(/^\d{1,3}$/.test(p.zona))p.zona=p.zona.padStart(3,'0');
  const nuevo=!perfil;p.registrado=(perfil&&perfil.registrado)||Date.now();
  guardarPerfil(p);pintarPerfil();
  $('#registro').hidden=true;$('#app').hidden=false;
  backend.ready.then(b=>b.guardarPerfil(perfil)).catch(()=>{});
  if(nuevo){irA('despacho');toast('¡Bienvenido(a), '+p.nombre.split(' ')[0]+'!')}else{irA('perfil');toast('Datos actualizados')}
});
function pintarPerfil(){
  if(!perfil)return;
  const ini=iniciales(perfil.nombre);
  $('#avTop').textContent=ini;$('#pAv').textContent=ini;
  $('#pNom').textContent=perfil.nombre;$('#pCargo').textContent=perfil.cargo;
  $('#pMun').textContent=perfil.municipio;$('#pZona').textContent=perfil.zona;
  $('#pTel').textContent=perfil.whatsapp?perfil.whatsapp.replace(/^(\d{3})(\d{3})(\d{4})$/,'$1 $2 $3'):'—';
}
$('#pEditar').onclick=()=>mostrarRegistro(true);
$('#avTop').onclick=()=>irA('perfil');

/* ================= Pestañas ================= */
let tabActual='despacho';
function irA(t){
  tabActual=t;
  document.querySelectorAll('[data-tab]').forEach(s=>s.hidden=s.dataset.tab!==t);
  document.querySelectorAll('[data-go]').forEach(b=>b.setAttribute('aria-selected',b.dataset.go===t));
  window.scrollTo({top:0});
  if(t==='despacho')setTimeout(()=>{if(mapa)mapa.invalidateSize();else pintarMapa()},30);
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>irA(b.dataset.go));

/* ================= Notificaciones del teléfono ================= */
let swReg=null;
async function registrarSW(){if(!('serviceWorker'in navigator))return null;try{swReg=await navigator.serviceWorker.register('sw.js');return swReg}catch(e){return null}}
async function pedirPermiso(){
  if(!('Notification'in window))throw Object.assign(new Error('nosoporte'),{code:'nosoporte'});
  const p=await Notification.requestPermission();
  if(p!=='granted')throw Object.assign(new Error('denegado'),{code:'denegado'});
  await registrarSW();
}
async function notificarSistema(t,b,tag){
  if(!('Notification'in window)||Notification.permission!=='granted')return false;
  const opt={body:b,icon:'icon-192.png',badge:'icon-192.png',tag:tag,renotify:true,requireInteraction:true,vibrate:[200,100,200],lang:'es-MX'};
  try{const r=swReg||await registrarSW()||await navigator.serviceWorker.ready;await r.showNotification(t,opt);return true}
  catch(e){try{new Notification(t,opt);return true}catch(e2){return false}}
}

/* ================= Servicio de alertas ================= */
/* Interfaz común: guardarPerfil, escuchar(cb,errCb), crear(a), resolver(id), confirmar(id), activarAvisos(), apagarAvisos(), uid */
function backendFirebase(cfg){
  const V='10.12.2',B='https://www.gstatic.com/firebasejs/'+V+'/';
  const ready=(async()=>{
    const [A,U,F]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
    const app=A.initializeApp(cfg);
    const auth=U.getAuth(app);
    await auth.authStateReady();
    if(!auth.currentUser)await U.signInAnonymously(auth);
    const uid=auth.currentUser.uid;
    let db;try{db=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})})}catch(e){db=F.getFirestore(app)}
    const uRef=F.doc(db,'usuarios',uid);
    return {
      uid,modo:'firebase',
      guardarPerfil:p=>F.setDoc(uRef,{nombre:p.nombre,cargo:p.cargo,municipio:p.municipio,zona:p.zona,whatsapp:p.whatsapp||'',actualizado:Date.now()},{merge:true}),
      escuchar(cb,errCb){
        const q=F.query(F.collection(db,'alertas'),F.where('creadoMs','>=',Date.now()-2*VENTANA),F.orderBy('creadoMs','desc'),F.limit(150));
        return F.onSnapshot(q,s=>cb(s.docs.map(d=>Object.assign({id:d.id,_pend:d.metadata.hasPendingWrites},d.data()))),errCb);
      },
      crear:a=>{const r=F.doc(F.collection(db,'alertas'));const w=F.setDoc(r,Object.assign({},a,{uid,estado:'activa',creadoMs:Date.now(),creado:F.serverTimestamp(),confirman:[]}));return {id:r.id,escrito:w}},
      resolver:(id,quien)=>F.updateDoc(F.doc(db,'alertas',id),{estado:'resuelta',resueltaPor:Object.assign({uid},quien),resueltaEn:Date.now()}),
      confirmar:(id,quien)=>F.updateDoc(F.doc(db,'alertas',id),{confirman:F.arrayUnion(Object.assign({en:Date.now(),uid},quien))}),
      async activarAvisos(){await pedirPermiso();await F.setDoc(uRef,{avisos:true,actualizado:Date.now()},{merge:true});return true},
      apagarAvisos:()=>F.setDoc(uRef,{avisos:false,actualizado:Date.now()},{merge:true})
    };
  })();
  return {ready};
}

function backendDemo(){
  const K='tarjetaGasolina.demo';const subs=[];
  const leer=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')}catch(e){return null}};
  let datos=leer();
  if(!datos){const t=Date.now();datos=[
    {id:'d1',uid:'x1',nombre:'Mtra. Rosa Elena Valdez Ruiz',cargo:'Supervisor(a) escolar',municipio:'San Quintín',zona:'051',whatsapp:'6161234567',gasolinera:'Pemex · Servicio Camalú',lugar:'Camalú, San Quintín',lat:30.8457,lon:-116.0622,estado:'activa',creadoMs:t-38*6e4,comentario:'Dicen que se cayó el sistema desde temprano.',confirman:[{nombre:'Mtro. Jorge Ibarra',en:t-15*6e4}]},
    {id:'d2',uid:'x2',nombre:'Mtro. Luis Fernando Soto',cargo:'Inspector(a) escolar',municipio:'Ensenada',zona:'018',gasolinera:'Arco · Vicente Guerrero',lugar:'Vicente Guerrero, San Quintín',lat:30.7262,lon:-115.9905,estado:'resuelta',resueltaPor:{nombre:'Mtra. Rosa Elena Valdez Ruiz'},resueltaEn:t-2*H,creadoMs:t-4*H,confirman:[]},
    {id:'d3',uid:'x3',nombre:'Mtra. Claudia Herrera',cargo:'Supervisor(a) escolar',municipio:'Ensenada',zona:'032',gasolinera:'Pemex · Maneadero',lugar:'Maneadero, Ensenada',lat:31.7211,lon:-116.5671,estado:'activa',creadoMs:t-9*H,confirman:[]}
  ]}
  const guardar=()=>{try{localStorage.setItem(K,JSON.stringify(datos))}catch(e){}subs.forEach(f=>f(datos.slice().sort((a,b)=>b.creadoMs-a.creadoMs)))};
  const uid='yo';
  return {ready:Promise.resolve({uid,modo:'demo',
    guardarPerfil:()=>Promise.resolve(),
    escuchar(cb){subs.push(cb);setTimeout(()=>cb(datos.slice().sort((a,b)=>b.creadoMs-a.creadoMs)),250);return()=>{}},
    crear(a){const id='d'+Date.now();datos.push(Object.assign({},a,{id,uid,estado:'activa',creadoMs:Date.now(),confirman:[]}));const escrito=new Promise(r=>setTimeout(r,500));escrito.then(guardar);return {id,escrito}},
    resolver(id,quien){const a=datos.find(x=>x.id===id);if(a){a.estado='resuelta';a.resueltaPor=quien;a.resueltaEn=Date.now()}guardar();return Promise.resolve()},
    confirmar(id,quien){const a=datos.find(x=>x.id===id);if(a)a.confirman.push(Object.assign({en:Date.now(),uid},quien));guardar();return Promise.resolve()},
    async activarAvisos(){await pedirPermiso();return true},
    apagarAvisos(){localStorage.removeItem('tarjetaGasolina.avisos');return Promise.resolve()}
  })};
}

const backend=self.FIREBASE_CONFIG?backendFirebase(self.FIREBASE_CONFIG):DEMO?backendDemo():{ready:Promise.reject(Object.assign(new Error('sin configurar'),{code:'sinconfig'}))};
backend.ready.catch(()=>{});

/* ================= Alertas: estado y lista ================= */
let alertas=[],conectado=false,miUbic=null,errorConexion=null;
const estadoDe=a=>a.estado==='resuelta'?'resuelta':(Date.now()-a.creadoMs>VIGENCIA?'vencida':'activa');
const yo=()=>({nombre:perfil.nombre,cargo:perfil.cargo,zona:perfil.zona,municipio:perfil.municipio});

function pintarEstado(){
  const el=$('#estado'),t=$('#estT'),p=$('#estP');
  const act=alertas.filter(a=>estadoDe(a)==='activa');
  const badge=$('#badge');badge.hidden=!act.length;badge.textContent=act.length;
  if(errorConexion){el.dataset.s='off';t.textContent=errorConexion.t;p.textContent=errorConexion.p;return}
  if(!conectado){el.dataset.s='off';t.textContent='Conectando…';p.textContent='Revisando reportes de tus compañeros';return}
  if(!act.length){el.dataset.s='ok';el.querySelector('use').setAttribute('href','#i-shield');t.textContent='Sin reportes de falla';p.textContent='Nadie ha reportado gasolineras sin sistema en las últimas 6 horas.';return}
  el.dataset.s='mal';el.querySelector('use').setAttribute('href','#i-alert');
  t.textContent=act.length===1?'1 gasolinera sin sistema':act.length+' gasolineras sin sistema';
  const mun=[...new Set(act.map(a=>(a.lugar||a.municipio||'').split(',').pop().trim()).filter(Boolean))];
  p.textContent=(mun.length?mun.slice(0,3).join(', ')+' · ':'')+'último reporte '+hace(Math.max(...act.map(a=>a.creadoMs)));
}

function pintarAlertas(){
  const cont=$('#alertas');
  const lista=alertas.filter(a=>Date.now()-a.creadoMs<=VENTANA).sort((a,b)=>{const ea=estadoDe(a)==='activa',eb=estadoDe(b)==='activa';return ea!==eb?(ea?-1:1):b.creadoMs-a.creadoMs});
  $('#cuenta').textContent=lista.length?lista.length+(lista.length===1?' reporte':' reportes'):'';
  if(!conectado){cont.innerHTML=errorConexion?'':'<div class="card vacio"><div class="spin" style="margin:0 auto 8px"></div>Cargando reportes…</div>';return}
  if(!lista.length){cont.innerHTML='<div class="card vacio">'+ic('check')+'<br><b>Todo en orden</b><br>No hay reportes en las últimas 24 horas.</div>';return}
  cont.innerHTML=lista.map(a=>{
    const e=estadoDe(a);
    const tag=e==='activa'?'<span class="tag mal">SIN SISTEMA</span>':e==='resuelta'?'<span class="tag ok">RESTABLECIDO</span>':'<span class="tag ven">SIN CONFIRMAR</span>';
    const d=(miUbic&&a.lat)?' · a '+fdist(dist(miUbic.lat,miUbic.lon,a.lat,a.lon))+' de ti':'';
    const conf=(a.confirman||[]).length;
    let meta='';
    if(e==='resuelta')meta='Restablecido '+hace(a.resueltaEn||a.creadoMs)+(a.resueltaPor&&a.resueltaPor.nombre?' · avisó '+esc(a.resueltaPor.nombre):'');
    else if(e==='vencida')meta='Reporte de hace más de 6 horas; puede que ya haya sistema.';
    if(conf)meta=(meta?meta+' · ':'')+(conf===1?'1 compañero confirmó':conf+' compañeros confirmaron')+' que sigue sin sistema';
    const mapa=a.lat?'<a class="btn2" href="https://www.google.com/maps/search/?api=1&query='+a.lat+','+a.lon+'" target="_blank" rel="noopener">'+ic('nav')+'Ver en mapa</a>':'';
    const wa=a.whatsapp&&a.uid!==miUid?'<a class="btn2" href="https://wa.me/52'+esc(a.whatsapp.slice(-10))+'" target="_blank" rel="noopener">'+ic('share')+'Escribirle</a>':'';
    const acc=e!=='resuelta'?'<button class="btn2 ok" data-res="'+esc(a.id)+'">'+ic('check')+'Ya hay sistema</button>'+(e==='activa'&&a.uid!==miUid?'<button class="btn2 mal" data-conf="'+esc(a.id)+'">'+ic('plus')+'Sigue sin sistema</button>':''):'';
    return '<article class="card al" data-e="'+e+'">'+
      '<div class="top"><div><h3>'+esc(a.gasolinera||'Gasolinera')+'</h3><div class="lug">'+esc(a.lugar||a.municipio||'')+d+'</div></div>'+tag+'</div>'+
      '<div class="who"><div class="av">'+esc(iniciales(a.nombre))+'</div><div><b>'+esc(a.nombre)+'</b><br><span>'+esc(a.cargo)+' · Zona '+esc(a.zona)+' · '+(a._pend?'enviando…':esc(hace(a.creadoMs))+' ('+hora(a.creadoMs)+')')+'</span></div></div>'+
      (a.comentario?'<div class="com">“'+esc(a.comentario)+'”</div>':'')+
      (meta?'<div class="meta">'+meta+'</div>':'')+
      '<div class="acc">'+acc+mapa+'<button class="btn2" data-comp="'+esc(a.id)+'">'+ic('share')+'Compartir</button>'+wa+'</div>'+
    '</article>';
  }).join('');
}
$('#alertas').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  const id=b.dataset.res||b.dataset.conf||b.dataset.comp;const a=alertas.find(x=>x.id===id);if(!a)return;
  if(b.dataset.comp)return compartir(a);
  if(b.dataset.res&&!b.dataset.ok){b.dataset.ok=1;b.innerHTML=ic('check')+'¿Confirmas? Toca otra vez';setTimeout(()=>{if(b.isConnected){delete b.dataset.ok;b.innerHTML=ic('check')+'Ya hay sistema'}},4000);return}
  b.disabled=true;
  try{const be=await backend.ready;
    if(b.dataset.res){await conTiempo(be.resolver(id,yo()),8000);toast('Gracias: avisaste que ya hay sistema')}
    else{if((a.confirman||[]).some(c=>c.uid===miUid)){toast('Ya habías confirmado este reporte');b.disabled=false;return}await conTiempo(be.confirmar(id,yo()),8000);toast('Confirmaste que sigue sin sistema')}
  }catch(err){b.disabled=false;toast(err.code==='timeout'?'Sin señal: se enviará cuando haya conexión':'No se pudo enviar. Intenta de nuevo.')}
});
function textoAlerta(a){
  const e=estadoDe(a);
  return (e==='resuelta'?'✅ *Ya hay sistema de despacho*':'⛽🚫 *Sin sistema de despacho*')+'\n'+
    'Gasolinera: '+(a.gasolinera||'—')+'\nLugar: '+(a.lugar||a.municipio||'—')+'\n'+
    'Reportó: '+a.nombre+' ('+a.cargo+', Zona '+a.zona+') a las '+hora(a.creadoMs)+'\n'+
    (a.comentario?'Comentario: '+a.comentario+'\n':'')+
    (a.lat?'Ubicación: https://maps.google.com/?q='+a.lat+','+a.lon+'\n':'')+
    'Ver reportes: '+APP_URL;
}
async function compartir(a){
  const txt=textoAlerta(a);
  if(navigator.share){try{await navigator.share({text:txt});return}catch(e){if(e.name==='AbortError')return}}
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener');
}

/* ================= Mapa (Leaflet + OpenStreetMap) ================= */
let mapa=null,capa=null,leafletCarga=null;
function cargarLeaflet(){
  if(window.L)return Promise.resolve();
  if(!leafletCarga)leafletCarga=new Promise((res,rej)=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.append(l);
    const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=res;s.onerror=()=>{leafletCarga=null;rej()};document.head.append(s);
  });
  return leafletCarga;
}
async function pintarMapa(){
  if(tabActual!=='despacho'||$('#app').hidden)return;
  try{await cargarLeaflet()}catch(e){$('#map').innerHTML='<div class="vacio">No se pudo cargar el mapa (sin internet).</div>';return}
  if(!mapa){
    mapa=L.map('map',{zoomControl:false,attributionControl:true,scrollWheelZoom:false}).setView([31.1,-116.1],7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(mapa);
    L.control.zoom({position:'bottomright'}).addTo(mapa);
    capa=L.layerGroup().addTo(mapa);
  }
  capa.clearLayers();
  const pts=[];
  const css=getComputedStyle(document.documentElement);
  const rojo=css.getPropertyValue('--danger').trim()||'#d7392a',verde=css.getPropertyValue('--ok').trim()||'#14945c',gris='#8a97a6';
  for(const a of alertas){if(!a.lat||Date.now()-a.creadoMs>VENTANA)continue;
    const e=estadoDe(a),col=e==='activa'?rojo:e==='resuelta'?verde:gris;
    L.circleMarker([a.lat,a.lon],{radius:e==='activa'?10:7,color:'#fff',weight:2.5,fillColor:col,fillOpacity:1}).addTo(capa)
      .bindPopup('<b>'+esc(a.gasolinera)+'</b><br>'+esc(a.lugar||'')+'<br>'+(e==='activa'?'Sin sistema':e==='resuelta'?'Restablecido':'Sin confirmar')+' · '+esc(hace(a.creadoMs)));
    pts.push([a.lat,a.lon]);
  }
  if(miUbic){L.circleMarker([miUbic.lat,miUbic.lon],{radius:6,color:'#fff',weight:2,fillColor:'#2f7de1',fillOpacity:1}).addTo(capa).bindPopup('Tú');pts.push([miUbic.lat,miUbic.lon])}
  setTimeout(()=>{mapa.invalidateSize();if(pts.length===1)mapa.setView(pts[0],12);else if(pts.length)mapa.fitBounds(pts,{padding:[30,30],maxZoom:12})},50);
}

/* ================= Ubicación y gasolineras cercanas ================= */
function ubicar(){
  return new Promise((res,rej)=>{
    if(!navigator.geolocation)return rej(Object.assign(new Error('nogeo'),{code:'nogeo'}));
    navigator.geolocation.getCurrentPosition(p=>res({lat:+p.coords.latitude.toFixed(6),lon:+p.coords.longitude.toFixed(6),prec:Math.round(p.coords.accuracy)}),rej,{enableHighAccuracy:true,timeout:20000,maximumAge:60000});
  });
}
async function fetchJSON(url,opt,ms){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||12000);try{const r=await fetch(url,Object.assign({signal:c.signal},opt));if(!r.ok)throw new Error('http '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function gasolinerasCerca(lat,lon){
  for(const r of [800,5000]){
    const q='[out:json][timeout:12];(node(around:'+r+','+lat+','+lon+')[amenity=fuel];way(around:'+r+','+lat+','+lon+')[amenity=fuel];);out center tags 20;';
    let j=null;
    for(const srv of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){
      try{j=await fetchJSON(srv,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}},12000);break}catch(e){}
    }
    if(!j)throw new Error('overpass');
    const vistos=new Set();
    const l=(j.elements||[]).map(e=>{
      const la=e.lat!=null?e.lat:e.center&&e.center.lat,lo=e.lon!=null?e.lon:e.center&&e.center.lon,t=e.tags||{};
      const marca=(t.brand||t.operator||'').trim();let nom=(t.name||'').trim();
      if(!nom)nom=marca||'Gasolinera';else if(marca&&!nom.toLowerCase().includes(marca.toLowerCase()))nom=marca+' · '+nom;
      return {nombre:nom,lat:la,lon:lo,d:la!=null?dist(lat,lon,la,lo):1e9,osm:e.type[0]+e.id,calle:t['addr:street']||''};
    }).filter(x=>x.lat!=null&&!vistos.has(x.osm)&&vistos.add(x.osm)).sort((a,b)=>a.d-b.d);
    if(l.length)return l.slice(0,6);
  }
  return [];
}
async function lugarDe(lat,lon){
  try{const j=await fetchJSON('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=es&lat='+lat+'&lon='+lon,{},9000);
    const a=j.address||{};
    const loc=a.village||a.town||a.city||a.hamlet||a.suburb||a.neighbourhood||'';
    let mun=(a.municipality||a.county||a.city_district||'').replace(/^Municipio de\s+/i,'');
    if(mun===loc)mun='';
    return {lugar:[loc,mun].filter(Boolean).join(', ')||(a.state||''),municipio:mun||loc};
  }catch(e){return {lugar:'',municipio:''}}
}

/* ================= Hoja para reportar ================= */
const sh={ignorar:false,paso:'',pos:null,lugar:null,opciones:[],sel:null,otro:'',com:'',err:'',enviando:false,existente:null};
function abrirReporte(){
  if(!perfil)return mostrarRegistro(false);
  Object.assign(sh,{ignorar:false,paso:'ubicando',pos:null,lugar:null,opciones:[],sel:null,otro:'',com:'',err:'',enviando:false,existente:null});
  $('#sheetBg').hidden=false;document.body.style.overflow='hidden';pintarHoja();
  ubicar().then(async pos=>{
    if(sh.paso!=='ubicando')return;
    sh.pos=pos;miUbic=pos;sh.paso='buscando';pintarHoja();
    const [ops,lug]=await Promise.all([gasolinerasCerca(pos.lat,pos.lon).catch(()=>null),lugarDe(pos.lat,pos.lon)]);
    if(sh.paso!=='buscando')return;
    sh.lugar=lug;sh.opciones=ops||[];sh.err=ops?'':'No se pudo consultar el mapa de gasolineras. Escribe el nombre.';
    if(sh.opciones.length&&sh.opciones[0].d<400)sh.sel=0;else if(!sh.opciones.length)sh.sel='otro';
    sh.paso='elegir';revisarExistente();pintarHoja();
  }).catch(err=>{
    if(sh.paso!=='ubicando')return;
    sh.err=err&&err.code===1?'No diste permiso de ubicación. Puedes activarlo en los ajustes del navegador, o escribir la gasolinera a mano.':'No se pudo obtener tu ubicación. Escribe la gasolinera a mano.';
    sh.sel='otro';sh.paso='elegir';pintarHoja();
  });
}
function cerrarHoja(){sh.paso='';$('#sheetBg').hidden=true;document.body.style.overflow=''}
function puntoSel(){if(sh.sel==null)return null;if(sh.sel==='otro')return sh.pos;const o=sh.opciones[sh.sel];return o?{lat:o.lat,lon:o.lon}:null}
function revisarExistente(){
  const p=puntoSel(),o=typeof sh.sel==='number'?sh.opciones[sh.sel]:null;
  sh.existente=sh.ignorar?null:alertas.find(a=>estadoDe(a)==='activa'&&((o&&a.osm&&a.osm===o.osm)||(p&&a.lat&&dist(p.lat,p.lon,a.lat,a.lon)<250)))||null;
}
function pintarHoja(){
  const s=$('#sheet');let h='<div class="grab"></div>';
  if(sh.paso==='ubicando'||sh.paso==='buscando'){
    h+='<h2 id="shT">Reportar falla de sistema</h2><div class="cargando"><div class="spin"></div><div>'+(sh.paso==='ubicando'?'Obteniendo tu ubicación…':'Buscando la gasolinera donde estás…')+'</div></div><button class="cancelar" data-x>Cancelar</button>';
  }else if(sh.paso==='elegir'){
    h+='<h2 id="shT">¿En qué gasolinera estás?</h2>';
    if(sh.pos)h+='<div class="ubic">'+ic('pin')+'<div><b>'+esc(sh.lugar&&sh.lugar.lugar||'Ubicación obtenida')+'</b><br>Precisión ±'+fdist(sh.pos.prec)+'</div></div>';
    if(sh.err)h+='<div class="ya"><b>Aviso</b>'+esc(sh.err)+'</div>';
    h+='<div class="opciones" role="radiogroup">';
    sh.opciones.forEach((o,i)=>{h+='<button class="op" role="radio" aria-checked="'+(sh.sel===i)+'" data-op="'+i+'"><span class="rd"></span><div><b>'+esc(o.nombre)+'</b><span>a '+fdist(o.d)+(o.calle?' · '+esc(o.calle):'')+'</span></div></button>'});
    h+='<button class="op" role="radio" aria-checked="'+(sh.sel==='otro')+'" data-op="otro"><span class="rd"></span><div><b>'+(sh.opciones.length?'Otra gasolinera':'Escribir el nombre')+'</b><span>'+(sh.opciones.length?'No aparece en la lista':'No la encontramos en el mapa')+'</span></div></button></div>';
    if(sh.sel==='otro')h+='<label>Nombre de la gasolinera<input id="shOtro" value="'+esc(sh.otro)+'" placeholder="Ej. Pemex de la entrada a Camalú"></label>';
    if(sh.existente){const a=sh.existente;h+='<div class="ya"><b>Ya hay un reporte activo aquí</b>Lo mandó '+esc(a.nombre)+' '+esc(hace(a.creadoMs))+'. Puedes confirmar que sigue sin sistema para que todos lo sepan.<br><button class="btn2" style="margin-top:8px" data-nueva>Es otra gasolinera: mandar alerta nueva</button></div>'}
    h+='<label>Comentario (opcional)<textarea class="in" id="shCom" rows="2" placeholder="Ej. dicen que regresa en la tarde">'+esc(sh.com)+'</textarea></label>';
    const listo=sh.sel!=null&&(sh.sel!=='otro'||sh.otro.trim().length>=3);
    h+='<button class="enviar" id="shEnviar"'+(listo&&!sh.enviando?'':' disabled')+'>'+(sh.enviando?'Enviando…':sh.existente?'Confirmar: sigue sin sistema':'Enviar alerta a todos')+'</button>';
    h+='<button class="cancelar" data-x>Cancelar</button>';
  }else if(sh.paso==='listo'){
    h+='<div class="listo"><div class="ok">'+ic('check')+'</div><h2 id="shT">'+(sh.listoTit||'¡Alerta enviada!')+'</h2><p>'+esc(sh.listoTxt||'')+'</p></div>';
    h+='<button class="enviar" style="background:#25a35a;box-shadow:none" id="shWa">'+'Compartir también por WhatsApp</button><button class="cancelar" data-x>Listo</button>';
  }
  s.innerHTML=h;
  const o=$('#shOtro');if(o){o.oninput=()=>{sh.otro=o.value;const b=$('#shEnviar');if(b)b.disabled=o.value.trim().length<3||sh.enviando};if(!sh.otro)setTimeout(()=>o.focus(),50)}
  const c=$('#shCom');if(c)c.oninput=()=>{sh.com=c.value};
}
$('#sheet').addEventListener('click',async e=>{
  if(e.target.closest('[data-x]'))return cerrarHoja();
  const op=e.target.closest('[data-op]');
  if(e.target.closest('[data-nueva]')){sh.ignorar=true;sh.existente=null;pintarHoja();return}
  if(op){sh.ignorar=false;sh.sel=op.dataset.op==='otro'?'otro':+op.dataset.op;revisarExistente();pintarHoja();return}
  if(e.target.closest('#shWa')){if(sh.ultima)compartir(sh.ultima);return}
  if(e.target.closest('#shEnviar'))return enviarReporte();
});
$('#sheetBg').addEventListener('click',e=>{if(e.target.id==='sheetBg'&&sh.paso!=='ubicando'&&sh.paso!=='buscando')cerrarHoja()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#sheetBg').hidden)cerrarHoja()});

async function enviarReporte(){
  if(sh.enviando)return;sh.enviando=true;pintarHoja();
  try{
    const be=await backend.ready;
    if(sh.existente){
      const a=sh.existente;
      await conTiempo(be.confirmar(a.id,Object.assign(yo(),sh.com.trim()?{comentario:sh.com.trim().slice(0,200)}:{})),8000).catch(err=>{if(err.code!=='timeout')throw err});
      sh.ultima=a;sh.listoTit='Reporte confirmado';sh.listoTxt='Tus compañeros verán que la falla sigue en '+(a.gasolinera||'esta gasolinera')+'.';
    }else{
      const o=typeof sh.sel==='number'?sh.opciones[sh.sel]:null;
      const p=puntoSel();
      const a={nombre:perfil.nombre,cargo:perfil.cargo,municipio:perfil.municipio,zona:perfil.zona,whatsapp:perfil.whatsapp||'',
        gasolinera:(o?o.nombre:sh.otro.trim()).slice(0,120),lugar:(sh.lugar&&sh.lugar.lugar)||perfil.municipio,
        comentario:sh.com.trim().slice(0,300)};
      if(p){a.lat=p.lat;a.lon=p.lon}
      if(sh.pos){a.miLat=sh.pos.lat;a.miLon=sh.pos.lon;a.precision=sh.pos.prec}
      if(o)a.osm=o.osm;
      const r=be.crear(a);
      let sinSenal=false;
      await conTiempo(r.escrito,8000).catch(err=>{if(err.code==='timeout')sinSenal=true;else throw err});
      sh.ultima=Object.assign({id:r.id,creadoMs:Date.now(),estado:'activa'},a);
      sh.listoTit=sinSenal?'Alerta guardada':'¡Alerta enviada!';
      sh.listoTxt=sinSenal?'Hay poca señal: tu alerta se enviará sola en cuanto el teléfono tenga conexión. No cierres la app por completo.':'Tus compañeros con avisos activados recibirán la notificación en este momento.';
    }
    sh.enviando=false;sh.paso='listo';pintarHoja();
  }catch(err){
    sh.enviando=false;sh.err=err&&err.code==='sinconfig'?'El servicio de alertas todavía no está activado.':'No se pudo enviar la alerta. Revisa tu señal e intenta de nuevo.';
    sh.paso='elegir';pintarHoja();
  }
}
$('#sos').onclick=abrirReporte;

/* ================= Avisos (notificaciones) ================= */
const esIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const instalada=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const LSA='tarjetaGasolina.avisos';
function avisosActivos(){return localStorage.getItem(LSA)==='1'&&'Notification'in window&&Notification.permission==='granted'}
function pintarAvisos(){
  const on=avisosActivos();
  const necesitaInstalar=esIOS&&!instalada();
  const sinSoporte=!('Notification'in window)&&!necesitaInstalar;
  const bloqueado='Notification'in window&&Notification.permission==='denied';
  $('#aEstado').textContent=on?'Activados':'Apagados';$('#aEstado').classList.toggle('on',on);
  $('#aTxt').textContent=on?'Suena cuando alguien reporta una falla, con la app abierta o en segundo plano. Deja la app abierta en tus recorridos.':bloqueado?'Bloqueaste las notificaciones. Actívalas en los ajustes del navegador para esta página.':necesitaInstalar?'En iPhone primero instala la app en tu pantalla de inicio (abajo te digo cómo).':sinSoporte?'Este navegador no permite notificaciones. Prueba con Chrome o Safari.':'Recibe una notificación cuando alguien reporte una falla.';
  $('#iosCard').hidden=!necesitaInstalar;
  const card=$('#notifCard');
  card.hidden=on||sinSoporte||!conectado||sessionStorage.getItem('tg.notifX')==='1';
  if(necesitaInstalar){$('#notifTxt').textContent='En iPhone, instala la app en tu pantalla de inicio para recibir avisos.';$('#notifBtn').textContent='Cómo';}
  else if(bloqueado){$('#notifTxt').textContent='Las notificaciones están bloqueadas para esta página.';$('#notifBtn').textContent='Ayuda'}
  else{$('#notifTxt').textContent='Te llega una notificación cuando alguien reporte una falla.';$('#notifBtn').textContent='Activar'}
  let b=$('#aBtn');if(!b){b=document.createElement('button');b.id='aBtn';b.className='pill';b.type='button';$('#aEstado').after(b);b.onclick=()=>avisosActivos()?apagar():activar()}
  b.textContent=on?'Apagar':'Activar';b.hidden=necesitaInstalar||sinSoporte||!conectado;$('#aEstado').hidden=!on&&!b.hidden;
}
async function activar(){
  if(esIOS&&!instalada()){irA('perfil');setTimeout(()=>$('#iosCard').scrollIntoView({behavior:'smooth',block:'center'}),80);return}
  if('Notification'in window&&Notification.permission==='denied'){toast('Actívalas en los ajustes del navegador (candado junto a la dirección)');return}
  try{const be=await backend.ready;toast('Activando avisos…');await be.activarAvisos();localStorage.setItem(LSA,'1');toast('¡Avisos activados!')}
  catch(e){const c=e&&e.code||'';toast(c==='denegado'?'No diste permiso para notificaciones':c==='nosoporte'?'Este navegador no permite notificaciones':c==='sinconfig'?'El servicio de alertas aún no está activado':'No se pudieron activar los avisos. Intenta de nuevo.')}
  pintarAvisos();
}
async function apagar(){try{const be=await backend.ready;await conTiempo(be.apagarAvisos(),8000)}catch(e){}localStorage.removeItem(LSA);toast('Avisos apagados');pintarAvisos()}
$('#notifBtn').onclick=activar;
function avisoEnPantalla(n){
  const b=$('#banner');b.innerHTML='<svg class="i" style="width:28px;height:28px"><use href="#i-alert"/></svg><div><b>'+esc(n.title||'Nueva alerta')+'</b><span>'+esc(n.body||'')+'</span></div>';
  b.hidden=false;b.onclick=()=>{b.hidden=true;irA('despacho')};clearTimeout(avisoEnPantalla.h);avisoEnPantalla.h=setTimeout(()=>b.hidden=true,9000);
  if(navigator.vibrate)navigator.vibrate([120,60,120]);
}

/* Instalación (Android/Chrome) */
let instEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEvt=e;pintarInstalar()});
window.addEventListener('appinstalled',()=>{instEvt=null;pintarInstalar();toast('App instalada')});
function pintarInstalar(){
  const ya=instalada();
  $('#instCard').hidden=ya||(!instEvt&&!esIOS);
  $('#instBtn').hidden=!instEvt;
  if(esIOS&&!ya)$('#instTxt').textContent='En iPhone se instala desde Safari (pasos abajo).';
}
$('#instBtn').onclick=async()=>{if(!instEvt)return;instEvt.prompt();try{await instEvt.userChoice}catch(e){}instEvt=null;pintarInstalar()};

/* ================= Arranque ================= */
let miUid=null,alertasPrevias=[];
function repintar(){pintarEstado();pintarAlertas();pintarAvisos();if(tabActual==='despacho')pintarMapa()}
function iniciar(){
  if(!perfil){mostrarRegistro(false)}else{$('#app').hidden=false;pintarPerfil()}
  pintarInstalar();repintar();
  backend.ready.then(be=>{
    miUid=be.uid;
    if(perfil)be.guardarPerfil(perfil).catch(()=>{});
    if(avisosActivos())registrarSW();
    be.escuchar(lista=>{
      const previas=new Set(alertas.map(a=>a.id));const primera=!conectado;
      alertas=lista;conectado=true;errorConexion=null;repintar();
      if(primera)alertasPrevias=lista.map(a=>({id:a.id,estado:a.estado}));
      if(!primera){
        const nueva=lista.find(a=>!previas.has(a.id)&&a.uid!==miUid&&estadoDe(a)==='activa'&&!a._pend);
        const antes=new Map(alertasPrevias.map(a=>[a.id,a.estado]));
        const resuelta=lista.find(a=>antes.get(a.id)==='activa'&&a.estado==='resuelta'&&!(a.resueltaPor&&a.resueltaPor.uid===miUid));
        const avisar=(t,b,tag)=>{if(document.hidden&&avisosActivos())notificarSistema(t,b,tag);else avisoEnPantalla({title:t,body:b})};
        if(nueva)avisar('⛽ Sin sistema: '+nueva.gasolinera,(nueva.lugar||'')+' · reportó '+nueva.nombre+(nueva.comentario?' · “'+nueva.comentario+'”':''),'alerta-'+nueva.id);
        else if(resuelta)avisar('✅ Ya hay sistema: '+resuelta.gasolinera,(resuelta.lugar||'')+(resuelta.resueltaPor&&resuelta.resueltaPor.nombre?' · avisó '+resuelta.resueltaPor.nombre:''),'alerta-'+resuelta.id);
      }
      alertasPrevias=lista.map(a=>({id:a.id,estado:a.estado}));
    },err=>{errorConexion={t:'Sin conexión con el servicio',p:'Revisa tu internet. Mientras, puedes seguir usando “Mi tarjeta”.'};repintar()});
  }).catch(e=>{
    errorConexion=e&&e.code==='sinconfig'?{t:'Alertas en preparación',p:'El servicio de alertas se está activando. Mientras, puedes usar “Mi tarjeta”.'}:{t:'Sin conexión con el servicio',p:'Revisa tu internet y vuelve a abrir la app.'};
    $('#sos').disabled=e&&e.code==='sinconfig';repintar();
  });
}
setInterval(()=>{if(!document.hidden&&conectado){pintarEstado();pintarAlertas()}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&conectado)repintar()});
if(location.hash==='#tarjeta')setTimeout(()=>irA('tarjeta'));
iniciar();
})();
