'use strict';
// Replay the existing F13 driver with current-main Rift cosmetics equipped.
// Only its temporary served-copy fixture changes; product assets are untouched.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../../..'),driver=fs.readFileSync(root+'/tests/behavioral/rift-cast-text.cjs','utf8');
const needle="install:function(next){state=acceptPersistedState(next,'qa-f13');restoreEnemyOrSpawn();renderAll();},";
assert.equal(driver.split(needle).length,2);
const fixture="install:function(next){next.owned=next.owned||{};next.owned.rifttrail=true;next.owned.starfallcrest=true;next.cometCosmetics={trail:true,crest:true};state=acceptPersistedState(next,'qa-f13');restoreEnemyOrSpawn();renderAll();applyRiftTheme();var stage=document.getElementById('enemy-stage');if(!stage.classList.contains('comet-trail-equipped')||!stage.classList.contains('comet-crest-equipped'))throw Error('current cosmetics genuinely equipped');},";
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'f13-cosmetics-')),file=path.join(temp,'driver.cjs');
try{fs.writeFileSync(file,driver.replace(needle,fixture));const r=cp.spawnSync(process.execPath,[file,...process.argv.slice(2)],{stdio:'inherit',timeout:180000});if(r.error)throw r.error;process.exitCode=r.status===null?1:r.status;}finally{fs.rmSync(temp,{recursive:true,force:true});}
