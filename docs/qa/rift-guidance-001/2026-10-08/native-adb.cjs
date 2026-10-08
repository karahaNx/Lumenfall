'use strict';
// Preserve the existing wire transport, but reject a dropped socket promptly.
const Base=require('../../rift-cast-text-001/finish/direct-adb.cjs');
module.exports=class Adb extends Base{
 async connect(){
  const connecting=super.connect();
  this.socket.once('close',()=>{if(this.closing)return;const error=Error('isolated ADB transport closed');if(this.readyReject)this.readyReject(error);for(const stream of this.streams.values())stream.destroy(error);this.streams.clear();});
  let timer;try{await Promise.race([connecting,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('isolated ADB handshake timeout')),20000);})]);return this;}finally{clearTimeout(timer);}
 }
 close(){this.closing=true;super.close();}
};
