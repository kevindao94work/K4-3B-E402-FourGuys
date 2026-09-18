import {mkdtemp,cp,symlink,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
// Separate working directory and process: never rename or remove the app's real sources.
export async function sourceOutage(appDir,body){
 const isolated=await mkdtemp(path.join(tmpdir(),'teachback-eval-'));
 const work=path.join(isolated,'codebase');await mkdir(work);
 let child;
 try{
  for(const file of ['app','components','tsconfig.json','next.config.ts','package.json','postcss.config.mjs','tailwind.config.ts']) await cp(path.join(appDir,file),path.join(work,file),{recursive:true});
  await symlink(path.join(appDir,'node_modules'),path.join(work,'node_modules'),'dir');
  const port=await new Promise((resolve,reject)=>{const s=createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  child=spawn(process.execPath,[path.join(appDir,'node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',String(port)],{cwd:work,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
  let ready=false;
  for(let i=0;i<60;i++){
   if(child.exitCode!==null)throw new Error('Isolated outage server exited');
   try{await fetch(`http://127.0.0.1:${port}/api/knowledge-map`,{signal:AbortSignal.timeout(1000)});ready=true;break;}catch{await new Promise(r=>setTimeout(r,500));}
  }
  if(!ready)throw new Error('Isolated outage server did not start');
  const response=await fetch(`http://127.0.0.1:${port}/api/learn`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
  return {httpStatus:response.status,raw:await response.text()};
 }finally{
  if(child&&child.exitCode===null){child.kill('SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},5000).unref();});}
  await rm(isolated,{recursive:true,force:true});
 }
}
