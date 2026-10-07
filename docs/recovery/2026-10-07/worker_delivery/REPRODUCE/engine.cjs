const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=__dirname,[,,label,fixture,out]=process.argv,stage=path.join(root,'stage');
const server=http.createServer((req,res)=>fs.readFile(path.join(stage,new URL(req.url,'http://localhost').pathname),(e,d)=>{res.statusCode=e?404:200;res.end(e?'missing':d)}));
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({executablePath:process.env.LUMENFALL_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
 let context=await browser.newContext(),page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
 await page.goto(`http://127.0.0.1:${server.address().port}/${label}/index.html?qaScenario=lab-motes-native&qaFixture=fresh`);await page.waitForFunction(()=>!!window.ownQA);
 let result=await page.evaluate('('+fs.readFileSync(path.resolve(root,fixture),'utf8')+')()');
 if(fixture.endsWith('own_motor.js'))result.scan=await page.evaluate(()=>ownScan);
 result.pageErrors=pageErrors;fs.writeFileSync(path.resolve(root,out),JSON.stringify(result,null,2));
 console.log(JSON.stringify({source:label,status:result.status,cases:result.cases,checks:result.checks,scan:result.scan&&{cases:result.scan.tested,bad:result.scan.bad.length},records:result.records?.length,failedRecords:result.records?.filter(r=>r.status==='fail').map(r=>({name:r.name,message:r.message})),picked:result.picked,rows:result.rows?.filter(r=>r.kills!==undefined).map(r=>({use:r.use,split:r.split,kind:r.kind,expected:r.expected,kills:r.kills,hp:r.result?.state.enemyHp})),errorCount:result.errors?.length,firstErrors:result.errors?.slice(0,5),pageErrors}));
 if(result.status==='fail'||result.rows?.some(r=>r.kills!==undefined&&r.expected!==undefined&&r.kills!==r.expected)||pageErrors.length)process.exitCode=1;
 await context.close();
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e.stack);process.exitCode=1});
