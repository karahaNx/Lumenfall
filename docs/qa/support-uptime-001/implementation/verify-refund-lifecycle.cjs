'use strict';
// Reuse the production VM bridge and independent BigInt value oracle, then
// exercise actual Ascend/canonicalization and the fresh-state half of Reset.
// The existing browser support-reset gate covers the actual Reset UI/storage.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'../../../..'),file=path.join(root,'tests/behavioral/support-refund.cjs');
const extra=`
{
 var lifecycleSeed=copy(a.fresh());lifecycleSeed.research.charge=25;lifecycleSeed.shards=1e300;lifecycleSeed.depth=lifecycleSeed.maxDepthEver=121;lifecycleSeed.heroRarity.tide=5;lifecycleSeed.wispUltimate.tide=true;lifecycleSeed.supportBuffs={version:1,sources:{tide:{until:2000000008000,mult:1.5}}};
 a.set(lifecycleSeed);eq(a.spend(7),true,'small refund spent before Ascend');var paid=copy(a.get()),credit=paid.exactRefundCredits.shards,receipt=copy(paid.feedbackMigration.receipts['forge.charge']);
 a.ascend();var ascended=copy(a.get());eq(ascended.exactRefundCredits.shards,credit,'Ascend preserves spent/refund remainder');eq(value(ascended),value(paid),'Ascend preserves total Shard value');eq(ascended.research.charge,25,'Ascend raw history');eq(ascended.wispUltimate.tide,true,'Ascend paid Ultimate retained');eq(ascended.supportBuffs,null,'existing run buff closes at Ascend');a.set(ascended);eq(copy(a.get().feedbackMigration.receipts['forge.charge']),receipt,'canonical Ascend keeps receipt');eq(a.get().exactRefundCredits.shards,credit,'canonical Ascend no second refund');
 a.set(a.fresh());eq(value(a.get()),0n,'fresh Reset has no refund balance');eq(a.get().research.charge,0,'fresh Reset no paid history');eq(a.get().feedbackMigration.receipts['forge.charge'],undefined,'fresh Reset no old receipt');
 var lifecycleResult={status:'pass',sourceSha256:crypto.createHash('sha256').update(html).digest('hex'),checks:11,ascendCredit:credit,receipt:receipt,reset:{shards:a.get().shards,credit:a.get().exactRefundCredits.shards,charge:a.get().research.charge}};
 fs.writeFileSync(process.argv[4]||path.join(root,'docs/qa/support-uptime-001/implementation/refund-lifecycle.json'),JSON.stringify(lifecycleResult,null,2)+'\\n');console.log('PASS real Ascend/canonical refund retention and fresh Reset state');
}
`;
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(fs.readFileSync(file,'utf8')+extra,file);
