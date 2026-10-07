/* F21 browser assertions. Uses real purchase, persistence and simulation paths;
 * the bridge exists only in the runner's in-memory copy of index.html. */
window.cheaperRecruitmentSeed=function(level){
  var b=window.__cheaperRecruitment,s=b.fresh();
  s.nodes.bonds=level;s.prisms=1000000;s.maxDepthEver=100;
  s.questDay=b.today();s.achieved.asc5=true;s.achieved.d100=true;
  return s;
};
window.runCheaperRecruitmentContracts=function(){
  var b=window.__cheaperRecruitment,checks=0;
  function ok(v,m){checks++;if(!v)throw Error(m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function install(level){b.set(cheaperRecruitmentSeed(level));b.render();}
  // An assertion against the old defect runs before presentation assertions.
  [20,21,40,2000].forEach(function(level){
    install(level);var before=b.get(),disk=b.disk();
    for(var i=0;i<100;i++)b.buy({id:'bonds',baseCost:2,growth:1.45});
    same(b.get(),before,'cap prevents direct/repeated debit at raw level '+level);
    same(b.disk(),disk,'blocked purchase never writes saves at '+level);
    ok(b.discount()===0.6,'legacy cap keeps earned 60% discount '+level);
    var button=document.querySelector('[data-node="bonds"]');
    ok(button.disabled&&button.dataset.state==='maxed','UI maxed even with affordable wallet '+level);
    ok(button.textContent.trim()==='Maxed'&&!button.querySelector('.cost'),'maxed offers no next price');
    ok(button.getAttribute('aria-label').includes('Cheaper Recruitment')&&button.getAttribute('aria-label').includes('Maxed'),'accessible maxed name');
    var card=button.closest('.node-card');
    ok(card.querySelector('.lvl').textContent.includes('20 / 20'),'effective level capped');
    if(level>20)ok(card.querySelector('.lvl').textContent.includes(level.toLocaleString('en-US')+' purchased levels preserved'),'legacy raw count visible');
    var effect=card.querySelector('[data-node-effect]').textContent;
    ok(effect.includes('60% Wisp recruiting discount')&&effect.includes('40% of normal price'),'cap earned effect');
  });
  install(0);var total=0;
  for(var level=0;level<20;level++){
    var price=Math.ceil(2*Math.pow(1.45,level)),before=b.get();total+=price;
    b.buy({id:'bonds',levelCap:0,baseCost:0,growth:1});
    ok(b.get().nodes.bonds===level+1&&b.get().prisms===before.prisms-price,'canonical metadata and original debit '+level);
    ok(b.discount()===Math.min(.6,(level+1)*.03),'original discount '+level);
  }
  ok(b.get().prisms===1000000-total,'all 20 prices paid exactly once');
  install(19);var s=b.get();s.prisms=2329;b.set(s);b.buy({id:'bonds'});
  ok(b.get().nodes.bonds===20&&b.get().prisms===0,'final level costs exactly 2329 Prisms');
  install(19);s=b.get();s.prisms=2328;b.set(s);var before=b.get(),disk=b.disk();b.buy({id:'bonds'});
  same(b.get(),before,'insufficient budget no debit');same(b.disk(),disk,'insufficient budget no save');
  [null,{}, {id:'missing'}].forEach(function(node){before=b.get();b.buy(node);same(b.get(),before,'unknown input cannot mutate');});
  install(0);b.buy({id:'starlight'});ok(b.get().nodes.starlight===1&&b.get().prisms===999999,'other Tree upgrade unchanged');
  // Existing nearest-integer recruiting prices are independent oracles.
  [0,1,19,20,21,40].forEach(function(raw){
    install(raw);b.spirits().forEach(function(sp){
      (sp.id==='ember'?[1,2,10,50]:[0,1,2,10,50]).forEach(function(owned){
        var s=cheaperRecruitmentSeed(raw);s.spirits[sp.id]=owned;b.set(s);
        var expected=Math.round(sp.baseCost*Math.pow(1.13,owned)*(1-Math.min(.6,raw*.03)));
        ok(b.recruitCost(sp.id)===expected,'unchanged rounded cost '+sp.id+'/'+owned+'/'+raw);
      });
    });
  });
  // A rejected Tree purchase cannot disturb running paid work or other currency.
  install(21);s=b.get();s.motes=99;s.sigils=77;
  s.activeStudies=[{id:'guardmastery',remainingSec:70,totalDurationSec:150,speedMult:4}];
  b.set(s);before=b.get();b.buy({id:'bonds'});same(b.get(),before,'paid Lab snapshot and currencies unchanged');
  [0,19,20,21,40,2000].forEach(function(raw){
    s=cheaperRecruitmentSeed(raw);s.activeStudies=[{id:'guardmastery',remainingSec:70,totalDurationSec:150,speedMult:4}];
    var canonical=b.canonical(s);same(b.canonical(canonical),canonical,'canonical normalization idempotent '+raw);
    ok(canonical.nodes.bonds===raw&&canonical.prisms===s.prisms,'raw purchase history and wallet preserved '+raw);
    b.set(s);b.save();var slots=b.disk();
    [slots.primary,slots.recovery].forEach(function(slot){var restored=JSON.parse(slot);ok(restored.nodes.bonds===raw&&restored.prisms===s.prisms,'both persisted slots keep raw levels '+raw);same(restored.activeStudies,s.activeStudies,'paid snapshot persists '+raw);});
    var backup=b.backup(),decoded=b.decode(backup);ok(decoded.nodes.bonds===raw&&decoded.prisms===s.prisms,'backup preserves raw levels '+raw);
    same(b.decode(backup),decoded,'repeated old backup decode has no refund loop '+raw);
  });
  // Actual automation chronology around Auto-Empower's one-second boundary.
  function chronological(kind,split){
    var s=cheaperRecruitmentSeed(20);s.prisms=4567;s.lumen=100;
    s.achieved.labmaster=true;s.activeStudies=[{id:'guardmastery',remainingSec:1,totalDurationSec:150,speedMult:1}];
    Object.keys(s.empowerQueue).forEach(function(id){s.empowerQueue[id]=id==='ember';});
    b.set(s);var parts=[],clock=2000000000000;
    (split?[.999,.001,1]:[2]).forEach(function(sec){var p=b.simulate(sec,kind,clock);parts.push(p);clock=p.clockEndMs;});
    var state=b.get();ok(state.nodes.bonds===20&&state.prisms===4567,'no Tree queue or simulation debit '+kind);
    ok(state.spirits.ember>1&&state.longStudyLevels.guardmastery===1,'real auto-empower and Study completion '+kind);
    return state;
  }
  var live=chronological('live',false),offline=chronological('offline',false),split=chronological('live',true);
  ['nodes','prisms','lumen','shards','motes','sigils','spirits','heroResource','longStudyLevels','activeStudies','totalKills'].forEach(function(key){
    if(typeof live[key]==='number'){ok(Math.abs(live[key]-offline[key])<1e-8&&Math.abs(live[key]-split[key])<1e-8,'live/offline/split '+key);}
    else same(live[key],offline[key],'live/offline '+key);
  });
  return {checks:checks,purchaseCap:20,finalPrice:2329,pricesThroughCap:total,legacyLevels:[21,40,2000],migration:'none; refund pending design and Core review'};
};
window.cheaperRecruitmentObservation=function(){
  var b=window.__cheaperRecruitment,button=document.querySelector('[data-node="bonds"]'),card=button.closest('.node-card'),rect=button.getBoundingClientRect();
  function rgb(c){return c.match(/[\d.]+/g).slice(0,3).map(Number);}
  function lum(c){return rgb(c).reduce(function(sum,v,i){v/=255;return sum+[.2126,.7152,.0722][i]*(v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));},0);}
  var bg=getComputedStyle(card).backgroundColor;
  var contrasts=Array.from(card.querySelectorAll('.name,.desc,.lvl,.earned-effect,.earned-effect strong')).map(function(el){var a=lum(getComputedStyle(el).color),c=lum(bg);return (Math.max(a,c)+.05)/(Math.min(a,c)+.05);});
  return {state:b.get(),disabled:button.disabled,kind:button.dataset.state,focused:document.activeElement.dataset.node,focusStyle:{width:getComputedStyle(document.activeElement).outlineWidth,style:getComputedStyle(document.activeElement).outlineStyle},text:card.textContent,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},fit:document.documentElement.scrollWidth<=innerWidth+1&&card.scrollWidth<=card.clientWidth+1,contrasts:contrasts,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,animation:getComputedStyle(document.querySelector('#tab-ascend')).animationDuration};
};
