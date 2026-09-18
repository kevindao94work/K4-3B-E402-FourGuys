import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {sourceOutage} from './eval-outage.mjs';
import {gradeResponse} from './eval-judge.mjs';
import {parseSse,initialState,dimensions} from './eval-core.mjs';

export async function loadEvalSuite(root) {
  const goldenRaw = await readFile(path.join(root, 'eval/golden-set.json'), 'utf8');
  const fixtureRaw = await readFile(path.join(root, 'eval/fixtures.json'), 'utf8');
  const golden = JSON.parse(goldenRaw);
  const fixtures = JSON.parse(fixtureRaw);
  const ids = golden.cases.map(c => c.id);
  if (
    new Set(ids).size !== ids.length ||
    golden.cases.some(c => !fixtures[c.id]) ||
    Object.keys(fixtures).some(id => !golden.cases.some(c => c.id === id))
  ) {
    throw new Error('Fixture IDs must match golden case IDs exactly');
  }
  return {goldenRaw, fixtureRaw, golden, fixtures};
}

export async function requestRoute(baseUrl, route, body, {allowSseError = false} = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: body ? 'POST' : 'GET',
    headers: {'Content-Type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  if (!body) return response.json();
  const raw = await response.text();
  if (!allowSseError) return parseSse(raw);
  return raw.split(/\r?\n\r?\n/).filter(Boolean).map(block => {
    const data = block.split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart())
      .join('\n');
    return data ? JSON.parse(data) : null;
  }).filter(Boolean);
}

export async function runGoldenCase({
  root,
  baseUrl,
  goldenCase,
  fixture,
  objectives,
  client,
  model,
  repeat = 1,
  recorded = null,
}) {
  const started = Date.now();
  const c = goldenCase;
  const f = fixture;
  const result = {
    id: c.id,
    category: c['lớp'],
    repeat,
    fixture: f,
    status: 'blocked',
    checks: [],
    response: '',
    durationMs: 0,
  };

  if (recorded && ['error', 'blocked'].includes(recorded.status)) {
    return {...recorded, durationMs: recorded.durationMs ?? Date.now() - started};
  }
  if (f.blocked) {
    result.reason = f.blocked;
    result.durationMs = Date.now() - started;
    return result;
  }

  try {
    const objective = objectives.find(o => o.id === f.objectiveId);
    if (!objective) throw new Error(`Missing objective ${f.objectiveId}`);
    const state = initialState(objectives, f.objectiveId);
    const history = f.history || [{
      role: 'student',
      content: f.opening || `Bạn giải thích giúp mình ${objective.title.toLowerCase()} được không?`,
    }];
    result.request = {userMessage: f.message, state, history};

    if (f.fault === 'source_unavailable') {
      result.outage = recorded
        ? recorded.outage
        : await sourceOutage(path.join(root, 'codebase'), result.request);
      const outageEvents = result.outage.raw
        .split(/\r?\n/)
        .filter(line => line.startsWith('data:'))
        .map(line => JSON.parse(line.slice(5)));
      result.response = outageEvents.map(e => e.text || e.error || '').filter(Boolean).join('\n');
      const falselyCompleted = outageEvents.some(e => e.state?.completed);
      result.checks.push({
        name: 'source_outage_recovery',
        pass: !falselyCompleted && /nguồn|tài liệu|slide/i.test(result.response) && /thử lại|tải lại|tạm dừng/i.test(result.response),
        reason: 'Phải thông báo rõ nguồn không khả dụng, cho phép tải/thử lại và không xác nhận hiểu bài; thông báo lỗi AI chung chung chưa đáp ứng yêu cầu.',
      });
      result.status = result.checks.every(check => check.pass) ? 'pass' : 'fail';
      result.durationMs = Date.now() - started;
      return result;
    }

    const events = recorded ? recorded.events : await requestRoute(baseUrl, '/api/learn', result.request);
    result.events = events;
    let meta = events.find(event => event.type === 'meta');
    result.response = events.filter(event => event.type === 'delta').map(event => event.text).join('');

    if (meta.callTutor) {
      const tutorEvents = recorded
        ? recorded.tutorEvents
        : await requestRoute(baseUrl, '/api/tutor', {
          state: meta.state,
          reason: meta.tutorReason,
          history: [...history, {role: 'user', content: f.message}],
        }, {allowSseError: true});
      result.tutorEvents = tutorEvents;
      const tutorError = tutorEvents.find(event => event.type === 'error');
      result.response += '\n' + tutorEvents
        .filter(event => event.type === 'delta' || event.type === 'error')
        .map(event => event.text || event.error)
        .join('');
      if (tutorError) {
        result.checks.push({
          name: 'tutor_source_boundary',
          pass: c['Tutor bị chặn bởi evidence'] === true && /dẫn chứng|slide|nguồn/i.test(tutorError.error || ''),
          reason: 'Tutor không có approved evidence phải nêu giới hạn nguồn; lỗi Tutor bất ngờ ở case khác không được chấp nhận.',
        });
      } else {
        meta = tutorEvents.find(event => event.type === 'meta');
      }
    }

    if (!meta?.state) throw new Error('Missing session state in learner/tutor response');
    const completionAllowed = c['cho phép hoàn tất'] === true;
    const completed = meta.state.completed || meta.state.objectiveStatus[f.objectiveId] === 'mastered';
    result.checks.push({
      name: 'completion_boundary',
      pass: completionAllowed ? completed : !completed,
      reason: completionAllowed
        ? 'Ca này đã chứng minh đủ required_claims nên phải đi tới hoàn tất đúng objective.'
        : 'Ca golden yêu cầu làm rõ, sửa hiểu sai hoặc kiểm tra sâu hơn trước khi xác nhận đã hiểu.',
    });
    result.checks.push({
      name: 'preserve_objective',
      pass: meta.state.currentObjectiveId === f.objectiveId,
      reason: 'Không tự chuyển mục tiêu học đã chọn.',
    });
    const evidence = objective.required_claims.flatMap(claim => claim.evidence);
    const citations = [...events, ...(result.tutorEvents || [])]
      .filter(event => event.type === 'meta')
      .flatMap(event => event.citations || []);
    result.checks.push({
      name: 'valid_live_citations',
      pass: citations.every(citation =>
        citation.slideIds.every(id => evidence.some(item => item.slide_id === id)) &&
        evidence.some(item => item.slide_id === citation.firstSlideId && item.pdf_page === citation.firstPdfPage)
      ),
      reason: 'Dẫn nguồn phải tồn tại trong mục tiêu hiện hành; chưa đối chiếu số slide của tài liệu golden cũ.',
    });

    if (!client) throw new Error('OPENAI_API_KEY required for semantic judging');
    const firstMeta = events.find(event => event.type === 'meta');
    const judged = await gradeResponse(client, model, {
      scenario: c['tình huống cụ thể'],
      expected: c['hành vi mong muốn'],
      userMessage: f.message,
      response: result.response,
      controls: {offerTutor: firstMeta.offerTutor, callTutor: firstMeta.callTutor},
      state: meta.state,
      liveObjective: objective,
    });
    result.judgeUsage = judged.usage;
    result.judge = judged.verdict;
    result.judgeRaw = judged.raw;
    result.checks.push(...dimensions.map(name => ({name, ...result.judge[name]})));
    result.status = result.checks.every(check => check.pass) ? 'pass' : 'fail';
  } catch (error) {
    result.status = 'error';
    result.reason = error instanceof Error ? error.message : String(error);
  }
  result.durationMs = Date.now() - started;
  return result;
}

export function failedChecks(result) {
  return (result.checks || []).filter(check => !check.pass).map(check => ({
    name: check.name,
    reason: check.reason,
  }));
}
