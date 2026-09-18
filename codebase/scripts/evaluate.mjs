import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import nextEnv from '@next/env';
import {sourceOutage} from './eval-outage.mjs';
import {vietnameseReport} from './eval-report-vi.mjs';
import OpenAI from 'openai';
import {gradeResponse,calibrateJudge,judgePrompt,judgeVersion} from './eval-judge.mjs';
import {parseSse,initialState,dimensions,summarize} from './eval-core.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
nextEnv.loadEnvConfig(path.join(root,'codebase'));
const args=process.argv.slice(2);
const option=(name,fallback)=> {const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const base=option('--base-url','http://127.0.0.1:3000');
const repeats=Number(option('--repeat','1'));
const intervalMs=Number(option('--interval-ms','12000'));
if(!Number.isFinite(intervalMs)||intervalMs<0)throw new Error('--interval-ms must be nonnegative');
if(!Number.isInteger(repeats)||repeats<1) throw new Error('--repeat must be a positive integer');
const hash=s=>createHash('sha256').update(s).digest('hex');
const goldenRaw=await readFile(path.join(root,'eval/golden-set.json'),'utf8');
const fixtureRaw=await readFile(path.join(root,'eval/fixtures.json'),'utf8');
const golden=JSON.parse(goldenRaw),fixtures=JSON.parse(fixtureRaw);
if(new Set(golden.cases.map(c=>c.id)).size!==golden.cases.length || golden.cases.some(c=>!fixtures[c.id]) || Object.keys(fixtures).some(id=>!golden.cases.some(c=>c.id===id))) throw new Error('Fixture IDs must match golden case IDs exactly');
const request=async(route,body)=>{
 const response=await fetch(`${base}${route}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(120000)});
 if(!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
 return body?parseSse(await response.text()):response.json();
};
const map=await request('/api/knowledge-map');
const objectives=map.learning_units.flatMap(u=>u.objectives);
for(const f of Object.values(fixtures)) if(!f.blocked&&!objectives.some(o=>o.id===f.objectiveId)) throw new Error(`Missing objective ${f.objectiveId}`);
if(args.includes('--validate')) {console.log(`Validated ${golden.cases.length} cases and objective mappings; including isolated source-outage injection.`);process.exit(0);}
if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY required for semantic judging');
const model=process.env.EVAL_JUDGE_MODEL||'gpt-4o';
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:90000,maxRetries:4});
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const out=path.resolve(option('--output',path.join(root,'eval/results',runId)));
await mkdir(out,{recursive:true});
const metadata={runId,base,repeats,intervalMs,judgeModel:model,judgeVersion,configuredAppModel:process.env.OPENAI_LEARN_MODEL||process.env.OPENAI_MODEL||'gpt-4o-mini',gitCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),gitStatus:execFileSync('git',['status','--short'],{cwd:root,encoding:'utf8'}).trim(),goldenSha256:hash(goldenRaw),fixturesSha256:hash(fixtureRaw),mapSha256:hash(JSON.stringify(map)),judgePrompt,sourceExpected:golden.source_policy.authoritative_source,sourceActual:map.source,officialEligible:false,limitations:['Golden set has no approved human review.','Source deck differs; exact golden citations and rendered UI are not evaluated.','truth-08 runs against an isolated copy with the knowledge map absent.','Single response per case; future multi-turn completion and three-attempt escalation are not covered.','Semantic verdicts are model judgments, not human-verified labels.']};
await writeFile(path.join(out,'metadata.json'),JSON.stringify(metadata,null,2));
const replayFile=option('--replay',null);
let replayRecords=null;
if(replayFile){
 const replayPath=path.resolve(replayFile);
 const previous=JSON.parse(await readFile(path.join(path.dirname(replayPath),'metadata.json'),'utf8'));
 if(previous.mapSha256!==metadata.mapSha256||previous.goldenSha256!==metadata.goldenSha256||previous.fixturesSha256!==metadata.fixturesSha256) throw new Error('Replay requires identical source map, golden set and fixtures');
 replayRecords=(await readFile(replayPath,'utf8')).trim().split('\n').map(line=>JSON.parse(line));
 metadata.replayOf=replayPath;
}
const calibration=await calibrateJudge(client,model,golden,map);
await writeFile(path.join(out,'calibration.json'),JSON.stringify(calibration,null,2));
if(!calibration.passed) throw new Error(`Grader failed control cases; do not score the suite. See ${out}/calibration.json`);
await writeFile(path.join(out,'metadata.json'),JSON.stringify(metadata,null,2));
console.log('Grader calibration: 5/5 control cases passed.');
const results=[];
for(let repeat=1;repeat<=repeats;repeat++) for(const c of golden.cases){
 await new Promise(resolve=>setTimeout(resolve,intervalMs));
 const recorded=replayRecords?.find(r=>r.id===c.id&&r.repeat===repeat);
 if(replayRecords&&!recorded)throw new Error(`Replay missing ${c.id}/${repeat}`);
 const f=fixtures[c.id];const r={id:c.id,category:c['lớp'],repeat,fixture:f,status:'blocked',checks:[],response:'',durationMs:0};const started=Date.now();
 if(recorded&&['error','blocked'].includes(recorded.status))Object.assign(r,recorded);
 else if(f.blocked) r.reason=f.blocked;
 else try {
  const state=initialState(objectives,f.objectiveId);
  const history=f.history||[{role:'student',content:f.opening||`Bạn giải thích giúp mình ${objectives.find(o=>o.id===f.objectiveId).title.toLowerCase()} được không?`}];
  r.request={userMessage:f.message,state,history};
  if(f.fault==='source_unavailable') {
   r.outage=recorded?recorded.outage:await sourceOutage(path.join(root,'codebase'),r.request);
   const outageEvents=r.outage.raw.split(/\r?\n/).filter(l=>l.startsWith('data:')).map(l=>JSON.parse(l.slice(5)));
   r.response=outageEvents.map(e=>e.text||e.error||'').filter(Boolean).join('\n');
   const falselyCompleted=outageEvents.some(e=>e.state?.completed);
   r.checks.push({name:'source_outage_recovery',pass:!falselyCompleted&&/nguồn|tài liệu|slide/i.test(r.response)&&/thử lại|tải lại|tạm dừng/i.test(r.response),reason:'Phải thông báo rõ nguồn không khả dụng, cho phép tải/thử lại và không xác nhận hiểu bài; thông báo lỗi AI chung chung chưa đáp ứng yêu cầu.'});
   r.status=r.checks.every(c=>c.pass)?'pass':'fail';
  } else {
  const events=recorded?recorded.events:await request('/api/learn',r.request);r.events=events;
  let meta=events.find(e=>e.type==='meta');
  r.response=events.filter(e=>e.type==='delta').map(e=>e.text).join('');
  if(meta.callTutor){
   const tutor=recorded?recorded.tutorEvents:await request('/api/tutor',{state:meta.state,reason:meta.tutorReason,history:[...history,{role:'user',content:f.message}]});
   r.tutorEvents=tutor;r.response+='\n'+tutor.filter(e=>e.type==='delta').map(e=>e.text).join('');
   meta=tutor.find(e=>e.type==='meta');
  }
  r.checks.push({name:'no_premature_mastery',pass:!meta.state.completed&&meta.state.objectiveStatus[f.objectiveId]!=='mastered',reason:'Ca golden yêu cầu làm rõ, sửa hiểu sai hoặc kiểm tra sâu hơn trước khi xác nhận đã hiểu.'});
  r.checks.push({name:'preserve_objective',pass:meta.state.currentObjectiveId===f.objectiveId,reason:'Không tự chuyển mục tiêu học đã chọn.'});
  const objective=objectives.find(o=>o.id===f.objectiveId);
  const evidence=objective.required_claims.flatMap(c=>c.evidence);
  const citations=[...events,...(r.tutorEvents||[])].filter(e=>e.type==='meta').flatMap(e=>e.citations||[]);
  r.checks.push({name:'valid_live_citations',pass:citations.every(c=>c.slideIds.every(id=>evidence.some(e=>e.slide_id===id))&&evidence.some(e=>e.slide_id===c.firstSlideId&&e.pdf_page===c.firstPdfPage)),reason:'Dẫn nguồn phải tồn tại trong mục tiêu hiện hành; chưa đối chiếu số slide của tài liệu golden cũ.'});
  const judged=await gradeResponse(client,model,{scenario:c['tình huống cụ thể'],expected:c['hành vi mong muốn'],userMessage:f.message,response:r.response,controls:{offerTutor:events.find(e=>e.type==='meta').offerTutor,callTutor:events.find(e=>e.type==='meta').callTutor},state:meta.state,liveObjective:objective});
  r.judgeUsage=judged.usage;r.judge=judged.verdict;r.judgeRaw=judged.raw;
  r.checks.push(...dimensions.map(name=>({name,...r.judge[name]})));
  r.status=r.checks.every(c=>c.pass)?'pass':'fail';
  }
 }catch(error){r.status='error';r.reason=error.message;}
 r.durationMs=Date.now()-started;results.push(r);
 await appendFile(path.join(out,'cases.jsonl'),JSON.stringify(r)+'\n');
 console.log(`[${results.length}/${golden.cases.length*repeats}] ${r.id} ${r.status}: ${r.reason||r.checks.filter(c=>!c.pass).map(c=>c.name).join(', ')}`);
}
const summary=summarize(results);
const byCategory=Object.fromEntries([...new Set(results.map(r=>r.category))].map(k=>[k,summarize(results.filter(r=>r.category===k))]));
const failuresByCheck={};for(const r of results)for(const c of r.checks)if(!c.pass)failuresByCheck[c.name]=(failuresByCheck[c.name]||0)+1;
const report={...metadata,summary,byCategory,failuresByCheck,responseGatePassed:summary.pass===summary.total,officialGatePassed:false};
await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
await writeFile(path.join(out,'report.md'),vietnameseReport(metadata,results,summary,byCategory,failuresByCheck));
console.log(JSON.stringify({output:out,...summary,failuresByCheck},null,2));
process.exitCode=summary.pass===summary.total?0:1;
