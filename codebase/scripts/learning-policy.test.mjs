import test from "node:test";
import assert from "node:assert/strict";
import { advanceLearning, isTurnDecision, refineBoundaryDecision } from "../app/lib/learning-policy.ts";
import { initialState } from "./eval-core.mjs";

const objective = {
  id: "topic",
  title: "Test topic",
  required_claims: [{ id: "a" }, { id: "b" }],
  common_misconceptions: [{ id: "wrong" }],
};
const state = () => initialState([objective], "topic");
const decision = (patch = {}) => ({
  intent: "teach",
  assessment: "correct",
  covered_claim_ids: ["a", "b"],
  misconception_id: null,
  issue_type: "none",
  feedback: "Bạn đã giải thích đủ ý.",
  question: "Bạn có thể kể lại phần này theo cách của bạn không?",
  used_claim_ids: ["a", "b"],
  topic_ids: [],
  ...patch,
});

test("all required claims complete immediately", () => {
  const next = advanceLearning(state(), objective, decision()).state;
  assert.equal(next.completed, true);
  assert.equal(next.objectiveStatus.topic, "mastered");
});

test("partial answers retain earlier coverage and complete when the missing claim arrives", () => {
  const first = advanceLearning(state(), objective, decision({ assessment: "partially_correct", covered_claim_ids: ["a"] })).state;
  assert.deepEqual(first.coveredClaimIds, ["a"]);
  assert.equal(first.completed, false);

  const next = advanceLearning(first, objective, decision({ covered_claim_ids: ["b"] })).state;
  assert.deepEqual(next.coveredClaimIds.sort(), ["a", "b"]);
  assert.equal(next.completed, true);
});

test("a later wrong answer never erases previously covered claims", () => {
  const first = advanceLearning(state(), objective, decision({ assessment: "partially_correct", covered_claim_ids: ["a"] })).state;
  const next = advanceLearning(first, objective, decision({ assessment: "incorrect", covered_claim_ids: [], misconception_id: "wrong", issue_type: "misconception" })).state;
  assert.deepEqual(next.coveredClaimIds, ["a"]);
  assert.equal(next.completed, false);
});

test("a verified misconception keeps correct coverage but pauses completion", () => {
  const mixed = advanceLearning(state(), objective, decision({ assessment: "partially_correct", misconception_id: "wrong", issue_type: "misconception" })).state;
  assert.deepEqual(mixed.coveredClaimIds.sort(), ["a", "b"]);
  assert.equal(mixed.completed, false);
});

test("the third incomplete learning attempt offers Tutor even after partial progress", () => {
  let current = state();
  const partial = decision({ assessment: "partially_correct", covered_claim_ids: ["a"] });
  for (let turn = 1; turn <= 3; turn += 1) {
    const result = advanceLearning(current, objective, partial);
    assert.equal(result.offerTutor, turn === 3);
    assert.equal(result.state.completed, false);
    current = result.state;
  }
  assert.equal(current.attemptsPerObjective.topic, 3);
});

test("off-topic chat neither earns credit nor triggers the Tutor modal", () => {
  const offTopic = decision({ intent: "off_topic", assessment: "incorrect", covered_claim_ids: [], misconception_id: null, issue_type: "off_topic" });
  let current = state();
  for (let turn = 0; turn < 3; turn += 1) current = advanceLearning(current, objective, offTopic).state;
  assert.equal(current.turnsWithoutProgress, 0);
  assert.deepEqual(current.coveredClaimIds, []);
});

test("a complete retell after Tutor is accepted immediately", () => {
  const fromTutor = { ...state(), awaitingRetell: true };
  const next = advanceLearning(fromTutor, objective, decision()).state;
  assert.equal(next.completed, true);
  assert.equal(next.awaitingRetell, false);
});

test("complete and misconception labels cannot coexist", () => {
  assert.equal(isTurnDecision(decision({ misconception_id: "wrong", issue_type: "misconception" }), objective), false);
  assert.equal(isTurnDecision(decision({ assessment: "uncertain" }), objective), false);
  assert.equal(isTurnDecision(decision({ covered_claim_ids: ["foreign"] }), objective), false);
  assert.equal(isTurnDecision(decision(), objective), true);
});

test("boundary refinement asks for the missing hierarchy claims", () => {
  const refined = refineBoundaryDecision(
    decision({ assessment: "incorrect", covered_claim_ids: [], used_claim_ids: ["a"] }),
    { ...objective, id: "ai-hierarchy", required_claims: [{ id: "hierarchy" }, { id: "ml-source" }] },
    "LLM là toàn bộ AI, còn ML chỉ là tên khác của deep learning.",
  );
  assert.match(refined.feedback, /LLM không phải toàn bộ AI/);
  assert.match(refined.question, /ML học từ đâu/);
  assert.equal((refined.question.match(/\?/g) ?? []).length, 1);
});

test("boundary refinement does not guess an ambiguous referent", () => {
  const refined = refineBoundaryDecision(
    decision({ assessment: "partially_correct", covered_claim_ids: ["a"] }),
    { ...objective, id: "attention-in-practice" },
    "Để nó ở cuối là model chú ý hơn.",
  );
  assert.match(refined.feedback, /chưa rõ/);
  assert.match(refined.question, /“Nó” ở đây là thông tin nào/);
});

test("boundary refinement asks for parameter and output goal", () => {
  const refined = refineBoundaryDecision(
    decision({ assessment: "incorrect", covered_claim_ids: [] }),
    { ...objective, id: "sampling-controls" },
    "Để 0,7 là ổn chứ?",
  );
  assert.match(refined.question, /temperature hay top_p/);
  assert.match(refined.question, /ổn định hay đa dạng/);
});

test("boundary refinement rejects an absolute RAG claim and asks for verification", () => {
  const refined = refineBoundaryDecision(
    decision({ assessment: "incorrect", covered_claim_ids: [] }),
    {
      ...objective,
      id: "llm-limitations",
      required_claims: [{ id: "cutoff" }, { id: "verification" }],
    },
    "Trang 1 khẳng định RAG luôn tốt hơn fine-tuning. Vì sao nhận định đó đúng?",
  );
  assert.match(refined.feedback, /không thể xác nhận rằng RAG luôn tốt hơn/);
  assert.match(refined.question, /prompt tốt, context sạch, RAG hoặc tools/);
  assert.match(refined.question, /kiểm chứng/);
  assert.equal((refined.question.match(/\?/g) ?? []).length, 1);
});

test("boundary refinement asks for agent capability levels", () => {
  const refined = refineBoundaryDecision(
    decision({ assessment: "incorrect", covered_claim_ids: [] }),
    {
      ...objective,
      id: "agent-capability-levels",
      required_claims: [{ id: "agent-loop" }, { id: "agent-levels" }],
    },
    "Agent là model hoàn toàn khác LLM; chatbot dài hơn là thành agentic AI rồi.",
  );
  assert.match(refined.feedback, /agent không phải model khác LLM/);
  assert.match(refined.question, /vòng làm việc có mục tiêu và hành động/);
  assert.match(refined.question, /các cấp năng lực/);
  assert.equal((refined.question.match(/\?/g) ?? []).length, 1);
});
