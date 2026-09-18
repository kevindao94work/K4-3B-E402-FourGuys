export function parseSse(text) {
  const events = text.split(/\r?\n\r?\n/).filter(Boolean).map(block => {
    const data = block.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    return data ? JSON.parse(data) : null;
  }).filter(Boolean);
  if (!events.some(e => e.type === 'done')) throw new Error('Incomplete SSE response (missing done)');
  const errors = events.filter(e => e.type === 'error');
  if (errors.length) throw new Error(errors.map(e => e.error).join('; '));
  if (!events.some(e => e.type === 'meta' && e.state)) throw new Error('Missing session state');
  return events;
}
export function initialState(objectives, id) {
  return {currentObjectiveId:id, objectiveStatus:Object.fromEntries(objectives.map(o=>[o.id,o.id===id?'in_progress':'not_started'])),coveredClaimIds:[],attemptsPerObjective:{},repeatedMisconceptions:{},tutorUsed:false,awaitingRetell:false,turnsWithoutProgress:0,completed:false,paused:false};
}
export const dimensions = ['specific_issue','grounding','learner_role','next_step'];
export function validateVerdict(v) {
  if (!v || Object.keys(v).length !== dimensions.length || !dimensions.every(k => typeof v[k]?.pass === 'boolean' && typeof v[k]?.reason === 'string' && v[k].reason.trim())) throw new Error('Invalid judge verdict');
  return v;
}
export function summarize(results) {
  const counts = Object.fromEntries(['pass','fail','error','blocked'].map(s=>[s,results.filter(r=>r.status===s).length]));
  return {...counts,total:results.length,passRate: results.length ? counts.pass/results.length : 0};
}
