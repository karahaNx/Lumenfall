'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function inspect(buffer){
 assert(buffer.length>=1536&&buffer.length%512===0,'complete binary tar blocks, not shell error text');
 const entries=[];let offset=0,ended=false;
 while(offset+512<=buffer.length){
  const h=buffer.subarray(offset,offset+512);
  if(h.every(v=>v===0)){assert(buffer.subarray(offset).every(v=>v===0),'tar terminator followed only by padding');assert(buffer.length-offset>=1024,'two tar terminators');ended=true;break;}
  assert.equal(h.subarray(257,262).toString(),'ustar','valid tar header');
  const field=(a,b)=>h.subarray(a,b).toString().replace(/\0.*$/s,'').trim();
  const octal=(a,b)=>{const s=field(a,b);assert(/^[0-7]+$/.test(s),'valid octal tar field');return parseInt(s,8);};
  let checksum=0;for(let i=0;i<512;i++)checksum+=i>=148&&i<156?32:h[i];assert.equal(checksum,octal(148,156),'tar checksum');
  const name=field(0,100),prefix=field(345,500),type=String.fromCharCode(h[156]);
  assert(!prefix&&name.startsWith('Local Storage/')&&!name.split('/').includes('..'),'only app Local Storage paths');
  assert(['0','\0','5'].includes(type),'regular files/directories only');
  const size=octal(124,136);assert(offset+512+size<=buffer.length,'complete tar entry');
  if(type==='5')assert.equal(size,0,'directory has no payload');
  const data=buffer.subarray(offset+512,offset+512+size);
  entries.push({name,type,size,sha256:sha(data)});offset+=512+Math.ceil(size/512)*512;
 }
 assert(ended,'tar has a complete terminator');
 const files=entries.filter(e=>e.type!=='5');assert(files.some(e=>/^Local Storage\/leveldb\/\d+\.(log|ldb)$/.test(e.name)&&e.size>0),'nonempty actual LevelDB data');
 for(const key of ['lumenfall_save_v2','lumenfall_save_recovery_v1'])assert(buffer.includes(Buffer.from(key))||buffer.includes(Buffer.from(key,'utf16le')),'actual save key in database: '+key);
 return {format:'validated ustar / WebView Local Storage LevelDB',bytes:buffer.length,sha256:sha(buffer),entries};
}
module.exports=inspect;
if(require.main===module){
 if(process.argv[2]==='--self-test'){
  for(const b of [Buffer.from('Permission denied\ntar: Local Storage: No such file or directory\n'),Buffer.alloc(1536)])assert.throws(()=>inspect(b));
  const valid=fs.readFileSync(process.argv[3]);inspect(valid);
  if(process.argv[4])assert.throws(()=>inspect(fs.readFileSync(process.argv[4])),'the original invalid native capture must fail');
  assert.throws(()=>inspect(valid.subarray(0,valid.length-1)));
  const damaged=Buffer.from(valid);damaged[0]^=1;assert.throws(()=>inspect(damaged),/checksum/);
  console.log('PASS valid app database; error text, empty, truncated and corrupted archives rejected');
 }else console.log(JSON.stringify(inspect(fs.readFileSync(process.argv[2])),null,2));
}
