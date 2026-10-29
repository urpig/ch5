// Pointer input uses the same domain actions as click / keyboard, including on touch screens.
export function installLabGestures(root,{canAct,perform,pick,feedback}){
 let drag=null,suppressUntil=0;
 root.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 const clear=()=>{if(!drag)return;drag.ghost?.remove();drag.el.classList.remove('is-dragging');root.querySelectorAll('.drop-ready,.drag-over').forEach(el=>el.classList.remove('drop-ready','drag-over'));drag=null;};
 const targetAt=(x,y)=>{const el=document.elementFromPoint(x,y);if(!el||!drag)return null;const card=el.closest('.ch5-card');if(!card||Number(card.id.slice(5))!==drag.id)return null;
  if(drag.type==='sample')return el.closest('[data-drop]');
  if(drag.type==='resource')return el.closest('[data-r-drop]');
  const stage=el.closest('[data-lab-drop]');return stage?.dataset.labDrop.split(' ').includes(drag.el.dataset.action)?stage:null;
 };
 root.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-transfer],[data-drag],[data-r-drag]');if(!el||el.disabled||e.button!==0)return;const id=Number(el.closest('.ch5-card').id.slice(5));if(!canAct(id))return;drag={el,id,type:el.hasAttribute('data-drag')?'sample':el.hasAttribute('data-r-drag')?'resource':'tool',x:e.clientX,y:e.clientY,pointer:e.pointerId,moved:false,ghost:null};el.setPointerCapture(e.pointerId);});
 root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;e.preventDefault();if(!drag.moved){drag.moved=true;drag.el.classList.add('is-dragging');const g=document.createElement('div');g.className='lab-drag-ghost';g.setAttribute('aria-hidden','true');g.innerHTML=drag.el.innerHTML;g.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));document.body.append(g);drag.ghost=g;}drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';root.querySelectorAll('.drop-ready,.drag-over').forEach(el=>el.classList.remove('drop-ready','drag-over'));targetAt(e.clientX,e.clientY)?.classList.add(drag.type==='tool'?'drop-ready':'drag-over');});
 root.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pointer)return;const d=drag,target=targetAt(e.clientX,e.clientY);if(d.moved){suppressUntil=performance.now()+400;e.preventDefault();if(target){if(d.type==='sample'||d.type==='resource'){pick(d.id,Number(d.type==='sample'?d.el.dataset.drag:d.el.dataset.rDrag));perform(d.id,'sort',d.type==='sample'?target.dataset.drop:target.dataset.rDrop,target);}else perform(d.id,d.el.dataset.action,d.el.dataset.boolean==='true'?d.el.dataset.value==='true':d.el.dataset.value,d.el);}else feedback(d.id,'還沒放進操作區；拖到本卡的實驗桌或分類格，也可以直接點選。');}clear();});
 root.addEventListener('pointercancel',clear);
 addEventListener('blur',clear);
 return clear;
}

export function animateAction(field,source,action){const stage=field.querySelector('.apparatus-stage');const kind=source?.dataset.tool;if(!stage||!kind||matchMedia('(prefers-reduced-motion: reduce)').matches)return Promise.resolve();
 stage.dataset.motion=kind;
 const x={3:86,4:27,6:64,7:action==='litmus'?68:33,8:49,9:49,10:action==='filter'?74:33,11:35,12:50,13:50,14:source?.dataset.value==='2'?76:44};stage.style.setProperty('--pour-x',(x[Number(field.id.slice(4))]||46)+'%');
 const film=stage.querySelector('.action-film');const ghost=document.createElement('span');ghost.className='film-tool';const svg=source.querySelector('.studio-svg');if(svg)ghost.innerHTML=svg.outerHTML;else ghost.textContent=kind==='heat'?'◉':kind==='filter'?'▽':kind==='rinse'?'≈':'';film.append(ghost);
 return new Promise(resolve=>setTimeout(()=>{ghost.remove();delete stage.dataset.motion;resolve();},680));
}
