/* NAV-001: navigation observes canonical state; shortage presentation is silent. */
window.runNavWorkshopQa = function(b,ctx,assert){
  var checks=0,q=function(s){return document.querySelector(s);};
  function ok(v,m){checks++;assert(v,m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function go(name){q('[data-tab="'+name+'"]').click();}
  function snapshot(){return {state:b.getState(),primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()};}
  var original=b.getState();b.resetFeedback();
  var seed=b.freshStateSnapshot();seed.maxDepthEver=101;seed.questDay=ctx.currentDay();
  b.setState(seed);b.renderLayout();
  var before=snapshot(),nav=Array.from(document.querySelectorAll('nav.tabbar .tab-btn'));
  same(nav.map(function(n){return n.dataset.tab;}),['spirits','workshop','battle','ascend','deeds'],'NAV five ordered destinations');
  go('workshop');ok(q('#tab-forge').classList.contains('active'),'first Workshop opening chooses Forge');
  var baseline=q('[data-tab="battle"] .nav-icon').getBoundingClientRect();
  nav.forEach(function(btn){
    btn.focus();btn.click();
    var icon=q('[data-tab="battle"] .nav-icon').getBoundingClientRect();
    ok(icon.x===baseline.x&&icon.y===baseline.y&&icon.width===baseline.width&&icon.height===baseline.height,'Rift geometry stays fixed on '+btn.dataset.tab);
    ok(document.querySelectorAll('.tab-btn.active').length===1&&document.querySelectorAll('nav.tabbar [aria-current="page"]').length===1,'one main selection');
    nav.forEach(function(n){ok(getComputedStyle(n.querySelector('.lb')).visibility===(n===btn?'hidden':'visible'),'only active bottom label hidden');ok(n.getAttribute('aria-label').includes(n.querySelector('.lb').textContent),'accessible main name survives hidden label');});
    ok(document.activeElement===btn,'navigation retains invoking focus');
  });
  go('workshop');go('research');go('battle');go('workshop');
  ok(q('#tab-research').classList.contains('active'),'session remembers last Workshop section');
  go('forge');ok(q('#tab-forge').classList.contains('active'),'direct Forge overrides remembered Lab');
  go('research');ok(q('#tab-research').classList.contains('active'),'direct Lab overrides remembered Forge');
  var sub=Array.from(document.querySelectorAll('.workshop-btn'));
  ok(sub.length===2&&sub.filter(function(n){return n.getAttribute('aria-selected')==='true'&&n.tabIndex===0;}).length===1,'one selected Workshop tab and roving focus');
  sub[1].focus();sub[1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  ok(document.activeElement===sub[0]&&q('#tab-forge').classList.contains('active'),'Workshop Right wraps Lab to Forge');
  sub[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  ok(document.activeElement===sub[1]&&q('#tab-research').classList.contains('active'),'Workshop Left wraps Forge to Lab');
  nav[4].focus();nav[4].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  ok(document.activeElement===nav[0],'main Right wraps to Wisps');
  nav[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));ok(document.activeElement===nav[4],'main Left wraps to Deeds');
  same(snapshot(),before,'all navigation preserves whole state, primary/recovery and events');
  [0,1,2].forEach(function(count){
    var s=b.freshStateSnapshot();s.maxDepthEver=101;
    s.activeStudies=[{id:'guardmastery',remainingSec:90,totalDurationSec:90,speedMult:1},{id:'wispascend',remainingSec:90,totalDurationSec:90,speedMult:1}].slice(0,count);
    b.setState(s);b.renderLayout();go('research');q('#nav-research').focus();
    var prior=snapshot();b.renderLayout();
    var free=b.riftStatus.slots()-count;
    ['#lab-capacity-badge','#workshop-lab-badge'].forEach(function(sel){ok(q(sel).textContent===String(free)&&q(sel).hidden===(free===0),'both badges show actual free slots');});
    ok(q('#nav-workshop').getAttribute('aria-label').includes('Lab — '+free+' Study slot'),'Workshop name describes Lab capacity');
    ok(document.activeElement===q('#nav-research'),'badge refresh retains subtab focus');same(snapshot(),prior,'badge refresh leaves state/saves/events unchanged');
  });
  var poor=b.freshStateSnapshot();poor.maxDepthEver=101;poor.questDay=ctx.currentDay();
  ['ember','tide','stone'].forEach(function(id){poor.spirits[id]=40;poor.heroRarity[id]=5;});
  poor.activeStudies=[{id:'guardmastery',remainingSec:90,totalDurationSec:90,speedMult:1}];
  b.setState(poor);b.renderLayout();
  var types={};
  ['spirits','forge','research','ascend','deeds'].forEach(function(name){
    go(name);document.querySelectorAll('#tab-'+name+' button[data-state="unaffordable"]').forEach(function(btn){
      var copy=btn.textContent+' '+btn.getAttribute('aria-label');
      ok(btn.disabled,'unaffordable retains native disabled');
      ok(!/Need\s+(Lumen|Shards|Motes|Prisms|Comets|Sigils)|Cannot afford|Insufficient resources/i.test(copy),'currency shortage copy absent in text and ARIA');
      var price=btn.hasAttribute('data-study')?document.getElementById(btn.getAttribute('aria-describedby')):btn;
      ok(!!btn.getAttribute('aria-label')&&price&&!!price.querySelector('.cost-icon'),'disabled purchase retains accessible action and actual currency price');
      if(btn.hasAttribute('data-research'))ok(btn.querySelector('.label').textContent==='Upgrade','poor Forge shows Upgrade without ×0');
      ['empower','module','ultimate','research','node','study','shop','speed-study'].forEach(function(type){if(btn.hasAttribute('data-'+type))types[type]=true;});
      var prior=snapshot();btn.click();same(snapshot(),prior,'disabled purchase cannot mutate state/saves/events');
    });
  });
  ['empower','module','ultimate','research','node','study','shop','speed-study'].forEach(function(type){ok(types[type],'silent shortage exercised for '+type);});
  b.setState(original);b.renderLayout();
  return {checks:checks,mainDestinations:5,workshopSections:2,wholeStatePurity:true,silentPurchaseTypes:Object.keys(types)};
};
