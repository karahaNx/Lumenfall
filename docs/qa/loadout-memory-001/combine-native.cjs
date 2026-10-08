'use strict';
// Combine separately completed UI and corrected upgrade proofs for the same APK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const inspect=require('./storage-tar.cjs'),dir=process.argv[2];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const inputs={};function read(name){const b=fs.readFileSync(path.join(dir,name));inputs[name]=sha(b);return JSON.parse(b);}
const behavior=read('native-behavior.json'),update=read('update-native.json'),storage=read('update.json'),baseline=read('baseline.json');
for(const r of [behavior,update,storage,baseline])assert.equal(r.status,'pass');
const apk='8ad8aeab6df7224e629c8a93805386a5c16851ffeb53e2f7338f42c76b0d79bc',source='84ca8f6a50d0df5046c86ddb4a354850aca6273e4581e11b94acc95b10ae885f';
for(const r of [behavior,update,storage]){assert.equal(r.artifact.sha256,apk);assert.equal(r.sourceSHA256,source);assert.equal(r.baseline.sha256,baseline.artifact.sha256);}
assert.deepEqual(behavior.runtimeErrors,[]);assert.deepEqual(update.runtimeErrors,[]);assert.equal(behavior.identity.ua,update.identity.ua);
const before=inspect(fs.readFileSync(path.join(dir,'baseline-storage.tar'))),after=inspect(fs.readFileSync(path.join(dir,'update-storage.tar')));
assert.equal(before.sha256,baseline.storageSHA256);assert.equal(before.sha256,storage.storageBefore.sha256);assert.equal(after.sha256,storage.storageAfter.sha256);assert.equal(before.sha256,after.sha256);
assert.equal(behavior.records[0].case,'signed143 update preserves database/legacy ownership/wallet/preference; separate F26 credit once');
assert.equal(update.records.length,1);assert.equal(update.repeated.primary.comets,425);assert.equal(update.repeated.primary.savedLabMultiplier,25);assert(update.repeated.primary.legacyCometPurchases.rememberbulk);
const result={status:'pass',artifact:update.artifact,baseline:baseline.artifact,sourceSHA256:source,identity:behavior.identity,
 provenance:{inputs,excluded:'native-behavior.json first record: invalid old database hash; superseded by corrected update-native.json and validated raw archives'},
 storage:{before,after},records:[...update.records,...behavior.records.slice(1)],runtimeErrors:[],limitations:behavior.limitations};
fs.writeFileSync(path.join(dir,'native.json'),JSON.stringify(result,null,2));console.log('PASS same exact signed APK/source; corrected real database upgrade plus native UI/restart/input/AX');
