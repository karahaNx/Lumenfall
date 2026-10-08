'use strict';
// Direct protocol transport to this isolated, unauthenticated AOSP emulator.
// No host ADB credentials/home directory or physical devices are used.
const net=require('node:net'),{Duplex}=require('node:stream');
class DirectAdb {
 constructor(port=5581){this.port=port;this.ids=0;this.channels=new Map();this.buffer=Buffer.alloc(0);}
 async connect(){
  this.socket=net.connect(this.port,'127.0.0.1');
  this.socket.on('data',d=>{this.buffer=Buffer.concat([this.buffer,d]);while(this.buffer.length>=24){const len=this.buffer.readUInt32LE(12);if(this.buffer.length<24+len)break;const p=this.buffer.subarray(0,24+len);this.buffer=this.buffer.subarray(24+len);this.packet(p.subarray(0,4).toString(),p.readUInt32LE(4),p.readUInt32LE(8),p.subarray(24));}});
  this.socket.on('error',e=>{if(this.reject)this.reject(e);for(const c of this.channels.values())c.destroy(e);});
  await new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;this.socket.once('connect',()=>this.send('CNXN',0x01000000,4096,Buffer.from('host::\0')));});
  return this;
 }
 send(cmd,a,b,data=Buffer.alloc(0)){const h=Buffer.alloc(24);h.write(cmd);h.writeUInt32LE(a>>>0,4);h.writeUInt32LE(b>>>0,8);h.writeUInt32LE(data.length,12);h.writeUInt32LE(data.reduce((n,x)=>(n+x)>>>0,0),16);h.writeUInt32LE((~h.readUInt32LE(0))>>>0,20);this.socket.write(Buffer.concat([h,data]));}
 packet(cmd,a,b,data){
  if(cmd==='CNXN'){this.max=a>=0x01000000?Math.min(b,65536):4096;this.resolve();return;}
  if(cmd==='AUTH'){this.reject(Error('This adapter refuses authenticated/physical devices'));this.socket.destroy();return;}
  const c=this.channels.get(b);if(!c)return;
  if(cmd==='OKAY'){c.remote=a;if(c.ready){c.ready();c.ready=null;}else if(c.ack){const f=c.ack;c.ack=null;f();}}
  if(cmd==='WRTE'){c.push(Buffer.from(data));this.send('OKAY',b,a);}
  if(cmd==='CLSE'){this.send('CLSE',b,a);c.push(null);this.channels.delete(b);if(c.ready)c.fail(Error('service closed'));if(c.ack){const f=c.ack;c.ack=null;f();}}
 }
 open(service){return new Promise((resolve,reject)=>{const id=++this.ids,self=this;const c=new Duplex({read(){},write(data,enc,done){let offset=0;function next(){if(offset===data.length){done();return;}const chunk=data.subarray(offset,offset+self.max);offset+=chunk.length;c.ack=next;self.send('WRTE',id,c.remote,chunk);}next();},final(done){self.send('CLSE',id,c.remote);done();}});c.ready=()=>resolve(c);c.fail=reject;c.on('error',()=>{});this.channels.set(id,c);this.send('OPEN',id,0,Buffer.from(service+'\0'));});}
 async shell(cmd){return this.exec('shell:'+cmd);}
 async exec(service){const c=await this.open(service),chunks=[];for await(const d of c)chunks.push(d);return Buffer.concat(chunks);}
 async push(file,data){const c=await this.open('sync:'),chunks=[];c.on('data',d=>chunks.push(d));function packet(id,payload){const h=Buffer.alloc(8);h.write(id);h.writeUInt32LE(payload.length,4);return Buffer.concat([h,payload]);}await new Promise((r,j)=>c.write(packet('SEND',Buffer.from(file+',33188')),e=>e?j(e):r()));for(let at=0;at<data.length;at+=65536)await new Promise((r,j)=>c.write(packet('DATA',data.subarray(at,at+65536)),e=>e?j(e):r()));const done=Buffer.alloc(8);done.write('DONE');done.writeUInt32LE(Math.floor(Date.now()/1000),4);await new Promise((r,j)=>c.write(done,e=>e?j(e):r()));await new Promise((r,j)=>{const poll=()=>{const b=Buffer.concat(chunks);if(b.length>=8){clearTimeout(timer);b.subarray(0,4).toString()==='OKAY'?r():j(Error(b.toString()));}else setTimeout(poll,25);};const timer=setTimeout(()=>j(Error('sync timeout')),30000);poll();});c.end();}
 async proxy(service,port=9229){const server=net.createServer(socket=>this.open(service).then(peer=>{socket.pipe(peer).pipe(socket);socket.on('error',()=>peer.destroy());peer.on('error',()=>socket.destroy());peer.on('close',()=>socket.destroy());}).catch(()=>socket.destroy()));await new Promise(r=>server.listen(port,'127.0.0.1',r));return server;}
 close(){for(const c of this.channels.values())c.destroy();this.channels.clear();this.socket.destroy();}
}
module.exports={DirectAdb};
if(require.main===module)(async()=>{const a=await new DirectAdb().connect();console.log((await a.shell('getprop sys.boot_completed; getprop ro.build.version.release; getprop ro.kernel.qemu')).toString());a.close();})().catch(e=>{console.error(e);process.exitCode=1;});
