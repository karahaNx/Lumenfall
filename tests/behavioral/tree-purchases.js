/* Tree purchase boundaries: actual handlers, controls, saves and backup codec. */
window.runTreePurchaseQa=function(b,ctx,assert){
  var checks=0;
  function ok(value,message){checks++;assert(value,message);}
  function same(a,c,message){ok(JSON.stringify(a)===JSON.stringify(c),message);}
  function observer(){return {state:b.getState(),primary:b.rawSave(),recovery:b.rawRecovery(),events:b.lifecycleTrace()};}
  function seed(id,level,prisms){var s=b.freshStateSnapshot();s.nodes[id]=level;s.prisms=prisms;b.setState(s);b.feedbackSave();b.treePurchases.render();return b.getState();}
  function button(id){return document.querySelector('[data-node="'+id+'"]');}
  function rejected(id,message){var before=observer();ok(b.treePurchases.buy(id)===false,message);same(observer(),before,message+' is a pure rejection');}

  // The last effective levels use the existing individually rounded prices:
  // Echo level 5 -> 6 costs 11; Bonds level 19 -> 20 costs 2329.
  [['echo',5,6,11],['bonds',19,20,2329]].forEach(function(row){
    var id=row[0],level=row[1],cap=row[2],cost=row[3];
    seed(id,level,cost-1);ok(button(id).disabled,'one Prism short is disabled '+id);
    rejected(id,'one Prism short handler '+id);
    var initial=seed(id,level,cost);ok(!button(id).disabled,'exact budget available '+id);
    var events=b.lifecycleTrace().length;
    button(id).focus();b.treePurchases.click(id);var after=b.getState();
    ok(b.lifecycleTrace().length===events+1,'one actual handler save '+id);
    ok(after.nodes[id]===cap&&after.prisms===0,'one final level for exact payment '+id);
    var expected=JSON.parse(JSON.stringify(initial));expected.nodes[id]=cap;expected.prisms=0;expected.lastSeen=after.lastSeen;
    same(after,expected,'purchase changes only level, Prisms and save metadata '+id);
    ok(button(id).disabled&&button(id).textContent==='Maxed','at cap control '+id);
    b.refreshAffordability();ok(button(id).disabled&&button(id).dataset.state==='maxed','refresh preserves cap state '+id);
    rejected(id,'cap cannot charge '+id);
    same(JSON.parse(b.rawSave()).nodes,after.nodes,'canonical save keeps cap '+id);
    same(JSON.parse(b.rawRecovery()).nodes,after.nodes,'recovery save keeps cap '+id);
  });

  [['echo',7],['bonds',21],['echo',1000000],['bonds',1000000]].forEach(function(row){
    var s=seed(row[0],row[1],5000),canonical=b.treePurchases.canonical(s);
    ok(canonical.nodes[row[0]]===row[1],'legacy raw over-cap value retained '+row);
    same(b.treePurchases.canonical(canonical),canonical,'normalization idempotent '+row);
    same(b.treePurchases.roundtrip(canonical),canonical,'backup codec retains full snapshot '+row);
    ok(button(row[0]).disabled&&button(row[0]).textContent==='Maxed','legacy over-cap control '+row);
    rejected(row[0],'legacy over-cap purchase '+row);
    ok(document.querySelector('[data-node-effect="'+row[0]+'"]').parentElement.textContent.includes('Saved level preserved'),'raw legacy level explanation '+row);
  });

  ['reserves'].forEach(function(id){
    seed(id,0,1000);ok(!button(id),'achievement-locked node has no purchase control '+id);
    rejected(id,'direct handler respects achievement '+id);
    var s=b.getState();s.achieved[id==='momentum'?'asc5':'d100']=true;b.setState(s);b.treePurchases.render();
    var cost=id==='momentum'?5:6,prisms=s.prisms;
    ok(b.treePurchases.buy(id),'achievement unlock allows purchase '+id);
    ok(b.getState().nodes[id]===1&&b.getState().prisms===prisms-cost,'unlocked price unchanged '+id);
  });

  // The integrated matrix closes generic damage/kill tracks. Raw ownership,
  // exact old operands and complete snapshots survive repeated normalization.
  ['starlight','steady','momentum'].forEach(function(id){
    [0,7,1000000].forEach(function(level){
      var s=seed(id,level,1000);
      ok(!button(id),'retired node has no purchase control '+id+' '+level);
      ok(b.treePurchases.plan(id).reason==='retired','shared plan rejects retired node '+id);
      rejected(id,'retired node cannot charge '+id+' '+level);
      var canonical=b.treePurchases.canonical(s);
      same(canonical.nodes,s.nodes,'retired raw levels survive normalization '+id);
      same(b.treePurchases.canonical(canonical),canonical,'retired transition is idempotent '+id);
      same(b.treePurchases.roundtrip(canonical),canonical,'backup preserves retired value '+id);
      var row=document.querySelector('[data-legacy-upgrade="'+id+'"]');
      ok(level?row&&row.textContent.includes('Existing bonus kept.'):!row,'preserved contribution shown only when owned '+id);
    });
  });

  seed('swift',0,1000);
  [undefined,null,'unknown',{id:'starlight',baseCost:0,growth:1}].forEach(function(id){rejected(id,'invalid or forged node');});
  seed('swift',1000000,1000);ok(button('swift').disabled&&button('swift').textContent==='Unavailable','nonfinite price disabled');
  rejected('swift','nonfinite price cannot debit');
  seed('swift',0,Number.MAX_VALUE);
  ok(button('swift').disabled&&button('swift').querySelector('.cost-icon')&&button('swift').querySelector('.cost').textContent.trim()==='3','unrepresentable payment preserves the finite visible price and currency icon');
  rejected('swift','unrepresentable payment cannot grant a free level');
  seed('swift',0,1e16);
  ok(button('swift').disabled&&button('swift').querySelector('.cost').textContent.trim()==='3','partially rounded payment keeps its visible price but is disabled');
  rejected('swift','a displayed three-Prism price cannot charge four');
  seed('echo',0,1e16);
  ok(!button('echo').disabled,'an exactly representable large-wallet payment remains available');
  ok(b.treePurchases.buy('echo'),'exact large-wallet payment succeeds');
  ok(b.getState().nodes.echo===1&&b.getState().prisms===1e16-2,'exactly two Prisms charged');
  return {checks:checks,caps:{echo:6,bonds:20},legacyRawValuesPreserved:true,backupIdempotence:true};
};

window.runTreePurchaseUiQa=async function(b,ctx,assert){
  var checks=0,records=[];
  function ok(v,m){checks++;assert(v,m);}
  var params=new URLSearchParams(location.search);
  ok(innerWidth===Number(params.get('width')),'exact mobile viewport');
  var reduced=ctx.scenario.includes('reduced-motion');
  ok(matchMedia('(prefers-reduced-motion: reduce)').matches===reduced,'requested motion preference');
  var s=b.freshStateSnapshot();s.prisms=10000;s.nodes.echo=7;s.nodes.bonds=21;s.nodes.starlight=12;s.nodes.steady=9;s.nodes.momentum=7;s.achieved.asc5=true;s.achieved.d100=true;b.setState(s);
  document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){el.style.display='none';});
  b.renderLayout();document.querySelector('[data-tab="ascend"]').click();await document.fonts.ready;
  var panel=document.getElementById('tab-ascend');
  if(reduced) ok(parseFloat(getComputedStyle(panel).animationDuration)<=0.01,'reduced motion suppresses panel entry animation');
  // dump-dom's virtual clock does not reliably advance compositor animation.
  // Measure the settled Tree geometry after separately checking motion policy.
  var settled=document.createElement('style');settled.textContent='#tab-ascend{animation:none!important;}';document.head.appendChild(settled);
  var before=b.getState(),primary=b.rawSave();
  function colors(text){
    var values=[];
    var pattern=/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/g,match;
    while((match=pattern.exec(text))){var parts=(match[1]||match[2]).split(/[,\s/]+/).map(Number);if(match[2])parts=parts.map(function(v,i){return i<3?v*255:v;});values.push(parts);}
    return values;
  }
  function luminance(rgb){var c=rgb.slice(0,3).map(function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  function contrastBound(el){
    var chain=[],bg=[0,0,0];for(var n=el;n;n=n.parentElement)chain.unshift(n);
    chain.forEach(function(n){var css=getComputedStyle(n),solid=colors(css.backgroundColor)[0];if(solid){var a=solid[3]===undefined?1:solid[3];bg=bg.map(function(v,i){return solid[i]*a+v*(1-a);});}
      var candidates=colors(css.backgroundImage);var base=bg.slice();candidates.forEach(function(c){var a=c[3]===undefined?1:c[3];bg=bg.map(function(v,i){return Math.max(v,c[i]*a+base[i]*(1-a));});});
    });
    // The component-wise brightest bound covers every gradient stop and its
    // interpolation, as well as the solid legacy fallback. Dark palette text
    // is lighter than every tested background, so this is conservative.
    var fg=colors(getComputedStyle(el).color)[0];ok(!!fg,'contrast foreground parses');return (luminance(fg)+.05)/(luminance(bg)+.05);
  }
  var minimumContrast=Infinity;
  document.querySelectorAll('#node-list .name,#node-list .desc,#node-list .lvl,#node-list .earned-effect,#node-list .earned-effect strong,#node-list .effect-note,#node-list .cost,#node-list .label').forEach(function(el){var ratio=contrastBound(el);minimumContrast=Math.min(minimumContrast,ratio);ok(ratio>=4.5,'Tree text contrast at least 4.5:1 '+el.className+' '+ratio);});
  function measure(scale){
    var root=document.getElementById('node-list');
    ok(root.scrollWidth<=root.clientWidth+1,'Tree content fits at text scale '+scale);
    root.querySelectorAll('.node-card').forEach(function(card){
      var button=card.querySelector('button'),info=card.querySelector('.node-info'),r=card.getBoundingClientRect();
      ok(card.scrollWidth<=card.clientWidth+1,'card has no horizontal clipping '+scale);
      ok(info.scrollWidth<=info.clientWidth+1,'text has no horizontal clipping '+scale);
      if(button){
        button.scrollIntoView({block:'center'});var p=button.getBoundingClientRect(),main=document.querySelector('main').getBoundingClientRect();
        ok(p.width>=44&&p.height>=44,'44px Tree control '+scale+' '+button.dataset.node+' '+JSON.stringify({width:p.width,height:p.height,minHeight:getComputedStyle(button).minHeight,transform:getComputedStyle(button).transform}));
        ok(p.left>=r.left&&p.right<=r.right+1,'control stays inside card '+scale);
        ok(p.top>=main.top&&p.bottom<=main.bottom+1,'control scrolls into view '+scale);
        ok(button.getAttribute('aria-label')&&button.textContent.trim(),'visible and accessible label '+scale);
      }
    });
    records.push({width:innerWidth,scale:scale,maxed:Array.from(root.querySelectorAll('button:disabled')).map(function(el){return {id:el.dataset.node,label:el.textContent};})});
  }
  measure(1);
  var style=document.createElement('style');
  // Double actual rendered Tree text, including explicit px declarations.
  style.textContent=['.name','.desc','.lvl','.earned-effect','.effect-note','.buy-btn .cost','.buy-btn .label'].map(function(selector){
    return '#node-list '+selector+'{font-size:'+parseFloat(getComputedStyle(document.querySelector('#node-list '+selector)).fontSize)*2+'px!important;}';
  }).join('');document.head.appendChild(style);measure(2);
  var button=document.querySelector('[data-node="swift"]');button.focus();
  ok(document.activeElement===button,'available Tree control takes focus');
  ok(parseFloat(getComputedStyle(button).outlineWidth)>=2&&getComputedStyle(button).outlineStyle!=='none','visible keyboard focus');
  style.remove();b.treePurchases.render();
  ok(document.activeElement===document.querySelector('[data-node="swift"]'),'render preserves available-control focus');
  ok(document.querySelector('[data-node="echo"]').disabled&&document.querySelector('[data-node="bonds"]').disabled,'over-cap controls remain disabled');
  ok(JSON.stringify(b.getState())===JSON.stringify(before)&&b.rawSave()===primary,'UI measurements never change gameplay or saves');
  return {checks:checks,records:records,reducedMotion:reduced,textScale:2,minimumContrast:minimumContrast};
};
