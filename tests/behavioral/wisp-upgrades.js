/* F04 acceptance against the rendered game. Test instrumentation only. */
window.runWispUpgradeQa = function(){
  var b=window.__wispQa, checks=0, fixtures=0;
  function ok(value,message){checks++;if(!value) throw new Error(message);}
  function same(a,c,message){ok(JSON.stringify(a)===JSON.stringify(c),message);}
  function q(selector){return document.querySelector(selector);}
  function visible(el){return !!el && el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;}
  function progression(id){return q('[data-wisp-progression="'+id+'"]');}
  function seed(id,rarity,module,ultimate,funded){
    var s=b.fresh();s.maxDepthEver=101;s.tutorialDone=true;
    s.spirits[id]=1;s.heroRarity[id]=rarity;s.wispModules[id]=module;s.wispUltimate[id]=ultimate;
    s.lumen=s.shards=s.sigils=funded?1e12:0;s.activeParty=[id];return s;
  }
  b.prepare();
  b.ids.forEach(function(id){
    [0,1,2,3,4,5,6,7].forEach(function(mask){
      [false,true].forEach(function(funded){
        var rarity=(mask&1)?5:4, module=(mask&2)?20:19, ultimate=!!(mask&4);
        b.set(seed(id,rarity,module,ultimate,funded));
        var before=b.get(),raw=b.slots();b.render();b.render();b.refresh();
        same(b.get(),before,'render preserves all gameplay data '+id+'/'+mask);
        same(b.slots(),raw,'render preserves primary and recovery '+id+'/'+mask);
        var p=progression(id),complete=mask===7;
        ok((p.tagName==='DETAILS')===complete,'fold available iff all three tracks complete '+id+'/'+mask);
        if(complete){p.open=true;ok(visible(p.querySelector('.ultimate-badge')),'completed Ultimate readable');}
        else {
          ok(p.tagName==='SECTION' && !p.querySelector('summary'),'unfinished section has no disclosure '+id);
          ok(visible(p.querySelector('.hero-ability')),'unfinished ability stays visible');
          if(module<20) ok(visible(p.querySelector('[data-module]')),'unfinished Module stays visible');
          if(rarity<5) ok(visible(p.querySelector('[data-rarity]')),'unfinished Rarity stays visible');
          if(!before.wispUltimate[id]) ok(visible(p.querySelector('[data-ultimate]')),'unowned Ultimate stays visible');
          if(!funded) Array.from(p.querySelectorAll('button')).forEach(function(btn){ok(btn.disabled,'no funds: purchase disabled');});
        }
        fixtures++;
      });
    });
  });
  // Unrecruited and level-gated purchases stay visible, with their reason.
  var s=seed('tide',0,0,false,false);s.spirits.tide=0;b.set(s);b.render();
  var p=progression('tide');
  ['module','rarity','ultimate'].forEach(function(action){var el=p.querySelector('[data-'+action+']');ok(visible(el)&&el.disabled,'unrecruited '+action+' visible/disabled');});
  ok(p.querySelector('[data-module]').dataset.state==='locked','Module recruit gate labelled');
  ok(p.querySelector('[data-ultimate]').textContent.includes('Mythic required'),'Ultimate rarity gate labelled');
  s.lumen=s.shards=s.sigils=1e12;b.set(s);b.render();b.refresh();
  ['module','rarity','ultimate'].forEach(function(action){ok(progression('tide').querySelector('[data-'+action+']').disabled,'funded unrecruited '+action+' stays disabled after affordability refresh');});
  var lockedBefore=b.get();progression('tide').querySelector('[data-module]').click();
  same(b.get(),lockedBefore,'locked Module click preserves old purchase prerequisite');
  s=seed('ember',0,0,false,true);b.set(s);b.render();
  b.refresh();ok(progression('ember').querySelector('[data-ultimate]').disabled,'funded Ultimate remains Mythic-gated after affordability refresh');
  ok(progression('ember').querySelector('[data-rarity]').disabled,'Rarity level requirement does not become a fold gate');
  // The predicate follows the same Module cap used by buying, not a UI literal.
  b.cap(21);try{b.set(seed('ember',5,20,true,false));b.render();ok(progression('ember').tagName==='SECTION','authoritative cap change leaves Module unfinished');}finally{b.cap(20);}
  // Empower, resource and exhausted/shared Resonate uses never block folding.
  s=seed('ember',5,20,true,false);s.sigilResonanceUses=3;s.heroResource.ember=100;
  b.ids.forEach(function(id){s.heroRarity[id]=5;s.wispUltimate[id]=true;});
  b.set(s);b.render();p=progression('ember');ok(p.tagName==='DETAILS','Empower Lv.1 and exhausted Resonate permit fold');
  p.open=true;var resonance=p.querySelector('[data-sigil-resonate]');ok(resonance && resonance.disabled,'Resonate remains its existing action');
  // Completion through real registered purchase handlers, including focus.
  ['module','ultimate'].forEach(function(action){
    b.set(seed('ember',5,action==='module'?19:20,action==='module',true));b.render();
    var sp=b.spirit('ember'),before=b.get();
    var cost=action==='module'?b.moduleCost('ember',19):{sigil:b.ultimateCost('ember')};
    var btn=progression('ember').querySelector('[data-'+action+']');btn.focus();btn.click();
    var after=b.get();p=progression('ember');
    ok(after.heroRarity.ember===5 && after.wispModules.ember===20 && after.wispUltimate.ember,'last '+action+' completes existing purchase');
    ok(after.lumen===before.lumen-(cost.lumen||0) && after.shards===before.shards-(cost.shard||0) && after.sigils===before.sigils-(cost.sigil||0),'existing deterministic '+action+' debit');
    ok(p.tagName==='DETAILS' && p.open,'last purchase preserves open progression');
    ok(document.activeElement===p.querySelector('summary'),'last '+action+' purchase focus goes to same Wisp summary: '+document.activeElement.outerHTML);
    var frozen=b.get(),slots=b.slots();p.open=false;b.render();
    ok(!progression('ember').open,'chosen fold survives render');
    same(b.get(),frozen,'fold preserves state');same(b.slots(),slots,'fold does not save');
  });
  s=seed('ember',4,20,false,true);s.spirits.ember=b.rarityRequirement(4);b.set(s);b.render();
  var beforeRarity=b.get(),rarityPrice=b.rarityCost('ember',4);
  progression('ember').querySelector('[data-rarity]').click();
  var afterRarity=b.get();p=progression('ember');
  ok(afterRarity.heroRarity.ember===5 && !afterRarity.wispUltimate.ember,'final Rarity purchase retains unowned Ultimate');
  ok(afterRarity.lumen===beforeRarity.lumen-rarityPrice.lumen && afterRarity.shards===beforeRarity.shards-rarityPrice.shard,'existing deterministic final Rarity debit');
  ok(p.tagName==='SECTION' && visible(p.querySelector('[data-ultimate]')) && !p.querySelector('[data-ultimate]').disabled,'reaching Mythic still exposes the unfinished Ultimate');
  p.querySelector('[data-ultimate]').focus();p.querySelector('[data-ultimate]').click();
  ok(progression('ember').tagName==='DETAILS' && progression('ember').open,'Rarity then Ultimate permits folding only at completion');
  // Old data has no new schema/ownership rewrite on any persistence path.
  ['canonical','recovery','backup'].forEach(function(route){
    [false,true].forEach(function(complete){
      s=seed('ember',5,complete?20:19,true,false);b.set(s);b.save();
      var before=b.get();b.roundTrip(route);b.render();
      var after=b.get();['spirits','heroRarity','wispModules','wispUltimate','lumen','shards','sigils','schemaVersion'].forEach(function(key){same(after[key],before[key],route+' preserves '+key);});
      ok((progression('ember').tagName==='DETAILS')===complete,route+' derives fold from saved progress');
      if(complete){progression('ember').open=false;var old=progression('ember').querySelector('summary');old.focus();s.wispModules.ember=19;b.set(s);b.render();ok(progression('ember').tagName==='SECTION'&&visible(progression('ember').querySelector('[data-module]')),'stale fold discarded on incomplete restore');ok(document.activeElement===progression('ember').querySelector('h3'),'restore preserves same Wisp focus');}
    });
  });
  b.set(seed('ember',0,0,false,false));b.render();
  return {checks:checks,fixtures:fixtures,paths:['canonical','recovery','backup'],finalPurchases:['module','ultimate','rarity'],noGameplayMigration:true};
};
