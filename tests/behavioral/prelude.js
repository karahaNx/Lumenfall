(function(){
  "use strict";
  var fixtures = __QA_FIXTURES_JSON__;
  var params = new URLSearchParams(location.search);
  var scenario = params.get('qaScenario') || '';
  if(scenario==='offline-catchup-legacy-dom'){
    // WebView60/61 has no ParentNode.replaceChildren. Exercise real startup,
    // catch-up and selector rendering without the newer browser convenience API.
    delete Element.prototype.replaceChildren;
    // Legacy WebView ignores inset, color-mix and eight-digit hex colors.
    // Preserve authored fallbacks; test actual return geometry, paint and input.
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('style').forEach(function(style){
        style.textContent=style.textContent.replace(/\binset\s*:[^;}]*;?/g,'')
          .replace(/\bcolor-mix\(/g,'unsupported-color-mix(')
          .replace(/#[0-9a-f]{8}\b/gi,'unsupported-alpha-hex');
      });
    });
  }
  // Native UI tests hold interval callbacks only across immediate measurements.
  // Keep real input/save handlers, animation frames and the production flags intact.
  var uiMeasurementPaused=scenario.startsWith('offline-catchup-');
  if(scenario==='lab-motes-native' || scenario==='lab-motes-reduced-motion' || scenario.startsWith('offline-catchup-') || scenario.startsWith('support-') || scenario==='rift-status-contract' || scenario==='auto-ascend-target-mobile' || scenario==='auto-ascend-target-reduced-motion' || scenario.startsWith('forge-ui-') || scenario.startsWith('self-test-forge-ui-') || scenario.startsWith('rift-status-stacking') || scenario.startsWith('rift-status-mobile') || scenario.startsWith('rift-status-reduced') || scenario.startsWith('self-test-rift-status-line') || scenario.startsWith('tree-purchase-ui')){
    // Observe actual registered Queue callbacks, without changing event dispatch.
    var realAddEventListener=EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener=function(type,callback,options){
      if(type==='click' && typeof callback==='function' && this.matches && this.matches('[data-queue]')){
        var original=callback;
        callback=function(event){
          var action=window.__qaForgeAction,previous=window.__qaForgeHandler;
          if(action && action.id===this.dataset.queue){action.handlers++;window.__qaForgeHandler=action;}
          try{return original.call(this,event);}finally{window.__qaForgeHandler=previous;}
        };
      }
      return realAddEventListener.call(this,type,callback,options);
    };
    var realSetInterval=window.setInterval.bind(window);
    window.setInterval=function(callback,delay){
      var args=Array.prototype.slice.call(arguments,2);
      return realSetInterval(function(){if(!uiMeasurementPaused) callback.apply(window,args);},delay);
    };
  }
  window.__qaUiMeasurementPause=function(paused){uiMeasurementPaused=!!paused;};
  var fixtureName = params.get('qaFixture') || '';
  var phaseKey = 'lumenfall_qa_phase_' + scenario;
  var errors = [];

  function stringifyReason(value){
    try{
      if(value && value.stack) return String(value.stack);
      return typeof value==='string' ? value : JSON.stringify(value);
    }catch(e){ return String(value); }
  }
  function ensureResult(){
    var el = document.getElementById('qa-result');
    if(!el){
      el = document.createElement('pre');
      el.id = 'qa-result';
      document.documentElement.appendChild(el);
    }
    return el;
  }
  function markRuntimeFailure(kind, detail){
    errors.push({kind:kind, detail:String(detail||'')});
    document.documentElement.setAttribute('data-qa-runtime-error', kind);
    var el = ensureResult();
    el.setAttribute('data-status','fail');
    el.setAttribute('data-scenario',scenario);
    el.textContent = JSON.stringify({scenario:scenario,status:'fail',runtimeErrors:errors}, null, 2);
    if(parent!==window) parent.postMessage({qaLayoutResult:el.textContent,status:'fail'},location.origin);
  }
  window.addEventListener('error', function(event){
    markRuntimeFailure('uncaught-error', event.message || (event.error && event.error.message) || 'unknown error');
  });
  window.addEventListener('unhandledrejection', function(event){
    markRuntimeFailure('unhandled-rejection', stringifyReason(event.reason));
  });

  function materialize(value){
    if(value==='__NOW_PLUS_10M__') return Date.now()+600000;
    if(value==='__NOW__') return Date.now();
    if(value==='__NOW_MINUS_8H__') return Date.now()-28800000;
    if(value==='__NOW_MINUS_60S__') return Date.now()-60000;
    if(value==='__TODAY__'){
      var d = new Date();
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }
    if(Array.isArray(value)) return value.map(materialize);
    if(value && typeof value==='object'){
      var out = {};
      Object.keys(value).forEach(function(k){ out[k]=materialize(value[k]); });
      return out;
    }
    return value;
  }

  var RealDate = Date;
  var clockKey = 'lumenfall_qa_clock_' + scenario;
  var phase = localStorage.getItem(phaseKey);
  var initialClockMs = scenario==='lifecycle-daily-rollover'
    ? new RealDate(2035,0,15,23,59,50,0).getTime()
    : new RealDate(2035,0,15,12,0,0,0).getTime();

  if(phase===null){
    localStorage.clear();
    phase = '0';
    localStorage.setItem(phaseKey, phase);
    localStorage.setItem(clockKey, String(initialClockMs));
  }

  var fakeNowMs = Number(localStorage.getItem(clockKey));
  if(!Number.isFinite(fakeNowMs)) fakeNowMs = initialClockMs;

  class QaDate extends RealDate {
    constructor(){
      if(arguments.length===0) super(fakeNowMs);
      else super(...arguments);
    }
    static now(){ return fakeNowMs; }
  }
  QaDate.parse = RealDate.parse;
  QaDate.UTC = RealDate.UTC;
  window.Date = QaDate;

  function setClock(ms){
    fakeNowMs = Number(ms);
    if(!Number.isFinite(fakeNowMs)) throw new Error('QA clock requires a finite timestamp');
    localStorage.setItem(clockKey,String(fakeNowMs));
    return fakeNowMs;
  }
  function advanceClock(ms){ return setClock(fakeNowMs + Number(ms||0)); }
  function setLocalClock(year,month,day,hour,minute,second){
    return setClock(new RealDate(year,month,day,hour||0,minute||0,second||0,0).getTime());
  }
  function currentDay(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  var qaHidden = false;
  try{
    Object.defineProperty(document,'hidden',{configurable:true,get:function(){ return qaHidden; }});
    Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){ return qaHidden ? 'hidden' : 'visible'; }});
  }catch(e){
    markRuntimeFailure('visibility-control-error', e && e.message ? e.message : String(e));
  }
  function setHidden(value){ qaHidden = !!value; return qaHidden; }

  var resolvedFixtures = materialize(fixtures);
  if(phase==='0'){
    var fixture = resolvedFixtures[fixtureName];
    if(!fixture){
      markRuntimeFailure('fixture-error', 'Unknown fixture '+fixtureName);
    } else if(Object.prototype.hasOwnProperty.call(fixture,'raw')){
      localStorage.setItem('lumenfall_save_v2', fixture.raw);
      localStorage.setItem('lumenfall_startup_intro_last', String(Date.now()));
    } else if(fixture.save!==null){
      localStorage.setItem('lumenfall_save_v2', JSON.stringify(fixture.save));
      localStorage.setItem('lumenfall_startup_intro_last', String(Date.now()));
    }
    if(Object.prototype.hasOwnProperty.call(fixture,'recoveryRaw')){
      localStorage.setItem('lumenfall_save_recovery_v1', fixture.recoveryRaw);
    } else if(fixture.recoverySave){
      localStorage.setItem('lumenfall_save_recovery_v1', JSON.stringify(fixture.recoverySave));
    }
  }

  window.__lumenfallQaContext = {
    scenario: scenario,
    fixtureName: fixtureName,
    phaseKey: phaseKey,
    clockKey: clockKey,
    fixtures: resolvedFixtures,
    errors: errors,
    clockNow: function(){ return fakeNowMs; },
    advanceTime: advanceClock,
    setClock: setClock,
    setLocalClock: setLocalClock,
    currentDay: currentDay,
    setHidden: setHidden,
    getHidden: function(){ return qaHidden; },
    markRuntimeFailure: markRuntimeFailure
  };
})();
