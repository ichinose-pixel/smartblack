(function(){
'use strict';
const A=window.SMARTBLACK_ASSETS, Flow=window.SmartblackFlow;
const $=id=>document.getElementById(id),app=$('app'),flow=new Flow();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let phase='',ready=false,last=performance.now(),feedbackUntil=0,stepUntil=0,chewUntil=0,sound=false,audio=null,swipe=null,detailsFocus=null;
const flights=new Set();
const phaseIndex={intro:0,eat:0,run:1,result:1,care:2,finish:2,cta:3};
const phaseLabels={intro:'まもなくスタート',eat:'食べる楽しさ、満喫！',run:'8秒の運動チャレンジ',result:'チャレンジ、おつかれさま！',care:'毎日のコーヒーに、ひと工夫',finish:'今日から、1日1杯の習慣',cta:'SMART BLACK'};
function beep(freq=520){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.13);}catch{}}
function feedback(text,duration=.85){$('feedback').textContent=text;feedbackUntil=flow.total+duration;$('feedback').classList.add('show');}
function clearEffects(){for(const f of flights){f.animation.cancel();f.el.remove();}flights.clear();$('character').classList.remove('chew','stepping');feedbackUntil=stepUntil=chewUntil=0;$('feedback').classList.remove('show');}
function setCharacter(){const keys=['slim','chubby','fat','round'];const src=A[keys[flow.level()]];for(const img of document.querySelectorAll('.character-layer'))img.src=src;}
function enter(){
  phase=flow.phase;app.dataset.phase=phase;clearEffects();
  $('intro').hidden=phase!=='intro';$('care').hidden=!['care','finish'].includes(phase);$('cta').hidden=phase!=='cta';
  $('game-header').hidden=phase==='cta';$('controls').hidden=phase==='cta';
  $('eat-actions').hidden=phase!=='eat';$('run-actions').hidden=phase!=='run';$('care-actions').hidden=!['care','finish'].includes(phase);
  $('meter').hidden=!['eat','run'].includes(phase);$('stage-note').hidden=!['eat','run','result'].includes(phase);
  $('stage-note').textContent=phase==='eat'?'食べるボタンをタップ':phase==='run'?'左右にスワイプでもOK':'あなたのチャレンジ結果';
  $('phase-label').textContent=phaseLabels[phase];
  document.querySelectorAll('.progress span').forEach((e,i)=>{e.className=i<phaseIndex[phase]?'done':i===phaseIndex[phase]?'active':'';});
  $('brew').disabled=phase==='finish';$('brew').textContent=phase==='finish'?'☕ できあがり':'☝ コーヒーをいれる';
  $('cup-scene').classList.toggle('brewing',phase==='finish');
  if(phase==='intro'){$('instruction').textContent='約24秒で遊べるミニゲーム';$('intro-message').textContent='食べて、動いて。\n毎日の習慣を見つけよう。';}
  if(phase==='eat'){$('instruction').textContent='タップで5口！ おいしく食べよう';$('eat').disabled=false;$('eat').textContent='🍔 食べる';$('meter-label').textContent='満腹メーター';}
  if(phase==='run'){$('instruction').textContent='左右の足を交互にタップ！';$('meter-label').textContent='目標12歩';feedback('いち、に！ リズムよく');beep(650);}
  if(phase==='result'){
    const msg=flow.steps>=12?'目標達成！ よく動きました':flow.steps>0?'ナイストライ！ '+flow.steps+'歩':'まずは、できることから。';
    $('instruction').textContent=flow.steps>=12?'運動も、毎日の習慣に。':'自分のペースで、少しずつ。';feedback(msg,2.1);$('result-summary').textContent=flow.steps>0?'運動チャレンジ '+flow.steps+'歩':'毎日に、小さなひと工夫を。';
  }
  if(phase==='care'){$('instruction').textContent='次は、いつもの一杯を。';$('care-hint').textContent='ボタンをタップして、一杯いれてみよう';}
  if(phase==='finish'){$('instruction').textContent='香りを楽しむ、毎日の一杯。';$('care-hint').textContent='お湯でも、水でも。1日1本を目安に。';beep(780);}
  if(phase==='cta'){document.querySelector('.cta-link').tabIndex=0;}
}
function paint(){
  if(flow.phase!==phase)enter();
  const timed=!['cta','result'].includes(phase);
  $('countdown').textContent=timed?'あと '+flow.remaining()+' 秒':phase==='result'?flow.steps+' 歩':'';
  $('intro-progress').style.width=Math.min(100,flow.elapsed/2*100)+'%';
  if(phase==='eat'){$('meter-fill').style.width=flow.meals/5*100+'%';$('meter-value').textContent=flow.meals+' / 5口';}
  if(phase==='run'){$('meter-fill').style.width=Math.min(100,flow.steps/12*100)+'%';$('meter-value').textContent=flow.steps+' / 12歩';}
  $('feedback').classList.toggle('show',flow.total<feedbackUntil);
  $('character').classList.toggle('stepping',phase==='run'&&flow.total<stepUntil);
  $('character').classList.toggle('chew',phase==='eat'&&flow.total<chewUntil);
}
function foodFlight(){
  const st=$('stage').getBoundingClientRect(),ch=$('character').getBoundingClientRect(),plate=$('plate').getBoundingClientRect();
  const el=document.createElement('img');el.className='flying-food';el.alt='';el.src=A.food[(flow.meals-1)%A.food.length];el.draggable=false;
  const size=Math.min(105,st.width*.24);el.style.width=size+'px';el.style.height=size+'px';
  const sx=plate.left+plate.width/2-st.left-size/2,sy=plate.top+plate.height*.45-st.top-size/2;
  const tx=ch.left+ch.width*.5-st.left-size/2,ty=ch.top+ch.height*.17-st.top-size/2;
  el.style.left=sx+'px';el.style.top=sy+'px';$('stage').append(el);
  const animation=el.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${(tx-sx)*.6}px,${ty-sy-18}px) scale(.8)`,opacity:1,offset:.65},{transform:`translate(${tx-sx}px,${ty-sy}px) scale(.12)`,opacity:0}],{duration:reduced?80:430,easing:'ease-in-out'});
  const flight={el,animation};flights.add(flight);animation.onfinish=()=>{flights.delete(flight);el.remove();if(flow.phase==='eat'){chewUntil=flow.total+.5;paint();}};
}
function eat(){if(!ready||!flow.eat())return;setCharacter();foodFlight();beep(500+flow.meals*40);feedback(['','いただきます！','おいしい！','ついつい、もうひと口。','お腹も、まんぷく。','ごちそうさま！'][flow.meals]);$('plate').src=A.food[flow.meals%A.food.length];if(flow.meals===5){$('eat').disabled=true;$('eat').textContent='✓ ごちそうさま';$('instruction').textContent='次は、8秒の運動チャレンジ！';}paint();}
function step(side){if(!ready||!flow.step())return;stepUntil=flow.total+.55;beep(side==='left'?420:510);if(flow.steps===12)feedback('目標達成！ いいペース！',1.3);else if(flow.steps%4===0)feedback(flow.steps+'歩！ その調子');else if(flow.steps<3)feedback(side==='left'?'いち！':'に！',.4);paint();}
function brew(){if(!ready||!flow.brew())return;paint();}
$('eat').addEventListener('click',eat);$('left-step').addEventListener('click',()=>step('left'));$('right-step').addEventListener('click',()=>step('right'));$('brew').addEventListener('click',brew);
$('stage').addEventListener('pointerdown',e=>{if(phase!=='run'||!e.isPrimary)return;swipe={id:e.pointerId,x:e.clientX,y:e.clientY};$('stage').setPointerCapture(e.pointerId);});
$('stage').addEventListener('pointerup',e=>{const start=swipe;swipe=null;if(!start||start.id!==e.pointerId||phase!=='run')return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>=28)step(dx<0?'left':'right');});
['pointercancel','lostpointercapture'].forEach(event=>$('stage').addEventListener(event,()=>{swipe=null;}));
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';$('sound').setAttribute('aria-label',sound?'音をオフにする':'音をオンにする');$('sound').setAttribute('aria-pressed',String(sound));if(sound)beep();});
$('replay').addEventListener('click',()=>{clearEffects();flow.reset();phase='';swipe=null;last=performance.now();setCharacter();$('plate').src=A.food[0];paint();$('sound').focus({preventScroll:true});});
$('show-details').addEventListener('click',()=>{detailsFocus=document.activeElement;$('disclosure').hidden=false;$('cta').inert=true;$('close-details').focus();});
function closeDetails(){$('disclosure').hidden=true;$('cta').inert=false;detailsFocus?.focus();}
$('close-details').addEventListener('click',closeDetails);
document.addEventListener('keydown',e=>{
 if(!$('disclosure').hidden){if(e.key==='Escape'){e.preventDefault();closeDetails();}if(e.key==='Tab'){const items=[...$('disclosure').querySelectorAll('button,a')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}return;}
 if(e.repeat||e.target.closest('button,a'))return;
 if(phase==='eat'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();eat();}
 if(phase==='run'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowLeft'?'left':'right');}
});
document.addEventListener('visibilitychange',()=>{last=performance.now();swipe=null;});
function tick(now){const dt=(now-last)/1000;last=now;if(ready&&!document.hidden&&phase!=='cta'){flow.advance(Math.min(dt,.25));paint();}requestAnimationFrame(tick);}
// Decode before enabling actions; no handlers can reference an unready scene.
async function boot(){
  try{
    const urls=[A.slim,A.chubby,A.fat,A.round,A.bg,A.product,...A.food];
    await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=src;})));
    $('food-backdrop').style.backgroundImage='url("'+A.bg+'")';$('plate').src=A.food[0];
    $('care-product').src=A.product;$('cta-product').src=A.product;setCharacter();ready=true;last=performance.now();$('intro-message').textContent='食べて、動いて。\n毎日の習慣を見つけよう。';paint();
  }catch{$('loading-error').hidden=false;$('intro').hidden=true;}
}
paint();$('intro-message').textContent='ゲームを準備しています…';boot();requestAnimationFrame(tick);
})();
