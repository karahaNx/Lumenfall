'use strict';
// One scoped correction to stale introductory text. No reward/save changes.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const old=fs.readFileSync('index.html','utf8');assert.equal(hash(old),'5131f9fbafdfe4e5feab69c5bb52ae5dba1363cc1eeef4cd7c02d376d6500cf9');
const before='Your first Ascend sets a Prism reward benchmark. Repeating at the same depth earns a 20% reserve reward; pushing beyond the benchmark adds the newly earned depth bonus. Ascending still resets the current run while permanent progression stays.';
const after='Each Ascend earns Prisms. Repeat runs keep 20% of the base reward plus the full earned upgrade bonus. Clearing beyond your best rewarded Rift adds a new-depth bonus. The current run resets; permanent progression stays.';
assert.equal(old.split(before).length,2);const updated=old.replace(before,after);fs.writeFileSync('index.html',updated);
const path='tests/behavioral/prism-acceptance.cjs',test=fs.readFileSync(path,'utf8'),marker="const {reward}=require('./prism-earning-reference.cjs');";assert.equal(test.split(marker).length,2);
fs.writeFileSync(path,test.replace(marker,marker+'\nassert(source.includes('+JSON.stringify(after)+'),\'intro must explain full earned bonus\');\nassert(!source.includes('+JSON.stringify(before)+'),\'obsolete full-reward penalty text must not remain\');'));
console.log(JSON.stringify({before:hash(old),after:hash(updated),scope:'one introductory paragraph plus explicit textual regression; formulas, saves, prices and all other HTML unchanged'}));
