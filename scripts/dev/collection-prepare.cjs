'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const blob=s=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex');
let source=fs.readFileSync('index.html','utf8');assert.equal(sha(source),'8ad085eccb0ad5992881ec7ba41bcd21ee6f56fd7a848fa22837f9221ced0b23','exact Prism + initial PR102 source');
const before=source;
function replace(a,b){assert.equal(source.split(a).length,2,'unique source marker: '+a.slice(0,90));source=source.replace(a,()=>b);}
replace('function isBoss(depth){',`// Presentation only: each displayed currency reads its own wallet, not button.disabled.
function purchasePriceColor(kind,amount){
  var key={lumen:'lumen',shard:'shards',prism:'prisms',comet:'comets'}[kind];
  return key && Number.isFinite(amount) && state[key]<amount ? 'var(--danger)' : 'var(--ink)';
}
function purchasePriceMarkup(kind,amount,classes,numberFirst){
  return '<span'+(classes?' class="'+classes+'"':'')+' data-price-currency="'+kind+'" data-price-amount="'+amount+'" style="color:'+purchasePriceColor(kind,amount)+'">'+
    (numberFirst?formatNum(amount)+' '+costIcon(kind):costIcon(kind)+formatNum(amount))+'</span>';
}
function updatePurchasePriceColors(root){
  root.querySelectorAll('[data-price-currency]').forEach(function(el){
    var color=purchasePriceColor(el.getAttribute('data-price-currency'),Number(el.getAttribute('data-price-amount')));
    if(el.style.color!==color) el.style.color=color;
  });
}

function isBoss(depth){`);
replace(`'<span class="cost mono" style="color:'+(state.lumen<displayed.lumen?'var(--danger)':'var(--ink)')+'">'+costIcon('lumen')+formatNum(displayed.lumen)+'</span>'`, `purchasePriceMarkup('lumen',displayed.lumen,'cost mono')`);
replace(`'<span class="cost mono" style="color:'+(state.shards<displayed.shard?'var(--danger)':'var(--ink)')+'">'+costIcon('shard')+formatNum(displayed.shard)+'</span>'`, `purchasePriceMarkup('shard',displayed.shard,'cost mono')`);
replace(`'<span class="cost mono" style="color:'+(state.prisms<plan.cost?'var(--danger)':'var(--ink)')+'">'+costIcon('prism')+formatNum(plan.cost)+'</span><span class="label">'`, `purchasePriceMarkup('prism',plan.cost,'cost mono')+'<span class="label">'`);
replace(`'<span style="color:'+(state.comets<item.cost?'var(--danger)':'var(--ink)')+'">'+formatNum(item.cost)+' '+costIcon('comet')+'</span>'`, `purchasePriceMarkup('comet',item.cost,'',true)`);
replace(`'<span style="color:'+(state.lumen<cost.lumen?'var(--danger)':'var(--ink)')+'">'+costIcon('lumen')+formatNum(cost.lumen)+'</span> <span style="color:'+(state.shards<cost.shard?'var(--danger)':'var(--ink)')+'">'+costIcon('shard')+formatNum(cost.shard)+'</span>'`, `purchasePriceMarkup('lumen',cost.lumen)+' '+purchasePriceMarkup('shard',cost.shard)`);
replace("+multHtml + html+'';",'+multHtml + html;');
replace("html += ''+'<div class=\"section-sub\">Lab:","html += '<div class=\"section-sub\">Lab:");
replace("replaceControlMarkup(els['node-list'],html+'');","replaceControlMarkup(els['node-list'],html);");
replace("  ['spirit-list','research-list','study-list','node-list','shop-list'].forEach(function(id){presentControlStates(els[id]);});",`  els['node-list'].querySelectorAll('[data-node]').forEach(function(btn){
    var node=NODES.find(function(n){return n.id===btn.getAttribute('data-node');});
    if(node) btn.disabled=!getNodeBuyPlan(node).affordable;
  });
  els['shop-list'].querySelectorAll('[data-shop]').forEach(function(btn){
    var item=SHOP.find(function(n){return n.id===btn.getAttribute('data-shop');});
    if(item) btn.disabled=!!state.owned[item.id] || state.comets<item.cost;
  });
  ['spirit-list','research-list','study-list','node-list','shop-list'].forEach(function(id){
    updatePurchasePriceColors(els[id]);
    presentControlStates(els[id]);
  });`);
fs.writeFileSync('index.html',source);
let p='tests/behavioral/upgrade-identity.js',t=fs.readFileSync(p,'utf8');assert.equal(blob(t),'299aa9b973e68dd052500d970934d9ca3f6a7809');
t=t.replace("var legacy=root.querySelectorAll('[data-legacy-upgrade]');ok(legacy.length===(tab==='forge'?4:tab==='research'?2:3),'owned archive visible '+tab);", "var legacy=root.querySelectorAll('[data-legacy-upgrade]');ok(legacy.length===0,'retired read-only shop entries removed '+tab);\n      ['focus','sense','formation','resolve'].forEach(function(id){ok(!root.querySelector('[data-research=\"'+id+'\"],[data-queue=\"'+id+'\"]'),'retired Forge controls remain absent '+id);});");
t=t.replace("legacy.forEach(function(card){\n        ok(!card.querySelector('button'),'legacy is read-only '+card.dataset.legacyUpgrade);ok(card.textContent.includes('Future upgrades:'),'visible new owner '+card.dataset.legacyUpgrade);", "root.querySelectorAll('.node-card,.study-card').forEach(function(card){");
t=t.replace("'legacy text contrast '","'retained upgrade text contrast '").replace('minLegacyTextContrast:minContrast','minRetainedTextContrast:minContrast');
assert(t.includes('retired read-only shop entries removed'));fs.writeFileSync(p,t);
p='tests/behavioral/tree-purchases.js';t=fs.readFileSync(p,'utf8');assert.equal(blob(t),'e1a3eb1a79215a7f08bb447bab66d62c9e7b616e');
t=t.replace("ok(level?row&&row.textContent.includes('Existing bonus kept.'):!row,'preserved contribution shown only when owned '+id);", "ok(!row,'retired contribution stays out of the shop while raw value survives '+id);");assert(t.includes('retired contribution stays out'));fs.writeFileSync(p,t);
console.log(JSON.stringify({status:'patched',before:sha(before),after:sha(source),scope:'per-currency live presentation, eligibility refresh, requested absence assertions; all earned-value/payment/chronology assertions preserved'}));
