/* P1-05 QA preparation only. Injected by tests/behavioral/run.py; never shipped. */
(function(){
  "use strict";

  function q(selector,root){ return (root||document).querySelector(selector); }
  function qa(selector,root){ return Array.from((root||document).querySelectorAll(selector)); }
  function visible(el){
    if(!el) return false;
    var style=getComputedStyle(el), r=el.getBoundingClientRect();
    return style.display!=='none' && style.visibility!=='hidden' && r.width>0 && r.height>0;
  }
  function add(findings,code,detail){ findings.push({code:code,detail:detail}); }
  function attrBool(el,name){
    if(!el || !el.hasAttribute(name)) return null;
    var value=el.getAttribute(name);
    return value==='true' ? true : (value==='false' ? false : null);
  }
  function semanticSelected(el,active){
    if(!el) return false;
    var current=el.getAttribute('aria-current');
    if(current!==null){
      var selected=current!=='' && current!=='false';
      return selected===active;
    }
    for(var i=0;i<3;i++){
      var name=['aria-selected','aria-pressed','aria-checked'][i];
      var value=attrBool(el,name);
      if(value!==null) return value===active;
    }
    return false;
  }
  function selectedGroupOkay(elements,isActive){
    var selected=0;
    for(var i=0;i<elements.length;i++){
      var active=!!isActive(elements[i]);
      if(active) selected++;
      if(!semanticSelected(elements[i],active)) return false;
    }
    return selected===1;
  }
  function hasPressedState(el){
    return attrBool(el,'aria-pressed')!==null || attrBool(el,'aria-checked')!==null;
  }
  function semanticControl(el){
    if(!el) return false;
    var tag=el.tagName;
    if(tag==='BUTTON' || tag==='A' || tag==='INPUT' || tag==='SELECT' || tag==='TEXTAREA') return true;
    var role=el.getAttribute('role');
    var tabindex=Number(el.getAttribute('tabindex'));
    return (role==='button' || role==='link') && Number.isFinite(tabindex) && tabindex>=0;
  }
  function accessibleName(el){
    if(!el) return '';
    var aria=el.getAttribute('aria-label');
    if(aria) return aria.trim();
    var labelled=el.getAttribute('aria-labelledby');
    if(labelled){
      return labelled.split(/\s+/).map(function(id){
        var node=document.getElementById(id);
        return node ? node.textContent.trim() : '';
      }).join(' ').trim();
    }
    return (el.textContent||'').trim();
  }
  function dialogSemanticsOkay(modal){
    if(!modal) return false;
    var role=modal.tagName==='DIALOG' ? 'dialog' : modal.getAttribute('role');
    var modalState=modal.tagName==='DIALOG' || modal.getAttribute('aria-modal')==='true';
    return role==='dialog' && modalState && accessibleName(modal).length>0;
  }
  function stateReason(el,words){
    if(!el) return false;
    var state=(el.getAttribute('data-state')||'').toLowerCase();
    var label=(accessibleName(el)+' '+(el.getAttribute('title')||'')).toLowerCase();
    var described=el.getAttribute('aria-describedby');
    if(described){
      described.split(/\s+/).forEach(function(id){
        var d=document.getElementById(id);
        if(d) label+=' '+d.textContent.toLowerCase();
      });
    }
    return words.some(function(word){ return state===word || label.indexOf(word)!==-1; });
  }
  function parseColor(value){
    value=(value||'').trim();
    var m;
    if((m=/^#([0-9a-f]{6})$/i.exec(value))){
      return [parseInt(m[1].slice(0,2),16),parseInt(m[1].slice(2,4),16),parseInt(m[1].slice(4,6),16)];
    }
    if((m=/^#([0-9a-f]{3})$/i.exec(value))){
      return m[1].split('').map(function(x){return parseInt(x+x,16);});
    }
    if((m=/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(value))){
      return [Number(m[1]),Number(m[2]),Number(m[3])];
    }
    return null;
  }
  function luminance(rgb){
    if(!rgb) return null;
    function channel(v){ v/=255; return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
    return channel(rgb[0])*0.2126+channel(rgb[1])*0.7152+channel(rgb[2])*0.0722;
  }
  function contrast(a,b){
    var la=luminance(parseColor(a)), lb=luminance(parseColor(b));
    if(la===null || lb===null) return null;
    var hi=Math.max(la,lb), lo=Math.min(la,lb);
    return (hi+0.05)/(lo+0.05);
  }
  function durationMs(value){
    if(!value) return 0;
    return Math.max.apply(null,value.split(',').map(function(part){
      part=part.trim();
      if(part.endsWith('ms')) return parseFloat(part);
      if(part.endsWith('s')) return parseFloat(part)*1000;
      return 0;
    }));
  }
  function resetPresentation(bridge,ctx,fixtureName){
    document.querySelectorAll('.overlay,#startup-intro').forEach(function(el){ el.style.display='none'; });
    var fixture=ctx.fixtures[fixtureName];
    if(fixture && fixture.save) bridge.setState(fixture.save);
    bridge.renderLayout();
  }

  function collect(bridge,ctx){
    var findings=[];
    var original=bridge.getState();
    resetPresentation(bridge,ctx,'accessibility-mixed-states');

    var nav=qa('nav.tabbar .tab-btn');
    if(!selectedGroupOkay(nav,function(el){return el.classList.contains('active');})){
      add(findings,'selected-nav','Navigation active state needs aria-current/aria-selected/aria-pressed semantics matching the visible tab.');
    }

    var modes=[q('#rift-push-btn'),q('#rift-farm-btn')].filter(Boolean);
    if(!selectedGroupOkay(modes,function(el){return el.classList.contains('active');})){
      add(findings,'selected-rift-mode','Push/Farm visual selection must expose a machine-readable selected/pressed state.');
    }

    var toggles=qa('[data-empower-queue],[data-queue],[data-study-queue],[data-autoascend-toggle]');
    if(!toggles.length || toggles.some(function(el){return !hasPressedState(el);})){
      add(findings,'toggle-pressed','Auto-Empower, Lab Queue, Study Queue and Auto-Ascend toggles need aria-pressed/checked state.');
    }
    var mult=qa('[data-mult]');
    if(mult.length && !selectedGroupOkay(mult,function(el){return el.classList.contains('active');})){
      add(findings,'selected-lab-multiplier','Lab multiplier selection needs semantic selected state.');
    }
    var speeds=qa('[data-speed-study].active');
    if(speeds.some(function(el){return !semanticSelected(el,true);})){
      add(findings,'selected-study-speed','Active Study speed tier needs semantic selected state.');
    }

    var maxed=qa('[data-rarity]').find(function(el){return el.disabled && /maxed/i.test(accessibleName(el));});
    if(!maxed || !stateReason(maxed,['maxed','complete','completed'])){
      add(findings,'state-maxed','Maxed/completed controls must expose a textual or data-state reason, not only disabled styling.');
    }
    var claimed=qa('[data-quest-claim]').find(function(el){return el.disabled && /claimed/i.test(accessibleName(el));});
    if(!claimed || !stateReason(claimed,['claimed','complete','completed'])){
      add(findings,'state-completed','Completed/claimed actions must remain distinguishable from generic disabled controls.');
    }
    var unaffordable=qa('button:disabled').find(function(el){
      return (el.matches('[data-research],[data-module],[data-rarity],[data-ultimate],[data-study],[data-shop]')) &&
        !/maxed|claimed|owned|no open slots/i.test(accessibleName(el));
    });
    if(!unaffordable || unaffordable.dataset.state!=='unaffordable' || !unaffordable.disabled || !accessibleName(unaffordable) || !unaffordable.querySelector('.cost-icon') || /Need|Cannot afford|Insufficient resources/i.test(accessibleName(unaffordable))){
      add(findings,'state-unaffordable','An unaffordable purchase must retain native disabled, data-state, accessible action/price and no currency-shortage warning.');
    }

    resetPresentation(bridge,ctx,'accessibility-locked');
    var lockedCard=q('[data-wisp-card].locked');
    if(!lockedCard || !/unlock/i.test(lockedCard.textContent||'')){
      add(findings,'state-locked','Locked Wisp state must include visible unlock language.');
    }
    var farm=q('#rift-farm-btn');
    if(!farm || !farm.disabled || !stateReason(farm,['locked','unlock','unavailable','requires','clear'])){
      add(findings,'state-locked-control','Disabled Farm must expose a reason distinct from unaffordable/maxed states.');
    }

    resetPresentation(bridge,ctx,'accessibility-mixed-states');

    [
      ['settings',q('#settings-overlay .settings-modal')],
      ['tutorial',q('#tutorial-overlay .modal')],
      ['welcome',q('#welcome-overlay .modal')],
      ['daily',q('#daily-overlay .modal')]
    ].forEach(function(item){
      if(!dialogSemanticsOkay(item[1])) add(findings,'overlay-dialog-'+item[0],item[0]+' overlay needs role/dialog, aria-modal and an accessible name.');
    });

    var settingsTrigger=q('#settings-btn'), settings=q('#settings-overlay'), settingsModal=q('#settings-overlay .settings-modal');
    if(settingsTrigger && settings && settingsModal){
      settingsTrigger.focus();
      settingsTrigger.click();
      if(!settingsModal.contains(document.activeElement)){
        add(findings,'overlay-focus-entry','Opening Settings must move focus into the modal.');
      }
      var background=q('nav.tabbar .tab-btn');
      if(background){
        background.focus();
        if(!settingsModal.contains(document.activeElement)){
          add(findings,'overlay-focus-containment','Focus must remain inside an open modal/overlay.');
        }
      }
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      if(settings.style.display!=='none' || document.activeElement!==settingsTrigger){
        add(findings,'overlay-focus-return','Escape/close must dismiss Settings and restore focus to its trigger.');
      }
    }

    var objective=q('#rift-objective');
    if(objective && objective.getAttribute('data-target-tab')){
      if(!semanticControl(objective)){
        add(findings,'keyboard-objective','Actionable Rift objective must be a semantic keyboard control.');
      }
    }
    var enemy=q('#enemy-stage');
    if(enemy && !semanticControl(enemy)){
      add(findings,'keyboard-guardian-tap','Guardian Tap target must expose semantic keyboard control behavior.');
    }
    var themeControls=qa('[data-theme-select]');
    if(!themeControls.length || themeControls.some(function(el){return !semanticControl(el);})){
      add(findings,'keyboard-theme-choice','Unlocked cosmetic theme choices must be semantic keyboard controls.');
    }
    qa('.bond-row,.ency-card,.hero-card:not([data-theme-select]),.shop-card,.node-card').forEach(function(el){
      var hasTabIndex=el.hasAttribute('tabindex') && Number(el.getAttribute('tabindex'))>=0;
      if((el.getAttribute('role')==='button' || hasTabIndex) && !el.matches('button,[data-theme-select]')){
        add(findings,'noninteractive-fake-control','Non-interactive visual cards must not masquerade as keyboard controls.');
      }
    });

    var rootStyle=getComputedStyle(document.documentElement);
    var stageStyle=getComputedStyle(q('#tab-battle .stage'));
    var rootBg=rootStyle.getPropertyValue('--bg').trim();
    var rootInk=rootStyle.getPropertyValue('--ink').trim();
    var stageBg=stageStyle.getPropertyValue('--bg-elev').trim();
    var stageInk=stageStyle.getPropertyValue('--ink').trim();
    var rootLum=luminance(parseColor(rootBg)), stageLum=luminance(parseColor(stageBg));
    if(rootLum!==null && stageLum!==null && Math.abs(rootLum-stageLum)>0.45){
      add(findings,'theme-partial-system-light','System appearance creates a split light shell/dark Rift instead of one coherent palette strategy.');
    }
    var rootContrast=contrast(rootBg,rootInk), stageContrast=contrast(stageBg,stageInk);
    if(rootContrast!==null && rootContrast<4.5) add(findings,'theme-shell-contrast','Primary shell text/background contrast is below 4.5:1.');
    if(stageContrast!==null && stageContrast<4.5) add(findings,'theme-rift-contrast','Primary Rift text/background contrast is below 4.5:1.');

    bridge.setState(ctx.fixtures['accessibility-mixed-states'].save);
    bridge.renderLayout();
    q('#settings-btn').click();
    q('#encyclopedia-btn').click();
    var rosterCards=qa('[data-wisp-card]');
    var encyclWisps=qa('#encyclopedia-content [data-ency-wisp]');
    var inconsistent=encyclWisps.length!==rosterCards.length;
    rosterCards.forEach(function(card){
      var id=card.getAttribute('data-wisp-card');
      var rosterUse=q('.wisp-portrait use',card);
      // Active-first roster order is presentation; identity remains keyed by Wisp ID.
      var matches=encyclWisps.filter(function(el){return el.getAttribute('data-ency-wisp')===id;});
      if(matches.length!==1) inconsistent=true;
      var encyclopedia=matches[0];
      var encUse=encyclopedia && q('.wisp-portrait use',encyclopedia);
      if(!rosterUse || rosterUse.getAttribute('href')!=='#wisp-'+id || !encUse || encUse.getAttribute('href')!=='#wisp-'+id){
        inconsistent=true;
      }
    });
    if(inconsistent){
      add(findings,'wisp-identity-consistency','Roster and Encyclopedia must use the same canonical Wisp portrait identity for each Wisp.');
    }
    q('#settings-close').click();

    bridge.setState(original);
    bridge.renderLayout();
    return findings;
  }

  function runAudit(bridge,ctx,assert){
    var findings=collect(bridge,ctx);
    assert(Array.isArray(findings),'P1-05 audit must return structured findings');
    return {findings:findings,baselineGapCount:findings.length};
  }
  function runAcceptance(bridge,ctx,assert){
    var findings=collect(bridge,ctx);
    assert(findings.length===0,'P1-05 accessibility contract failed: '+JSON.stringify(findings));
    return {findings:findings};
  }

  function runReducedMotion(bridge,ctx,assert){
    resetPresentation(bridge,ctx,'accessibility-mixed-states');
    assert(matchMedia('(prefers-reduced-motion: reduce)').matches,'QA browser must force prefers-reduced-motion: reduce');
    ['#tab-battle','.enemy-glyph','#toast','.wisp-portrait'].forEach(function(selector){
      var el=q(selector);
      if(!el) return;
      var style=getComputedStyle(el);
      assert(durationMs(style.animationDuration)<=1,selector+' animation must collapse under reduced motion');
      assert(durationMs(style.transitionDuration)<=1,selector+' transition must collapse under reduced motion');
    });
    q('[data-tab="research"]').click();
    assert(q('#tab-research').classList.contains('active'),'Tab state change must not depend on animation');
    q('[data-tab="battle"]').click();
    q('#rift-farm-btn').click();
    assert(bridge.getState().riftMode==='farm','Farm state must remain understandable with reduced motion');
    q('#rift-push-btn').click();
    assert(bridge.getState().riftMode==='push','Push state must remain understandable with reduced motion');
    assert(!q('#rift-details-btn') && !q('#rift-details'),'Details absent with reduced motion');
    q('#rift-push-btn').focus();
    assert(document.activeElement===q('#rift-push-btn'),'remaining Rift controls remain focusable');
    return {reduced:true};
  }

  function negativeSelected(assert){
    var host=document.createElement('div');
    host.innerHTML='<div role="tablist"><button role="tab" aria-selected="true" class="active">One</button><button role="tab" aria-selected="false">Two</button></div>';
    document.body.appendChild(host);
    var tabs=qa('[role="tab"]',host);
    assert(selectedGroupOkay(tabs,function(el){return el.classList.contains('active');}),'synthetic selected baseline must be valid');
    tabs[0].removeAttribute('aria-selected');
    assert(selectedGroupOkay(tabs,function(el){return el.classList.contains('active');}),'intentional selected semantics regression');
  }
  function negativeFocusReturn(assert){
    var trigger=document.createElement('button');
    var wrong=document.createElement('button');
    trigger.textContent='Trigger'; wrong.textContent='Wrong target';
    document.body.appendChild(trigger); document.body.appendChild(wrong);
    trigger.focus();
    wrong.focus();
    assert(document.activeElement===trigger,'intentional overlay focus-return regression');
  }

  window.P105AccessibilityQa={
    collect:collect,
    runAudit:runAudit,
    runAcceptance:runAcceptance,
    runReducedMotion:runReducedMotion,
    negativeSelected:negativeSelected,
    negativeFocusReturn:negativeFocusReturn
  };
})();
