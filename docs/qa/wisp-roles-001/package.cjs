'use strict';
// Phone-friendly local handoff; no remote writes or repository integration.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const out=path.resolve(process.argv[2]||'/workspace/WISP_ROLES_001-delivery');
fs.mkdirSync(out,{recursive:true});
const git=args=>execFileSync('git',args,{cwd:root});
const head=git(['rev-parse','HEAD']).toString().trim();
const tree=git(['rev-parse','HEAD^{tree}']).toString().trim();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const latest=JSON.parse(fs.readFileSync(path.join(__dirname,'latest-main-results.json'),'utf8'));
const readme=`WISP_ROLES_001 — LOCAL HANDOFF, FEATURE UNFINISHED\n\nOwner: this WISP_ROLES_001 feature chat / Gameplay.\nLocal branch: feature/WISP_ROLES_001\nLocal checkpoint: ${head}\nTree: ${tree}\nLocal Git base: 67c3e99c24587f6c13fc65cfd27f8dcb8e289602\nLatest measured live main: ${latest.provenance.liveMain}\nProduct blob: ${latest.provenance.indexGitBlob}\n\nREAD FIRST: WISP_ROLES_001.txt, then docs/qa/wisp-roles-001/REPORT.md.\nThe TXT is the complete task/decision/acceptance document, not a completed-feature claim.\nThe patch adds only this feature's task, analysis tools and evidence. No game, shared state, mobile, signing or workflow changes.\nApply/rebase only at a coordinated Lead writer checkpoint on then-current main.\nNo remote publication, PR, writer handover or device acceptance was performed by this feature.\n\nFINDINGS\n1,008 equal-budget team measurements on each source, 24 individual-Wisp controls, 12 actual-engine Boss windows.\nTitan remains dominant under the tested budgets. Ember/Stone Bond value and support uplift must be shown separately from raw damage.\nRaw damage + Bond increment + support increment reconciles. Removal deltas overlap and must never be summed.\nThe supplied save is post-Ascend, not a powered mid/late-game snapshot.\nCurrent-main Farm whole/split: 8/16 pass; aligned-clock failures remain. Aggregate measure exits 1 intentionally.\nBrowser QA is blocked/no completed payload; no Android/TalkBack acceptance.\n\nNEXT LEAD ACTION\nReview the task, coordinate PR46/B2/writer handover, save this checkpoint to GitHub in its own writer slot, decide the listed mastery/role/acceptance numbers, and provide powered mid/late-game saves.\nNo gameplay numbers or new binding rules were invented.\n\nREPRODUCE from a repository with the referenced fixed source bytes\nnode docs/qa/wisp-roles-001/measure.cjs\nWISP_INDEX=/path/to/verified/index.html WISP_OUTPUT=/tmp/wisp-results.json node docs/qa/wisp-roles-001/measure.cjs\nnode docs/qa/wisp-roles-001/report.cjs\nThe source hash in each result is authoritative. Old-main, B2 and latest-main results remain separate.\nLogs are gzip archives of exact original bytes; decompress to inspect. Full original save/feedback sources already live at the task's pinned repository paths.\nThe live-review export is not a local Git HEAD equal to main; 40 imported source/tooling blobs were individually verified.\n\nFEATURE STATUS\nLocal proposal only. Numeric design, powered-save acceptance, product UI/tuning, coordinated integration/GitHub checkpoint and APK/device checks remain outstanding. Keep this owner chat open.\n`;
const payload=new Map();
payload.set('README.txt',Buffer.from(readme));
payload.set('WISP_ROLES_001.txt',fs.readFileSync(path.join(root,'docs/tasks/WISP_ROLES_001.md')));
payload.set('WISP_ROLES_001.patch',git(['diff','67c3e99c24587f6c13fc65cfd27f8dcb8e289602','HEAD','--','docs/tasks/WISP_ROLES_001.md','docs/qa/wisp-roles-001']));
for(const name of git(['ls-files','-z','docs/tasks/WISP_ROLES_001.md','docs/qa/wisp-roles-001']).toString().split('\0').filter(Boolean))payload.set(name,fs.readFileSync(path.join(root,name)));
payload.set('MANIFEST.json',Buffer.from(JSON.stringify({head,tree,latestMain:latest.provenance.liveMain,files:[...payload].map(([name,data])=>({name,bytes:data.length,sha256:sha(data)}))},null,2)+'\n'));
const table=Array.from({length:256},(_,v)=>{for(let i=0;i<8;i++)v=v&1?0xedb88320^(v>>>1):v>>>1;return v>>>0;});
const crc=b=>{let v=0xffffffff;for(const x of b)v=table[(v^x)&255]^(v>>>8);return(v^0xffffffff)>>>0;};
const body=[],directory=[];let offset=0;
for(const [name,data]of payload){
 const n=Buffer.from(name),packed=zlib.deflateRawSync(data),sum=crc(data),h=Buffer.alloc(30),d=Buffer.alloc(46);
 h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt32LE(sum,14);h.writeUInt32LE(packed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);
 d.writeUInt32LE(0x02014b50);d.writeUInt16LE(20,4);d.writeUInt16LE(20,6);d.writeUInt16LE(0x800,8);d.writeUInt16LE(8,10);d.writeUInt32LE(sum,16);d.writeUInt32LE(packed.length,20);d.writeUInt32LE(data.length,24);d.writeUInt16LE(n.length,28);d.writeUInt32LE(offset,42);
 body.push(h,n,packed);directory.push(d,n);offset+=h.length+n.length+packed.length;
}
const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(payload.size,8);end.writeUInt16LE(payload.size,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...body,central,end]);
fs.writeFileSync(path.join(out,'WISP_ROLES_001.zip'),zip);
for(const name of ['README.txt','WISP_ROLES_001.txt','MANIFEST.json'])fs.writeFileSync(path.join(out,name),payload.get(name));
assert(payload.get('WISP_ROLES_001.patch').length>0);
console.log(JSON.stringify({out,head,tree,files:payload.size,zipBytes:zip.length,zipSha256:sha(zip)},null,2));
