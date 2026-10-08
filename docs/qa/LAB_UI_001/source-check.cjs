const fs=require('node:fs'),crypto=require('node:crypto');
const acorn=require('internal/deps/acorn/acorn/dist/acorn');
const baseline=fs.readFileSync(process.argv[2],'utf8');
const candidate=fs.readFileSync('index.html','utf8');
const scripts=s=>Array.from(s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),m=>m[1]);
const old=scripts(baseline),next=scripts(candidate);
const allowed=new Set(['projectEarnedEffect','projectEarnedMarkup','studyMotesMarkup','studySpeedMarkup','closeStudySpeed','renderLongStudies','presentControlStates','studyRemainingText','updateStudyProgress','checkAffordability']);
function protectedStatements(code){
 const ast=acorn.parse(code,{ecmaVersion:2017});
 const body=ast.body[0].expression.callee.body.body;
 return body.filter(n=>!(n.type==='FunctionDeclaration'&&allowed.has(n.id.name))&&!(n.type==='VariableDeclaration'&&n.declarations.length===1&&n.declarations[0].id.name==='openStudySpeedId')).map(n=>code.slice(n.start,n.end)).join('\n');
}
if(old.length!==next.length)throw Error('script count changed');
next.forEach(code=>acorn.parse(code,{ecmaVersion:2017}));
if(protectedStatements(old[0])!==protectedStatements(next[0]))throw Error('non-presentation statements changed');
if(old.slice(1).join('')!==next.slice(1).join(''))throw Error('native bridge changed');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({status:'pass',baselineIndexSHA256:hash(baseline),candidateIndexSHA256:hash(candidate),grammar:'ES2017',parser:'Node embedded acorn '+acorn.version,protectedStatementsSHA256:hash(protectedStatements(next[0])),allowedPresentationFunctions:Array.from(allowed),newEphemeralState:'openStudySpeedId',limitation:'Syntax and unchanged-authority proof; not physical WebView60, APK or TalkBack acceptance.'},null,2));
