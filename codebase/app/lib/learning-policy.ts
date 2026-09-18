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
