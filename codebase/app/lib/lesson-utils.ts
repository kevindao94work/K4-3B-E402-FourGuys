import { allClaimIds, allEvidence, lesson } from "@/app/data/lesson";
import type { SessionState } from "@/app/lib/types";

export function currentObjective(state: SessionState) {
  return lesson.objectives.find((objective) => objective.id === state.currentObjectiveId) ?? lesson.objectives[0];
}

export function sourceBundleForObjective(objectiveId: string) {
  const objective = lesson.objectives.find((item) => item.id === objectiveId) ?? lesson.objectives[0];
  const slideIds = new Set(objective.requiredClaims.flatMap((claim) => claim.evidence.map((evidence) => evidence.slideId)));

  return lesson.slides.filter((slide) => slideIds.has(slide.id));
}

export function allowedClaimIds(objectiveId: string) {
  return (lesson.objectives.find((item) => item.id === objectiveId) ?? lesson.objectives[0]).requiredClaims.map(
    (claim) => claim.id,
  );
}

export function nextObjectiveId(currentId: string) {
  const index = lesson.objectives.findIndex((objective) => objective.id === currentId);
  return lesson.objectives[index + 1]?.id ?? null;
}

export function allClaimsCovered(state: SessionState) {
  return allClaimIds.every((id) => state.coveredClaimIds.includes(id));
}

export function evidenceSlideIdsForObjective(objectiveId: string) {
  const objective = lesson.objectives.find((item) => item.id === objectiveId);
  return [...new Set(objective?.requiredClaims.flatMap((claim) => claim.evidence.map((evidence) => evidence.slideId)) ?? [])];
}

export function evidenceForSlide(slideId: string) {
  return allEvidence.filter((evidence) => evidence.slideId === slideId);
}
