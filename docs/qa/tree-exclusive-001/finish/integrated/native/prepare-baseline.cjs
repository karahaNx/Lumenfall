'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{connect}=require('./native-connect.cjs');
(async()=>{const c=await connect();try{
 const observed=await c.evaluate('({ua:navigator.userAgent,raw:localStorage.getItem("lumenfall_save_v2")})');assert(observed.raw,'real baseline save exists');
 const s=JSON.parse(observed.raw);s.prisms=20000;s.nodes.echo=5;s.nodes.bonds=19;s.nodes.swift=4;s.nodes.starlight=13;s.nodes.steady=9;s.nodes.momentum=7;s.achieved.asc5=true;s.achieved.d100=true;s.lastSeen=Date.now();
 // Deterministic fixture supplies currency/legacy raw entitlements. Subsequent
 // levels are purchased through actual unmodified signed148 controls.
 await c.evaluate('(function(){var s='+JSON.stringify(s)+';localStorage.setItem("lumenfall_save_v2",JSON.stringify(s));localStorage.setItem("lumenfall_save_recovery_v1",JSON.stringify(s));return true;})()');
 await c.adb.shell('am force-stop com.lumenfall.app');await c.adb.shell('am start -n com.lumenfall.app/.MainActivity');fs.writeFileSync('/workspace/tree-android-tools/baseline-fixture.json',JSON.stringify({ua:observed.ua,source:'signed148; raw legacy seed and currency fixture; actual controls purchase subsequent cap levels',fixture:s},null,2)+'\n');console.log('Baseline fixture loaded for actual signed148 purchases');
}finally{c.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
