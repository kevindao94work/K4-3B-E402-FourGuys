import path from 'node:path';
import {fileURLToPath} from 'node:url';
import nextEnv from '@next/env';
import OpenAI from 'openai';
import {loadEvalSuite, requestRoute, runGoldenCase, failedChecks} from './eval-runner.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
nextEnv.loadEnvConfig(path.join(root, 'codebase'));
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
};
const caseId = option('--case-id', args[0]);
const baseUrl = option('--base-url', 'http://127.0.0.1:3000');

if (!caseId) throw new Error('Usage: npm run eval:case -- <case-id> [--base-url URL]');
if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY required for semantic judging');

const {golden, fixtures} = await loadEvalSuite(root);
const goldenCase = golden.cases.find(item => item.id === caseId);
if (!goldenCase) throw new Error(`Unknown golden case: ${caseId}`);
const fixture = fixtures[caseId];
const map = await requestRoute(baseUrl, '/api/knowledge-map');
const objectives = map.learning_units.flatMap(unit => unit.objectives);
for (const item of Object.values(fixtures)) {
  if (!item.blocked && !objectives.some(objective => objective.id === item.objectiveId)) {
    throw new Error(`Missing objective ${item.objectiveId}`);
  }
}

const model = process.env.EVAL_JUDGE_MODEL || 'gpt-4o';
const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY, timeout: 90000, maxRetries: 4});
const result = await runGoldenCase({
  root,
  baseUrl,
  goldenCase,
  fixture,
  objectives,
  client,
  model,
});

console.log(`${result.id}: ${result.status.toUpperCase()}`);
console.log(`Input: ${fixture.message}`);
console.log(`Response:\n${result.response || result.reason || '(không có phản hồi)'}`);
if (result.status !== 'pass') {
  console.log('Explanation:');
  for (const failure of failedChecks(result)) console.log(`- ${failure.name}: ${failure.reason}`);
}
console.log(JSON.stringify({
  id: result.id,
  category: result.category,
  status: result.status,
  response: result.response,
  failedChecks: failedChecks(result),
  durationMs: result.durationMs,
}, null, 2));
