/* Contribution presentation only; injected by the existing behavioral harness. */
window.runWispRolesUi=async function(b,ctx,assert){
  b.resetFeedback();b.freeze();
  var s=b.freshStateSnapshot();s.maxDepthEver=220;s.activeParty=['ember','tide','gale','thorn','aurora'];
  Object.keys(s.spirits).forEach(function(id){s.spirits[id]=100;s.heroRarity[id]=5;s.wispModules[id]=20;s.wispUltimate[id]=true;});
  s.achieved.autotap=true;s.lumen=s.shards=1e20;b.setState(s);b.renderLayout();
  document.querySelector('[data-tab="spirits"]').click();
  // Freeze gameplay, then let the existing presentation animation settle.
  // Pausing that animation mid-scale would shrink 44px targets artificially.
  document.body.classList.remove('app-paused');
  await new Promise(function(resolve){setTimeout(resolve,250);});
  document.body.classList.add('app-paused');
  var records=[];
  if(ctx.scenario.endsWith('reduced-motion')) assert(matchMedia('(prefers-reduced-motion: reduce)').matches,'real reduced-motion preference');
  [100,200].forEach(function(scale){
    document.documentElement.style.fontSize=scale===200?'32px':'16px';b.wispRoles.render();
    var panel=document.getElementById('tab-spirits'),summary=document.getElementById('wisp-role-summary');
    assert(summary.textContent.includes('Raw damage')&&summary.textContent.includes('Bonds added')&&summary.textContent.includes('Support added')&&summary.textContent.includes('Total preview'),'complete additive summary');
    assert(summary.textContent.includes('do not add them'),'removal overlap warning');
    var state=b.getState(),before=JSON.stringify(state);b.wispRoles.compare(state.depth,b.clockNow());
    assert(JSON.stringify(b.getState())===before,'UI comparison is read-only');
    var tide=panel.querySelector('[data-wisp-role="tide"]'),gale=panel.querySelector('[data-wisp-role="gale"]');
    assert(tide.textContent.includes('Support added to party')&&tide.textContent.includes('Motes from Module'),'support and Motes visible');
    assert(gale.textContent.includes('Shards per cast'),'utility rewards visible');
    assert(panel.querySelector('[data-wisp-role="titan"]').textContent.includes('Benched'),'benched contribution distinct');
    Array.from(panel.querySelectorAll('.wisp-role-line,.wisp-role-note')).forEach(function(el){
      var r=el.getBoundingClientRect();assert(r.left>=-1&&r.right<=innerWidth+1,'role text inside viewport '+scale+'%');
      assert(el.scrollWidth<=el.clientWidth+1,'role text does not overflow '+scale+'%');
    });
    Array.from(panel.querySelectorAll('button,summary')).filter(function(el){return el.getBoundingClientRect().height>0&&!el.disabled;}).forEach(function(el){
      var r=el.getBoundingClientRect();
      assert(r.height>=44&&r.width>=44,'Wisp control 44px: '+el.outerHTML.slice(0,140)+' '+r.width+'x'+r.height);
    });
    var field=panel.querySelector('[data-toggle="tide"]');field.focus();b.wispRoles.render();
    assert(document.activeElement===field,'readout refresh preserves input focus');
    var style=getComputedStyle(tide.querySelector('.wisp-role-note'));
    var color=style.color.match(/[\d.]+/g).slice(0,3).map(Number);
    function lum(rgb){return rgb.map(function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce(function(sum,v,i){return sum+v*[.2126,.7152,.0722][i];},0);}
    // The brightest existing Wisp-card surface is #1d2940; darker gradient
    // stops increase the contrast of this inherited light foreground.
    var contrast=(lum(color)+.05)/(lum([29,41,64])+.05);
    assert(contrast>=4.5,'role text contrast >=4.5: '+contrast);
    assert(style.animationName==='none'&&style.transitionDuration.split(',').every(function(v){return parseFloat(v)===0;}),'readouts introduce no motion');
    records.push({width:innerWidth,scale:scale,noteColor:style.color,contrast:contrast});
  });
  document.documentElement.style.fontSize='16px';
  return {records,readOnly:true};
};
