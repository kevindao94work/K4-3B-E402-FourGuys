import type { MapClaim, MapObjective } from "@/app/lib/knowledge-map-types";
import type { SessionState } from "@/app/lib/types";

type RawHistoryMessage = { role?: unknown; content?: unknown };

const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_CHARS = 600;

function compactText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, MAX_HISTORY_CHARS) : "";
}

export function compactHistory(history: RawHistoryMessage[]) {
  return history
    .filter((item) => item.role === "user" || item.role === "student" || item.role === "tutor")
    .map((item) => ({ role: item.role === "student" ? "learner" : item.role, content: compactText(item.content) }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_ITEMS);
}

export function claimById(objective: MapObjective, claimId: string) {
  return objective.required_claims.find((claim) => claim.id === claimId) ?? null;
}

function publicClaim(claim: MapClaim) {
  return { id: claim.id, statement: claim.text };
}

function scopedState(objective: MapObjective, state: SessionState) {
  const claimIds = new Set(objective.required_claims.map((claim) => claim.id));
  const misconceptionIds = new Set(objective.common_misconceptions.map((item) => item.id));
  return {
    covered_claim_ids: state.coveredClaimIds.filter((id) => claimIds.has(id)),
    repeated_misconceptions: Object.entries(state.repeatedMisconceptions)
      .filter(([id, count]) => misconceptionIds.has(id) && count > 0)
      .map(([id, count]) => ({ id, count })),
    turns_without_progress: state.turnsWithoutProgress,
    awaiting_retell: state.awaitingRetell,
  };
}

/**
 * The first turn establishes the whole learning objective.  Later turns may
 * deliberately narrow to one missing claim, but opening with only the first
 * claim makes comparison objectives sound unrelated to their stated goal.
 */
export function learnerOpeningContext(objective: MapObjective) {
  return {
    task: "ask_friendly_objective_opening",
    objective: { id: objective.id, goal: objective.title },
    required_claims: objective.required_claims.map(publicClaim),
  };
}

export function learnerAssessmentContext(objective: MapObjective, state: SessionState, newestUserMessage: string, history: RawHistoryMessage[]) {
  return {
    task: "assess_teachback",
    objective: { id: objective.id, goal: objective.title },
    required_claims: objective.required_claims.map(publicClaim),
    common_misconceptions: objective.common_misconceptions.map((item) => ({ id: item.id, statement: item.text })),
    session: scopedState(objective, state),
    recent_turns: compactHistory(history),
    newest_user_message: compactText(newestUserMessage),
  };
}

/** Intentionally excludes history and lesson content so routing cannot confuse who asked for help. */
export function learnerIntentContext(newestUserMessage: string) {
  return {
    task: "classify_tutor_need",
    newest_user_message: compactText(newestUserMessage),
  };
}

/** The learner only receives its backend-selected target, never the entire lesson scope. */
export function learnerFollowUpContext(objective: MapObjective, action: string, targetClaim: MapClaim, userMessage: string) {
  return {
    task: "ask_one_follow_up_question",
    action,
    objective: { id: objective.id, goal: objective.title },
    target_claim: publicClaim(targetClaim),
    newest_user_message: compactText(userMessage),
  };
}

export function approvedTutorEvidence(targetClaim: MapClaim) {
  return targetClaim.evidence
    .map((item, index) => ({
      id: `${targetClaim.id}:${item.slide_id}:${index}`,
      claim_id: targetClaim.id,
      slide_id: item.slide_id,
      quote: item.supporting_quote,
      review_status: item.review_status,
    }))
    .filter((item) => item.review_status === "approved");
}

export function approvedTutorEvidenceForObjective(objective: MapObjective) {
  return objective.required_claims.flatMap((claim) => approvedTutorEvidence(claim));
}

/** Tutor explains the whole selected objective, so a single accurate retell can complete it. */
export function tutorContext(objective: MapObjective, reason: string | undefined, history: RawHistoryMessage[]) {
  return {
    task: "explain_entire_learning_objective",
    objective: { id: objective.id, goal: objective.title },
    required_claims: objective.required_claims.map(publicClaim),
    reason: compactText(reason),
    approved_evidence: approvedTutorEvidenceForObjective(objective),
    recent_turns: compactHistory(history),
  };
}
