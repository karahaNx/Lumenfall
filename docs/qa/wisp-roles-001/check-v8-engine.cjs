/* Run the existing role assertions on V8 6.0 without altering product code.
 * Node20+ launcher; supply the Node8.3.0 executable as the first argument.
 * This checks JavaScript only, not Android DOM, lifecycle or TalkBack. */
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
async function runLegacy(command,timeout){
 // Node8 cannot identify the socket-based stdio created by modern Node's
 // pipe mode on this host. Regular files preserve the real engine output.
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-node8-io-'));
 const out=path.join(directory,'stdout'),err=path.join(directory,'stderr');
 const fds=[fs.openSync(out,'w'),fs.openSync(err,'w')];
 try{
  let timedOut=false;
  const exitcode=await new Promise((resolve,reject)=>{
   const child=spawn(command[0],command.slice(1),{stdio:['ignore',...fds]});
   const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeout);
   child.once('error',error=>{clearTimeout(timer);reject(error);});
   child.once('close',code=>{clearTimeout(timer);resolve(code);});
  });
  return {exitcode,timed_out:timedOut,stdout:fs.readFileSync(out,'utf8'),stderr:fs.readFileSync(err,'utf8')};
 }finally{fds.forEach(fd=>fs.closeSync(fd));fs.rmSync(directory,{recursive:true,force:true});}
}
async function main(){
 const executable=process.argv[2];assert(executable,'Node8.3.0 executable required');
 const identity=await runLegacy([executable,'-p','JSON.stringify({node:process.version,v8:process.versions.v8})'],5000);
 assert.equal(identity.exitcode,0,identity.stderr);assert.equal(identity.timed_out,false);
 const engine=JSON.parse(identity.stdout);assert.equal(engine.node,'v8.3.0');assert.equal(engine.v8,'6.0.286.52');
 let driver=fs.readFileSync(path.join(root,'tests/behavioral/wisp-roles.cjs'),'utf8');
 function replaceOnce(from,to){assert.equal(driver.split(from).length,2,'legacy test-driver anchor: '+from);driver=driver.replace(from,()=>to);}
 // Only adapt the modern test runner. The VM receives the original product
 // script, unmodified, with no polyfills or newer APIs injected into it.
 driver=driver.replace(/require\('node:([^']+)'\)/g,(_,name)=>"require('"+(name==='assert/strict'?'assert':name)+"')");
 replaceOnce("const root=path.resolve(__dirname,'../..');",'const root='+JSON.stringify(root)+';');
 replaceOnce('globalThis.roles={','window.roles={');
 replaceOnce('const b=ctx.roles,','const b=ctx.window.roles,');
 replaceOnce('s.spirits={...original.spirits};','s.spirits=Object.assign({},original.spirits);');
 const prefix="Object.fromEntries=function(entries){var out={};entries.forEach(function(e){out[e[0]]=e[1];});return out;};\n"+
  "Array.prototype.flatMap=function(fn){return [].concat.apply([],this.map(fn));};\n"+
  "require('assert').deepEqual=require('assert').deepStrictEqual;\n";
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lumenfall-wisp-v8-'));
 try{
  const file=path.join(directory,'driver.cjs');fs.writeFileSync(file,prefix+driver);
  const result=await runLegacy([executable,file,'--source',path.join(root,'index.html')],90000);
  assert.equal(result.timed_out,false,'engine assertions finish');assert.equal(result.exitcode,0,result.stderr);
  const checks=JSON.parse(result.stdout);assert.equal(checks.status,'pass');
  console.log(JSON.stringify({status:'pass',scope:'unmodified product JavaScript on V8 6.0; no native DOM/device claim',engine,checks},null,2));
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
