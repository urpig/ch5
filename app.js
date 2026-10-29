import {lessons,finalQuiz,sources} from './content.js';
import {STORAGE_KEY,fresh,restore,ready,requirement,mastered,submit,act} from './core.js';
import {labMarkup} from './labs.js';
import {installLabGestures,animateAction} from './lab-gestures.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let raw={},storageOK=true,current=1;
try{raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch{storageOK=false;}
let states=restore(raw);
const qs=id=>id===16?finalQuiz:lessons[id-1].quiz;
const speech=(person,line,expression)=>`<div class="story-speech story-speech--${person}"><span class="story-portrait story-portrait--${person}" data-expression="${expression}" aria-hidden="true"></span><p><b>${person==='kui'?'小葵':'阿公'}</b>${line}</p></div>`;
function card(c){return `<article class="exploration-card ch5-card" id="card-${c.id}" aria-labelledby="title-${c.id}"><header class="chapter-header"><div class="chapter-kicker"><span>${c.act}</span><span>${c.place} · ${String(c.id).padStart(2,'0')} / 16</span></div><div class="title-row"><span class="card-number">${String(c.id).padStart(2,'0')}</span><h2 id="title-${c.id}">${c.title}</h2><button class="reset-card" type="button" data-reset="${c.id}" aria-label="重設第${c.id}卡">↺ 重設本卡</button></div><p class="core-question">${c.question}</p></header><div class="chapter-body"><p class="opening">${c.story}</p><section class="manuscript" aria-label="第${c.id}頁百工秘卷卷文"><div class="manuscript-heading"><span class="scroll-seal" aria-hidden="true">卷</span><span>《百工秘卷》<small>第 ${String(c.id).padStart(2,'0')} 頁 · 讀一句，驗一理</small></span></div>${c.scroll.map(([name,verse])=>`<blockquote><p>${escape(verse)}</p><cite>〈${escape(name)}〉</cite></blockquote>`).join('')}</section><div class="story-dialogue">${speech('kui',c.kui,c.expression)}${speech('grandpa',c.grandpa,'thoughtful')}</div><div class="prediction-block" id="prediction-${c.id}"></div><section class="interactive-workbench" aria-label="${c.title}的互動實驗"><div class="bench-heading"><div><span class="eyebrow">動手找證據</span><h3>${c.place}工作台</h3></div><span class="virtual-tag">虛擬探究</span></div><p class="task-line">${c.task}</p><fieldset class="lab-fieldset" id="lab-${c.id}" aria-label="第${c.id}卡操作區"></fieldset><p class="lab-feedback" id="feedback-${c.id}" role="status" aria-live="polite"></p></section><section class="notebook" aria-labelledby="record-title-${c.id}"><div><span class="eyebrow">OBSERVATION NOTES</span><h3 id="record-title-${c.id}">小葵的觀察紀錄</h3></div><div id="records-${c.id}"></div></section><div id="reveal-${c.id}"></div><div id="quiz-${c.id}"></div><div class="chapter-bridge"><span class="eyebrow">翻到下一頁</span><p>${c.bridge}</p></div></div><footer class="chapter-footer">${c.id>1?`<a href="#card-${c.id-1}">← 上一張</a>`:'<span>先觀察，再解釋</span>'}<span class="card-status" id="status-${c.id}"></span><a class="next" href="${c.id<16?'#card-'+(c.id+1):'#chapter-top'}">${c.id<16?'帶著證據翻下一頁 →':'回到故事起點 ↑'}</a></footer></article>`;}
$('#lesson').innerHTML=lessons.map(card).join('');
$('#source-content').innerHTML=`<div class="comparison-table"><table><thead><tr><th>範圍</th><th>卡片</th></tr></thead><tbody><tr><td>有機物特徵與乾餾</td><td>01–03</td></tr><tr><td>烴、醇、有機酸、酯與結構</td><td>04–08</td></tr><tr><td>清潔原理、皂化與水質</td><td>09–11</td></tr><tr><td>聚合物、衣料、食品、塑膠與5R</td><td>12–15</td></tr><tr><td>章末整合</td><td>16 · 十題跨觀念測驗</td></tr></tbody></table></div><ul>${sources.map(([name,url,description])=>`<li><a href="${url}" target="_blank" rel="noopener">${name} ↗</a><p>${description}</p></li>`).join('')}</ul><p>模型限制：不計算乾餾產率、酯化平衡常數或清潔率；所有反應階段與分子位置為教學示意。衣料使用代表纖維的定性性質，沒有虛構吸水或伸長數據。南一完整現行課本未取得，跨版本核對範圍以公開資源為限。</p>`;
function prediction(id){const c=lessons[id-1],s=states[id];$('#prediction-'+id).innerHTML=`<span class="step-label">先留一個預測</span><p>你目前比較支持哪個想法？操作後可以修正。</p><div class="prediction-options">${c.predict.map((p,i)=>`<button type="button" data-predict="${i}" aria-pressed="${s.prediction===i}" class="${s.prediction===i?'selected':''}"><span>${s.prediction===i?'✓':'○'}</span>${p}</button>`).join('')}</div>`;}
function showLab(id){const s=states[id],el=$('#lab-'+id);el.disabled=s.prediction===null;el.setAttribute('aria-busy','false');el.innerHTML=labMarkup(id,s);if(s.prediction===null)el.querySelector('.bench-guide b').textContent='先留下你的預測，接著就能拿取器材。';$('#feedback-'+id).textContent=s.prediction===null?'先選一個預測，工作台就準備好了。':s.feedback||requirement(id,s);}
function showRecords(id){const s=states[id];$('#records-'+id).innerHTML=s.log.length?`<ol>${s.log.map(t=>`<li>${escape(t)}</li>`).join('')}</ol>`:'<p class="empty-record">先操作一次，紀錄會出現在這裡。</p>';}
function showReveal(id){const c=lessons[id-1],s=states[id];$('#reveal-'+id).innerHTML=ready(id,s)?`<section class="discovery"><span class="eyebrow">把證據連成解釋</span><h3>阿公的科學旁註</h3><p>${c.discover}</p><details class="concept-check"><summary>本頁觀念核對 · ${c.concepts.length} 項</summary><ul>${c.concepts.map(t=>`<li>${escape(t)}</li>`).join('')}</ul></details></section>`:`<p class="evidence-needed"><span>○</span>${requirement(id,s)}，再揭開科學解釋。</p>`;}
function showQuiz(id){const s=states[id],q=qs(id);if(!ready(id,s)){$('#quiz-'+id).innerHTML='';return;}const n=q.filter((_,i)=>s.quiz[i]?.correct).length;$('#quiz-'+id).innerHTML=`<section class="practice"><div class="practice-heading"><span class="eyebrow">${id===16?'FINAL CHALLENGE':'TRY IT YOURSELF'}</span><b>${n} / ${q.length}</b></div><h3>${id===16?'秘卷末頁 · 十道證據挑戰':'小試身手'}</h3>${q.map((item,i)=>{const a=s.quiz[i];return `<fieldset class="question"><legend><span>${i+1}</span>${item.text}</legend><div class="answer-options">${item.options.map((o,j)=>`<button type="button" data-question="${i}" data-choice="${j}" aria-pressed="${a?.choice===j}" class="${a?.choice===j?(a.correct?'correct':'incorrect'):''}"><span>${String.fromCharCode(65+j)}</span>${o}</button>`).join('')}</div>${a?`<p class="answer-feedback ${a.correct?'success':'retry'}" role="status">${a.correct?'✓ '+item.why:'再想一想：'+item.hints[a.choice]+' 可以直接改選重試。'}</p>`:''}</fieldset>`;}).join('')}${id===16?`<div class="final-score"><b>${n} / 10</b><p>${n===10?'秘卷解讀完成！你已用實驗證據寫好自己的科學旁註。':'秘卷的空白旁註等待你完成；答錯可以回看相關卡片再重試。'}</p><small>首次作答正確：${q.filter((item,i)=>s.quiz[i]?.history?.[0]===item.answer).length} / 10</small></div>`:''}</section>`;}
function route(){const count=lessons.filter(c=>mastered(c.id,states[c.id],qs(c.id))).length;$('#mastery-label').textContent=$('#top-progress').textContent=count+' / 16';$('#mastery-progress').value=count;$('#storage-note').textContent=storageOK?'觀察與作答已保存在這台裝置。':'瀏覽器未允許保存；本次操作仍可繼續。';$('#route').innerHTML=lessons.map(c=>`<a href="#card-${c.id}" ${current===c.id?'aria-current="step"':''} class="${mastered(c.id,states[c.id],qs(c.id))?'mastered':''}"><span>${String(c.id).padStart(2,'0')}</span><span>${c.title}</span><i aria-label="${mastered(c.id,states[c.id],qs(c.id))?'已掌握':'待探索'}">${mastered(c.id,states[c.id],qs(c.id))?'✓':'○'}</i></a>`).join('');for(const [i,range] of [[0,[1,2,3,4]],[1,[5,6,7,8]],[2,[9,10,11]],[3,[12,13,14,15]]]){const done=range.every(id=>mastered(id,states[id],qs(id)));$('[data-workshop="'+i+'"]').textContent=done?'已讀懂 ✓':'待解讀';}}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(states));storageOK=true;}catch{storageOK=false;}route();}
function status(id){const m=mastered(id,states[id],qs(id));$('#status-'+id).textContent=m?'✓ 已掌握':ready(id,states[id])?'證據已齊，完成小試身手':'探索中';}
function refresh(id){prediction(id);showLab(id);showRecords(id);showReveal(id);showQuiz(id);status(id);}
lessons.forEach(c=>refresh(c.id));route();
function rememberFocus(el){return {action:el.dataset.action,value:el.dataset.value,tag:el.tagName};}
function restoreFocus(id,f){if(!f)return;const candidates=[...$('#lab-'+id).querySelectorAll('[data-action]')];const el=candidates.find(x=>x.dataset.action===f.action&&x.dataset.value===f.value&&x.tagName===f.tag&&!x.disabled);if(el)el.focus({preventScroll:true});else{const feedback=$('#feedback-'+id);feedback.tabIndex=-1;feedback.focus({preventScroll:true});}} 
function commitAction(id,action,value,el){const f=el?rememberFocus(el):null;act(id,states[id],action,value);showLab(id);showRecords(id);showReveal(id);showQuiz(id);status(id);save();restoreFocus(id,f);}
const pending=new Map();
let runSerial=0;
async function run(id,action,value,el){
 if(pending.has(id)||states[id].prediction===null)return;
 const token=++runSerial;pending.set(id,token);
 const field=$('#lab-'+id);field.setAttribute('aria-busy','true');field.disabled=true;
 try{
  await animateAction(field,el,action);
  if(pending.get(id)!==token)return;
  commitAction(id,action,value,el);
 }finally{
  if(pending.get(id)===token){pending.delete(id);field.disabled=states[id].prediction===null;field.setAttribute('aria-busy','false');}
 }
}
installLabGestures($('#lesson'),{
 canAct:id=>states[id].prediction!==null&&!pending.has(id),
 perform:run,
 pick:(id,n)=>act(id,states[id],'pick',n),
 feedback:(id,text)=>{$('#feedback-'+id).textContent=text;}
});
$('#lesson').addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;const article=el.closest('.ch5-card');if(!article)return;const id=Number(article.id.replace('card-',''));const s=states[id];if(el.dataset.reset){pending.delete(id);states[id]=fresh(id);refresh(id);save();return;}if(el.dataset.predict!==undefined){if(pending.has(id))return;s.prediction=Number(el.dataset.predict);prediction(id);showLab(id);save();$('#prediction-'+id).querySelector('[aria-pressed="true"]').focus({preventScroll:true});return;}if(el.dataset.question!==undefined){const i=Number(el.dataset.question),j=Number(el.dataset.choice);submit(s,i,j,qs(id)[i]);showQuiz(id);status(id);save();$('#quiz-'+id).querySelector(`[data-question="${i}"][data-choice="${j}"]`).focus({preventScroll:true});return;}if(el.dataset.action&&s.prediction!==null)run(id,el.dataset.action,el.dataset.boolean==='true'?el.dataset.value==='true':el.dataset.value,el);});
$('#lesson').addEventListener('change',e=>{const el=e.target;if(!el.matches('input[data-action],select[data-action]'))return;const id=Number(el.closest('.ch5-card').id.replace('card-',''));if(states[id].prediction===null)return;run(id,el.dataset.action,el.type==='checkbox'?el.checked:el.value,el);});
let routeFrame=0;
function syncCurrentCard(){
  routeFrame=0;
  const cards=$$('.ch5-card');
  const line=Math.min(180,innerHeight*.25);
  const active=cards.find(c=>{const r=c.getBoundingClientRect();return r.top<=line&&r.bottom>line;})||cards.find(c=>c.getBoundingClientRect().top>line);
  if(!active)return;
  current=Number(active.id.replace('card-',''));
  $$('#route a').forEach(a=>{if(a.hash==='#card-'+current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function scheduleRoute(){if(!routeFrame)routeFrame=requestAnimationFrame(syncCurrentCard);}
addEventListener('scroll',scheduleRoute,{passive:true});
addEventListener('resize',scheduleRoute);
scheduleRoute();
if(/^#card-\d+$/.test(location.hash))requestAnimationFrame(()=>$(location.hash)?.scrollIntoView());
