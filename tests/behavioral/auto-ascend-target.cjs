'use strict';
// Native keyboard/touch on the new single editable dropdown in Ascend.
const assert=require('node:assert/strict'),launch=require('./all-27-cdp.cjs');
const [chrome,url,scenario]=process.argv.slice(2),c=launch(process.env.LUMENFALL_QA_CDP_CHROME||chrome),records=[];
async function state(){return c.evaluate(`(()=>{const el=document.querySelector('[data-autoascend-target]'),r=el.getBoundingClientRect();return {observation:autoTargetObservation(__lumenfallQaBridge),value:el.value,focused:document.activeElement===el,identity:el===nativeTargetInput,scroll:document.querySelector('main').scrollTop,options:document.querySelectorAll('[data-rift-target]').length,rect:{x:r.x,y:r.y,width:r.width,height:r.height},fit:document.documentElement.scrollWidth<=innerWidth,errors:__lumenfallQaContext.errors};})()`);}
async function press(key){await c.key(key);}
async function ticks(ms){await c.evaluate('__lumenfallQaBridge.uiMeasurementPause(false)');await new Promise(r=>setTimeout(r,ms));await c.evaluate('__lumenfallQaBridge.uiMeasurementPause(true)');}
async function run(){for(const [width,height]of [[320,844],[360,640],[430,844]]){
 const ctx=await c.context(width,height,scenario.includes('reduced')?'reduce':'no-preference');await c.send('Page.navigate',{url});
 for(let i=0;i<150&&!await c.evaluate('!!window.__autoAscendTargetReady');i++)await new Promise(r=>setTimeout(r,20));assert(await c.evaluate('!!window.__autoAscendTargetReady'));
 await c.evaluate('window.__qaForgeStartup.promise');await c.evaluate('document.fonts.ready.then(()=>true)');
 await c.evaluate(`(()=>{const b=__lumenfallQaBridge;b.uiMeasurementPause(true);b.resetFeedback();const s=autoTargetSeed(b,43,false);s.maxDepthEver=300;s.enemyHp=s.enemyMaxHp=1e9;b.setState(s);b.save();b.renderLayout();document.querySelector('[data-tab="ascend"]').click();window.nativeTargetInput=document.querySelector('[data-autoascend-target]');})()`);
 await c.evaluate(`Promise.all(document.querySelector('#tab-ascend').getAnimations().map(a=>a.finished.catch(()=>{}))).then(()=>true)`);
 await c.touch('[data-autoascend-target]');let before=await state();assert(before.focused&&before.identity&&before.rect.height>=44&&before.rect.width>=44&&before.fit);
 await press('Escape');await press('ArrowDown');let draft=await state();assert.equal(draft.value,'44');assert.deepEqual(draft.observation,before.observation,'draft browsing does not save');
 await press('Enter');let chosen=await state();const expected=structuredClone(before.observation.state);expected.autoAscendTargetDepth=45;expected.lastSeen=chosen.observation.state.lastSeen;
 assert.deepEqual(chosen.observation.state,expected,'exact target and normal metadata only');assert.equal(chosen.observation.events.length,before.observation.events.length+1);assert.equal(chosen.observation.primary,chosen.observation.recovery);assert(chosen.focused&&chosen.identity);
 await press('ArrowUp');await press('Enter');assert.equal((await state()).observation.state.autoAscendTargetDepth,44);
 before=await state();await c.evaluate('__lumenfallQaBridge.autoTarget.render();__lumenfallQaBridge.refreshAffordability();__lumenfallQaBridge.renderLayout()');let rendered=await state();assert.deepEqual(rendered.observation,before.observation,'render pure');assert(rendered.focused&&rendered.identity&&rendered.scroll===before.scroll);
 await press('Escape');await ticks(450);let live=await state();assert(live.observation.state.enemyHp<rendered.observation.state.enemyHp,'real ticks');assert(live.focused&&live.identity&&live.value==='43');
 await c.evaluate(`(()=>{const b=__lumenfallQaBridge,s=b.getState();s.totalTaps=10000;s.maxDepthEver=10001;b.setState(s);b.save();b.autoTarget.render();})()`);await ticks(350);assert((await state()).focused,'Deed shop refresh retains input');
 await press('End');draft=await state();assert.equal(draft.value,'10000');assert(draft.options<=40);await press('Enter');assert.equal((await state()).observation.state.autoAscendTargetDepth,10001);
 await press('Home');await press('Enter');assert.equal((await state()).observation.state.autoAscendTargetDepth,16);
 await c.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await c.send('Input.insertText',{text:'219'});await press('Enter');chosen=await state();assert.equal(chosen.observation.state.autoAscendTargetDepth,220);assert.equal(chosen.observation.state.autoAscendEnabled,false);assert(chosen.focused&&chosen.identity);
 await c.touch('[data-autoascend-toggle]');assert(await c.evaluate('__lumenfallQaBridge.getState().autoAscendEnabled'));assert(!await c.evaluate('!!document.querySelector("#shop-list [data-autoascend-target],[data-autoascend-nav],[data-autoascend-find]")'));
 assert.equal(chosen.errors.length,0);records.push({width,height,chosenTarget:219,normalSave:true,renderPurity:true,liveTicks:true,highHistory:true,nativeTouch:true,nativeKeyboard:true});await c.send('Target.disposeBrowserContext',{browserContextId:ctx},null);
}return {status:'pass',scenario,records};}
(async()=>{let result;try{result=await run();}catch(e){result={status:'fail',scenario,message:e.message,records};}try{result.teardown=await c.close();}catch(e){result.status='fail';result.teardown=e.message;}console.log(JSON.stringify(result));process.exitCode=result.status==='pass'?0:1;})();
