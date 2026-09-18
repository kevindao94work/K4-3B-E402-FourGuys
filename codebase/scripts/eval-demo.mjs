import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parseSse,initialState} from './eval-core.mjs';
const root=new URL('../../',import.meta.url);
const demo=JSON.parse(await readFile(new URL('eval/demo-prompts.vi.json',root),'utf8'));
const base=process.env.EVAL_BASE_URL||'http://127.0.0.1:3000';
const map=await (await fetch(`${base}/api/knowledge-map`)).json();
const objectives=map.learning_units.flatMap(u=>u.objectives);
const expected={'đúng':'correct','đúng một phần':'partially_correct','sai':'incorrect'};
const results=[];
for(const c of demo.cac_ca){
 await new Promise(r=>setTimeout(r,12000));
 const result={id:c.id,expected:expected[c.loai]};
 try{
  const response=await fetch(`${base}/api/learn`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userMessage:c.prompt,state:initialState(objectives,c.objectiveId),history:[]}),signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const events=parseSse(await response.text());
  const meta=events.find(e=>e.type==='meta');
  result.events=events;result.assessment=meta.assessment;
  result.checks={classification:meta.assessment===expected[c.loai],noPrematureMastery:!meta.state.completed,preserveObjective:meta.state.currentObjectiveId===c.objectiveId,noPrivateTrace:events.filter(e=>e.type==='trace').every(e=>!e.trace.promptInput&&!e.trace.rawResponse)};
  result.pass=Object.values(result.checks).every(Boolean);
 }catch(e){result.pass=false;result.error=e.message;}
 results.push(result);console.log(`${result.id}: ${result.pass?'PASS':'FAIL'} (${result.assessment||result.error})`);
}
const out=new URL(`eval/results/demo-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,root);
await mkdir(new URL('eval/results/',root),{recursive:true});
await writeFile(out,JSON.stringify({source:map.source,passed:results.filter(r=>r.pass).length,total:results.length,results},null,2));
console.log(fileURLToPath(out));process.exitCode=results.every(r=>r.pass)?0:1;
