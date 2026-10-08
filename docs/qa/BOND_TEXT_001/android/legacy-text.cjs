// Execute the shipped partner helper and parse all product scripts on V8 6.0.
// Usage: node-v8.4.0 legacy-text.cjs /absolute/extracted-or-source-index.html
'use strict';
var fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
var file=process.argv[2],source=fs.readFileSync(file,'utf8'),sandbox={};
vm.runInNewContext(source.slice(source.indexOf('var SPIRITS = ['),source.indexOf('var RESOURCE_COLORS =')),sandbox);
var expected=['Ember Wisp + Voidling','Tide Sprite + Aurora Seer','Stoneheart Golem + Starforged Titan','Gale Dancer + Thornback'];
var partners=sandbox.FORMATION_BONDS.map(function(b){return sandbox.formationBondPartners(b);});
assert.deepStrictEqual(JSON.parse(JSON.stringify(partners)),expected);
assert(!/Bond|Stone|Titan/.test(sandbox.ABILITY_DESC.breaker));
assert(/Heavy ability damage/.test(sandbox.ABILITY_DESC.breaker)&&/Module boosts the hit/.test(sandbox.ABILITY_DESC.breaker)&&/Ultimate doubles it/.test(sandbox.ABILITY_DESC.breaker));
var scripts=[],re=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g,m;
while((m=re.exec(source))){new vm.Script(m[1]);scripts.push(m[1]);}
console.log(JSON.stringify({status:'PASS',input:file,node:process.version,v8:process.versions.v8,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),scriptsParsed:scripts.length,partners:partners,scope:'actual V8 6.0 syntax and partner helper execution; DOM/physical acceptance separate'},null,2));
