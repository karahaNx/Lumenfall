'use strict';
// Minimal ADB daemon transport for the isolated, unauthenticated AOSP emulator.
// Avoids the SDK adb client's compulsory writes to the read-only user home.
const net=require('node:net'),fs=require('node:fs'),assert=require('node:assert/strict');
const {Duplex}=require('node:stream');
class Adb {
 constructor(){this.streams=new Map();this.seq=0;this.buffer=Buffer.alloc(0);}
 async connect(){
  this.socket=net.createConnection({host:'127.0.0.1',port:5681});
  await new Promise((resolve,reject)=>{this.socket.once('connect',resolve);this.socket.once('error',reject);});
  const ready=new Promise((resolve,reject)=>{this.readyResolve=resolve;this.readyReject=reject;});
  this.socket.on('data',chunk=>{this.buffer=Buffer.concat([this.buffer,chunk]);while(this.buffer.length>=24&&this.buffer.length>=24+this.buffer.readUInt32LE(12)){const h=this.buffer.subarray(0,24),data=this.buffer.subarray(24,24+h.readUInt32LE(12));this.buffer=this.buffer.subarray(24+data.length);this.packet(h.subarray(0,4).toString(),h.readUInt32LE(4),h.readUInt32LE(8),data);}});
  this.socket.on('error',e=>{if(this.readyReject)this.readyReject(e);for(const s of this.streams.values())s.destroy(e);});
  this.send('CNXN',0x01000000,262144,Buffer.from('host::\0'));await ready;return this;
 }
 send(command,a,b,data=Buffer.alloc(0)){const h=Buffer.alloc(24),c=Buffer.from(command).readUInt32LE();h.writeUInt32LE(c);h.writeUInt32LE(a,4);h.writeUInt32LE(b,8);h.writeUInt32LE(data.length,12);h.writeUInt32LE(data.reduce((n,x)=>n+x,0)>>>0,16);h.writeUInt32LE((c^0xffffffff)>>>0,20);this.socket.write(Buffer.concat([h,data]));}
 packet(command,a,b,data){
  if(command==='CNXN'){this.maxPayload=b;this.identity=data.toString();this.readyResolve();this.readyReject=null;return;}
  if(command==='AUTH'){this.readyReject(Error('Only the unauthenticated isolated emulator is supported'));return;}
  const s=this.streams.get(b);if(!s)return;
  if(command==='OKAY'){s.remote=a;if(s.opened){s.opened(s);s.opened=null;}else if(s.ack){const ack=s.ack;s.ack=null;ack();}}
  if(command==='WRTE'){s.push(data);this.send('OKAY',b,a);}
  if(command==='CLSE'){this.send('CLSE',b,a);this.streams.delete(b);s.push(null);if(s.opened)s.opened(null);if(s.ack){const ack=s.ack;s.ack=null;ack(Error('Remote stream closed'));}}
 }
 async open(service){
  const id=++this.seq,owner=this;
  const s=new Duplex({read(){},write(chunk,encoding,cb){let pos=0;function next(error){if(error)return cb(error);if(pos===chunk.length)return cb();const data=chunk.subarray(pos,pos+owner.maxPayload);pos+=data.length;s.ack=next;owner.send('WRTE',id,s.remote,data);}next();},destroy(error,cb){if(owner.streams.has(id)){owner.send('CLSE',id,s.remote||0);owner.streams.delete(id);}cb(error);}});
  const ready=new Promise(resolve=>{s.opened=resolve;});this.streams.set(id,s);this.send('OPEN',id,0,Buffer.from(service+'\0'));assert(await ready,'ADB service opened: '+service);return s;
 }
 async exec(command){const s=await this.open('exec:'+command),chunks=[];for await(const b of s)chunks.push(b);return Buffer.concat(chunks);}
 async shell(command){return (await this.exec(command)).toString();}
 async upload(file,dest){
  const s=await this.open('sync:'),responses=[];s.on('data',b=>responses.push(b));
  const write=b=>new Promise((resolve,reject)=>s.write(b,e=>e?reject(e):resolve()));
  function msg(type,payload){const h=Buffer.alloc(8);h.write(type,0,4);h.writeUInt32LE(payload.length,4);return Buffer.concat([h,payload]);}
  await write(msg('SEND',Buffer.from(dest+',33206')));const data=fs.readFileSync(file);
  for(let i=0;i<data.length;i+=65536)await write(msg('DATA',data.subarray(i,i+65536)));
  const done=Buffer.alloc(8);done.write('DONE');done.writeUInt32LE(Math.floor(Date.now()/1000),4);await write(done);
  const start=Date.now();while(!responses.length&&Date.now()-start<60000)await new Promise(r=>setTimeout(r,25));
  assert.equal(Buffer.concat(responses).subarray(0,4).toString(),'OKAY','ADB sync upload succeeded');s.destroy();
 }
 async forward(port,service){const sockets=new Set(),server=net.createServer(async socket=>{sockets.add(socket);socket.on('error',()=>{});socket.on('close',()=>sockets.delete(socket));try{const stream=await this.open(service);socket.pipe(stream);stream.pipe(socket);socket.on('close',()=>stream.destroy());stream.on('error',e=>socket.destroy(e));}catch(e){socket.destroy(e);}});server.sockets=sockets;await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));return server;}
 close(){for(const s of this.streams.values())s.destroy();this.socket.destroy();}
}
module.exports=Adb;
if(require.main===module)(async()=>{const a=await new Adb().connect();console.log(a.identity);console.log(await a.shell(process.argv.slice(2).join(' ')||'getprop sys.boot_completed'));a.close();})().catch(e=>{console.error(e);process.exitCode=1;});
