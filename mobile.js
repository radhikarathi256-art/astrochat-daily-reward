/* Mobile web app layer: hamburger drawer drives the prototype flows */
(function(){
  const $=id=>document.getElementById(id);
  const FL=[['j1','Day 1 · first check-in','Intro sheet, answer, ₹15, reminder'],['j2','Day 2 · streak','Toast, answer, claim'],['j3','Not answering','3 tries, then stop'],['missed','Missed a day','Grey sheet once, restart at Day 1']];
  const drawer=$('drawer'),scrim=$('dscrim'),ham=$('hamBtn');
  const cur=()=>{const t=document.querySelector('.tabs button[aria-selected="true"]');return t?t.dataset.flow:'j1'};
  function render(){
    const f=cur();
    $('drFlows').innerHTML=FL.map(([k,t,s],i)=>`<button type="button" data-go="${k}" class="${k===f?'on':''}"><span class="n">${i+1}</span><span><b>${t}</b><small>${s}</small></span></button>`).join('');
    $('drSteps').innerHTML=[...document.querySelectorAll('#stepList .step')].map(s=>`<div class="st ${s.classList.contains('on')?'on':s.classList.contains('done')?'done':''}"><b>${s.querySelector('b').textContent}</b><span>${s.querySelector('span').textContent}</span></div>`).join('');
    $('drNext').hidden=$('jnext').hidden;
    $('drPerm').checked=$('permAllowed').checked;
  }
  function open(){render();scrim.hidden=false;requestAnimationFrame(()=>{scrim.classList.add('on');drawer.classList.add('on')});drawer.setAttribute('aria-hidden','false');ham.setAttribute('aria-expanded','true');}
  function close(){scrim.classList.remove('on');drawer.classList.remove('on');drawer.setAttribute('aria-hidden','true');ham.setAttribute('aria-expanded','false');setTimeout(()=>{scrim.hidden=true},240);}
  ham.addEventListener('click',e=>{e.stopPropagation();open();});
  // Hamburger stays usable even when a sheet/scrim is covering it
  document.addEventListener('click',e=>{if(drawer.classList.contains('on')||e.target.closest('#hamBtn,#drawer'))return;const r=ham.getBoundingClientRect();
    if(e.clientX>=r.left-8&&e.clientX<=r.right+8&&e.clientY>=r.top-8&&e.clientY<=r.bottom+8){e.stopPropagation();e.preventDefault();open();}},true);
  scrim.addEventListener('click',close);$('drClose').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('on'))close();});
  drawer.addEventListener('click',e=>{
    e.stopPropagation();
    const g=e.target.closest('[data-go]');
    if(g){const tab=document.querySelector(`.tabs button[data-flow="${g.dataset.go}"]`);close();setTimeout(()=>{tab.click();try{history.replaceState(null,'','#'+g.dataset.go)}catch(_){}} ,200);return;}
    if(e.target.id==='drRestart'){close();setTimeout(()=>$('restart').click(),200);return;}
    if(e.target.id==='drPush'){close();setTimeout(()=>$('pushBtn').click(),200);return;}
    if(e.target.id==='drNext'){close();setTimeout(()=>$('jnext').click(),200);return;}
  });
  $('drPerm').addEventListener('change',e=>{$('permAllowed').checked=e.target.checked;$('permAllowed').dispatchEvent(new Event('change'));render();});
  // Tint the real status bar: hero colour at top, white once the header turns white on scroll
  const meta=$('themeColor'),head=$('head');const TOP='#FDBA96',SCROLLED='#FFFFFF';
  const sync=()=>{meta.setAttribute('content',head.classList.contains('scrolled')?SCROLLED:TOP)};
  new MutationObserver(sync).observe(head,{attributes:true,attributeFilter:['class']});sync();
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
