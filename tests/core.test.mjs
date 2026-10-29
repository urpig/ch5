import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,finalQuiz} from '../content.js';
import {fresh,restore,act,ready,mastered,submit,specimens,combustion,esterStage,cleanResult,workshopPlans} from '../core.js';
import {labMarkup} from '../labs.js';
const run=(id,steps)=>{const s=fresh(id);s.prediction=1;for(const [a,v] of steps)act(id,s,a,v);return s;};
export const paths={
1:Array.from({length:5},(_,i)=>['scan',i]),
2:specimens.flatMap((x,i)=>[['pick',i],['sort',x[2]]]),
3:[['heat'],['heat'],['heat'],['test','co2'],['test','burn']],
4:[['burn'],['air','low'],['burn'],['fraction',0]],
5:[['molecule','ethanol'],['molecule','ether']],
6:[['bottle',0],['mix'],['bottle',1],['use','label']],
7:[['litmus'],['bicarbonate'],['sample',3],['litmus']],
8:[['acid',true],['alcohol',true],['catalyst',true],['heat',true],['time'],['time'],['time']],
9:[['stir'],['settle'],['soap'],['stir'],['rinse']],
10:[['oil',true],['alkali',true],['heat',true],['react'],['react'],['react'],['salt'],['filter']],
11:['soft','hard'].flatMap(w=>['soap','detergent'].flatMap(c=>[['water',w],['cleaner',c],['run']])),
12:[['join'],['view','network'],['heat']],
13:[...Array.from({length:4},(_,i)=>[['fiber',i],['water'],['moisture'],['stretch'],['release']]).flat(),['use','易乾衣料']],
14:[['test',0],['food',1],['test',1],['food',2],['test',2],['food',3],['test',1],['test',2],['storage','cold']],
15:[['plastic',0],...Array.from({length:5},(_,i)=>[['pick',i],['sort',i]]).flat()],
16:workshopPlans.map((w,i)=>['plan',i+':'+w.answer])};
test('16 lessons, at least one practice each and 10 final questions; answer and hint integrity',()=>{assert.equal(lessons.length,16);assert.equal(finalQuiz.length,10);for(const c of lessons){const qs=c.id===16?finalQuiz:c.quiz;assert.ok(qs.length>0);for(const q of qs){assert.ok(q.answer>=0&&q.answer<q.options.length);assert.equal(q.options.length,q.hints.length);q.hints.forEach((h,i)=>{if(i!==q.answer)assert.ok(h.length>5);});}}});
for(let id=1;id<=16;id++)test(`card ${id}: complete meaningful flow, quiz, reload and isolated reset`,()=>{const s=run(id,paths[id]);assert.equal(ready(id,s),true);assert.ok(s.log.length>0);const qs=id===16?finalQuiz:lessons[id-1].quiz;assert.equal(mastered(id,s,qs),false);qs.forEach((q,i)=>{submit(s,i,(q.answer+1)%q.options.length,q);assert.equal(s.quiz[i].correct,false);submit(s,i,q.answer,q);assert.equal(s.quiz[i].attempts,2);});assert.ok(mastered(id,s,qs));const restored=restore(JSON.parse(JSON.stringify({[id]:s})));assert.ok(mastered(id,restored[id],qs));assert.deepEqual(restored[id].quiz,s.quiz);const markup=labMarkup(id,s);assert.ok(!markup.includes('undefined'));assert.ok(!markup.includes('NaN'));assert.equal(ready(id,fresh(id)),false);assert.deepEqual(run(id,paths[id]),s.log.length?{...s,quiz:{}}:s);});
test('classification rejects carbon elements and inorganic exceptions without false progress',()=>{const s=fresh(2);for(const i of [4,5,6,7,8,10,11]){act(2,s,'pick',i);act(2,s,'sort','organic');assert.ok(!s.seen.includes('sort'+i));assert.ok(s.feedback);}});
test('dry distillation requires correct oxygen setting and condensation, two gas evidence tests',()=>{const s=run(3,[['air','open'],['heat'],['heat'],['heat'],['test','co2']]);assert.equal(ready(3,s),false);act(3,s,'air','low');act(3,s,'cool',false);for(let i=0;i<3;i++)act(3,s,'heat');assert.ok(!s.seen.includes('dry3'));});
test('esterification never completes on mixing alone, short ambient observation or missing reagent',()=>{for(const stages of [[['acid',true]],[['acid',true],['alcohol',true]],[['acid',true],['alcohol',true],['heat',true]]]){const s=run(8,[...stages,['time'],['time'],['time']]);assert.equal(esterStage(s.lab),0);assert.equal(ready(8,s),false);}const s=run(8,paths[8].slice(0,-1));assert.equal(esterStage(s.lab),2);assert.equal(ready(8,s),false);});
test('soap cannot be obtained by salt alone or by oil and salt; product separation gated',()=>{for(const steps of [[['salt'],['filter']],[['oil',true],['heat',true],['react'],['salt'],['filter']]]){const s=run(10,steps);assert.equal(ready(10,s),false);assert.equal(s.lab.filter,false);}});
test('clean water stirring and rinsing do not magically eliminate oil',()=>{const s=run(9,[['stir'],['rinse']]);assert.notEqual(s.lab.phase,'rinsed');assert.equal(ready(9,s),false);act(9,s,'settle');assert.equal(s.lab.phase,'layer');});
test('only hard water and soap produce modeled calcium magnesium scum',()=>{assert.equal(cleanResult('hard','soap').scum,true);for(const [w,c] of [['soft','soap'],['soft','detergent'],['hard','detergent']])assert.equal(cleanResult(w,c).scum,false);});
test('complete hydrocarbon combustion conserves every atom for 4 fuels',()=>{const counts=[[[1,4],[1,2,1,2]],[[3,8],[1,5,3,4]],[[4,10],[2,13,8,10]],[[8,18],[2,25,16,18]]];counts.forEach(([[c,h],[a,b,d,e]],i)=>{assert.equal(a*c,d);assert.equal(a*h,2*e);assert.equal(2*b,2*d+e);assert.ok(combustion(i,'enough').complete);assert.ok(combustion(i,'low').products.includes('CO'));});});
test('incorrect final repair removes workshop credit until corrected',()=>{const s=run(16,paths[16]);assert.ok(ready(16,s));act(16,s,'plan','0:0');assert.equal(ready(16,s),false);});
test('changing experiment parameters starts a fresh comparison but retains previous evidence',()=>{const s=run(8,paths[8]);act(8,s,'heat',false);assert.equal(s.lab.time,0);assert.equal(esterStage(s.lab),0);assert.ok(s.seen.includes('ester3'));});
test('empty and corrupt high-level storage fall back without losing defaults',()=>{for(const raw of [null,{},[],{1:null},{1:{seen:'oops',log:5,quiz:[],prediction:99}}]){const s=restore(raw);assert.equal(s[1].prediction,null);assert.ok(Array.isArray(s[1].seen));assert.equal(s[1].lab.pick,0);}});
