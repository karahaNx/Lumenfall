// F27 analysis of unchanged source. Not an implementation or balance acceptance.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8');
function extractFunction(name) {
  const start = source.indexOf('function '+name+'(');
  if (start < 0) throw Error('Missing function '+name);
  const body = source.indexOf('{', start);
  let depth=0, quote='', comment='';
  for (let i=body; i<source.length; i++) {
    const c=source[i], n=source[i+1];
    if (comment==='line') { if(c==='\n') comment=''; continue; }
    if (comment==='block') { if(c==='*'&&n==='/') { comment=''; i++; } continue; }
    if (quote) { if(c==='\\') { i++; continue; } if(c===quote) quote=''; continue; }
    if (c==='/'&&n==='/') { comment='line'; i++; continue; }
    if (c==='/'&&n==='*') { comment='block'; i++; continue; }
    if (c==='"'||c==="'") { quote=c; continue; }
    if (c==='{') depth++;
    if (c==='}'&&--depth===0) return source.slice(start,i+1);
  }
  throw Error('Missing function close '+name);
}
const context = {Date, Math, Number, Array, Object, Infinity, saveState(){}, renderShop(){}};
vm.createContext(context);
for (const name of ['SPIRITS','RESEARCH','NODES','LONG_STUDIES','ACHIEVEMENTS','RIFT_THEMES','SHOP','QUEST_POOL','DAILY_LOGIN_REWARDS']) {
  const match = source.match(new RegExp('var '+name+' = \\[([\\s\\S]*?)\\n\\];'));
  if (!match) throw Error('Missing table '+name);
  vm.runInContext(match[0], context);
}
vm.runInContext("var FORMATION_PRESET_IDS=['push','farm','boss']; var RARITY_NAMES=['Common','Uncommon','Rare','Epic','Legendary','Mythic']; var MODULE_MAX_LEVEL=20; var SAVE_SCHEMA_VERSION=1; var LAB_SPEED_TIERS=[1.5,2,3,4,5,6,7,8]; var SIGIL_RESONANCE_RUN_LIMIT=3; var COMET_QUEST_REFRESH_BASE_COST=25;", context);
const functions = ['freshState','dateSeed','dailyQuestEligible','pickDailyQuests','loginRewardFor','restStopComplete','maxDailyQuestCometReward','dailyQuestRefreshCost','buyShopItem','isPlainObject','finiteNonNegative','nonNegativeInt','boundedInt','strictBool','normalizeSupportBuffs','normalizeFormationRebuild','reconcileFormationRebuild','normalizeCurrentSave','isBoss'];
for (const name of functions) vm.runInContext(extractFunction(name), context);
const results = {
  scope:'Observed unchanged main tables/functions, isolated VM with save/UI stubs. Calendar earnings assume stated completion; not measured player pacing, full engine, UI, migration or Android acceptance.',
  sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),
  functionHashes:Object.fromEntries(functions.map(name=>[name,crypto.createHash('sha256').update(extractFunction(name)).digest('hex')])),
  oneTimeDeedComets:context.ACHIEVEMENTS.reduce((s,a)=>s+a.reward,0),
  shop:context.SHOP.map(({id,name,cost,desc})=>({id,name,cost,desc})),
  refreshCost:context.dailyQuestRefreshCost(), maxQuestReward:context.maxDailyQuestCometReward(),
  currencyMatrix:['RESEARCH','NODES','LONG_STUDIES'].flatMap(table=>context[table].map(n=>({system:table==='RESEARCH'?'Forge':table==='NODES'?'Tree':'Lab',currency:table==='NODES'?'Prisms':'Lumen/Shards',id:n.id,name:n.name,effect:n.desc,cap:n.levelCap===undefined?null:n.levelCap}))),
  calendar:[]
};
for (const maxDepthEver of [1,5,8,10,16,250]) {
  const days=[];
  for(let i=0;i<365;i++) {
    const day=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);
    const ids=context.pickDailyQuests(day,{maxDepthEver,ascendCount:0});
    const questComets=ids.reduce((s,id)=>s+context.QUEST_POOL.find(q=>q.id===id).reward.comets,0);
    const login=context.loginRewardFor(i%7+1).comets;
    days.push({day,ids,questComets,login,allSelectedCompleted:questComets+login});
  }
  const mean=days.reduce((s,d)=>s+d.allSelectedCompleted,0)/days.length;
  results.calendar.push({maxDepthEver,days:365,assumption:'continuous seven-day login streak; either no quest completion or all three selected quests completed; no refresh spending or one-time Deeds',loginOnlyMean:days.reduce((s,d)=>s+d.login,0)/days.length,allSelectedCompletedMean:mean,min:Math.min(...days.map(d=>d.allSelectedCompleted)),max:Math.max(...days.map(d=>d.allSelectedCompleted)),priceAnchors:[50,140,160].map(price=>({price,priceDividedByMeanDays:price/mean}))});
}
context.state=context.freshState();
context.state.comets=1000;
const memory=context.SHOP.find(i=>i.id==='rememberbulk');
context.buyShopItem(memory);
const afterFirst=context.state.comets;
context.buyShopItem(memory);
results.directBuy={afterFirst,afterRepeat:context.state.comets,owned:context.state.owned.rememberbulk};
context.state=context.freshState();
context.state.comets=49;
context.buyShopItem(memory);
results.insufficient={comets:context.state.comets,owned:!!context.state.owned.rememberbulk};
context.state=context.freshState();
context.state.owned={autoascend:true,offline24:true,offline48:true,rememberbulk:true};
results.legacy={gateBefore:context.restStopComplete(),ownedBefore:context.normalizeCurrentSave(context.state).owned};
context.state.owned={autoascend:true};
results.legacy.autoAscendOnlyBefore=context.restStopComplete();
context.state.owned={autoascend:true,offline24:true,offline48:true,rememberbulk:true};
// Deliberately change only the analysis context to expose the deletion hazard.
context.SHOP=context.SHOP.filter(i=>i.id==='autoascend');
results.legacy.withRemovedShopRows={gateAfter:context.restStopComplete(),ownedAfter:context.normalizeCurrentSave(context.state).owned};
context.state.owned={autoascend:true};
results.legacy.autoAscendOnlyAfter=context.restStopComplete();
if(results.directBuy.afterFirst!==950 || results.directBuy.afterRepeat!==950 || results.insufficient.comets!==49 || results.insufficient.owned || results.oneTimeDeedComets!==683 || results.refreshCost<results.maxQuestReward) throw Error('Baseline evidence mismatch');
console.log(JSON.stringify(results,null,2));
