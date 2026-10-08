/* BigInt is an independent modern-browser QA oracle, never product code. */
window.cheaperLegacySeed=function(level,wallet){
  var b=__cheaperRecruitment,s=b.fresh();s.schemaVersion=1;s.nodes.bonds=level;s.prisms=wallet;
  s.questDay=b.today();s.maxDepthEver=100;s.achieved.asc5=true;s.achieved.d100=true;
  s.activeStudies=[{id:'guardmastery',remainingSec:70,totalDurationSec:150,speedMult:4}];
  delete s.feedbackMigration;delete s.refundCredits;return s;
};
window.runCheaperRefundContracts=function(){
  var b=__cheaperRecruitment,checks=0,records=[];
  function ok(v,m){checks++;if(!v)throw Error(m);}
  function same(a,c,m){ok(JSON.stringify(a)===JSON.stringify(c),m);}
  function balance(s){return BigInt(s.prisms)+(s.refundCredits.prisms||[]).reduce(function(n,e){return n+BigInt(e.amount);},BigInt(0));}
  function owed(level){var total=BigInt(0);for(var k=20;k<level;k++){var cost=Math.ceil(2*Math.pow(1.45,k));if(!Number.isFinite(cost))break;total+=BigInt(cost);}return total;}
  [[19,1234],[20,0],[21,0],[40,0],[21,1e30],[2000,1000000],[1e300,0]].forEach(function(pair){
    var raw=pair[0],wallet=pair[1],old=cheaperLegacySeed(raw,wallet),before=JSON.stringify(old),s=b.canonical(old);
    ok(balance(s)===BigInt(wallet)+owed(raw),'all finite original purchase value retained '+raw+'/'+wallet);
    ok(JSON.stringify(old)===before,'migration does not mutate input '+raw);
    same(b.canonical(s),s,'refund receipt prevents a second credit '+raw);
    ok(s.nodes.bonds===raw,'refund preserves raw history '+raw);
    same(s.activeStudies,old.activeStudies,'refund preserves paid Study snapshot '+raw);
    same(b.decode(b.encode(s)),s,'refund/remaining credit backup roundtrip '+raw);
    if(raw>20){var receipt=s.feedbackMigration.receipts['node.bonds'];ok(receipt.from===20&&receipt.to===raw,'complete receipt range '+raw);ok((raw>1900)===!!receipt.unpricedFrom,'nonfinite prices distinguished '+raw);}
    else ok(!s.feedbackMigration.receipts['node.bonds'],'no invented below-cap refund '+raw);
    records.push({raw,wallet,creditEntries:s.refundCredits.prisms.length,retainedValue:balance(s).toString(),unpricedFrom:s.feedbackMigration.receipts['node.bonds']?.unpricedFrom||0});
  });
  var s=b.canonical(cheaperLegacySeed(21,0));ok(s.prisms===3376,'documented level21 refund exactly 3376');
  s=b.canonical(cheaperLegacySeed(40,0));ok(s.prisms===12655538,'documented level40 refund exactly 12655538');
  s=b.canonical(cheaperLegacySeed(21,0.1));ok(s.prisms===0.1&&s.refundCredits.prisms[0].amount===3376,'fractional original wallet retains exact refund value');
  var v0=cheaperLegacySeed(21,17);delete v0.schemaVersion;s=b.canonical(v0);
  ok(s.prisms===3393&&s.schemaVersion===2,'v0 migrates before one-time restitution');
  var both=cheaperLegacySeed(21,7);both.nodes.reserves=4;both.owned.offline24=true;both.owned.offline48=true;s=b.canonical(both);
  ok(s.prisms===3440&&s.comets===300,'old schema1 preserves both original-currency refunds');
  ok(s.nodes.bonds===21&&s.nodes.reserves===4&&s.schemaVersion===2,'both migrations retain raw purchase history');
  same(b.canonical(s),s,'both migration receipts prevent repeated refunds');
  same(b.decode(b.encode(s)),s,'both refund records survive actual backup encoding');
  var beforeOffline=cheaperLegacySeed(21,3376);beforeOffline.feedbackMigration={version:1,applied:true,receipts:{'node.bonds':{from:20,to:21,unpricedFrom:0,amounts:{prisms:[3376]}}},history:{bonds:{levels:21}}};beforeOffline.refundCredits={prisms:[]};beforeOffline.nodes.reserves=4;s=b.canonical(beforeOffline);
  ok(s.prisms===3433&&s.feedbackMigration.receipts['node.bonds'].amounts.prisms[0]===3376,'existing F21 schema1 receipt survives schema2 transition without double refund');
  s=b.canonical(cheaperLegacySeed(21,1e30));ok(s.prisms===1e30&&s.refundCredits.prisms[0].amount===3376,'small refund stays exact beside huge wallet');
  b.set(s);b.render();ok(!document.querySelector('[data-node="swift"]').disabled,'credit purchase enabled');
  var original=balance(b.get());
  for(var i=0;i<20;i++){
    var next=b.get();next.nodes.swift=0;b.set(next);var cost=3,before=balance(b.get());b.buy({id:'swift'});
    ok(b.get().nodes.swift===1&&balance(b.get())===before-BigInt(cost),'exact credit debit '+i);
    ok(b.get().prisms===1e30,'refund credit spent before huge wallet '+i);
  }
  ok(balance(b.get())<original,'refund really pays, not a free purchase');
  s=b.canonical(cheaperLegacySeed(200,1e100));var large=s.refundCredits.prisms.find(function(e){return e.amount>1e25;});
  ok(!!large,'large-credit fixture is an actual originally-priced refund');
  s.prisms=0;s.refundCredits.prisms=[large];b.set(s);var before=b.get();
  ok(!b.payment(1),'unrepresentable credit subtraction cannot buy a free level');
  b.buy({id:'swift'});same(b.get(),before,'unspendable small debit retains entire credit');
  ok(b.payment(large.amount).prisms===0&&b.payment(large.amount).credits.length===0,'whole large credit can pay exactly');
  s=b.canonical(cheaperLegacySeed(95,0));
  ok(s.prisms<=Number.MAX_SAFE_INTEGER&&s.refundCredits.prisms.length>0,'large restitution stays spendable as exact credits');
  b.set(s);var refunded=balance(b.get());b.buy({id:'swift'});
  ok(b.get().nodes.swift===1&&balance(b.get())===refunded-BigInt(3),'actual raw95 refund pays original Swift price exactly');
  s=b.canonical(cheaperLegacySeed(21,1e30));s.refundCredits.prisms=[];b.set(s);before=b.get();var disk=b.disk();
  ok(!b.payment(1),'unrepresentable wallet debit cannot buy a free level');
  b.buy({id:'swift'});same(b.get(),before,'wallet rejection retains exact original value');same(b.disk(),disk,'wallet rejection never saves');
  s.prisms=9007199254740992;b.set(s);var value=balance(b.get());b.buy({id:'echo'});
  ok(b.get().nodes.echo===1&&balance(b.get())===value-BigInt(2),'representable large-wallet debit pays exactly');
  // Preserve receipts actually generated by V8 6.0 across engine transitions.
  var compatible=b.canonical(cheaperLegacySeed(2000,0));compatible.feedbackMigration.receipts['node.bonds'].amounts.prisms=cheaperReceiptLegacyPrices.slice();
  var originalPrices=JSON.stringify(compatible.feedbackMigration.receipts['node.bonds'].amounts.prisms);
  ok(JSON.stringify(b.canonical(compatible).feedbackMigration.receipts['node.bonds'].amounts.prisms)===originalPrices,'legacy-engine receipt prices preserved without a second refund');
  var originalPow=Math.pow,repeatedPrices=0,started=performance.now();
  Math.pow=function(base,level){if(base===1.45&&level>=20)repeatedPrices++;return originalPow(base,level);};
  try{for(var boundary=0;boundary<100;boundary++)compatible=b.canonical(compatible);}
  finally{Math.pow=originalPow;}
  ok(repeatedPrices===0,'completed large refund avoids repeated price calculation at Ascend boundaries');
  ok(JSON.stringify(compatible.feedbackMigration.receipts['node.bonds'].amounts.prisms)===originalPrices,'repeated boundaries preserve original receipt amounts');
  records.push({kind:'completed-refund-boundaries',raw:2000,boundaries:100,priceCalculations:repeatedPrices,elapsedMs:performance.now()-started});
  // Compatibility with the separately proposed feedback bundle's receipt shape.
  s=b.canonical(cheaperLegacySeed(21,0));s.feedbackMigration.receipts['node.echo']={from:6,to:7,unpricedFrom:0,amounts:{prisms:[16]}};
  s.feedbackMigration.history.echo={levels:7};s.refundCredits.comets=[{id:'shop.offline24',amount:140}];
  var normalized=b.canonical(s);ok(normalized.prisms===3376,'existing bundle receipt does not refund bonds twice');
  same(normalized.feedbackMigration.receipts['node.echo'],s.feedbackMigration.receipts['node.echo'],'foreign receipt retained');
  same(normalized.refundCredits.comets,s.refundCredits.comets,'foreign currency credits retained');
  [null,{},Object.assign({},s.feedbackMigration.receipts['node.bonds'],{to:22})].forEach(function(bad){
    var broken=JSON.parse(JSON.stringify(s));broken.feedbackMigration.receipts['node.bonds']=bad;var caught=false;
    try{b.canonical(broken);}catch(e){caught=e.code==='invalid-bonds-refund';}ok(caught,'partial receipt rejects instead of recrediting');
  });
  [1,3375,3377].forEach(function(amount){
    var broken=JSON.parse(JSON.stringify(s));broken.feedbackMigration.receipts['node.bonds'].amounts.prisms=[amount];var caught=false;
    try{b.canonical(broken);}catch(e){caught=e.code==='invalid-bonds-refund';}ok(caught,'wrong receipt amount rejects for recovery');
  });
  [function(x){x.feedbackMigration=null;},function(x){x.feedbackMigration.receipts=[];},function(x){delete x.refundCredits;},function(x){x.refundCredits=[];},function(x){delete x.refundCredits.prisms;}].forEach(function(damage){
    var broken=JSON.parse(JSON.stringify(s));damage(broken);var caught=false;
    try{b.canonical(broken);}catch(e){caught=e.code==='invalid-bonds-refund';}ok(caught,'damaged record rejects instead of dropping value/recrediting');
  });
  var orphan=cheaperLegacySeed(21,0);orphan.refundCredits={prisms:[{id:'node.bonds',amount:3376}]};var caught=false;
  try{b.canonical(orphan);}catch(e){caught=e.code==='invalid-bonds-refund';}ok(caught,'orphan credit cannot trigger a second compensation');
  var damagedCached=JSON.parse(JSON.stringify(compatible));damagedCached.feedbackMigration.receipts['node.bonds'].amounts.prisms[0]=1;var cachedRejected=false;
  try{b.canonical(damagedCached);}catch(e){cachedRejected=e.code==='invalid-bonds-refund';}
  ok(cachedRejected,'cached schedule still rejects a changed completed receipt');
  [null,{},[],0,'credit',{id:'node.bonds',amount:0.5},{id:'node.bonds',amount:0},{id:'node.echo',amount:0.5},{id:'',amount:1}].forEach(function(entry){
    var damaged=b.canonical(cheaperLegacySeed(95,0));damaged.refundCredits.prisms=[entry];var rejected=false;
    try{b.canonical(damaged);}catch(e){rejected=e.code==='invalid-bonds-refund';}
    ok(rejected,'malformed persisted Prism credit rejects for recovery');
  });
  var foreign=b.canonical(cheaperLegacySeed(21,0));foreign.refundCredits.prisms.push({id:'node.echo',amount:16});
  same(b.canonical(foreign).refundCredits.prisms,foreign.refundCredits.prisms,'valid foreign integer Prism credit retained');
  return {checks,records,receipt:'feedbackMigration.receipts[node.bonds]',rawHistoryRetained:true,exactCreditDebit:true};
};
