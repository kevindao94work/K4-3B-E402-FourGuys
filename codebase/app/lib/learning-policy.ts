import type { MapObjective } from "./knowledge-map-types";
import type { SessionState } from "./types";

/** The learner has only three knowledge outcomes. Off-topic is a routing outcome. */
export const turnIntents = ["teach", "off_topic"] as const;
export const assessments = ["correct", "partially_correct", "incorrect"] as const;

export type TurnDecision = {
  intent: typeof turnIntents[number];
  assessment: typeof assessments[number];
  /** Claims demonstrated correctly in this message only. */
  covered_claim_ids: string[];
  misconception_id: string | null;
  issue_type: "none" | "misconception" | "off_topic";
  feedback: string;
  question: string;
  used_claim_ids: string[];
  topic_ids: string[];
};

/**
 * Keep a few high-cost domain boundaries deterministic after model assessment.
 * The model still decides the learner state and covered claims; this helper
 * only prevents a known ambiguous prompt from losing the required next step.
 */
export function refineBoundaryDecision(
  decision: TurnDecision,
  objective: MapObjective,
  userMessage: string,
): TurnDecision {
  const next = { ...decision };
  const message = userMessage.toLowerCase();

  if (objective.id === "ai-hierarchy" && message.includes("llm là toàn bộ ai")) {
    next.feedback = "Bạn đang trộn hai ý: LLM không phải toàn bộ AI, và ML không đồng nghĩa với deep learning; blog ngoài không thay cho sơ đồ nguồn hiện tại.";
    next.question = "Bạn hãy đặt LLM vào chuỗi AI → ML → deep learning → generative AI → LLM và giải thích ML học từ đâu?";
    next.assessment = "incorrect";
    next.misconception_id = "llm-is-all-ai";
    next.issue_type = "misconception";
    next.covered_claim_ids = [];
    next.used_claim_ids = objective.required_claims.map((claim) => claim.id);
  }

  if (objective.id === "context-window" && message.includes("nhét hết lịch sử")) {
    next.feedback = "Mình chưa thể kết luận rằng nhét hết lịch sử sẽ giúp model nhớ tốt hơn; context có giới hạn.";
    next.question = "Bạn có thể giải thích vì sao context bị giới hạn, và context quá dài ảnh hưởng chi phí hoặc tốc độ hay khiến thông tin quan trọng bị bỏ sót như thế nào không?";
    next.assessment = "incorrect";
    next.covered_claim_ids = [];
    next.misconception_id = "context-is-unlimited-memory";
    next.issue_type = "misconception";
  }

  if (objective.id === "attention-in-practice" && /\bnó\b|\bđó\b|ở cuối/.test(message)) {
    next.feedback = "Mình chưa rõ “nó” là thông tin nào nên không muốn tự đoán ý bạn.";
    next.question = "“Nó” ở đây là thông tin nào, và bạn hãy giải thích attention liên quan thế nào đến việc đặt thông tin ở đầu hoặc cuối prompt?";
    next.assessment = "partially_correct";
    next.misconception_id = "attention-selects-one-word";
    next.issue_type = "misconception";
  }

  if (objective.id === "sampling-controls" && /\b0[,.]7\b/.test(message)) {
    next.feedback = "Mình chưa biết 0,7 là giá trị của temperature hay top_p, cũng chưa biết bạn ưu tiên ổn định hay đa dạng.";
    next.question = "Bạn đang nói về temperature hay top_p, và mục tiêu của bạn là đầu ra ổn định hay đa dạng?";
    next.assessment = "incorrect";
    next.covered_claim_ids = [];
    next.misconception_id = null;
    next.issue_type = "none";
  }

  return next;
}

function countCharacter(text: string, character: string) {
  let count = 0;
  for (const value of text) if (value === character) count += 1;
  return count;
}

export function isTurnDecision(value: unknown, objective: MapObjective): value is TurnDecision {
  if (!value || typeof value !== "object") return false;
  const decision = value as TurnDecision;
  const claimIds = new Set(objective.required_claims.map((claim) => claim.id));
  const misconceptionIds = new Set(objective.common_misconceptions.map((item) => item.id));
  const hasOnlyKnownClaims = (ids: unknown) => Array.isArray(ids) && ids.every((id) => typeof id === "string" && claimIds.has(id));

  return turnIntents.includes(decision.intent)
    && assessments.includes(decision.assessment)
    && hasOnlyKnownClaims(decision.covered_claim_ids)
    && hasOnlyKnownClaims(decision.used_claim_ids)
    && decision.used_claim_ids.length > 0
    && (decision.misconception_id === null || misconceptionIds.has(decision.misconception_id))
    && ["none", "misconception", "off_topic"].includes(decision.issue_type)
    && typeof decision.feedback === "string" && decision.feedback.length <= 1000 && !decision.feedback.includes("?")
    && typeof decision.question === "string" && decision.question.trim().length > 0 && decision.question.length <= 650
    && countCharacter(decision.question, "?") === 1
    && Array.isArray(decision.topic_ids) && decision.topic_ids.every((id) => typeof id === "string")
    // A complete answer cannot simultaneously be a core misconception.
    && (decision.assessment !== "correct" || (decision.misconception_id === null && decision.issue_type === "none"));
}

/**
 * Progress is monotonic: a later wrong answer never erases claims the learner
 * already demonstrated. A verified core misconception pauses completion while
 * keeping every claim the learner demonstrated correctly.
 */
export function advanceLearning(state: SessionState, objective: MapObjective, decision: TurnDecision) {
  const allowedClaimIds = objective.required_claims.map((claim) => claim.id);
  const allowed = new Set(allowedClaimIds);
  const priorCoverage = state.coveredClaimIds.filter((id) => allowed.has(id));
  const earnsCredit = decision.intent === "teach" && decision.assessment !== "incorrect";
  const incomingCoverage = earnsCredit ? decision.covered_claim_ids.filter((id) => allowed.has(id)) : [];
  const coveredClaimIds = [...new Set([...priorCoverage, ...incomingCoverage])];
  const madeProgress = incomingCoverage.some((id) => !priorCoverage.includes(id));
  const learningAttempt = decision.intent === "teach";
  const completed = allowedClaimIds.length > 0
    && allowedClaimIds.every((id) => coveredClaimIds.includes(id))
    && decision.misconception_id === null;

  const next: SessionState = {
    ...state,
    coveredClaimIds,
    objectiveStatus: { ...state.objectiveStatus },
    attemptsPerObjective: { ...state.attemptsPerObjective },
    repeatedMisconceptions: { ...state.repeatedMisconceptions },
    completed,
    paused: false,
    awaitingRetell: completed ? false : state.awaitingRetell,
    turnsWithoutProgress: learningAttempt ? (madeProgress ? 0 : state.turnsWithoutProgress + 1) : state.turnsWithoutProgress,
  };

  if (learningAttempt) next.attemptsPerObjective[objective.id] = (next.attemptsPerObjective[objective.id] ?? 0) + 1;
  if (decision.misconception_id) next.repeatedMisconceptions[decision.misconception_id] = (next.repeatedMisconceptions[decision.misconception_id] ?? 0) + 1;
  next.objectiveStatus[objective.id] = completed ? "mastered" : "in_progress";

  const attemptsForObjective = next.attemptsPerObjective[objective.id] ?? 0;
  return {
    state: next,
    // A learner may make partial progress on every turn and still need help.
    // Offer Tutor once, on the third answer attempt that has not completed the
    // objective; off-topic messages never count as attempts.
    offerTutor: !completed && learningAttempt && attemptsForObjective === 3,
  };
}
