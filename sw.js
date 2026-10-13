const C='daily-reward-v7';
const FILES=["./","app.js","assets/av1.jpg","assets/av2.jpg","assets/av3.jpg","assets/fig/battery.svg","assets/fig/chat.svg","assets/fig/compass.svg","assets/fig/csend.svg","assets/fig/flame.svg","assets/fig/hamburger.svg","assets/fig/mood0.svg","assets/fig/mood1.svg","assets/fig/mood2.svg","assets/fig/moodsend.svg","assets/fig/signal.svg","assets/fig/timeline.svg","assets/fig/today.svg","assets/fig/users.svg","assets/fig/wallet.svg","assets/fig/wifi.svg","assets/hemali-face.png","assets/hemali.png","assets/hero.jpg","assets/ins-1.svg","assets/ins-2.svg","assets/ins-3.svg","assets/sheet-glow.png","icons.js","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","index.html","manifest.webmanifest","mobile.css","mobile.js","styles.css"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const same=url.origin===location.origin;
  const put=res=>{if(res.ok&&same){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;};
  // App shell is network-first so a new deploy shows up immediately; cache is only
  // the offline fallback. Images and icons stay cache-first.
  if(same&&(e.request.mode==='navigate'||/\.(?:html|js|css|webmanifest)$/.test(url.pathname))){
    e.respondWith(fetch(e.request).then(put).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(put).catch(()=>caches.match('./'))));
});
