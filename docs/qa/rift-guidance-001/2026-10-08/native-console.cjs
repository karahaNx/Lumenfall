'use strict';
// Task-owned emulator hardware input. Console replies never include its token.
const fs=require('node:fs'),net=require('node:net'),assert=require('node:assert/strict');
module.exports=class Console {
 async connect(){
  this.buffer='';this.pending=[];this.socket=net.connect(5554,'127.0.0.1');
  this.socket.on('data',b=>{this.buffer+=b;const match=this.buffer.match(/(?:^|\n)(?:OK|KO[^\n]*)\r?\n$/);if(match&&this.pending.length){const item=this.pending.shift(),text=this.buffer;this.buffer='';clearTimeout(item.timer);item.resolve(text);}});
  this.socket.on('error',error=>{for(const p of this.pending.splice(0)){clearTimeout(p.timer);p.reject(error);}});
  await this.read();
  const token=fs.readFileSync(process.env.LUMENFALL_EMULATOR_CONSOLE_TOKEN_FILE||'/home/agent/.emulator_console_auth_token','utf8').trim();
  assert(token&&!/[\r\n]/.test(token),'local console token available');
  await this.command('auth '+token);assert(/^RiftGuidance\r?\n/.test(await this.command('avd name')),'task-owned emulator console only');return this;
 }
 read(){return new Promise((resolve,reject)=>{const item={resolve,reject,timer:setTimeout(()=>reject(Error('task emulator console timeout')),20000)};this.pending.push(item);if(/(?:^|\n)(?:OK|KO[^\n]*)\r?\n$/.test(this.buffer)){this.pending.shift();clearTimeout(item.timer);const text=this.buffer;this.buffer='';resolve(text);}});}
 async command(command){const result=this.read();this.socket.write(command+'\n');const text=await result;assert(/(?:^|\n)OK\r?\n$/.test(text),'task emulator console command accepted');return text;}
 async gesture(points){assert(points.length>=4);for(const p of points)assert(p.every(v=>Number.isInteger(v)&&v>=0&&v<=32767));for(const [x,y]of points){await this.command('event mouse '+x+' '+y+' 0 1');await new Promise(r=>setTimeout(r,25));}const last=points.at(-1);await this.command('event mouse '+last[0]+' '+last[1]+' 0 0');}
 close(){if(this.socket)this.socket.destroy();for(const p of this.pending.splice(0)){clearTimeout(p.timer);p.reject(Error('task emulator console closed'));}}
};
