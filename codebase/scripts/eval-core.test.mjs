import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSse,validateVerdict,summarize} from './eval-core.mjs';
test('does not accept truncated streams or error events even with HTTP 200',()=>{
 assert.throws(()=>parseSse('data: {"type":"meta","state":{}}\n\n'),/missing done/);
 assert.throws(()=>parseSse('data: {"type":"error","error":"upstream failure"}\n\ndata: {"type":"done"}\n\n'),/upstream failure/);
 assert.throws(()=>parseSse('data: {"type":"done"}\n\n'),/Missing session/);
});
test('accepts CRLF streams and assembles all events',()=>{
 assert.equal(parseSse('data: {"type":"meta","state":{}}\r\n\r\ndata: {"type":"delta","text":"xin chào"}\r\n\r\ndata: {"type":"done"}\r\n\r\n')[1].text,'xin chào');
});
test('malformed judge decisions never become passes',()=>{
 assert.throws(()=>validateVerdict({pass:true}));
 assert.throws(()=>validateVerdict(Object.fromEntries(['specific_issue','grounding','learner_role','next_step'].map(k=>[k,{pass:'false',reason:'test'}]))));
});
test('blocked and infrastructure errors stay in denominator and separate from failures',()=>{
 assert.deepEqual(summarize(['pass','fail','error','blocked'].map(status=>({status}))),{pass:1,fail:1,error:1,blocked:1,total:4,passRate:0.25});
});
