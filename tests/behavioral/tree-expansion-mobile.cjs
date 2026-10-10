#!/usr/bin/env node
'use strict';
// Complete-product Chromium acceptance. Only ambient intervals are paused;
// native animation frames, input, purchases, rendering and persistence remain.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const sourcePath=path.resolve(process.argv[2]||'index.html');
const evidence=path.resolve(process.argv[3]||'tree-mobile-evidence');
const transportPath=path.join(__dirname,'prism-acceptance.cjs');
let driver=fs.readFileSync(transportPath,'utf8');
const transportHash=crypto.createHash('sha256').update(driver).digest('hex');
const selfHash=crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
function one(from,to){assert.equal(driver.split(from).length,2,'one Tree transport extension: '+from.slice(0,60));driver=driver.replace(from,()=>to);}
one('window.requestAnimationFrame=function(){return 0;};','');
one('let checks=0;','let checks=0;const treeMigrationDiagnostics=[],treeFundedDiagnostics=[],treeFormationDiagnostics=[],treeViewportControls=[];');
one('window.__prismInput=[];',String.raw`window.__prismInput=[];window.__treeWrites=[];var originalTreeStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){var result=originalTreeStorageSet.call(this,k,v);window.__treeWrites.push(k);return result;};`);
const hook='breakdown:ascendPrismBreakdown,keys:function(){return [SAVE_KEY,RECOVERY_SAVE_KEY];}';
one(hook,String.raw`
 treeSeed:function(){var s=freshState();s.maxDepthEver=250;s.depth=s.enemyDepth=101;s.enemyMaxHp=enemyHpFor(101);s.enemyHp=s.enemyMaxHp;
  s.lumen=1000000000;s.shards=1000000000;s.motes=10000;s.prisms=100000;s.comets=115;s.sigils=849;s.questDay=todayStr();s.lastSeen=Date.now();
  s.nodes.starlight=12;s.nodes.steady=9;s.nodes.momentum=7;s.nodes.swift=10;
  s.research.focus=3;s.research.sense=4;s.research.formation=5;s.research.resolve=6;s.research.relay=2;
  s.longStudyLevels.guardmastery=2;s.longStudyLevels.prismstudy=3;s.longStudyLevels.labcapacity=1;
  s.activeStudies=[{id:'wispascend',remainingSec:90,totalDurationSec:180,speedMult:1.5},{id:'shardstudy',remainingSec:100,totalDurationSec:200,speedMult:2}];
  s.owned.autoascend=true;s.owned.comettrials=true;s.owned.rifttrail=true;s.owned.starfallcrest=true;
  s.autoAscendEnabled=true;s.autoAscendTargetDepth=250;s.sigilResonanceUses=2;s.achieved.labmaster=true;
  s.activeParty=['ember','tide','stone','gale','thorn'];s.activeParty.forEach(function(id){s.spirits[id]=10;});
  s.formationPresets.push=s.activeParty.slice();s.formationPresets.farm=s.activeParty.slice();s.formationPresets.boss=s.activeParty.slice();
  SPIRITS.forEach(function(sp){s.empowerQueue[sp.id]=false;});return s;},
 treeSet:function(s,tab){state=acceptPersistedState(s);renderAll();activateTab(tab||'ascend');},
 treeDefs:function(){return NODES.map(function(n){return {id:n.id,name:n.name,desc:n.desc,retired:n.retired,retiredTo:n.retiredTo,levelCap:n.levelCap,unlockDepth:n.unlockDepth,requiresSwift:n.requiresSwift};});},
 treeRender:renderNodes,treeSave:saveState,treeAccept:acceptPersistedState,
 treeWallet:function(prisms){state.prisms=prisms;},treeRefresh:function(){lastAffordabilityAt=0;checkAffordability();},
 treeLumen:function(lumen){state.lumen=lumen;},treeSpiritPlan:function(id){return getSpiritBuyPlan(SPIRITS.find(function(s){return s.id===id;}));},
 treePlan:function(id){return getNodeBuyPlan(NODES.find(function(n){return n.id===id;}));},
 treeCost:function(id){return nodeCost(NODES.find(function(n){return n.id===id;}));},
 treeRoundtrip:function(){return acceptPersistedState(decodeSaveBackup(encodeSaveBackup(state)));},
 treeSpirits:function(){return SPIRITS.map(function(s){return {id:s.id,unlockDepth:s.unlockDepth};});},
 treeCapacity:function(){return treeFormationCapacity(state);},
 treeViewportFunction:function(kind){
  if(kind!=='summary'&&kind!=='formation')throw Error('unknown viewport function');
  return Function.prototype.toString.call(kind==='summary'?renderAscendSummary:renderSpirits);},
 treeViewportMutation:function(kind){
  if(this.treeViewportOriginal)throw Error('viewport control already installed');
  if(kind!=='summary'&&kind!=='formation')throw Error('unknown viewport mutation');
  var original=kind==='summary'?renderAscendSummary:renderSpirits,text=Function.prototype.toString.call(original);
  var anchor=kind==='summary'?'restoreControlViewport(treeViewport);':'restoreControlViewport(spiritViewport);';
  var replacement='/* QA negative: '+kind+' viewport restoration disabled. */';
  if(text.split(anchor).length!==2)throw Error('one exact viewport restoration call required');
  var mutated=text.replace(anchor,replacement),fn=eval('('+mutated+')');
  if(kind==='summary')renderAscendSummary=fn;else renderSpirits=fn;
  this.treeViewportOriginal={kind:kind,fn:original};
  return {original:text,mutated:Function.prototype.toString.call(fn),from:anchor,to:replacement};},
 treeViewportRestore:function(){
  var original=this.treeViewportOriginal;if(!original)throw Error('viewport control is not installed');
  if(original.kind==='summary')renderAscendSummary=original.fn;else renderSpirits=original.fn;
  delete this.treeViewportOriginal;return Function.prototype.toString.call(original.fn);},
 `+hook);
one("const result={status:'fail',sourceSha256:","const result={status:'fail',migrationDiagnostics:treeMigrationDiagnostics,fundedPurchaseDiagnostics:treeFundedDiagnostics,formationDiagnostics:treeFormationDiagnostics,viewportControls:treeViewportControls,treeTestSha256:"+JSON.stringify(selfHash)+",transportSha256:"+JSON.stringify(transportHash)+",sourceSha256:");
one("await shot('failure');result.input=await ev('window.__prismInput');",String.raw`await shot('failure');result.input=await ev('window.__prismInput');result.syntheticStorage=await ev("['lumenfall_save_v2','lumenfall_save_recovery_v1'].map(function(k){return {key:k,raw:localStorage.getItem(k)};})");result.syntheticLoadedState=await ev('window.prismQa?prismQa.get():null');result.syntheticSeedObservation=await ev('window.__treeLegacySeedObservation||null');fs.writeFileSync(path.join(evidence,'failure-dom.html'),await ev('document.documentElement.outerHTML'));result.failureDom='failure-dom.html';`);
// Independent frozen DESIGN rows: id, displayed name, unlock, cap, price ladder.
const specs=[
 ['echo','Echoing Rest',1,6,[2,3,4,6,8,11]],
 ['bonds','Cheaper Bonds',1,20,null],
 ['swift','Swift Ascension',1,null,null],
 ['swiftcharter','Swift Charter',100,1,[200]],
 ['lumenmemory','Lumen Inheritance',15,5,[8,16,28,44,64]],
 ['veteranrecruits','Veteran Recruits',20,5,[5,10,18,30,46]],
 ['rosterrecall','Roster Recall',25,4,[15,30,55,90]],
 ['chargememory','Charge Memory',30,5,[12,22,38,60,90]],
 ['supportmemory','Lasting Blessings',60,1,[60]],
 ['phasememory','Unbroken Rhythm',40,1,[35]],
 ['riftstep','Familiar Paths',30,5,[12,24,42,68,104]],
 ['frontier','Frontier Record',50,5,[20,35,55,80,110]],
 ['stardust','Ascension Dust',60,5,[10,18,30,46,66]],
 ['gentlegrowth','Patient Growth',40,5,[12,22,38,60,90]],
 ['formationseat','Sixth Companion',75,1,[120]],
 ['benchmentor','Bench Mentorship',35,5,[10,18,30,46,66]],
 ['empowerbatch','Steady Instruction',45,4,[15,28,46,70]],
 ['wallwisdom','Wall Wisdom',50,4,[12,22,36,54]],
 ['invitations','Early Invitations',15,3,[4,9,16]],
 ['recruitreserve','Recruitment Reserve',25,5,[8,16,28,44,64]]
];
const start=driver.indexOf('  const samples=[];'),end=driver.indexOf("  await send('Target.disposeBrowserContext'",start);
assert(start>0&&end>start,'one mobile profile body');
const cases='  const specs='+JSON.stringify(specs)+';\n'+String.raw`
  const copy=x=>JSON.parse(JSON.stringify(x)),sel=(a,id)=>'['+a+'="'+id+'"]',same=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m);
  const digest=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
  const samples=[],effectSamples=[],locks=[],inputSamples=[],formationSamples=[],dustSamples=[],ids=specs.map(x=>x[0]),added=ids.slice(3);
  function price(row,level){if(row[0]==='bonds')return Math.ceil(2*Math.pow(1.45,level));if(row[0]==='swift')return Math.ceil(3*Math.pow(1.5,level));return row[4][level];}
  function effect(id,raw){var r=specs.find(x=>x[0]===id),l=r[3]===null?raw:Math.min(raw,r[3]);
   if(id==='echo')return ['+'+(5*l)+' percentage points offline rate',(70+5*l)+'% before Projects'];
   if(id==='bonds')return [(3*l)+'% Wisp recruiting discount',(100-3*l)+'% cost'];
   if(id==='swift')return ['+'+(4*l)+'% Prisms per Ascend'];
   if(id==='swiftcharter')return [l?'Swift level 10 onward: 6 × current level Prisms':'Original Swift price curve'];
   if(id==='lumenmemory')return [(5*l)+'% Lumen carried','limit '+(l?(50*l).toFixed(2)+'K':'0')+' Lumen'];
   if(id==='veteranrecruits')return ['New recruits and reset Ember start at level '+(1+l)];
   if(id==='rosterrecall')return ['Recall up to '+l+' additional previously recruited Formation members'];
   if(id==='chargememory')return [(20*l)+'% charge carried through Ascend'];
   if(id==='supportmemory')return [l?'Current blessing strength and expiry survive Ascend':'Blessings end at Ascend'];
   if(id==='phasememory')return [l?'Current automation second carries through Ascend':'Automation timers restart at Ascend'];
   if(id==='riftstep')return ['Next run starts at Rift '+(1+l)];
   if(id==='frontier')return [l+' extra Prisms per new 25-Rift milestone'];
   if(id==='stardust')return [l+' Motes per 20 earned Prisms','limit '+(10*l)+' Motes per Ascend'];
   if(id==='gentlegrowth')return [(13-l)+'% Empower price growth after Wisp level 25'];
   if(id==='formationseat')return [(5+l)+' chosen Formation slots'];
   if(id==='benchmentor')return [l+' Bench levels per 10 paid actions'].concat(l?['0/10 this run']:[]);
   if(id==='empowerbatch')return ['Up to '+(1+l)+' paid Auto-Empowers per second'];
   if(id==='wallwisdom')return [(5-l)+' minutes of offline boss grace'];
   if(id==='invitations')return ['Recruitment unlocks '+l+' Rifts earlier','minimum Rift 1'];
   return [(20*l)+'% of the next remembered recruit’s price reserved'];
  }
  async function install(s,tab){await ev('prismQa.treeSet('+JSON.stringify(s)+','+JSON.stringify(tab||'ascend')+')');await ev('Promise.all(document.getElementById('+JSON.stringify('tab-'+(tab||'ascend'))+').getAnimations().map(function(a){return a.finished;})).then(function(){return true;})');}
  async function frames(){await ev('new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});})');}
  async function measure(selector){return ev('('+function(selector){var e=document.querySelector(selector);if(!e)throw Error('missing control '+selector);var r=e.getBoundingClientRect(),m=document.querySelector('main'),v=m.getBoundingClientRect(),n=document.querySelector('nav.tabbar').getBoundingClientRect(),summary=document.querySelector('.ascend-summary').getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y),a=document.activeElement;return {scroll:m.scrollTop,x:x,y:y,top:r.top,bottom:r.bottom,width:r.width,height:r.height,mainTop:v.top,mainBottom:v.bottom,scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,summaryHeight:summary.height,summaryTop:summary.top,summaryBottom:summary.bottom,treeTop:document.getElementById('node-list').getBoundingClientRect().top,visible:r.top>=Math.max(0,v.top)-.5&&r.bottom<=Math.min(v.bottom,n.top,innerHeight)+.5&&r.left>=v.left-.5&&r.right<=v.right+.5,hit:!!h&&(h===e||e.contains(h)),focus:a&&{node:a.dataset.node,toggle:a.dataset.toggle,preset:a.dataset.formationPreset,insideTree:!!a.closest('#node-list')},disabled:e.disabled};}.toString()+')('+JSON.stringify(selector)+')');}
  function visible(m,label){ok(m.width>=44&&m.height>=44,'44px '+label);ok(m.visible&&m.hit,'visible actual hit target '+label+' '+JSON.stringify(m));}
  // Derive the required scroll from the real post-layout coordinates. At a
  // native boundary only the unavoidable displacement may remain visible.
  function viewportBounds(before,after){
   const targetScroll=after.scroll+after.top-before.top,maxScroll=after.scrollHeight-after.clientHeight;
   const nearestFeasible=Math.max(0,Math.min(maxScroll,targetScroll)),bound=targetScroll<0?'minimum':targetScroll>maxScroll?'maximum':'none';
   return {targetScroll,maxScroll,nearestFeasible,bound,unavoidableTopDisplacement:targetScroll-nearestFeasible,actualScroll:after.scroll,actualTopDisplacement:after.top-before.top};
  }
  function viewport(before,after,focusKey,focusId,label,allowBoundary=false){
   ok(after.focus&&after.focus[focusKey]===focusId,'native focus '+label);
   ok(!after.disabled,'enabled control '+label);
   const bounds=viewportBounds(before,after);
   if(allowBoundary&&bounds.bound!=='none'){
    ok(Math.abs(after.scroll-bounds.nearestFeasible)<=1,'nearest native scroll bound '+label);
    ok(Math.abs(bounds.actualTopDisplacement-bounds.unavoidableTopDisplacement)<=1,'only unavoidable viewport displacement '+label);
   }else ok(Math.abs(after.top-before.top)<=1,'viewport top stable '+label);
   visible(after,label);
  }
  function stableAction(record,focusKey,focusId,label,allowBoundary=false){viewport(record.before,record.immediate,focusKey,focusId,label+' immediate',allowBoundary);viewport(record.before,record.settled,focusKey,focusId,label+' settled',allowBoundary);}
  async function prepare(selector,focus){await point(selector);if(focus)await ev('document.querySelector('+JSON.stringify(selector)+').focus({preventScroll:true})');var m=await measure(selector);visible(m,selector);return m;}
  async function touchHere(selector){var m=await measure(selector);visible(m,'touch '+selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:m.x,y:m.y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  async function observeInput(record,selector,action,prepareInput=true){
   record.before=prepareInput?await prepare(selector,true):await measure(selector);visible(record.before,'before '+record.id);
   record.stateBefore=await ev('prismQa.get()');record.runtimeErrorsBefore=await ev('window.__prismErrors');
   const writes=await ev('window.__treeWrites.length'),inputStart=await ev('window.__prismInput.length');
   await action();record.immediate=await measure(selector);await frames();record.settled=await measure(selector);
   // Persist every geometry epoch before state, focus or visibility assertions.
   record.stateAfter=await ev('prismQa.get()');record.writeKeys=await ev('window.__treeWrites.slice('+writes+')');
   record.input=await ev('window.__prismInput.slice('+inputStart+')');record.runtimeErrorsAfter=await ev('window.__prismErrors');
   record.deltas={immediateTop:record.immediate.top-record.before.top,settledTop:record.settled.top-record.before.top,immediateScroll:record.immediate.scroll-record.before.scroll,settledScroll:record.settled.scroll-record.before.scroll};
   record.viewportBounds={immediate:viewportBounds(record.before,record.immediate),settled:viewportBounds(record.before,record.settled)};
   return record;
  }
  async function formationInput(id,selector,action,prepareInput=true){
   const record={id,width,scale,motion,nativeAnimationFrames:true,before:null,immediate:null,settled:null};
   treeFormationDiagnostics.push(record);formationSamples.push(record);
   await observeInput(record,selector,action,prepareInput);return record;
  }
  async function viewportControl(kind,fixture,tab,selector,focusKey,focusId,verifyState){
   const prior=await ev('prismQa.get()'),priorSlots=await ev('prismQa.keys().map(function(key){return {key:key,raw:localStorage.getItem(key)};})');
   const priorStyle=await ev("(function(){var s=document.querySelector('main').style;return {value:s.getPropertyValue('overflow-anchor'),priority:s.getPropertyPriority('overflow-anchor')};})()");
   const priorTab=await ev("document.querySelector('.tab-panel.active').id.slice(4)");
   const control={id:kind==='summary'?'frontier-summary-viewport':'formation-reorder-viewport',width,scale,motion,status:'started',overflowAnchor:'none',seedSha256:digest(fixture),positiveStateSha256:digest(prior),positiveSlotsSha256:digest(priorSlots),runs:{}};
   treeViewportControls.push(control);let mutated=false;
   try{
    const original=await ev('prismQa.treeViewportFunction('+JSON.stringify(kind)+')');control.originalFunctionSha256=digest(original);
    for(const mode of ['positive','mutated']){
     await install(fixture,tab);
     const row={id:control.id+'-'+mode,width,scale,motion,nativeAnimationFrames:true,before:null,immediate:null,settled:null};control.runs[mode]=row;
     row.overflowAnchorBefore=await ev("document.querySelector('main').style.overflowAnchor='none';getComputedStyle(document.querySelector('main')).overflowAnchor");
     if(mode==='mutated'){
      const mutation=await ev('prismQa.treeViewportMutation('+JSON.stringify(kind)+')');mutated=true;
      control.mutation={from:mutation.from,to:mutation.to};control.mutatedFunctionSha256=digest(mutation.mutated);
      ok(mutation.original===original&&mutation.original.split(mutation.from).length===2&&mutation.mutated===mutation.original.replace(mutation.from,mutation.to),'one exact '+kind+' viewport restore mutation');
     }
     await observeInput(row,selector,()=>key('Enter','Enter',13));
     row.overflowAnchorAfter=await ev("getComputedStyle(document.querySelector('main')).overflowAnchor");
     const slots=await ev('prismQa.keys().map(function(key){return {key:key,raw:localStorage.getItem(key)};})');
     row.slots=slots.map(slot=>({key:slot.key,bytes:Buffer.byteLength(slot.raw||''),sha256:digest(slot.raw||''),state:slot.raw&&JSON.parse(slot.raw)}));
     row.screenshot='tree-'+kind+'-viewport-'+mode+'-'+width+'-'+scale+'-'+motion+'.png';await shot(row.screenshot.slice(0,-4));
     ok(row.overflowAnchorBefore==='none'&&row.overflowAnchorAfter==='none','browser anchoring disabled for '+row.id);
     for(const phase of ['immediate','settled'])ok(row.viewportBounds[phase].bound==='none','causal viewport target is physically feasible '+row.id+' '+phase);
     await verifyState(row);
     same(row.writeKeys,await ev('prismQa.keys()'),'one real primary/recovery pair '+row.id);
     ok(row.input.some(e=>e.trusted&&e.type==='keydown'&&e.key==='Enter')&&row.input.some(e=>e.trusted&&e.type==='click'),'actual trusted Enter/click '+row.id);
     ok(row.runtimeErrorsBefore.length===0&&row.runtimeErrorsAfter.length===0,'no runtime errors '+row.id);
     if(mode==='positive')stableAction(row,focusKey,focusId,row.id);
     else{
      same(row.stateBefore,control.runs.positive.stateBefore,'identical original fixture before both '+kind+' inputs');
      row.caught=[];
      for(const phase of ['immediate','settled']){
       const message='viewport top stable '+row.id+' '+phase;
       try{viewport(row.before,row[phase],focusKey,focusId,row.id+' '+phase);}catch(error){if(!(error instanceof assert.AssertionError)||error.message!==message)throw error;row.caught.push({phase,name:error.name,message:error.message});}
       ok(Math.abs(row[phase].top-row.before.top)>1,'actual viewport displacement exceeds rounding '+row.id+' '+phase);
      }
      ok(row.caught.length===2,'both native epochs detect disabled '+kind+' restoration');
     }
    }
    control.status='caught';
   }catch(error){control.status='fail';control.error=error.stack;throw error;}
   finally{
    if(mutated){const restored=await ev('prismQa.treeViewportRestore()');control.restoredFunctionSha256=digest(restored);ok(control.restoredFunctionSha256===control.originalFunctionSha256,'restore exact original '+kind+' function');}
    // Fixture cleanup occurs after all observations; it never repairs a tested
    // input's focus or scroll before the immediate/settled assertions.
    await ev('('+function(style){var s=document.querySelector('main').style;if(style.value)s.setProperty('overflow-anchor',style.value,style.priority);else s.removeProperty('overflow-anchor');}.toString()+')('+JSON.stringify(priorStyle)+')');
    await install(prior,priorTab);await ev('('+function(slots){slots.forEach(function(slot){if(slot.raw===null)localStorage.removeItem(slot.key);else localStorage.setItem(slot.key,slot.raw);});}.toString()+')('+JSON.stringify(priorSlots)+')');
    control.restoredStateSha256=digest(await ev('prismQa.get()'));control.restoredSlotsSha256=digest(await ev('prismQa.keys().map(function(key){return {key:key,raw:localStorage.getItem(key)};})'));
    ok(control.restoredStateSha256===control.positiveStateSha256&&control.restoredSlotsSha256===control.positiveSlotsSha256,'restore paid state and raw slots after '+kind+' control');
    if(control.status==='caught')control.status='pass';
   }
  }
  async function fit(scope,label){var result=await ev('('+function(scope){var root=document.querySelector(scope),bad=[];root.querySelectorAll('[data-tree-node],.node-info,.name,.desc,.lvl,.earned-effect,.effect-note,[data-price-currency],.formation-preset-card,.formation-member,.formation-help .section-sub').forEach(function(e){if(!e.getClientRects().length)return;var r=e.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+1)bad.push({id:e.dataset.treeNode,cls:e.className,text:e.textContent.slice(0,90),left:r.left,right:r.right,scroll:e.scrollWidth,client:e.clientWidth});});return {bad:bad,overflow:root.scrollWidth>root.clientWidth+1};}.toString()+')('+JSON.stringify(scope)+')');ok(!result.overflow&&!result.bad.length,'fit '+label+' '+JSON.stringify({width,scale,motion,result}));}
  const seed=await ev('prismQa.treeSeed()');let paid=copy(seed);
  // Actual schema1 cold load, not a normalized test fixture passed as migration.
  const old=copy(seed);old.schemaVersion=1;delete old.offline12hRefund;delete old.treeTrainingProgress;added.forEach(id=>delete old.nodes[id]);
  old.nodes.echo=9;old.nodes.bonds=25;old.nodes.swift=12;old.nodes.reserves=3;old.prisms=100;old.comets=7;old.owned.offline24=true;old.owned.offline48=true;
  const legacyRaw=JSON.stringify(old),legacySeedSha256=crypto.createHash('sha256').update(legacyRaw).digest('hex');
  const migrationDiagnostic={synthetic:true,width,scale,motion,seedSha256:legacySeedSha256,seed:{schemaVersion:old.schemaVersion,nodes:old.nodes,prisms:old.prisms,comets:old.comets},loaded:null};treeMigrationDiagnostics.push(migrationDiagnostic);
  // The outgoing real beforeunload autosave must run normally. Install the raw
  // legacy fixture only at the next document start, before the game loads it.
  const legacyBootstrap=await send('Page.addScriptToEvaluateOnNewDocument',{source:'('+function(raw,sha){var keys=['lumenfall_save_v2','lumenfall_save_recovery_v1'];keys.forEach(function(k){localStorage.setItem(k,raw);});var s=JSON.parse(raw);window.__treeLegacySeedObservation={synthetic:true,sha256:sha,schemaVersion:s.schemaVersion,prisms:s.prisms,comets:s.comets,nodes:s.nodes,slotsMatch:keys.every(function(k){return localStorage.getItem(k)===raw;})};}.toString()+')('+JSON.stringify(legacyRaw)+','+JSON.stringify(legacySeedSha256)+')'});
  await ev('window.prismQa=null');await send('Page.reload');await ready();
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:legacyBootstrap.identifier});
  const legacySeedObservation=await ev('window.__treeLegacySeedObservation');migrationDiagnostic.beforeLoad=legacySeedObservation;ok(legacySeedObservation&&legacySeedObservation.slotsMatch&&legacySeedObservation.sha256===legacySeedSha256,'raw legacy slots installed before actual load');
  await ev('document.documentElement.style.fontSize='+JSON.stringify(16*scale+'px'));await ev("prismQa.tab('ascend')");await frames();
  const migrated=await ev('prismQa.get()');migrationDiagnostic.loaded={schemaVersion:migrated.schemaVersion,nodes:migrated.nodes,prisms:migrated.prisms,comets:migrated.comets};ok(migrated.schemaVersion===2,'actual load migrates schema1');
  for(const id of ['starlight','steady','echo','bonds','swift','momentum','reserves'])ok(migrated.nodes[id]===old.nodes[id],'raw old paid level retained '+id);
  ok(added.every(id=>migrated.nodes[id]===0)&&migrated.treeTrainingProgress===0,'all missing new levels/counter start at zero');
  ok(migrated.prisms===132&&migrated.comets===307,'F26 prices 6+10+16 and two old hours refund once');
  for(const field of ['research','longStudyLevels','activeStudies','heroRarity','wispModules','wispUltimate','autoAscendEnabled','autoAscendTargetDepth'])same(migrated[field],old[field],'paid migration retains '+field);
  same(await ev('prismQa.treeRoundtrip()'),migrated,'actual backup codec does not replay migration');
  await ev('prismQa.treeSave()');const migrationSaved=await ev('prismQa.get()');await ev('window.prismQa=null');await send('Page.reload');await ready();
  ok(await ev('prismQa.get().prisms')===132&&await ev('prismQa.get().comets')===307,'second actual load never repeats F26 refund');
  await ev('document.documentElement.style.fontSize='+JSON.stringify(16*scale+'px'));
  await install(seed);
  const defs=(await ev('prismQa.treeDefs()')).filter(n=>!n.retired&&!n.retiredTo),catalog=await ev("Array.from(document.querySelectorAll('#node-list [data-tree-node]')).map(function(e){return e.dataset.treeNode;})");
  same(defs.map(n=>n.id).sort(),ids.slice().sort(),'twenty active production definitions');same(catalog.slice().sort(),ids.slice().sort(),'all twenty rendered cards without duplicates');
  ok(await ev("document.querySelectorAll('#node-list [data-legacy-upgrade],#node-list [data-node-queue],#node-list [data-node-mult]').length")===0,'no retired, queue or bulk Tree controls');
  const beforeRender=await ev('JSON.stringify(prismQa.get())');await ev('prismQa.treeRender();prismQa.treeRender()');ok(await ev('JSON.stringify(prismQa.get())')===beforeRender,'Tree render is pure');await fit('#node-list','catalog');
  await prepare(sel('data-node','echo'),false);await shot('tree-first-'+width+'-'+scale+'-'+motion);
  const locked=copy(seed);locked.depth=locked.enemyDepth=locked.maxDepthEver=1;locked.enemyHp=locked.enemyMaxHp=100;await install(locked);
  for(const r of specs.slice(3)){const card=sel('data-tree-node',r[0]);const m=await ev('('+function(card,id){var e=document.querySelector(card),b=e&&e.querySelector('[data-node]');return {exists:!!e,text:e&&e.textContent,disabled:!b||b.disabled};}.toString()+')('+JSON.stringify(card)+','+JSON.stringify(r[0])+')');ok(m.exists&&m.disabled&&m.text.includes(r[1])&&m.text.includes('Rift '+r[2])&&!m.text.includes('???'),'named locked row and exact unlock '+r[0]);locks.push({id:r[0],text:m.text});}
  const charterLocked=copy(seed);charterLocked.nodes.swift=9;await install(charterLocked);ok(await ev("prismQa.treePlan('swiftcharter').reason")==='locked','Charter independently requires Swift10');ok(await ev("document.querySelector('[data-tree-node=swiftcharter]').textContent.includes('10')"),'Swift10 requirement visible');
  // Current contribution is independently checked at 0,1,cap and raw overcap.
  for(const r of specs){const id=r[0],levels=r[3]===null?[0,1,50]:[0,1,r[3],r[3]+1];
   for(const level of Array.from(new Set(levels))){const s=copy(seed);s.nodes[id]=level;await install(s);const t=await ev('document.querySelector('+JSON.stringify(sel('data-node-effect',id))+').textContent');for(const piece of effect(id,level))ok(t.includes(piece),'independent current effect '+id+'/'+level+' '+piece);const raw=await ev('prismQa.get().nodes['+JSON.stringify(id)+']');ok(raw===level,'render keeps raw paid value '+id+'/'+level);if(r[3]!==null&&level>=r[3])ok(await ev('document.querySelector('+JSON.stringify(sel('data-node',id))+').disabled&&document.querySelector('+JSON.stringify(sel('data-node',id))+').textContent.includes("Maxed")'),'cap control '+id+'/'+level);effectSamples.push({id,level,text:t});}
  }
  for(let i=0;i<specs.length;i++){
   const r=specs[i],id=r[0],button=sel('data-node',id),card=sel('data-tree-node',id),level=paid.nodes[id],cost=price(r,level);await install(paid);
   const plan=await ev('prismQa.treePlan('+JSON.stringify(id)+')');ok(plan.level===level&&plan.cost===cost&&plan.affordable,'independent first real quote '+id);
   const text=await ev('document.querySelector('+JSON.stringify(card)+').textContent');ok(text.includes(r[1])&&text.includes('Level '+level),'visible name and paid level '+id);if(r[3]!==null)ok(text.includes('Cap '+r[3]),'explicit cap '+id);
   async function wallet(amount,label){await ev('prismQa.treeWallet('+amount+');prismQa.treeRefresh()');const m=await ev('('+function(card){var e=document.querySelector(card),p=e.querySelector('[data-price-currency="prism"]'),b=e.querySelector('[data-node]'),probe=document.createElement('span');document.body.appendChild(probe);probe.style.color='var(--danger)';var red=getComputedStyle(probe).color;probe.style.color='var(--ink)';var ink=getComputedStyle(probe).color;probe.remove();return {count:e.querySelectorAll('[data-price-currency]').length,amount:Number(p.dataset.priceAmount),color:getComputedStyle(p).color,red:red,ink:ink,disabled:b.disabled,text:b.textContent,warning:e.querySelectorAll('.control-state').length};}.toString()+')('+JSON.stringify(card)+')');ok(m.count===1&&m.amount===cost,'one exact Prisms quote '+id+'/'+label);ok(m.color===(amount<cost?m.red:m.ink),'red only when unaffordable '+id+'/'+label);ok(m.disabled===(amount<cost),'live eligibility '+id+'/'+label);ok(m.warning===0&&!/need|short|missing|deficit|not enough/i.test(m.text),'no shortage UI '+id+'/'+label);return m;}
   await wallet(cost-1,'one short');await wallet(cost,'exact');const focused=await prepare(button,true);await ev('prismQa.treeRefresh()');const refresh=await measure(button);await frames();const refreshSettled=await measure(button);ok(refresh.focus.node===id&&refresh.scroll===focused.scroll,'unchanged-layout affordability retains focus and exact scroll '+id);ok(refreshSettled.scroll===focused.scroll,'unchanged-layout affordability exact scroll after native frames '+id);viewport(focused,refresh,'node',id,'affordability '+id+' immediate');viewport(focused,refreshSettled,'node',id,'affordability '+id+' settled');
   const before=await ev('prismQa.get()'),writes=await ev('window.__treeWrites.length');
   if(i%3===0)await touchHere(button);else await key(i%3===1?'Enter':' ',i%3===1?'Enter':'Space',i%3===1?13:32);
   await frames();const after=await ev('prismQa.get()');ok(after.nodes[id]===level+1&&after.prisms===0,'one trusted exact purchase '+id);
   for(const field of ['research','longStudyLevels','activeStudies','owned','heroRarity','wispModules','wispUltimate','spirits','activeParty','formationPresets','autoAscendEnabled','autoAscendTargetDepth','lumen','shards','motes','sigils','comets','treeTrainingProgress'])same(after[field],before[field],'Tree buy preserves '+field+' '+id);
   for(const other of ids.concat(['starlight','steady','momentum','reserves']))if(other!==id)ok(after.nodes[other]===before.nodes[other],'only selected node changes '+id+'/'+other);
   ok(await ev('window.__treeWrites.slice('+writes+').filter(function(k){return prismQa.keys().indexOf(k)!==-1;}).length')===2,'one primary/recovery save '+id);
   ok(await ev('prismQa.keys().every(function(k){var s=JSON.parse(localStorage.getItem(k));return s.nodes['+JSON.stringify(id)+']==='+Number(level+1)+'&&s.prisms===0;})'),'both slots contain exact real endpoint '+id);
   const rendered=await ev('document.querySelector('+JSON.stringify(sel('data-node-effect',id))+').textContent');for(const piece of effect(id,level+1))ok(rendered.includes(piece),'purchase immediately changes effect '+id);
   // A separate funded purchase keeps the same enabled control, so viewport
   // checks do not depend on the product's disabled-control fallback policy.
   if(r[3]===null||level+2<r[3]){
    const f=copy(paid);f.prisms=100000;await install(f);const m=await prepare(button,true);
    const diagnostic={width,scale,motion,id,nativeAnimationFrames:true,before:m,immediate:null,settled:null};treeFundedDiagnostics.push(diagnostic);inputSamples.push(diagnostic);
    await key('Enter','Enter',13);const now=await measure(button);diagnostic.immediate=now;
    await frames();const settled=await measure(button);diagnostic.settled=settled;
    // Preserve both observations before an assertion can abort the profile.
    // The immediate check still reads its original pre-frame snapshot.
    diagnostic.deltas={immediateTop:now.top-m.top,settledTop:settled.top-m.top,immediateScroll:now.scroll-m.scroll,settledScroll:settled.scroll-m.scroll};
    diagnostic.viewportBounds={immediate:viewportBounds(m,now),settled:viewportBounds(m,settled)};
    stableAction(diagnostic,'node',id,'funded purchase '+id);
   }
   paid=copy(after);paid.prisms=100000;samples.push({id,levelBefore:level,levelAfter:level+1,cost});
  }
  await install(paid);const last=catalog[catalog.length-1];await prepare(sel('data-node',last),false);await shot('tree-last-'+width+'-'+scale+'-'+motion);await fit('#node-list','all purchased');
  // Browser anchoring is disabled in both halves. Only the real summary's
  // viewport restore call is removed; its closure, purchase and saves remain.
  if(width===320&&scale===1&&motion==='no-preference'){
   const s=copy(seed);s.nodes.frontier=0;s.prisms=100000;
   await viewportControl('summary',s,'ascend',sel('data-node','frontier'),'node','frontier',async row=>{
    ok(row.stateBefore.nodes.frontier===0&&row.stateBefore.prisms===100000&&row.stateAfter.nodes.frontier===1&&row.stateAfter.prisms===99980,'actual Frontier zero-to-one for20 '+row.id);
    const expectedNodes=copy(row.stateBefore.nodes);expectedNodes.frontier=1;same(row.stateAfter.nodes,expectedNodes,'only Frontier node changes '+row.id);
    for(const field of ['research','longStudyLevels','activeStudies','owned','heroRarity','wispModules','wispUltimate','spirits','activeParty','formationPresets','autoAscendEnabled','autoAscendTargetDepth','lumen','shards','motes','sigils','comets','treeTrainingProgress'])same(row.stateAfter[field],row.stateBefore[field],'summary control preserves '+field+' '+row.id);
    ok(row.slots.every(slot=>slot.state.nodes.frontier===1&&slot.state.prisms===99980),'both saved endpoints contain exact Frontier debit '+row.id);
   });
  }
  // The actual Ascend calculation displays Dust from represented Prism credit.
  // The huge-wallet case must display zero even though the nominal gain is >20.
  for(const wallet of [100000,1e30]){
   const dustState=copy(paid);dustState.prisms=wallet;await install(dustState);
   const gain=(await ev('prismQa.breakdown(101)')).gain,expected=Math.min(10,Math.floor(((wallet+gain)-wallet)/20));
   ok(gain>=20,'Dust preview fixture has a whole twenty-Prism bundle');
   const preview=await ev('('+function(){var root=document.querySelector('#prism-calculation'),term=Array.from(root.querySelectorAll('dt')).find(function(e){return e.textContent==='Ascension Dust';});return {dust:term&&term.nextElementSibling.textContent,note:document.querySelector('#ascend-note').textContent};}.toString()+')()');
   ok(preview.dust===expected+' Motes','Dust preview uses actual represented credit');
   ok(expected?preview.note.includes('Ascension Dust adds '+expected+' Motes.'):!preview.note.includes('Ascension Dust adds'),'Ascend note agrees with actual Dust preview');
   dustSamples.push({wallet,gain,expected,preview});
  }
  // A quote can fit the wallet and still be an unrepresentable exact debit.
  // Verify actual initial render, delayed refresh, blocked trusted input, then
  // the ordinary affordable transition and the unchanged real paid handler.
  const precision=copy(seed);precision.spirits.ember=1;precision.nodes.bonds=0;precision.lumen=1e30;await install(precision,'spirits');
  const empower='[data-empower="ember"]';
  async function empowerStatus(){return ev('('+function(){var b=document.querySelector('[data-empower="ember"]');return {disabled:b.disabled,state:b.dataset.state,label:b.querySelector('strong').textContent,aria:b.getAttribute('aria-label'),plan:prismQa.treeSpiritPlan('ember')};}.toString()+')()');}
  const unavailableInitial=await empowerStatus();ok(unavailableInitial.plan.cost===11&&unavailableInitial.plan.reason==='unavailable','exact huge-wallet quote11');
  ok(unavailableInitial.disabled&&unavailableInitial.state==='unavailable'&&unavailableInitial.label==='Unavailable','initial unrepresented Empower remains unavailable');
  await ev('new Promise(function(resolve){setTimeout(resolve,500);})');await ev('prismQa.treeRefresh()');
  const unavailableRefresh=await empowerStatus();ok(unavailableRefresh.disabled&&unavailableRefresh.state==='unavailable'&&unavailableRefresh.label==='Unavailable','500ms affordability refresh retains exact-debit unavailability');
  const precisionBefore=await ev('JSON.stringify(prismQa.get())'),precisionWrites=await ev('window.__treeWrites.length');
  await prepare(empower,false);await touchHere(empower);await frames();
  ok(await ev('JSON.stringify(prismQa.get())')===precisionBefore&&await ev('window.__treeWrites.length')===precisionWrites,'trusted unavailable click changes neither state nor saves');
  await ev('prismQa.treeLumen(11);prismQa.treeRefresh()');const affordableRefresh=await empowerStatus();
  ok(!affordableRefresh.disabled&&affordableRefresh.state==='available'&&affordableRefresh.label==='Empower','ordinary exact wallet restores Empower label and action');
  await prepare(empower,false);await touchHere(empower);await frames();const precisionAfter=await ev('prismQa.get()');
  ok(precisionAfter.spirits.ember===2&&precisionAfter.lumen===0,'actual restored handler buys exactly one level for11');
  ok(await ev('window.__treeWrites.slice('+precisionWrites+').filter(function(k){return prismQa.keys().indexOf(k)!==-1;}).length')===2,'restored actual Empower saves one primary/recovery pair');
  const unavailableEmpower={unavailableInitial,unavailableRefresh,affordableRefresh,after:{level:precisionAfter.spirits.ember,lumen:precisionAfter.lumen}};
  // Six chosen members, including two Support sources, through real controls.
  const formation=copy(paid),firstFive=['ember','tide','stone','gale','thorn'];
  ['ember','tide','stone','gale','thorn','void','aurora','titan'].forEach(id=>formation.spirits[id]=10);
  formation.activeParty=firstFive.slice();formation.formationPresets={push:firstFive.slice(),farm:firstFive.slice(),boss:firstFive.slice()};formation.activeFormationPreset='push';formation.formationRebuild=null;
  await install(formation,'spirits');ok(await ev('prismQa.treeCapacity()')===6,'paid sixth capacity');
  const field=sel('data-toggle','aurora');
  const sixth=await formationInput('field-sixth',field,()=>key('Enter','Enter',13)),six=sixth.stateAfter;
  same(six.activeParty,firstFive.concat('aurora'),'actual keyboard fields sixth');same(six.formationPresets.push,six.activeParty,'six-member autosaved intent');same(six.spirits,formation.spirits,'Field never recruits or empowers');
  same(sixth.writeKeys,await ev('prismQa.keys()'),'sixth Field saves one actual primary/recovery pair');stableAction(sixth,'toggle','aurora','sixth Field',true);
  ok(await ev("document.querySelector('#formation-presets').textContent.includes('6/6')"),'six of six visible');
  ok(await ev("document.querySelector('#formation-capacity').textContent")==='6','Formation header agrees with paid six-slot capacity');
  for(const name of ['push','farm','boss']){const count=six.formationPresets[name].length;ok(await ev('document.querySelector('+JSON.stringify('[data-formation-preset="'+name+'"]')+').textContent.includes('+JSON.stringify(count+'/6 Wisps')+')'),'each preset count agrees with saved members and six-slot capacity '+name);}
  ok(await ev("document.querySelector('.formation-help .section-sub').textContent.includes('6 Wisps')"),'Formation guidance uses owned capacity');
  const seventh=await formationInput('six-capacity-refusal',sel('data-toggle','void'),()=>touchHere(sel('data-toggle','void')));
  same(seventh.stateAfter.activeParty,six.activeParty,'seventh member refused without changing six');same(seventh.stateAfter,seventh.stateBefore,'six-capacity refusal preserves entire synthetic state');same(seventh.writeKeys,[],'six-capacity refusal never writes a save');stableAction(seventh,'toggle','void','six-capacity refusal',true);
  const bench=await formationInput('bench-sixth',field,()=>key(' ','Space',32));
  ok(bench.stateAfter.activeParty.length===5,'keyboard benches sixth');same(bench.writeKeys,await ev('prismQa.keys()'),'Bench saves once');stableAction(bench,'toggle','aurora','bench sixth',true);
  // The next touch uses the still-focused post-Bench control directly, without
  // scrollIntoView or a focus repair between the two real actions.
  const refield=await formationInput('re-field-sixth',field,()=>touchHere(field),false);
  same(refield.stateAfter.activeParty,six.activeParty,'native touch restores sixth once');same(refield.writeKeys,await ev('prismQa.keys()'),'re-Field saves once');stableAction(refield,'toggle','aurora','re-field sixth',true);
  const farm=await formationInput('preset-farm','[data-formation-preset="farm"]',()=>touchHere('[data-formation-preset="farm"]'));
  ok(farm.stateAfter.activeParty.length===5,'real preset switches to five');same(farm.writeKeys,await ev('prismQa.keys()'),'Farm selection saves once');stableAction(farm,'preset','farm','Farm preset',true);
  const push=await formationInput('preset-push','[data-formation-preset="push"]',()=>key('Enter','Enter',13));
  same(push.stateAfter.activeParty,six.activeParty,'keyboard preset restores all six');same(push.writeKeys,await ev('prismQa.keys()'),'Push selection saves once');stableAction(push,'preset','push','Push preset',true);
  const solo=copy(formation);solo.activeParty=['ember'];solo.formationPresets={push:['ember'],farm:['ember'],boss:['ember']};await install(solo,'spirits');
  const lastWisp=await formationInput('last-wisp-refusal',sel('data-toggle','ember'),()=>key('Enter','Enter',13));
  same(lastWisp.stateAfter.activeParty,['ember'],'actual last-Wisp Bench is refused');same(lastWisp.stateAfter,lastWisp.stateBefore,'last-Wisp refusal preserves entire synthetic state');same(lastWisp.writeKeys,[],'last-Wisp refusal never writes a save');stableAction(lastWisp,'toggle','ember','last-Wisp refusal',true);
  await install(push.stateAfter,'spirits');
  for(const row of formationSamples){
   for(const name of ['spirits','nodes','research','longStudyLevels','activeStudies','owned','heroRarity','wispModules','wispUltimate','autoAscendEnabled','autoAscendTargetDepth','lumen','shards','motes','sigils','comets','prisms','treeTrainingProgress'])same(row.stateAfter[name],row.stateBefore[name],'Formation input preserves '+name+' '+row.id);
   ok(row.input.some(e=>e.trusted&&e.type==='click'),'actual trusted Formation click '+row.id);ok(!row.runtimeErrorsBefore.length&&!row.runtimeErrorsAfter.length,'no runtime error during '+row.id);
  }
  if(width===320&&scale===1&&motion==='no-preference'){
   await viewportControl('formation',formation,'spirits',field,'toggle','aurora',async row=>{
    same(row.stateBefore.activeParty,firstFive,'Formation control begins with five '+row.id);same(row.stateAfter.activeParty,firstFive.concat('aurora'),'actual control fields Aurora as sixth '+row.id);same(row.stateAfter.formationPresets.push,row.stateAfter.activeParty,'control autosaves six-member intent '+row.id);
    for(const name of ['farm','boss'])same(row.stateAfter.formationPresets[name],row.stateBefore.formationPresets[name],'control preserves other preset '+name+' '+row.id);
    for(const name of ['spirits','nodes','research','longStudyLevels','activeStudies','owned','heroRarity','wispModules','wispUltimate','autoAscendEnabled','autoAscendTargetDepth','lumen','shards','motes','sigils','comets','prisms','treeTrainingProgress'])same(row.stateAfter[name],row.stateBefore[name],'Formation control preserves '+name+' '+row.id);
    ok(row.slots.every(slot=>JSON.stringify(slot.state.activeParty)===JSON.stringify(firstFive.concat('aurora'))&&JSON.stringify(slot.state.formationPresets.push)===JSON.stringify(firstFive.concat('aurora'))&&slot.state.lumen===row.stateBefore.lumen&&slot.state.prisms===row.stateBefore.prisms),'both slots contain sixth member without an economic mutation '+row.id);
   });
  }
  await fit('#tab-spirits','six-member Formation');await prepare('[data-formation-preset="push"]',true);await shot('tree-six-'+width+'-'+scale+'-'+motion);
  const input=await ev('window.__prismInput');ok(input.some(e=>e.trusted&&e.type==='click')&&input.some(e=>e.trusted&&e.key==='Enter')&&input.some(e=>e.trusted&&e.key===' '),'trusted touch Enter and Space evidence');
  await ev('prismQa.treeSave()');const committed=await ev('prismQa.get()');await ev('window.prismQa=null');await send('Page.reload');await ready();await ev('document.documentElement.style.fontSize='+JSON.stringify(16*scale+'px'));await ev("prismQa.tab('spirits')");
  const cold=await ev('prismQa.get()');for(const field of ['nodes','research','longStudyLevels','activeStudies','owned','heroRarity','wispModules','wispUltimate','activeParty','formationPresets','activeFormationPreset','autoAscendEnabled','autoAscendTargetDepth'])same(cold[field],committed[field],'actual reload retains paid '+field);
  ok(added.every(id=>cold.nodes[id]===1),'all seventeen actual new purchases survive reload');ok(cold.activeParty.length===6,'six-slot snapshot survives cold load');
  const zero=copy(formation);zero.nodes.formationseat=0;zero.activeParty=six.activeParty;zero.formationPresets.push=six.activeParty;await install(zero,'spirits');ok(await ev('prismQa.get().activeParty.length')===5&&await ev('prismQa.treeCapacity()')===5,'zero-new capacity remains five');
  await install(committed);const ax=await send('Accessibility.getFullAXTree');for(const r of specs)ok(ax.nodes.some(n=>!n.ignored&&n.name&&n.name.value.includes(r[1])),'named Tree row exposed to AX '+r[0]);
  ok((await ev('window.__prismErrors')).length===0,'no browser runtime errors');records.push({width,scale,motion,nativeAnimationFrames:true,catalog,samples,effectSamples,locks,inputSamples,formationSamples,dustSamples,unavailableEmpower,sixMembers:six.activeParty,legacyMigration:{seed:legacySeedObservation,schema:migrated.schemaVersion,prisms:migrated.prisms,comets:migrated.comets,nodes:migrated.nodes,newDefaultZero:added.length},input});
`;
// Capture the purchase/formation input epoch before the final actual reload.
// No focus or scroll repair runs after user input.
driver=driver.slice(0,start)+cases+driver.slice(end);
const temp=path.join(__dirname,'.tree-mobile-'+process.pid+'.cjs');
try{fs.writeFileSync(temp,driver);const r=spawnSync(process.execPath,[temp,sourcePath,evidence],{stdio:'inherit',timeout:1200000});if(r.error)throw r.error;assert.equal(r.status,0,'Tree browser acceptance failed; inspect raw receipt/screenshots');}
finally{fs.rmSync(temp,{force:true});}
