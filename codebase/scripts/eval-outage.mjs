import {mkdtemp,cp,symlink,rm,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
// Separate working directory and process: never rename or remove the app's real sources.
export async function sourceOutage(appDir,body){
 const isolated=await mkdtemp(path.join(appDir,'.eval-outage-'));
 const work=path.join(isolated,'codebase');await mkdir(work);
 const evalDir=path.join(isolated,'eval');await mkdir(evalDir);
 let child;
 let serverLog='';
 try{
  for(const file of ['app','components','tsconfig.json','next.config.ts','package.json','postcss.config.mjs','tailwind.config.ts']) await cp(path.join(appDir,file),path.join(work,file),{recursive:true});
  await cp(path.join(appDir,'..','eval','demo-prompts.vi.json'),path.join(evalDir,'demo-prompts.vi.json'));
  await symlink(path.join(appDir,'node_modules'),path.join(work,'node_modules'),process.platform==='win32'?'junction':'dir');
  const port=await new Promise((resolve,reject)=>{const s=createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  child=spawn(process.execPath,[path.join(appDir,'node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',String(port)],{cwd:work,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',chunk=>{serverLog+=chunk.toString();});
  child.stderr.on('data',chunk=>{serverLog+=chunk.toString();});
  let ready=false;
  for(let i=0;i<60;i++){
   if(child.exitCode!==null)throw new Error('Isolated outage server exited');
   try{const response=await fetch(`http://127.0.0.1:${port}/api/learn`,{signal:AbortSignal.timeout(1000)});if(response.ok||response.status===405){ready=true;break;}}catch{/* Server is still starting. */}
   await new Promise(r=>setTimeout(r,500));
  }
  if(!ready)throw new Error(`Isolated outage server did not start: ${serverLog.slice(-5000)}`);
  const response=await fetch(`http://127.0.0.1:${port}/api/learn`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
  return {httpStatus:response.status,raw:await response.text()};
 }finally{
  if(child&&child.exitCode===null){child.kill('SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},5000).unref();});}
  const appRoot=path.resolve(appDir)+path.sep;
  if(!path.resolve(isolated).startsWith(appRoot))throw new Error('Unsafe isolated outage cleanup target');
  await rm(isolated,{recursive:true,force:true});
 }
}
