/* AstroChat · Daily streak prototype — vanilla JS, no build step. */
(function(){
const $=id=>document.getElementById(id);
document.querySelectorAll('[data-fig]').forEach(e=>{e.outerHTML=FIG[e.dataset.fig].replace('<svg ','<svg aria-hidden="true" ');});

/* ---------- flows (desktop tabs) ---------- */
const FLOWS={
  claim:{title:'Check-in + reward in one card',sub:'Streak and check-in sit together below Your Experts. Answer, claim, set the reminder.',
    steps:[['A1','Today · check-in card below experts'],['A2','Answer → Hemali prediction'],['A3','Claim sheet (soft ask)'],['A4','Android permission'],['A5','Allowed · streak celebration'],['A6','Not allowed · reminder off'],['A7','Okay · reminder on'],['A8','Next morning · push notification']]},
  missed:{title:'Missed day · streak restart',sub:'The grey missed sheet shows only the first time a day is missed (once). Open this flow again to see a later miss: no sheet, the card just restarts at Day 1 (₹5).',
    steps:[['B1','App open · Missed sheet (first miss only)'],['B2','Streak restarted (Day 1)'],['B3','Answer → Hemali prediction'],['B4','Claim sheet · 1 out of 7 day streak'],['B5','Android permission'],['B6','Celebration sheet / off'],['B7','Okay · reminder on'],['B8','Next morning · push notification']]},
};
FLOWS.j1={title:'Day 1 · first check-in',sub:'New user sees one simple ask: answer 1 question, get ₹15. The 7-day streak is shown only after they answer, with a reminder for tomorrow.',
  steps:[['J0','App open · Daily reward intro sheet'],['J1','Today · "Daily reward" card, no streak yet'],['J2','Answer → Hemali prediction'],['J3','₹15 added + streak revealed'],['J4','Android permission → toast "Reminder set"'],['J6','Today · streak now visible']]};
FLOWS.j2={title:'Day 2 · streak + question',sub:'A toast at the top shows Day 2 progress (auto-hides in 5s). The card shows the 7 days with today\'s question.',
  steps:[['K2','Today · Day 2 toast + question'],['K3','Answer → Hemali prediction'],['K4','Claim · ₹7 added, ₹9 tomorrow'],['K5','Done · tomorrow ₹9']]};
FLOWS.j3={title:'Not answering · 3 tries',sub:'If a new user does not answer, we try 3 times, then stop. Use “Next try →” to move through them.',
  steps:[['N1','Try 1 · intro sheet + card, user leaves'],['N2','Try 2 · next app open, nudge sheet'],['N3','Try 3 · next morning push'],['N4','Still no answer · stop nudging'],['N5','If they answer → reward + streak revealed']]};
FLOWS.type={title:'Type own answer · keyboard',sub:'Tap the reply box, type with the keyboard, send. Then claim and set the reminder.',
  steps:[['C1','Tap “Apne shabdon mein likhein”'],['C2','Keyboard up · composer focused'],['C3','Typing answer'],['C4','Sent → Hemali typing'],['C5','Prediction → claim sheet'],['C6','Android permission'],['C7','Allowed · streak celebration'],['C8','Okay · reminder on'],['C9','Next morning · push notification']]};
const SCEN={
  day1:{date:'Monday, 5 Oct · Krishna Dashami',labels:['Aaj','Tue 6','Wed 7','Thu 8','Fri 9','Sat 10','Sun 11'],amts:[15,5,7,9,11,13,15],done:0,today:0,missed:-1,todayLabel:'Mon 5',before:0,after:1,reward:15,next:5},
  normal:{date:'Monday, 5 Oct · Krishna Dashami',labels:['Sat 3','Sun 4','Aaj','Tue 6','Wed 7','Thu 8','Fri 9'],amts:[15,5,7,9,11,13,15],done:2,today:2,missed:-1,todayLabel:'Mon 5',before:2,after:3,reward:7,next:9},
  reset:{date:'Wednesday, 7 Oct · Ekadashi',labels:['Wed 7','Thu 8','Fri 9','Sat 10','Sun 11','Mon 12','Tue 13'],amts:[15,5,7,9,11,13,15],done:0,today:0,missed:-1,todayLabel:'Wed 7',before:0,after:1,reward:5,next:7}
};
const MOODS=[
  {k:'Achha',f:['','#12B76A','','','M6.8 12c1.8 1.8 4.6 1.8 6.4 0'],a:'Aaj Rahul ke saath baat aasaani se hogi. Shaam ko ek chhota sa plan banaiye, rishta aur mazboot hoga.'},
  {k:'Theek hai',f:['','#F79009','','','M7 12.8h6'],a:'Din shaant rahega. Aaj aap pehle baat shuru karein, ek chhota sa message bhi kaafi hai.'},
  {k:'Thoda Pareshaan',f:['','#F04438','','','M6.8 13.6c1.8-1.8 4.6-1.8 6.4 0'],a:'Aaj galatfehmi ho sakti hai. Shaam 6 baje ke baad baat karein aur pehle unki baat poori sunein.'}
];

/* ---------- icons ---------- */
let uid=0;
const face=f=>`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8.5" stroke="${f[1]}" stroke-width="1.6"/><circle cx="7.3" cy="8.3" r="1.1" fill="${f[1]}"/><circle cx="12.7" cy="8.3" r="1.1" fill="${f[1]}"/><path d="${f[4]}" stroke="${f[1]}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const ICON={
  tick:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.4l3 3 6-6.3" stroke="#EF6939" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:'<svg width="10" height="10" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="#98A2B3" stroke-width="1.8" stroke-linecap="round"/></svg>',
  down:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4.5v11M5.5 11l4.5 4.5 4.5-4.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell:c=>`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.2a4 4 0 0 0-4 4v2.3L2.8 11h10.4L12 8.5V6.2a4 4 0 0 0-4-4ZM6.5 13a1.6 1.6 0 0 0 3 0" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check:c=>`<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.4l3 3 6-6.3" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  info:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#98A2B3" stroke-width="1.4"/><path d="M8 7v4" stroke="#98A2B3" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.8" r=".9" fill="#98A2B3"/></svg>',
  flame:FIG.flame,
  flameGrey:'<svg width="36" height="36" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#F2F4F7"/><path d="M20 6c1 5 7 7.5 7 15a7 7 0 0 1-14 0c0-3.6 1.8-5.6 3.4-7.6.5 2 1.4 3 2.6 3.6C18.6 13.6 18.6 9.6 20 6Z" fill="#98A2B3"/></svg>',
  send:FIG.moodsend,
  lock:'<svg width="34" height="34" viewBox="0 0 40 40"><path d="M13 18v-4a7 7 0 0 1 14 0v4" stroke="#C88A04" stroke-width="3" fill="none"/><rect x="9" y="17" width="22" height="18" rx="5" fill="#FDB022"/><circle cx="20" cy="25" r="2.4" fill="#8A4F06"/></svg>',
  bellBig:'<svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16h15L18 12.5V9a6 6 0 0 0-6-6Z" fill="#fff"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
  okToast:'<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#12B76A"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  crack:'<svg class="crack" viewBox="0 0 16 80" aria-hidden="true"><path d="M10 0 4 26l8 8-10 18 5 10-5 18" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>'
};

/* ---------- state ---------- */
let S;
const PICK={v:'21',d:'1'};
['1','2','3','4','5','6','7'].forEach(k=>{const d=+k;const A=[15,5,7,9,11,13,15];const dates=['Mon 5','Tue 6','Wed 7','Thu 8','Fri 9','Sat 10','Sun 11'];SCEN['d'+k]={date:'Monday, 5 Oct · Krishna Dashami',labels:dates,amts:A,done:d-1,today:d-1,missed:-1,todayLabel:dates[d-1],before:d-1,after:d,reward:A[d-1],next:d<7?A[d]:5,week:d===7};});
SCEN.d1.first=true;const WB=0;SCEN.reset.amts=[5,5,7,9,11,13,15];SCEN.reset.reward=5;SCEN.reset.next=5;SCEN.reset.prior=15;SCEN.reset.missedAmt=5;
const earnBox=(D,total)=>`<div class="earn2"><div><span>Earned till now</span><b>₹${total+(D.prior||0)}</b></div><div><span>Missed out</span><b>₹${D.missedAmt||0}</b></div></div>`;
try{const q=new URLSearchParams(location.search);if(q.get('v'))PICK.v=q.get('v');if(q.get('d'))PICK.d=q.get('d');}catch(e){}
function fresh(flow){
  const permPre=$('permAllowed').checked;
  return {flow,intro:flow==='j1'||flow==='j3',tries:1,scen:flow==='missed'?'reset':flow==='j1'||flow==='j3'?'d1':flow==='j2'?'d2':'d'+PICK.d,claimed:false,phase:'ask',text:'',ans:'',remind:flow==='j2',band:false,
    perm:permPre?'granted':'default',time:null,step:null,visited:new Set(),sheet:null,pending:null};
}

/* ---------- steps panel ---------- */
function setStep(id){S.step=id;S.visited.add(id);renderSteps();}
function renderSteps(){
  const F=FLOWS[S.flow];$('flowTitle').textContent=F.title;$('flowSub').textContent=F.sub;
  $('stepList').innerHTML=F.steps.map(([id,l])=>`<div class="step ${S.step===id?'on':S.visited.has(id)?'done':''}"><b>${id}</b><span>${l}</span></div>`).join('');
}

/* ---------- render page ---------- */
function panelParts(D,claimed,scenKey,mini){
  const pending=!claimed;
  const n=pending?D.before:D.after;
  const days=D.labels.map((l,i)=>{const lab=i===D.today?D.todayLabel:l;const [dn,dd]=lab.split(' ');
    const done=i<D.done||(claimed&&i===D.today), today=i===D.today&&pending, missed=i===D.missed;
    const dayN=i-(D.missed>=0?D.missed+1:0)+1;
    return {dn:'Day',dd:missed?'–':dayN,lab:missed?'Miss':'Day '+dayN,v:D.amts[i],cls:done?'done':today?'today':missed?'missed':'next',pop:claimed&&i===D.today};});
  const TK=c=>`<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.4l3 3 6-6.3" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const val=(d,c='#C4320A')=>d.cls==='done'?TK(c):d.cls==='missed'?'✕':'₹'+d.v;
  const V=PICK.v;let w='';
  if(V==='1')w=`<div class="p1">${days.map(d=>`<div class="${d.cls} ${d.pop?'pop':''}"><span class="c">${val(d)}</span><span class="l">${d.cls==='missed'?'Miss':d.lab}</span></div>`).join('')}</div>`;
  if(V==='6')w=`<div class="p6">${days.map(d=>`<div class="${d.cls} ${d.pop?'pop':''}"><span class="k">${d.dn}</span><span class="dt">${d.dd}</span><span class="v">${d.cls==='done'?TK('#98A2B3'):d.cls==='missed'?'Miss':(d.cls==='today'?'₹'+d.v:'₹'+d.v)}</span></div>`).join('')}</div>`;
  if(V==='12')w=`<div class="p12">${days.map(d=>`<div class="${d.cls} ${d.pop?'pop':''}"><span class="k">${d.dn}</span><span class="dt">${d.dd}</span><span class="v">${d.cls==='done'?TK('#C4320A'):d.cls==='missed'?'Miss':'₹'+d.v}</span></div>`).join('')}</div>`;
  if(V==='21'){const LOCK='<svg width="8" height="9" viewBox="0 0 8 9" fill="none"><rect x=".5" y="3.5" width="7" height="5" rx="1.2" fill="#98A2B3"/><path d="M2 3.8V2.6a2 2 0 0 1 4 0v1.2" stroke="#98A2B3" stroke-width="1.1"/></svg>';
    const ti=days.findIndex(d=>d.cls==='today');const lastDone=days.map(d=>d.cls).lastIndexOf('done');const fillTo=ti>=0?ti:lastDone;
    w=`<div class="p21" style="--f:${Math.max(0,fillTo)/6}">${days.map((d,i)=>{const sz=i===6?46:[26,28,30,30,33,38][i];const fs=i===6?16:[12,12,12,12,13,14][i];const lift=[0,1,3,5,8,11,15][i];
      const dot=d.cls==='done'?`<i class="dot">${TK('#fff')}</i>`:d.cls==='missed'?'<i class="dot x">✕</i>':'<i class="dot"></i>';
      return `<div class="col ${d.cls} ${i===6?'goal':''} ${d.pop?'pop':''}"><span class="ic"><span class="coin val ${d.cls==='done'?'got':''}" style="--s:${sz}px;--fs:${fs}px;margin-bottom:${lift}px"><span class="cv">${d.cls==='missed'?'<b>–</b>':`<small>₹</small><b>${d.v}</b>`}</span></span></span><span class="tr">${dot}</span><span class="lb2">${d.cls==='missed'?'<b>Miss</b>':mini?`Day ${d.dd}<b>₹${d.v}</b>`:`Day<b>${d.dd}</b>`}</span></div>`;}).join('')}</div>`;if(mini)w=w.replace('class="p21"','class="p21 mini"');}
  if(V==='24'){const ti=days.findIndex(d=>d.cls==='today');const lastDone=days.map(d=>d.cls).lastIndexOf('done');const fillTo=ti>=0?ti:lastDone;
    w=`<div class="p21 p24" style="--f:${Math.max(0,fillTo)/6}">${days.map((d,i)=>{const sz=[20,23,27,31,36,41,48][i];const fs=[12,13,15,17,19,22,26][i];const lift=0;
      const dot=d.cls==='done'?`<i class="dot">${TK('#fff')}</i>`:d.cls==='missed'?'<i class="dot x">✕</i>':'<i class="dot"></i>';
      return `<div class="col ${d.cls} ${i===6?'goal':''} ${d.pop?'pop':''}"><span class="ic"><span class="coin val ${d.cls==='done'?'got':''}" style="--s:${sz}px;--fs:${fs}px;margin-bottom:${lift}px"><span class="cv"><b>${d.cls==='missed'?'–':'₹'}</b></span></span></span><span class="tr">${dot}</span><span class="lb3"><span>${d.cls==='missed'?'Miss':'Day '+d.dd}</span><b>${d.cls==='missed'?'–':'₹'+d.v}</b></span></div>`;}).join('')}</div>`;}
  if(V==='23'){const ti=days.findIndex(d=>d.cls==='today');const lastDone=days.map(d=>d.cls).lastIndexOf('done');const fillTo=ti>=0?ti:lastDone;
    w=`<div class="p23" style="--f:${Math.max(0,fillTo)/6}">${days.map((d,i)=>{const goal=i===6;const sz=goal?34:(d.cls==='today'?26:18+i*1.2);
      const mark=d.cls==='done'?`<i class="dot">${TK('#fff')}</i>`:d.cls==='missed'?'<i class="dot x">✕</i>':`<i class="dot"></i>`;
      return `<div class="${d.cls} ${goal?'goal':''} ${d.pop?'pop':''}"><span class="k">${d.lab==='Miss'?'Miss':d.lab}</span><span class="ic"><span class="coin ${d.cls==='done'?'got':''}" style="--s:${sz}px"></span></span><span class="tr">${mark}</span><span class="v">${d.cls==='missed'?'–':'₹'+d.v}</span></div>`;}).join('')}</div>`;}
  if(V==='22'){const ti=days.findIndex(d=>d.cls==='today');const lastDone=days.map(d=>d.cls).lastIndexOf('done');const fillTo=ti>=0?ti:lastDone;
    w=`<div class="p22" style="--f:${Math.max(0,fillTo)/6}">${days.map((d,i)=>{const goal=i===6;
      const mark=d.cls==='done'?`<i class="dot">${TK('#fff')}</i>`:d.cls==='missed'?'<i class="dot x">✕</i>':goal?'<span class="coin" style="--s:20px"></span>':`<i class="dot"></i>`;
      return `<div class="${d.cls} ${goal?'goal':''} ${d.pop?'pop':''}"><span class="k">${d.dn}</span><span class="dt">${d.dd}</span><span class="tr">${mark}</span><span class="v">${d.cls==='missed'?'Miss':'₹'+d.v}</span></div>`;}).join('')}</div>`;}
  if(V==='20')w=`<div class="p20">${days.map(d=>`<div class="${d.cls} ${d.pop?'pop':''}"><span class="p">${val(d)}</span><span class="l">${d.cls==='missed'?'Miss':d.lab}</span></div>`).join('')}</div>`;
  const title=pending?`Answer &amp; get <span class="amt">₹${D.reward}</span>`:`<span class="amt">₹${D.reward}</span> added to wallet`;
  const sub=pending?(scenKey==='reset'?'Missed yesterday · back to Day 1':'Grows every day'):(D.week?'Week complete · new week tomorrow':`Tomorrow: ₹${D.next}`);
  const fire=(scenKey==='reset'&&pending?ICON.flameGrey:ICON.flame)+`<b>${n}</b>`;
  return {title,sub,n,w,fire};
}


PICK.card='K';
const CARDS=[['A','Title on question'],['B','Tag + question'],['C','Pick, then button'],['D','Question first, strip last'],['E','Emoji tiles'],['F','Two-step guide'],['G','Hemali asks'],['H','Money first'],['I','Reward on every answer'],['J','Question is the title'],['K','Reply bubbles'],['L','Question from Hemali'],['M','Answer before midnight'],['N','Day ring'],['O','Question inside panel'],['P','Wallet preview'],['Q','Keep the streak'],['R','Tomorrow teaser'],['S','Emoji-only tags'],['T','One-line ask']];
const UP=`<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 12.5V3.8M4.2 7.4 8 3.6l3.8 3.8" stroke="#E8590C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PEN=`<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10.5 2.5l3 3L5.5 13.5H2.5v-3l8-8Z" stroke="#667085" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const MLAB=['Achha','Okay','Pareshan'];
const CLOCK=`<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" stroke="#BC3606" stroke-width="1.5"/><path d="M8 4.8V8l2.2 1.4" stroke="#BC3606" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const FIRE_S='<span class="fs">🔥</span>';
const Qtxt='Aaj is relationship ko lekar aap kaisa feel kar rahe hain?';
const dayNo=D=>D.today-(D.missed>=0?D.missed+1:0)+1;
function topPanel(V,D,claimed,key){
  const P=panelParts(D,claimed,key,false);
  const fire=P.n?`<span class="fire">${P.fire}</span>`:'';
  let head;
  if(claimed) head=`<div class="m-txt"><h3>${P.title}</h3><p>${P.sub}</p></div>`;
  else return `<div class="m-top">${P.w}</div>`;
  return `<div class="m-top"><div class="m-row">${head}${fire}</div>${P.w}</div>`;
}
const tag=(i,V,st)=>{const amt=st.amt;
  if(V==='C')return `<button type="button" class="tag nogo ${st.sel===i?'sel':''}" data-sel="${i}">${FIG['mood'+i]}<span>${MLAB[i]}</span></button>`;
  const end=V==='I'?`<i class="gain">+₹${amt} ${UP}</i>`:`<i class="up">${UP}</i>`;
  return `<button type="button" class="tag" data-m="${i}">${FIG['mood'+i]}<span>${MLAB[i]}</span>${end}</button>`;};
const writeTag=V=>`<button type="button" class="tag write" data-act="write">${PEN}<span>Write &amp; send</span>${V==='C'?'':`<i class="up">${UP}</i>`}</button>`;
function askHTML(V,D,st){
  const amt=D.reward;st=Object.assign({amt},st);
  const amtS=`<span class="amt">₹${amt}</span>`;
  const T=t=>st.intro?`<div class="ask-t">${PICK.ih==='2'?`<span class="ih2">${COIN}₹${amt} reward</span>`:''}<p class="q">${Qtxt}</p></div>`:`<div class="ask-t"><h4>${t}</h4><p class="q">${Qtxt}</p></div>`;
  const RULE=`<p class="ask-rule">Miss a day → back to Day 1</p>`;
  const tags=`<div class="tags ${V==='G'?'right':''}">${[0,1,2].map(i=>tag(i,V,st)).join('')}${st.compose?'':writeTag(V)}</div>`;
  let h='';
  if(V==='A'||V==='D')h=T(`Answer &amp; Get ${amtS} in wallet`)+tags;
  if(V==='J')h=`<div class="ask-t"><p class="q qj">${Qtxt}</p><span class="ask-cap">${UP.replace('width="14" height="14"','width="12" height="12"')} Answer to get ₹${amt} in wallet</span></div>`+tags;
  if(V==='B')h=`<span class="ask-tag">Today's question · +₹${amt}</span><p class="q">${Qtxt}</p>`+tags;
  if(V==='C')h=T(`Answer to get ${amtS}`)+tags+`<button type="button" class="cta" data-act="submitSel" ${st.sel==null?'disabled':''}>Submit &amp; get ₹${amt}</button>`;
  if(V==='E')h=T(`Tap an answer, get ${amtS}`)+`<div class="tiles">${[0,1,2].map(i=>`<button type="button" class="tile" data-m="${i}">${FIG['mood'+i]}<span>${MLAB[i]}</span><i class="up">${UP}</i></button>`).join('')}</div>`+(st.compose?'':`<div class="tags">${writeTag(V)}</div>`);
  if(V==='F')h=`<div class="ask-steps"><i>1</i>Answer this<span></span><i class="o">2</i>Get ₹${amt} in wallet</div><p class="q">${Qtxt}</p>`+tags;
  if(V==='G')h=`<div class="ask-t"><h4>Reply &amp; get ${amtS}</h4></div><div class="ask-bub"><span class="mini"></span><div><small>Astro Hemali</small>${Qtxt}</div></div>`+tags;
  if(V==='H')h=`<div class="ask-band"><span class="ask-coin">₹${amt}</span><div><h4>Your ₹${amt} is ready</h4><p>Answer this to collect it</p></div></div><p class="q">${Qtxt}</p>`+tags;
  if(V==='I')h=T('Pick one answer')+tags;

  if(V==='K')h=(st.intro?T(''):`<div class="ask-t"><p class="q">${Qtxt}</p></div>`)+`<div class="ans"><div class="moods3">${[0,1,2].map(i=>`<button type="button" class="tag" data-m="${i}">${FIG['mood'+i]}<span>${MLAB[i]}</span></button>`).join('')}</div></div>`;
  if(V==='L')h=`<div class="ask-t"><h4>Today's question · ${amtS}</h4></div><div class="ask-bub"><span class="mini"></span><div><small>Astro Hemali asks</small>${Qtxt}</div></div>`+tags.replace('class="tags','class="tags bub');
  if(V==='M')h=`<div class="ask-t"><span class="ask-clock">${CLOCK} Answer before midnight</span><h4>Get ${amtS} today</h4><p class="q">${Qtxt}</p></div>`+tags;
  if(V==='N')h=`<div class="ask-ring"><span class="ring" style="--p:${dayNo(D)/7}"><b>${dayNo(D)}</b><small>/7</small></span><div class="ask-t"><h4>Answer &amp; get ${amtS}</h4><p class="sub2">Day ${dayNo(D)} of your 7-day streak</p></div></div><p class="q">${Qtxt}</p>`+tags;
  if(V==='O')h=T(`Answer &amp; get ${amtS}`)+tags;
  if(V==='P')h=T(`Answer &amp; get ${amtS}`)+`<div class="ask-wallet">${FIG.wallet||''}<span>Wallet</span><b>₹0</b><i>→</i><b class="gn">₹${amt}</b></div>`+tags;
  if(V==='Q')h=`<div class="ask-t"><h4>Keep your streak going</h4><p class="sub2">Answer now · ${FIRE_S} 0 → 1 · <b>+₹${amt}</b></p></div><p class="q">${Qtxt}</p>`+tags;
  if(V==='R')h=T(`Answer &amp; get ${amtS}`)+tags+`<div class="ask-next"><span>Tomorrow <b>₹${D.amts[Math.min(D.today+1,6)]}</b></span><span>Day 7 <b>₹${D.amts[6]}</b></span></div>`;
  if(V==='S')h=T(`Answer &amp; get ${amtS}`)+`<div class="tags emo">${[0,1,2].map(i=>`<button type="button" class="tag emo" data-m="${i}" aria-label="${MLAB[i]}">${FIG['mood'+i]}<span>${MLAB[i]}</span></button>`).join('')}${st.compose?'':writeTag(V)}</div>`;
  if(V==='T')h=`<div class="ask-one"><p class="q">${Qtxt}</p><span class="ask-pill">+₹${amt}</span></div>`+tags;
  return `<div class="ck-ask">${h}</div>`;
}
PICK.ih='4';
const COIN=`<span class="intro-coin" aria-hidden="true">₹</span>`;
function rhHead(D,claimed){const n=dayNo(D);const dp=n>1?`Day ${n} · `:'';const a=`<span class="amt">₹${D.reward}</span>`;
  const t=claimed?`${dp}${a} added to your wallet`:`<span class="l1">${dp}Answer 1 question</span><span class="l2">Get ${a} in your wallet</span>`;
  return `<div class="hero4 rh"><div class="rh-l">${S.attn&&!claimed?'<small class="rh-lbl warn">Still waiting for you</small>':''}<b class="rh-t">${t}</b></div>${(!claimed&&D.first)?STACK:''}</div>`;}
function introPanel(D){
  if(PICK.ih==='4')return rhHead(D,false);
  if(PICK.ih!=='3')return '';
  return `<div class="m-top intro-top ih3"><div class="intro-row">${COIN}<b>${S.attn?`Your <span class="amt">₹${D.reward}</span> is still waiting`:`Answer and get <span class="amt">₹${D.reward}</span> in your wallet`}</b></div></div>`;
}
function trustFoot(){return `<div class="rh-foot"><span class="avs">${['assets/av1.jpg','assets/av2.jpg','assets/av3.jpg'].map(u=>`<i style="background-image:url(${u})"></i>`).join('')}</span><span><b>₹50K+</b> earned by users</span></div>`;}
function introFoot(D){
  if(PICK.ih!=='1')return '';
  return `<div class="ih1">${COIN}<span>${S.attn?`Your <b>₹${D.reward}</b> is still waiting`:`Answer to get <b>₹${D.reward}</b> in your wallet`}</span></div>`;
}
const STACK=`<span class="cstk" aria-hidden="true"><svg width="52" height="52" viewBox="0 0 52 52"><defs><linearGradient id="kf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".5" stop-color="#FDCB4A"/><stop offset="1" stop-color="#F5A70F"/></linearGradient><linearGradient id="ks" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9840A"/><stop offset=".5" stop-color="#FDB022"/><stop offset="1" stop-color="#C77700"/></linearGradient><clipPath id="kc"><ellipse cx="26" cy="22" rx="16" ry="5.5"/></clipPath></defs>
<ellipse class="sh0" cx="26" cy="47" rx="17" ry="3" fill="#000" opacity=".08"/>
<g><path d="M10 36v5a16 5.5 0 0 0 32 0v-5Z" fill="url(#ks)"/><ellipse cx="26" cy="36" rx="16" ry="5.5" fill="url(#kf)" stroke="#E8A00A" stroke-width=".8"/></g>
<g><path d="M12 29v5a16 5.5 0 0 0 32 0v-5Z" fill="url(#ks)"/><ellipse cx="28" cy="29" rx="16" ry="5.5" fill="url(#kf)" stroke="#E8A00A" stroke-width=".8"/></g>
<g class="ktop"><path d="M10 22v5a16 5.5 0 0 0 32 0v-5Z" fill="url(#ks)"/><ellipse cx="26" cy="22" rx="16" ry="5.5" fill="url(#kf)" stroke="#E8A00A" stroke-width=".8"/><text x="26" y="24.8" text-anchor="middle" font-size="8.5" font-weight="800" fill="#93370D" font-family="Inter,sans-serif">₹</text><g clip-path="url(#kc)"><rect class="kshine" x="-10" y="14" width="6" height="16" fill="#fff" opacity=".7" transform="skewX(-20)"/></g></g>
<g class="kdrop"><path d="M10 6v4a16 5.5 0 0 0 32 0V6Z" fill="url(#ks)"/><ellipse cx="26" cy="6" rx="16" ry="5.5" fill="url(#kf)" stroke="#E8A00A" stroke-width=".8"/></g>
<g class="kspark" fill="#FDB022"><path d="M45 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><path d="M5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></g></svg></span>`;
function rcHead(D,claimed,intro){
  const day=dayNo(D);const n=claimed?D.after:D.before;
  const eb=S.attn&&!claimed?'<small class="wait">Still waiting for you</small>':intro?'':`<small>Day ${day} of 7${n?` · 🔥 ${n} day streak`:''}</small>`;
  const t=claimed?`<span class="amt">₹${D.reward}</span> added to your wallet`:`Answer &amp; get <span class="amt">₹${D.reward}</span> in wallet`;
  const sub=claimed?(D.week?'Week complete · new week tomorrow':`Come back tomorrow for ₹${D.next}`):intro?'':`Tomorrow ₹${D.next} · Day 7 ₹${D.amts[6]}`;
  return `<div class="rc-head"><div class="rc-txt">${eb}<b>${t}</b>${sub?`<span>${sub}</span>`:''}</div>${STACK}</div>`;
}
function rcLadder(D,claimed,intro){
  if(intro)return '';
  const t=D.today;
  return `<div class="rc-ladder">${D.amts.map((v,i)=>{const done=i<D.done||(claimed&&i===t);const today=i===t&&!claimed;return `<span class="${done?'done':today?'today':''} ${i===6?'goal':''}">${done?ICON.check('#fff'):''}₹${v}</span>`;}).join('')}</div>`;
}
function fixStrips(){document.querySelectorAll('.p21').forEach(s=>{const cols=[...s.querySelectorAll('.col')];if(!cols.length)return;const r=s.getBoundingClientRect();if(!r.width)return;
  const cx=cols.map(c=>{const d=c.querySelector('.dot')||c;const b=d.getBoundingClientRect();return b.left+b.width/2-r.left;});
  const fi=Math.round((parseFloat(getComputedStyle(s).getPropertyValue('--f'))||0)*6);
  s.style.setProperty('--l',cx[0]+'px');s.style.setProperty('--r',(r.width-cx[6])+'px');s.style.setProperty('--fw',(cx[fi]-cx[0])+'px');});}
function render(){
  const D=SCEN[S.scen];$('dateLine').textContent=D.date;const V=PICK.card;
  const pending=!S.claimed;const m=$('merged');
  m.className='merged v-'+V+(pending?'':' claimed')+(S.attn&&pending?' attn':'');
  const intro0=S.intro&&!S.claimed;const sh=document.querySelector('#checkin .sh');
  sh.innerHTML=`<span>Daily reward</span>`+(intro0?'':`<button type="button" class="sh-link ${S.remind?'on':''}" data-act="streakRemind">${S.remind?ICON.check('#667085')+' Reminder On':ICON.bell('#667085')+' Remind Me →'}</button>`);
  const intro=S.intro&&!S.claimed;m.classList.toggle('intro',intro);
  const so=$('streakOut');if(so)so.innerHTML=intro?'':`<div class="merged-strip ${S.claimed?'claimed':''}">${topPanel(V,D,S.claimed,S.scen)}</div>`;
  m.innerHTML=((intro||!S.claimed)?introPanel(D):rhHead(D,true))+'<div class="ck" id="ck"></div>'+((!S.claimed&&D.first)?trustFoot():'')+'<div id="stAction"></div>';
  $('stAction').innerHTML='';const _old=`<button class="linkbtn" type="button" data-act="streakRemind">${S.remind?ICON.check('#475467')+' Daily reminder on · 9 AM':ICON.bell('#475467')+' Remind me tomorrow'}</button>`;
  renderCk();renderGuide();requestAnimationFrame(fixStrips);
}
function renderCk(){
  let h;
  if(S.phase==='ask'){
    h=askHTML(PICK.card,SCEN[S.scen],{sel:S.sel,compose:S.compose,intro:S.intro&&!S.claimed})+
    (S.compose?`<form class="compose" id="cform"><label for="free" class="sr">Apna jawab</label><input id="free" placeholder="Ya apne shabdon mein bataiye…" autocomplete="off"><button class="send" type="submit" aria-label="Bhejein">${FIG.csend}</button></form>`:'');
  }else{
    h=`<div class="ck-ask"><div class="ask-t"><p class="q">${Qtxt}</p></div></div><div class="thread"><div class="me">${S.text}</div><div class="her"><span class="mini"></span>`+
      (S.phase==='typing'?`<span class="typing" aria-label="Hemali likh rahi hain"><i></i><i></i><i></i></span>`:`<div class="b"><small>Astro Hemali · today's prediction</small>${S.ans}</div>`)+`</div></div>`+(S.phase==='done'?`<button type="button" class="btn cc" data-act="contChat">Continue Chat<span class="cc-p">· ₹10/min</span></button>`:'');
  }
  $('ck').innerHTML=h;
}
function showCards(){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.flow==='cards')));
  $('stage').hidden=true;const g=$('allDays');g.hidden=false;
  const D=SCEN['d'+PICK.d];
  let html=`<div class="ad-head"><h2>Daily check-in · card layouts</h2><p>Twenty ways to join the reward and the question, all on Day ${PICK.d}. Pick one to try it live in the flows.</p></div><div class="ad-grid">`;
  html+=CARDS.map(([k,n])=>`<figure class="ad"><figcaption><b>${k}</b> · ${n}</figcaption><div class="merged v-${k}">${topPanel(k,D,false,'d'+PICK.d)}<div class="ck">${askHTML(k,D,{sel:k==='C'?0:undefined})}</div></div><button type="button" class="use ${PICK.card===k?'on':''}" data-usecard="${k}">${PICK.card===k?'✓ In use':'Use in prototype'}</button></figure>`).join('');
  g.innerHTML=html+'</div>';
}
function renderGuide(){
  const done=S.phase==='done';
  $('gTitle').textContent='Personalised guidance';
  const HEART='<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M15 31s-10-5.8-10-13a5.4 5.4 0 0 1 10-2.8A5.4 5.4 0 0 1 25 18c0 7.2-10 13-10 13Z" fill="#FDB022"/><path d="M26 27s-7-4-7-9.2a3.8 3.8 0 0 1 7-2 3.8 3.8 0 0 1 7 2C33 23 26 27 26 27Z" fill="#F79009" opacity=".85"/></svg>';
  const CHAT='<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 9h24a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H18l-7 5v-5H8a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5Z" fill="#FDB022"/><circle cx="14" cy="19" r="1.8" fill="#fff"/><circle cx="20" cy="19" r="1.8" fill="#fff"/><circle cx="26" cy="19" r="1.8" fill="#fff"/></svg>';
  const card=(ic,t,s)=>`<div class="g2"><span class="g2-ic">${ic}</span><div><b>${t}${done?'<i class="upd">Updated</i>':''}</b><span>${s}</span></div><svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h8.5M8.5 4.2 12.3 8l-3.8 3.8" stroke="#475467" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  $('guide').innerHTML=`<div class="g2wrap">${done?'<p class="g2sub">Jo aapne bataya, usi ke hisaab se aaj ke liye ✨</p>':''}${card(HEART,'Match Love','Apna love compatibility score dekhiye')}${card(CHAT,'Relationship Expert','Baat-cheet behtar karne ke aasaan tareeke')}</div>`;
}

/* ---------- sheets ---------- */
function openSheet(type){
  S.sheet=type;const D=SCEN[S.scen];const sh=$('sheet');sh.className='sheet'+(type==='missed'?' grey':'');
  const bar=(n,lbl,right)=>`<div class="prog"><div class="row"><span>${lbl}</span><span>${right}</span></div><div class="segs">${[0,1,2,3,4,5,6].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')}</div></div>`;
  if(type==='claim'){
    const from=D.missed>=0?D.missed+1:0;let total=0;for(let i=from;i<=D.today;i++)total+=D.amts[i];if(/^d[2-7]$/.test(S.scen))total+=WB;
    const sp=[[-26,8,14],[118,0,12],[-14,74,9],[124,60,10]].map(([x,y,s])=>`<i class="spk" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"></i>`).join('');
    sh.innerHTML=`<span class="grab"></span><div class="art"><div class="celebrate">${sp}<div class="coin-lg"><div class="face"><span>₹</span></div></div></div></div>
    <div class="txt"><h2 id="shTitle">₹${D.reward} added to your wallet</h2><p>Come back tomorrow for ₹${D.next}</p></div>
    ${earnBox(D,total)}
    ${S.remind?`<div class="rem-line">Reminder on · we'll remind you tomorrow at 9 AM</div><div class="acts"><button class="btn lg" type="button" data-act="close">Okay</button></div>`
      :`<div class="acts"><button class="btn lg" type="button" data-act="claimRemind">${ICON.bell('#fff')} Set Reminder</button><button class="btn text" type="button" data-act="close">Maybe Later</button></div>`}`;}
  if(type==='intro'){const P=panelParts(D,true,S.scen);
    sh.innerHTML=`<span class="grab"></span><div class="art"><div class="coin-lg"><div class="face"><span>₹</span></div></div></div>
    <div class="txt"><h2 id="shTitle">₹${D.reward} added to your wallet 🎉</h2><p>Answer every day to keep earning.</p></div>
    <div class="intro-strip">${P.w}</div>
    <div class="acts"><button class="btn lg" type="button" data-act="claimRemind">${ICON.bell('#fff')} Set Reminder</button><button class="btn text" type="button" data-act="close">Maybe Later</button></div>`;}
  if(type==='onboard')sh.innerHTML=`<span class="grab"></span><div class="art"><div class="coin-lg"><div class="face"><span>₹</span></div></div></div>
    <div class="txt"><h2 id="shTitle">New: Daily reward</h2><p>Get money in your wallet every day</p></div>
    <ol class="ob-steps"><li><i>1</i><span>Answer 1 question</span></li><li><i>2</i><span>Get money in your wallet</span></li><li><i>3</i><span>Come back tomorrow for more</span></li></ol>
    <div class="acts"><button class="btn lg" type="button" data-act="obGo">Answer now</button><button class="btn text" type="button" data-act="close">Maybe Later</button></div>`;
  if(type==='nudge')sh.innerHTML=`<span class="grab"></span><div class="art"><div class="coin-lg"><div class="face"><span>₹</span></div></div></div>
    <div class="txt"><h2 id="shTitle">Your ₹${D.reward} is waiting</h2><p>Answer 1 quick question about your day and get ₹${D.reward} straight in your wallet.</p></div>
    <div class="acts"><button class="btn lg" type="button" data-act="nudgeGo">Answer now</button><button class="btn text" type="button" data-act="nudgeLater">Maybe Later</button></div>`;
  if(type==='missed')sh.innerHTML=`<span class="grab"></span><div class="art"><div class="coin-lg grey"><div class="face"><span>₹</span></div>${ICON.crack}</div></div>
    <div class="txt"><h2 id="shTitle">You missed a day</h2><p>You did not check in yesterday, so your reward starts again from ₹5.</p></div>
    <div class="prog"><div class="row"><span>Day 1 of 7</span><span>Today: ₹5</span></div><div class="segs"><i class="on"></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="acts"><button class="btn lg" type="button" data-act="missedGo">Restart checkin &amp; get ₹5</button><button class="btn text" type="button" data-act="close">Maybe Later</button></div>`;
  if(type==='reminder'){
    const from=D.missed>=0?D.missed+1:0;let total=0;for(let i=from;i<=D.today;i++)total+=D.amts[i];if(/^d[2-7]$/.test(S.scen))total+=WB;if(!S.claimed)total-=D.reward;
    const sp=[[-26,8,14],[118,0,12],[-14,74,9],[124,60,10]].map(([x,y,s])=>`<i class="spk" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"></i>`).join('');
    const head=S.claimed?`₹${D.reward} added to your wallet`:'Reminder set';
    const sub=S.claimed?`Come back tomorrow for ₹${D.next}`:`Check in today to get ₹${D.reward}`;
    sh.innerHTML=`<span class="grab"></span><div class="art"><div class="celebrate">${sp}<div class="coin-lg"><div class="face"><span>₹</span></div></div></div></div>
    <div class="txt"><h2 id="shTitle">${head}</h2><p>${sub}</p></div>
    ${earnBox(D,total)}
    <div class="rem-line" id="remLine">Reminder set · we'll remind you tomorrow at 9 AM</div>
    <div class="acts"><button class="btn lg" type="button" data-act="close">Okay</button></div>`;}
  $('scrim').classList.add('show');requestAnimationFrame(()=>sh.classList.add('show'));
}
function closeSheet(){
  if(!S.sheet)return;const type=S.sheet;S.sheet=null;if(document.activeElement&&$('sheet').contains(document.activeElement))document.activeElement.blur();
  $('scrim').classList.remove('show');$('sheet').classList.remove('show');
  if(type==='reminder')setStep(STEP[S.flow].on);
  
  if((type==='claim'||type==='intro')&&!S.claimed){S.claimed=true;render();countUp(SCEN[S.scen].reward);if(type==='intro'&&!S.remind)setStep(S.flow==='j3'?'N5':'J6');}
  if(type==='reminder'&&S.flow==='j1')setStep('J6');
  if(type==='onboard'&&S.flow==='j1'&&S.step==='J0')setStep('J1');
  if(type==='claim'&&S.flow==='j2')setTimeout(()=>setStep('K5'),300);
}
function countUp(to){let v=0;const w=$('wallet');w.classList.add('bump');const iv=setInterval(()=>{v++;$('bal').textContent='₹'+v;if(v>=to){clearInterval(iv);setTimeout(()=>w.classList.remove('bump'),400);}},60);}

/* ---------- notifications ---------- */
const STEP={j1:{ask:'J4',ok:'J5',no:'J5',on:'J6',push:'J6'},j2:{ask:'K4',ok:'K5',no:'K5',on:'K5',push:'K2'},j3:{ask:'N5',ok:'N5',no:'N5',on:'N5',push:'N3'},claim:{ask:'A4',ok:'A5',no:'A6',on:'A7',push:'A8'},missed:{ask:'B5',ok:'B6',no:'B6',on:'B7',push:'B8'},type:{ask:'C6',ok:'C7',no:'C7',on:'C8',push:'C9'}};
function askPermission(kind,onDone){
  if(S.perm==='granted'){turnOn(kind);onDone&&onDone();return;}
  if(S.perm==='denied'){onDone&&onDone();toast('Notifications are off · turn them on in Settings');setStep(STEP[S.flow].no);return;}
  S.pending={kind,onDone};$('sys').classList.add('show');setStep(STEP[S.flow].ask);
}
const TIMES=['subah 9 baje'];
function turnOn(kind){
  S.remind=true;if(S.time==null)S.time=0;
  setStep(STEP[S.flow].ok);render();
  toast("Reminder set · we'll remind you tomorrow at 9 AM");if(S.intro)setStep(S.flow==='j1'?'J6':'N5');else setStep(STEP[S.flow].on);
}
function pushMsg(title,body,onTap,step){const n=$('push');n.querySelector('.pt').textContent=title;n.querySelector('.pb').textContent=body;n.querySelector('.pw').textContent='9:00 AM';S.onPush=onTap;n.classList.add('show');if(step)setStep(step);clearTimeout(n._t);}
function showPush(){
  const D=SCEN[S.scen];const day=S.claimed?D.after+1:D.after;const amt=S.claimed?D.next:D.reward;
  const n=$('push');n.querySelector('.pt').textContent=`Day ${day} ka ₹${amt} wait kar raha hai 🔥`;
  n.querySelector('.pb').textContent=`${day-1} out of 7 day streak. Check-in karo, money wallet mein add hoga.`;
  n.querySelector('.pw').textContent='9:00 AM';
  n.classList.add('show');setStep(STEP[S.flow].push);clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('show'),5000);
}
function sysAnswer(allow){
  $('sys').classList.remove('show');const p=S.pending;S.pending=null;if(!p)return;
  if(allow){S.perm='granted';p.onDone&&p.onDone();turnOn(p.kind);}
  else{S.perm='denied';p.onDone&&p.onDone();render();toast('Turn on notifications to get reminders');setStep(STEP[S.flow].no);}
}

/* ---------- check-in ---------- */
function goCheck(){const sc=$('scroll');const ex=$('experts'),ck=$('checkin');sc.scrollTo({top:Math.max(0,Math.min(ex?ex.offsetTop:1e9,ck.offsetTop)-62),behavior:'smooth'});const c=$('ck');c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash');sc.classList.remove('spot');void sc.offsetWidth;sc.classList.add('spot');clearTimeout(sc._sp);sc._sp=setTimeout(()=>sc.classList.remove('spot'),2600);const st={missed:'B2',claim:'A1',type:'C1',j2:'K2'}[S.flow];if(st)setStep(st);}
function answer(text,i){
  hideStreakToast();S.text=text;S.ans=MOODS[i].a;S.phase='typing';renderCk();setStep({missed:'B3',claim:'A2',type:'C4',j1:'J2',j2:'K3',j3:'N5'}[S.flow]);
  setTimeout(()=>{S.phase='done';renderCk();renderGuide();setTimeout(()=>{openSheet(S.intro?'intro':'claim');setStep({missed:'B4',claim:'A3',type:'C5',j1:'J3',j2:'K4',j3:'N5'}[S.flow]);},400);},1200);
}

/* ---------- misc ---------- */
function toast(t){const e=$('toast');e.innerHTML=ICON.okToast+'<span></span>';e.querySelector('span').textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2400);}

function showAll(){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.flow==='all')));
  $('stage').hidden=true;const g=$('allDays');g.hidden=false;
  const card=(D,claimed,key,label)=>{const P=panelParts(D,claimed,key);
    return `<figure class="ad"><figcaption>${label}</figcaption><div class="merged ${claimed?'claimed':''}"><div class="m-top"><div class="m-row"><div class="m-txt"><h3>${P.title}</h3><p>${P.sub}</p></div><span class="fire ${P.n?'':'zero'}">${P.fire}</span></div>${P.w}</div></div></figure>`;};
  let html='<div class="ad-head"><h2>All streak days</h2><p>Milestone track, Day 1–7 before answering and after claiming, plus the missed-day restart. Same component as Figma: Streak panel · Milestone.</p></div>';
  html+='<h3 class="ad-row">Before answering (Pending)</h3><div class="ad-grid">'+[1,2,3,4,5,6,7].map(d=>card(SCEN['d'+d],false,'d'+d,`Day ${d}`)).join('')+'</div>';
  html+='<h3 class="ad-row">After claiming (Claimed)</h3><div class="ad-grid">'+[1,2,3,4,5,6,7].map(d=>card(SCEN['d'+d],true,'d'+d,`Day ${d}`)).join('')+'</div>';
  html+='<h3 class="ad-row">Missed yesterday</h3><div class="ad-grid">'+card(SCEN.reset,false,'reset','Restart · Day 1')+'</div>';
  g.innerHTML=html;
}
function start(flow){
  $('stage').hidden=false;$('allDays').hidden=true;
  S=fresh(flow);
  {const t=$('stoast');if(t){t.classList.remove('show');t.hidden=true;}}
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.flow===flow)));
  $('push').classList.remove('show');$('sheet').className='sheet';KB.classList.remove('show');$('scroll').classList.remove('kb-open');$('scrim').classList.remove('show');$('sys').classList.remove('show');$('bal').textContent='₹0';
  render();renderSteps();
  const sc=$('scroll');sc.style.scrollBehavior='auto';sc.scrollTop=0;sc.style.scrollBehavior='';
  if(flow==='claim')setStep('A1');
  if(flow==='j1'){setStep('J0');setTimeout(()=>openSheet('onboard'),400);}
  if(flow==='j3'){setStep('N1');setTimeout(()=>openSheet('onboard'),400);}
  if(flow==='j2'){setStep('K2');setTimeout(showStreakToast,600);}
  $('jnext').hidden=flow!=='j3';
  if(flow==='missed'){if(!MISSED_SEEN){MISSED_SEEN=true;setStep('B1');setTimeout(()=>openSheet('missed'),350);}else{setStep('B2');setTimeout(()=>{toast('You missed a day. Starting again from ₹5');goCheck();},350);}}
  if(flow==='type'){setTimeout(()=>{goCheck();setTimeout(()=>{const f=document.querySelector('.write');if(f)f.classList.add('hint');},500);},300);}
  onScroll();
  try{history.replaceState(null,'','#'+flow);}catch(e){}
}
// Your Experts always stays above Daily reward — the attention state no longer hoists
// the check-in section above it.
function attn(on){S.attn=on;render();}
var MISSED_SEEN=false;
function hideStreakToast(){const t=$('stoast');if(!t)return;t.classList.remove('show');setTimeout(()=>t.hidden=true,250);}
function showStreakToast(){if(S.flow!=='j2'||S.claimed||S.phase!=='ask')return;const D=SCEN[S.scen];const n=D.before;const t=$('stoast');
  t.innerHTML=`<span class="st-ic">🔥</span><div class="st-b"><p><b>Day ${n+1}:</b> Answer today to get ₹${D.reward}</p><div class="st-seg">${[0,1,2,3,4,5,6].map(i=>`<i class="${i<n?'on':i===n?'now':''}"></i>`).join('')}</div></div><button type="button" class="st-go" data-act="stGo">Answer</button><button type="button" class="st-x" data-act="stClose" aria-label="Close">✕</button>`;
  t.hidden=false;requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(t._h);t._h=setTimeout(hideStreakToast,5000);}
function nextTry(){
  if(S.claimed||S.phase!=='ask'){toast('Already answered · no more nudges');return;}
  const st=S.step;
  if(st==='N1'){closeSheet();attn(true);const sc=$('scroll');sc.scrollTop=0;setTimeout(()=>{openSheet('nudge');setStep('N2');},300);return;}
  if(st==='N2'){closeSheet();setTimeout(()=>pushMsg('Answer 1 question, get ₹15 today 🎁','Takes 5 seconds. Money goes to your wallet.',()=>{goCheck();},'N3'),400);return;}
  if(st==='N3'){$('push').classList.remove('show');S.onPush=null;setStep('N4');toast('3 tries done · we stop nudging. Card stays on Today.');return;}
  toast('No more tries · card stays quietly on Today');
}
function onScroll(){$('head').classList.toggle('scrolled',$('scroll').scrollTop>40);}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const tab=e.target.closest('.tabs button');if(tab){if(tab.dataset.flow==='all'){showAll();return;}if(tab.dataset.flow==='cards'){showCards();return;}start(tab.dataset.flow);return;}
  const uc=e.target.closest('[data-usecard]');if(uc){PICK.card=uc.dataset.usecard;document.querySelectorAll('#pickC button').forEach(x=>x.classList.toggle('on',x.dataset.c===PICK.card));start('j2');return;}
  if(e.target.closest('#allDays'))return;
  const t=e.target.closest('button');if(!t)return;
  const a=t.dataset.act;
  if(t.id==='restart')return start(S.flow);
  if(t.id==='allow')return sysAnswer(true);
  if(t.id==='deny')return sysAnswer(false);
  if(t.id==='pushBtn'){if(!S.remind){toast('Set a reminder first');return;}return showPush();}
  if(t.closest('#push')){$('push').classList.remove('show');if(S.onPush){const f=S.onPush;S.onPush=null;f();return;}start(S.flow);toast('Opened from notification');return;}
  if(t.id==='jnext')return nextTry();
  if(a==='obGo'){closeSheet();if(S.flow==='j1')setStep('J1');setTimeout(goCheck,350);return;}
  if(a==='nudgeGo'){closeSheet();setTimeout(goCheck,350);return;}
  if(a==='nudgeLater'){closeSheet();return;}
  if(t.dataset.m!==undefined){const i=+t.dataset.m;return answer(MLAB[i],i);}
  if(t.dataset.sel!==undefined){S.sel=+t.dataset.sel;renderCk();return;}
  if(a==='submitSel'&&S.sel!=null){const i=S.sel;return answer(MLAB[i],i);}
  if(a==='goCheck')return goCheck();
  if(a==='write'){S.compose=true;renderCk();const i=$('free');i&&i.focus();return;}
  if(a==='contChat'){toast('Opening chat with Astro Hemali');return;}
  if(a==='stGo'){hideStreakToast();goCheck();return;}
  if(a==='stClose'){const t=$('stoast');t.classList.remove('show');setTimeout(()=>t.hidden=true,250);return;}
  if(a==='close')return closeSheet();
  if(a==='claimRemind')return askPermission('streak',closeSheet);
  if(a==='streakRemind'){if(S.remind){S.remind=false;render();toast('Reminder removed');return;}return askPermission('streak');}
  if(a==='missedGo'){closeSheet();setStep('B2');setTimeout(goCheck,350);return;}
  if(a==='missedRemind')return askPermission('streak',closeSheet);
});
$('scrim').addEventListener('click',closeSheet);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});
document.addEventListener('submit',e=>{if(e.target.id!=='cform')return;e.preventDefault();const v=$('free').value.trim();if(!v){$('free').focus();return;}
  const l=v.toLowerCase();const i=/achha|accha|khush|badhiya|good/.test(l)?0:/theek|thik|ok|normal/.test(l)?1:2;answer(v.replace(/[<>&]/g,''),i);});
$('scroll').addEventListener('scroll',onScroll,{passive:true});
$('permAllowed').addEventListener('change',()=>start(S.flow));

/* ---------- simulated keyboard ---------- */
const KB=$('kbd');
const ROWS=['qwertyuiop','asdfghjkl','zxcvbnm'];
KB.innerHTML='<div class="sug"><span>Achha</span><span>Okay</span><span>Pareshan</span></div>'+
  ROWS.map((r,i)=>'<div class="row">'+(i===2?'<button class="w" data-k="shift">⇧</button>':'')+[...r].map(k=>`<button data-k="${k}">${k}</button>`).join('')+(i===2?'<button class="w" data-k="del">⌫</button>':'')+'</div>').join('')+
  '<div class="row"><button class="w" data-k="?123">?123</button><button data-k=",">,</button><button class="sp" data-k=" ">Hinglish</button><button data-k=".">.</button><button class="go" data-k="go">➤</button></div>';
const fine=matchMedia('(pointer:fine)').matches;
function kbShow(){if(!fine)return;const sc=$('scroll');KB.classList.add('show');sc.style.setProperty('--kbh',KB.offsetHeight+'px');sc.classList.add('kb-open');
  setTimeout(()=>{const f=$('cform');if(!f)return;const r=f.getBoundingClientRect(),p=$('phone').getBoundingClientRect();const target=p.bottom-KB.offsetHeight-16;if(r.bottom>target||r.top<p.top+96)sc.scrollTo({top:sc.scrollTop+(r.bottom-target),behavior:'smooth'});},320);}
function kbHide(){KB.classList.remove('show');$('scroll').classList.remove('kb-open');}
KB.addEventListener('mousedown',e=>e.preventDefault());
KB.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;const inp=$('free');if(!inp)return;const k=b.dataset.k;
  if(e.target.closest('.sug')){}
  if(k==='del')inp.value=inp.value.slice(0,-1);
  else if(k==='go'){kbHide();$('cform').requestSubmit();return;}
  else if(k==='shift'||k==='?123'){}
  else inp.value+=k;
  inp.dispatchEvent(new Event('input',{bubbles:true}));inp.focus();});
KB.querySelector('.sug').addEventListener('click',e=>{const s=e.target.closest('span');const inp=$('free');if(!s||!inp)return;inp.value=s.textContent;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.focus();});
document.addEventListener('focusin',e=>{if(e.target.id==='free'){kbShow();if(S.flow==='type'&&S.phase==='ask'){setStep('C2');}}});
document.addEventListener('input',e=>{if(e.target.id==='free'&&S.flow==='type'&&S.phase==='ask'&&e.target.value)setStep('C3');});
document.addEventListener('focusout',e=>{if(e.target.id==='free')setTimeout(()=>{if(document.activeElement!==$('free'))kbHide();},0);});
document.addEventListener('submit',()=>kbHide(),true);

document.querySelectorAll('#pickI button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();PICK.ih=b.dataset.i;document.querySelectorAll('#pickI button').forEach(x=>x.classList.toggle('on',x===b));render();}));
document.querySelectorAll('#pickC button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();PICK.card=b.dataset.c;document.querySelectorAll('#pickC button').forEach(x=>x.classList.toggle('on',x===b));start(S.flow);}));
document.querySelectorAll('#pickV button,#pickD button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const g=b.parentElement;g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(b.dataset.v)PICK.v=b.dataset.v;if(b.dataset.d)PICK.d=b.dataset.d;start(S.flow);}));
document.querySelectorAll('#pickV button').forEach(x=>x.classList.toggle('on',x.dataset.v===PICK.v));document.querySelectorAll('#pickD button').forEach(x=>x.classList.toggle('on',x.dataset.d===PICK.d));
const h=(location.hash||'').slice(1);start(FLOWS[h]?h:'j1');
})();
