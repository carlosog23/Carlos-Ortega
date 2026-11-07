/* Service worker: permite instalar la app y mostrar notificaciones de alertas en el teléfono. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{}); /* sin caché: siempre la versión más reciente */

/* Al tocar la notificación, abre (o enfoca) la app */
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL('./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if(c.url.startsWith(url)&&'focus'in c)return c.focus()}
    return self.clients.openWindow(url);
  }));
});
