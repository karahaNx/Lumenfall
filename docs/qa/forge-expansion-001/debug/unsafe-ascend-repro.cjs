#!/usr/bin/env node
'use strict';
// Full production-IIFE reproduction. Pass the pre-fix index.html as argv[2]
// to reproduce the recorded defect; current fixed source should clear both
// old-run grants. No product functions are stubbed or replaced by this probe.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {app,clone}=require('../../../../tests/behavioral/forge-expansion-harness.cjs');
const {battle,advance}=require('../../../../tests/behavioral/forge-expansion.cjs');
const file=process.argv[2]||path.resolve(__dirname,'../../../../index.html');
const source=fs.readFileSync(file,'utf8'),q=app(source).q;
const state=battle(q,['tide','ember'],20);
state.ascendCount=1e30;state.owned.autoascend=true;state.autoAscendEnabled=true;state.autoAscendTargetDepth=21;
state.research.relay=5;state.research.spillway=5;state.research.resonantedge=5;
q.set(state);q.get().heroResource.tide=100;q.get().enemyHp=q.abilityDamage('tide',20)/2;
const before=clone(q.get()),summary=advance(q),after=clone(q.get());
process.stdout.write(JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),
  expected:{ascends:1,depth:1,enemyHp:11,enemyMaxHp:11,emberCharge:0,rawAscendCount:1e30},
  observed:{ascends:summary.ascends,bossKills:summary.bossKills,depth:after.depth,enemyHp:after.enemyHp,enemyMaxHp:after.enemyMaxHp,emberCharge:after.heroResource.ember,rawAscendCount:after.ascendCount},
  before,summary,after},null,2)+'\n');
