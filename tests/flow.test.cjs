const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Flow}=require('../docs/debu-buster/core.js');
test('no-input session reaches CTA within 24 foreground seconds',()=>{const f=new Flow();f.advance(23.9);assert.equal(f.phase,'finish');f.advance(.11);assert.equal(f.phase,'cta');assert.equal(f.brewed,true);});
test('eating and exercise do not gate completion',()=>{const f=new Flow();f.advance(2);for(let i=0;i<5;i++){assert.ok(f.eat());assert.equal(f.step(),false);f.advance(.4);}assert.equal(f.meals,5);assert.equal(f.eat(),false);f.advance(4);assert.equal(f.phase,'run');for(let i=0;i<12;i++){assert.ok(f.step());assert.equal(f.eat(),false);f.advance(.3);}f.advance(12.5);assert.equal(f.phase,'cta');assert.equal(f.steps,12);});
test('rapid duplicated inputs are throttled',()=>{const f=new Flow();f.advance(2);assert.ok(f.eat());assert.equal(f.eat(),false);f.advance(6);assert.ok(f.step());assert.equal(f.step(),false);});
test('old controls are inert after product arrival; brew is idempotent',()=>{const f=new Flow();f.advance(18);assert.equal(f.phase,'care');assert.equal(f.eat(),false);assert.equal(f.step(),false);assert.ok(f.brew());assert.equal(f.brew(),false);f.advance(1);assert.equal(f.phase,'cta');});
test('replay clears score and phase state',()=>{const f=new Flow();f.advance(2);f.eat();f.advance(6);f.step();f.advance(16);f.reset();assert.equal(f.phase,'intro');assert.equal(f.meals,0);assert.equal(f.steps,0);assert.equal(f.total,0);assert.equal(f.brewed,false);});
test('max taps never extend phase timing',()=>{const f=new Flow();for(let i=0;i<2401;i++){f.eat();f.step();f.advance(.01);}assert.equal(f.phase,'cta');assert.ok(f.meals<=5);assert.ok(f.steps<=24);});
