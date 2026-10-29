import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,act,molecules,esterStage} from '../core.js';
import {labMarkup,nextMove} from '../labs.js';
import {structure,polymerArt} from '../lab-art.js';

test('ball-and-stick models conserve the declared C, H and O atom counts',()=>{
 for(const m of Object.values(molecules)){
  const svg=structure(m);
  ['C','H','O'].forEach((element,i)=>assert.equal([...svg.matchAll(new RegExp('>'+element+'</text>','g'))].length,m.counts[i],m.name+' / '+element));
 }
});
test('every displayed ethene unit retains two carbon and four hydrogen atoms during polymerization',()=>{
 for(let units=2;units<=5;units++)for(const joined of [false,true]){
  const svg=polymerArt({units,joined,view:'chain',heated:false});
  assert.equal([...svg.matchAll(/>C<\/text>/g)].length,2*units);
  assert.equal([...svg.matchAll(/>H<\/text>/g)].length,4*units);
 }
});
test('all sixteen initial workbenches have an explicit next step and valid visual references',()=>{
 const ids=new Set();
 for(let id=1;id<=16;id++){
  const s=fresh(id),html=labMarkup(id,s);assert.ok(nextMove(id,s).length>5);
  assert.ok(!/undefined|NaN/.test(html));
  for(const [,ref] of html.matchAll(/id="((?:studio-|lens-)[^"]+)"/g)){assert.ok(!ids.has(ref),'duplicate SVG resource '+ref);ids.add(ref);}
  for(const [,ref] of html.matchAll(/url\(#([^\)]+)\)/g))assert.ok(ids.has(ref),'missing SVG resource '+ref);
  for(const match of html.matchAll(/<button[^>]*data-transfer="true"[^>]*>/g)){
   const a=/data-action="([^"]+)"/.exec(match[0])[1];
   assert.ok(html.includes('data-lab-drop="')&&[...html.matchAll(/data-lab-drop="([^"]*)"/g)].some(m=>m[1].split(' ').includes(a)),id+' has no destination for '+a);
  }
 }
});
test('reagent controls encode booleans, and completed additions cannot be accidentally removed',()=>{
 const s=fresh(8);assert.match(labMarkup(8,s),/data-action="acid"[^>]*data-boolean="true"/);
 act(8,s,'acid',true);assert.match(labMarkup(8,s),/data-action="acid"[^>]*disabled/);
 assert.equal(esterStage(s.lab),0);
});
test('after rinsing, settling does not recreate oil that has already left the surface',()=>{
 const s=fresh(9);for(const a of ['stir','soap','stir','rinse','settle'])act(9,s,a);
 assert.equal(s.lab.phase,'rinsed');assert.match(labMarkup(9,s),/data-action="settle"[^>]*disabled/);
});
test('changing monomer count creates an unheated, unpolymerized sample',()=>{
 const s=fresh(12);act(12,s,'join');act(12,s,'heat');act(12,s,'units',5);
 assert.equal(s.lab.joined,false);assert.equal(s.lab.heated,false);
});
test('filtering control is unavailable until soap has been salted out',()=>{
 const s=fresh(10);assert.match(labMarkup(10,s),/data-action="filter"[^>]*disabled/);
 for(const a of ['oil','alkali','heat'])act(10,s,a,true);
 for(let i=0;i<3;i++)act(10,s,'react');
 assert.match(labMarkup(10,s),/data-action="filter"[^>]*disabled/);
 act(10,s,'salt');assert.ok(!/data-action="filter"[^>]*disabled/.test(labMarkup(10,s)));
 act(10,s,'filter');assert.equal(s.lab.heat,false,'empty reaction beaker should no longer be heated');
 assert.match(labMarkup(10,s),/data-action="heat"[^>]*disabled/);
});
