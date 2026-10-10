#!/usr/bin/env node
'use strict';
// Source-bound Forge acceptance. Reuse the existing Chromium/CDP transport;
// all purchases and Queue changes below use trusted native input.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const sourcePath=path.resolve(process.argv[2]||'index.html'),evidence=path.resolve(process.argv[3]||'forge-mobile-evidence');
let driver=fs.readFileSync(path.join(__dirname,'prism-acceptance.cjs'),'utf8');
function one(from,to){assert.equal(driver.split(from).length,2,'one Forge transport extension');driver=driver.replace(from,()=>to);}
// Keep native browser animation frames for post-input layout observations.
// Only ambient gameplay intervals are paused by the existing transport.
one('window.requestAnimationFrame=function(){return 0;};','');
one('window.__prismInput=[];',`window.__prismInput=[];window.__forgeWrites=[];var originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){var result=originalStorageSet.call(this,k,v);window.__forgeWrites.push(k);return result;};`);
const hook='breakdown:ascendPrismBreakdown,keys:function(){return [SAVE_KEY,RECOVERY_SAVE_KEY];}';
one(hook,String.raw`
 forgeSeed:function(){var s=freshState();s.maxDepthEver=250;s.depth=s.enemyDepth=101;s.enemyMaxHp=enemyHpFor(101);s.enemyHp=s.enemyMaxHp;
  s.lumen=10000000000;s.shards=10000000000;s.motes=10000;s.prisms=23;s.comets=115;s.sigils=849;s.questDay=todayStr();s.lastSeen=Date.now();
  s.nodes.echo=10;s.nodes.swift=7;s.research.focus=3;s.research.sense=4;s.research.formation=5;s.research.resolve=6;
  s.longStudyLevels.guardmastery=2;s.longStudyLevels.prismstudy=3;s.owned={autoascend:true,comettrials:true,rifttrail:true,starfallcrest:true};
  s.autoAscendEnabled=true;s.autoAscendTargetDepth=250;s.sigilResonanceUses=2;
  s.activeParty=['ember','stone','gale','thorn','aurora'];s.activeParty.forEach(function(id){s.spirits[id]=10;});
  SPIRITS.forEach(function(sp){s.empowerQueue[sp.id]=false;});return s;},
 forgeSet:function(s){state=acceptPersistedState(s);labMultiplier=state.savedLabMultiplier;renderAll();activateTab('forge');},
 forgeNodes:function(){return RESEARCH.map(function(n){return {id:n.id,name:n.name,desc:n.desc,retiredTo:n.retiredTo,levelCap:n.levelCap,unlockDepth:n.unlockDepth,lumenBase:n.lumenBase,shardBase:n.shardBase};});},
 forgeRender:renderResearch,forgeSave:saveState,
 forgeWallet:function(v){Object.keys(v).forEach(function(k){state[k]=v[k];});},
 forgeRefresh:function(){lastAffordabilityAt=0;checkAffordability();},
 forgeCost:function(id,l,n){return researchCostForLevels(RESEARCH.find(function(r){return r.id===id;}),l,n);},
 forgePlan:function(id,n){return getResearchBuyPlan(RESEARCH.find(function(r){return r.id===id;}),n);},
 forgePreview:function(id,n){return researchPreview(RESEARCH.find(function(r){return r.id===id;}),n);},
 `+hook);
const start=driver.indexOf('  const samples=[];'),end=driver.indexOf("  await send('Target.disposeBrowserContext'",start);
assert(start>0&&end>start,'one existing mobile profile body');
const cases=String.raw`
  const samples=[],queueSamples=[];
  const added=['cauterize','fracturekey','guardianseal','spillway','sustainedchannel','tapconduit','guardiancadence','relay','resonantedge','victorycharge','amplifiertrim','dualchannel','overflowconduit','resonancecells','resonancecascade','resonancereclaim'];
  const activeIds=['charge','arcanecal','conduction','luminoustracking'].concat(added);
  const expectedPrices=[[0,30],[15000,120],[90000,280],[2500000,1500],[36000,2500],[103000,6000],[293000,14500],[2361000,80500],[6703000,191000],[61000,4000],[174000,9500],[493000,22000],[831000,34000],[1401000,52500],[2361000,80500],[1401000,52500],[3978000,124000],[19032000,452500],[54040000,1071500],[153442000,2536500]];
  // Approved native effect text at 0, 1 and cap, independent of the product's
  // effect/preview formatters. A correct model with stale rendered values fails.
  const nativeEffects=[
   ['Boss regeneration ×1 (0% less)','Boss regeneration ×0.98 (2% less)','Boss regeneration ×0.8 (20% less)'],
   ['Fractured Core ability damage ×1.75','Fractured Core ability damage ×1.775','Fractured Core ability damage ×2'],
   ['Guardian’s Mark tap damage ×3','Guardian’s Mark tap damage ×3.1','Guardian’s Mark tap damage ×3.5'],
   ['0% of bounded tap/ability overkill to one following non-boss','4% of bounded tap/ability overkill to one following non-boss','20% of bounded tap/ability overkill to one following non-boss'],
   ['0 charge after a nonlethal non-Support boss ability','2 charge after a nonlethal non-Support boss ability','10 charge after a nonlethal non-Support boss ability'],
   ['0 charge to the first powered Active Wisp per tap','2 charge to the first powered Active Wisp per tap','10 charge to the first powered Active Wisp per tap'],
   ['+0% damage every fifth lifetime tap','+10% damage every fifth lifetime tap','+50% damage every fifth lifetime tap'],
   ['0 charge to each powered non-Support Active after a Support cast','2 charge to each powered non-Support Active after a Support cast','10 charge to each powered non-Support Active after a Support cast'],
   ['Support hit: 0 × Wisp Power before ability factors','Support hit: 0.1 × Wisp Power before ability factors','Support hit: 0.5 × Wisp Power before ability factors'],
   ['0 charge to each powered Active per boss kill','4 charge to each powered Active per boss kill','20 charge to each powered Active per boss kill'],
   ['Future Support buff: +25%; +50% with Ultimate','Future Support buff: +26%; +51% with Ultimate','Future Support buff: +30%; +55% with Ultimate'],
   ['Gale extra Lumen: floor(native Shards × 0); Thorn extra Shards: floor(native Lumen × 0)','Gale extra Lumen: floor(native Shards × 0.2); Thorn extra Shards: floor(native Lumen × 0.02)','Gale extra Lumen: floor(native Shards × 1); Thorn extra Shards: floor(native Lumen × 0.1)'],
   ['Up to 0% extra native cast resource from original-hit overkill','Up to 2% extra native cast resource from original-hit overkill','Up to 10% extra native cast resource from original-hit overkill'],
   ['3 shared Resonate uses per run','4 shared Resonate uses per run','5 shared Resonate uses per run'],
   ['0 charge to each other powered Active per Resonate','2 charge to each other powered Active per Resonate','10 charge to each other powered Active per Resonate'],
   ['Restore up to 0 spent Resonate use(s) per boss kill','Restore up to 1 spent Resonate use(s) per boss kill','Restore up to 3 spent Resonate use(s) per boss kill']
  ];
  const copy=x=>JSON.parse(JSON.stringify(x)),selector=(attr,id)=>'['+attr+'="'+id+'"]';
  async function install(s){
   await ev('prismQa.forgeSet('+JSON.stringify(s)+')');
   await ev("Promise.all(document.getElementById('tab-forge').getAnimations().map(function(a){return a.finished;})).then(function(){return true;})");
  }
  async function measure(sel){return ev('('+function(sel){
   var e=document.querySelector(sel);if(!e)throw Error('missing measured control '+sel);
   var r=e.getBoundingClientRect(),m=document.querySelector('main'),v=m.getBoundingClientRect(),nav=document.querySelector('nav.tabbar').getBoundingClientRect();
   var x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y),a=document.activeElement;
   return {scrollTop:m.scrollTop,x:x,y:y,width:r.width,height:r.height,
    visible:r.top>=Math.max(0,v.top)-.5&&r.bottom<=Math.min(v.bottom,nav.top,innerHeight)+.5&&r.left>=v.left-.5&&r.right<=v.right+.5,
    hit:!!h&&(h===e||e.contains(h)),focus:a&&{queue:a.dataset.queue,research:a.dataset.research,mult:a.dataset.mult},focusVisible:!!a&&a.matches(':focus-visible')};
  }.toString()+')('+JSON.stringify(sel)+')');}
  function visible(m,label){ok(m.width>=44&&m.height>=44,'44px control '+label);ok(m.visible&&m.hit,'visible and hittable '+label+' '+JSON.stringify(m));}
  async function prepare(sel,focus){await point(sel);if(focus)await ev('document.querySelector('+JSON.stringify(sel)+').focus({preventScroll:true})');const m=await measure(sel);visible(m,'before input '+sel);return m;}
  // Deliberately no scroll/focus helper here, or between any input and checks.
  async function touchHere(sel){const m=await measure(sel);visible(m,'native touch '+sel);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:m.x,y:m.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  async function frames(){await ev('new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve);});})');}
  async function fit(label){const m=await ev('('+function(){
   var root=document.getElementById('research-list'),bad=[];
   root.querySelectorAll('[data-forge-card],.name,.desc,.lvl,[data-price-currency],[data-forge-group]').forEach(function(e){
    if(!e.getClientRects().length)return;var r=e.getBoundingClientRect();
    if(r.left<-.5||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+1)bad.push({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,80),left:r.left,right:r.right,scroll:e.scrollWidth,client:e.clientWidth});
   });return {bad:bad,overflow:root.scrollWidth>root.clientWidth+1};
  }.toString()+')()');ok(!m.overflow&&!m.bad.length,'Forge fit '+JSON.stringify({width,scale,motion,label,measurement:m}));}
  const seed=await ev('prismQa.forgeSeed()');let paid=copy(seed);await install(seed);
  const nodes=(await ev('prismQa.forgeNodes()')).filter(n=>!n.retiredTo);
  ok(JSON.stringify(nodes.map(n=>n.id))===JSON.stringify(activeIds),'twenty approved active IDs in order');
  const catalog=await ev("({ids:Array.from(document.querySelectorAll('#research-list [data-forge-card]')).map(function(e){return e.dataset.forgeCard;}),groups:Array.from(document.querySelectorAll('#research-list [data-forge-group]')).map(function(e){return e.textContent.trim();}),legacy:document.querySelectorAll('[data-legacy-upgrade]').length})");
  ok(JSON.stringify(catalog.ids)===JSON.stringify(activeIds),'all twenty rendered cards in order');
  ok(catalog.groups.join(',')==='Core,Boss craft,Rhythm,Resources,Resonance','five explicit Forge groups');ok(catalog.legacy===0,'retired shop rows stay absent');
  const groupCounts=await ev("(function(){var counts=[],at=-1;document.querySelectorAll('#research-list [data-forge-group],#research-list [data-forge-card]').forEach(function(e){if(e.hasAttribute('data-forge-group')){at++;counts[at]=0;}else counts[at]++;});return counts;})()");
  ok(JSON.stringify(groupCounts)==='[4,5,6,2,3]','exact active row count in each group');catalog.groupCounts=groupCounts;
  await fit('full catalogue');
  const renderBefore=await ev('JSON.stringify(prismQa.get())');await ev('prismQa.forgeRender();prismQa.forgeRender()');ok(await ev('JSON.stringify(prismQa.get())')===renderBefore,'full catalog rendering is pure');
  const locked=copy(seed);locked.maxDepthEver=1;locked.depth=locked.enemyDepth=1;await install(locked);
  for(const id of added){const d=nodes.find(n=>n.id===id),m=await ev('({disabled:document.querySelector('+JSON.stringify(selector('data-research',id))+').disabled,text:document.querySelector('+JSON.stringify(selector('data-forge-card',id))+').textContent})');ok(m.disabled&&m.text.includes(d.name)&&m.text.includes('Reach Rift '+d.unlockDepth),'named locked row and requirement '+id);}
  for(let row=0;row<nodes.length;row++){
   const d=nodes[row],id=d.id,button=selector('data-research',id),queue=selector('data-queue',id),card=selector('data-forge-card',id);
   await install(paid);const preview=await ev('prismQa.forgePreview('+JSON.stringify(id)+',1)'),plan=preview.plan;
   ok(plan.level===0&&plan.buyCount===1,'first paid level available '+id);
   ok(plan.cost.lumen===expectedPrices[row][0]&&plan.cost.shard===expectedPrices[row][1],'independent approved first price '+id);
   const text=await ev('document.querySelector('+JSON.stringify(card)+').textContent');
   ok(text.includes(d.name)&&text.includes(d.desc)&&text.includes('Current:')&&text.includes('Next:')&&text.includes('Purchase impact:'),'native name/effect/current/next/purchase preview '+id);
   const native=row>=4?nativeEffects[row-4]:null;
   if(native)ok(await ev('document.querySelector('+JSON.stringify(card)+').querySelector("[data-forge-preview]").textContent')==='Current: '+native[0]+'\nNext: '+native[1]+' (preview only)\nPurchase impact: 1 level(s) · '+native[1],'independent native 0/1/purchase text '+id);
   async function wallet(L,S,label){
    await ev('prismQa.forgeWallet({lumen:'+L+',shards:'+S+'})');const before=await ev('JSON.stringify(prismQa.get())');await ev('prismQa.forgeRefresh()');ok(await ev('JSON.stringify(prismQa.get())')===before,'affordability refresh pure '+id+' '+label);
    const seen=await ev('('+function(card){
     var c=document.querySelector(card),p=document.createElement('span');document.body.appendChild(p);p.style.color='var(--danger)';var red=getComputedStyle(p).color;p.style.color='var(--ink)';var white=getComputedStyle(p).color;p.remove();
     return {red:red,white:white,prices:Array.from(c.querySelectorAll('[data-price-currency]')).map(function(e){return {kind:e.dataset.priceCurrency,amount:Number(e.dataset.priceAmount),color:getComputedStyle(e).color,text:e.textContent};}),disabled:c.querySelector('[data-research]').disabled,warnings:c.querySelectorAll('.control-state').length};
    }.toString()+')('+JSON.stringify(card)+')');
    const expectedCount=(plan.cost.lumen>0?1:0)+(plan.cost.shard>0?1:0);ok(seen.prices.length===expectedCount,'only actual priced currencies '+id);
    for(const p of seen.prices){const amount=p.kind==='lumen'?plan.cost.lumen:plan.cost.shard,enough=(p.kind==='lumen'?L:S)>=amount;ok(p.amount===amount,'native exact quoted amount '+id+' '+p.kind);ok(p.color===(enough?seen.white:seen.red),'independent currency color '+id+' '+label+' '+p.kind);ok(!/need|short|missing/i.test(p.text),'no deficit prose '+id);}
    ok(seen.disabled===(L<plan.cost.lumen||S<plan.cost.shard),'live button eligibility '+id+' '+label);ok(seen.warnings===0,'no extra shortage warning '+id);
   }
   if(plan.cost.lumen>0)await wallet(plan.cost.lumen-1,plan.cost.shard,'only Lumen short');
   await wallet(plan.cost.lumen,plan.cost.shard-1,'only Shards short');await wallet(plan.cost.lumen,plan.cost.shard,'exact budget');await fit('price '+id);
   await prepare(button,true);await ev('window.__forgeFocus=document.activeElement;prismQa.forgeRefresh()');ok(await ev('document.activeElement===window.__forgeFocus'),'price refresh retains same focused element '+id);
   const before=await ev('prismQa.get()'),p=await ev('prismQa.forgePreview('+JSON.stringify(id)+',1)'),writeStart=await ev('window.__forgeWrites.length');
   await touchHere(button);const after=await ev('prismQa.get()');
   ok(after.research[id]===1,'native touch grants one Forge level '+id);ok(after.lumen===0&&after.shards===0,'native touch exact two-currency debit '+id);
   ok((after.dailyStats.research||0)===(before.dailyStats.research||0)+1,'one level in daily counter '+id);
   for(const field of ['nodes','longStudyLevels','activeStudies','owned','spirits','autoAscendEnabled','autoAscendTargetDepth','sigilResonanceUses','enemyHp','enemyDepth','enemyIsLuminous','luminousAccum'])ok(JSON.stringify(after[field])===JSON.stringify(before[field]),'purchase preserves '+field+' '+id);
   for(const other of Object.keys(before.research))if(other!==id)ok(after.research[other]===before.research[other],'other paid Forge retained '+other);
   ok(JSON.stringify(await ev('prismQa.forgePreview('+JSON.stringify(id)+',1).current'))===JSON.stringify(p.purchase),'actual Current equals shown Purchase impact '+id);
   if(native)ok((await ev('document.querySelector('+JSON.stringify(card)+').querySelector("[data-forge-preview]").textContent')).startsWith('Current: '+native[1]+'\n'),'actual native Current becomes paid first effect '+id);
   const fallback=await measure(queue);visible(fallback,'exhausted-wallet fallback '+id);ok(fallback.focus.queue===id,'same-row fallback focus '+id);
   const writes=await ev('window.__forgeWrites.slice('+writeStart+').filter(function(k){return prismQa.keys().indexOf(k)!==-1;})');ok(writes.length===2&&new Set(writes).size===2,'one primary/recovery write per purchase '+id);
   const saved=await ev('prismQa.keys().map(function(k){return JSON.parse(localStorage.getItem(k));})');ok(JSON.stringify(saved[0])===JSON.stringify(saved[1])&&saved[0].research[id]===1,'both slots persist actual purchase '+id);
   // Every row receives native touch and keyboard Queue input. Measurements
   // follow immediately; no corrective scrolling can hide a render regression.
   await touchHere(queue);const queueOn=await measure(queue);visible(queueOn,'Queue ON '+id);ok(queueOn.scrollTop===fallback.scrollTop,'Queue ON preserves exact scroll '+id);ok(await ev('prismQa.get().researchQueue['+JSON.stringify(id)+']')===true,'one touch Queue toggle '+id);
   await key(' ','Space',32);const queueOff=await measure(queue);visible(queueOff,'Queue OFF '+id);ok(queueOff.focus.queue===id&&queueOff.scrollTop===queueOn.scrollTop,'keyboard Queue preserves focus/scroll '+id);ok(await ev('prismQa.get().researchQueue['+JSON.stringify(id)+']')===false,'one keyboard Queue toggle '+id);
   paid=await ev('prismQa.get()');paid.lumen=seed.lumen;paid.shards=seed.shards;
   if(d.levelCap!==undefined){const capped=copy(paid);capped.research[id]=d.levelCap;await install(capped);ok(await ev('document.querySelector('+JSON.stringify(button)+').disabled&&document.querySelector('+JSON.stringify(button)+').textContent.includes("Maxed")'),'cap disables native purchase '+id);ok(await ev('prismQa.forgePreview('+JSON.stringify(id)+',1).next')===null,'cap has no next promise '+id);if(native)ok(await ev('document.querySelector('+JSON.stringify(card)+').querySelector("[data-forge-preview]").textContent')==='Current: '+native[2]+'\nNext: Maxed\nPurchase impact: 0 level(s) · No purchase (0 levels)','independent native cap/no purchase text '+id);await fit('cap '+id);}
   samples.push({id,price:plan.cost,cap:d.levelCap||null,purchase:after.research[id],fallback,queueOn,queueOff});
  }
  const last='resonancereclaim',lastQueue=selector('data-queue',last),lastBuy=selector('data-research',last),lastNode=nodes[nodes.length-1];
  await install(paid);ok(await ev("Array.from(document.querySelectorAll('[data-forge-card]')).pop().dataset.forgeCard")===last,'last-row regression targets actual final card');
  let lastBefore=await prepare(lastQueue,true);await shot('forge-last-before-'+width+'-'+scale+'-'+motion);
  const stable=await ev('prismQa.get()');
  for(let i=0;i<6;i++){
   const writesBefore=await ev('window.__forgeWrites.length');await key(' ','Space',32);
   const immediate=await measure(lastQueue);visible(immediate,'last Queue immediate '+i);ok(immediate.focus.queue===last&&immediate.scrollTop===lastBefore.scrollTop,'last Queue keyboard focus/exact scroll '+i);
   await frames();await pause(100);const settled=await measure(lastQueue);visible(settled,'last Queue settled '+i);ok(settled.focus.queue===last&&settled.scrollTop===lastBefore.scrollTop,'last Queue remains after native frames '+i);
   const state=await ev('prismQa.get()');ok(state.researchQueue[last]===(i%2===0),'one last-row toggle '+i);
   for(const field of ['research','longStudyLevels','nodes','lumen','shards','motes','sigils','spirits','activeStudies','autoAscendEnabled','autoAscendTargetDepth'])ok(JSON.stringify(state[field])===JSON.stringify(stable[field]),'Queue leaves economy/progression '+field);
   ok(await ev('window.__forgeWrites.slice('+writesBefore+').filter(function(k){return prismQa.keys().indexOf(k)!==-1;}).length')===2,'one last-row save '+i);queueSamples.push({i,immediate,settled});
  }
  await ev('document.activeElement.blur()');lastBefore=await measure(lastQueue);
  for(let i=0;i<2;i++){await touchHere(lastQueue);const m=await measure(lastQueue);visible(m,'last touch Queue '+i);ok(m.scrollTop===lastBefore.scrollTop,'last touch exact scroll '+i);ok(!m.focusVisible,'touch does not acquire keyboard indicator');ok(await ev('prismQa.get().researchQueue['+JSON.stringify(last)+']')===(i===0),'last native touch toggles once');queueSamples.push({touch:true,measurement:m});}
  const cap=copy(paid);cap.research[last]=lastNode.levelCap-1;cap.researchQueue[last]=false;
  const finalPrice=await ev('prismQa.forgeCost('+JSON.stringify(last)+','+(lastNode.levelCap-1)+',1)');cap.lumen=finalPrice.lumen;cap.shards=finalPrice.shard;await install(cap);await prepare(lastBuy,true);
  await key('Enter','Enter',13);const final=await ev('prismQa.get()'),cappedControl=await measure(lastQueue);
  ok(final.research[last]===lastNode.levelCap&&final.lumen===0&&final.shards===0,'actual last-row Enter buys final level exactly');visible(cappedControl,'last cap fallback');ok(cappedControl.focus.queue===last,'cap fallback stays on final logical row');
  await frames();await pause(150);const capSettled=await measure(lastQueue);visible(capSettled,'settled final cap fallback');ok(capSettled.focus.queue===last,'settled cap focus retained');
  ok(await ev('document.querySelector('+JSON.stringify(lastBuy)+').disabled&&document.querySelector('+JSON.stringify(selector('data-forge-card',last))+').textContent.includes("Next: Maxed")'),'native final cap preview');
  await shot('forge-last-cap-'+width+'-'+scale+'-'+motion);await fit('last cap');
  const input=await ev('window.__prismInput');ok(input.some(e=>e.trusted&&e.type==='click')&&input.some(e=>e.trusted&&e.key==='Enter')&&input.some(e=>e.trusted&&e.code==='Space'||e.trusted&&e.key===' '),'trusted touch and keyboard evidence');
  await ev('prismQa.forgeSave()');const committed=await ev('prismQa.get()');await ev('window.prismQa=null');await send('Page.reload');await ready();await ev('document.documentElement.style.fontSize='+JSON.stringify(16*scale+'px'));await ev("prismQa.tab('forge')");
  const cold=await ev('prismQa.get()');for(const field of ['research','researchQueue','nodes','longStudyLevels','activeStudies','owned','autoAscendEnabled','autoAscendTargetDepth','sigilResonanceUses'])ok(JSON.stringify(cold[field])===JSON.stringify(committed[field]),'actual reload preserves paid '+field);
  ok(added.every(id=>cold.research[id]>0),'reload retains all sixteen genuinely purchased additions');
  const ax=await send('Accessibility.getFullAXTree');ok(ax.nodes.some(n=>!n.ignored&&n.name&&/Resonance Reclaim/.test(n.name.value)),'last added Forge exposed in accessibility tree');
  ok((await ev('window.__prismErrors')).length===0,'no browser runtime errors');records.push({width,scale,motion,nativeAnimationFrames:true,independentNativeEffectRows:nativeEffects.length,catalog,samples,queueSamples,finalPrice,cappedControl,capSettled,input});
`;
driver=driver.slice(0,start)+cases+driver.slice(end);
const temp=path.join(__dirname,'.forge-mobile-'+process.pid+'.cjs');
try{fs.writeFileSync(temp,driver);const r=spawnSync(process.execPath,[temp,sourcePath,evidence],{stdio:'inherit',timeout:600000});if(r.error)throw r.error;assert.equal(r.status,0,'Forge browser acceptance failed');}
finally{fs.rmSync(temp,{force:true});}
