import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeMap, MapObjective } from "@/app/lib/knowledge-map-types";
import type { SessionState, SourceCitation } from "@/app/lib/types";

export async function loadKnowledgeMap(): Promise<KnowledgeMap> {
  let mapPath = path.join(process.cwd(), "data", "ingested", "d1-knowledge-map.json");
  try {
    await readFile(mapPath, "utf8");
  } catch {
    mapPath = path.join(process.cwd(), "..", "data", "ingested", "d1-knowledge-map.json");
  }
  const raw = await readFile(mapPath, "utf8");
  const map = JSON.parse(raw) as KnowledgeMap;
  if (!map.lesson_id || !Array.isArray(map.learning_units)) throw new Error("Invalid Knowledge Map");
  return map;
}

export function objectivesIn(map: KnowledgeMap) {
  return map.learning_units.flatMap((unit) => unit.objectives);
}

export function objectiveById(map: KnowledgeMap, objectiveId: string) {
  return objectivesIn(map).find((objective) => objective.id === objectiveId) ?? null;
}

export function newSessionState(map: KnowledgeMap, objectiveId: string): SessionState {
  const objective = objectiveById(map, objectiveId) ?? objectivesIn(map)[0];
  if (!objective) throw new Error("Knowledge Map has no objectives");
  return {
    currentObjectiveId: objective.id,
    objectiveStatus: Object.fromEntries(objectivesIn(map).map((item) => [item.id, item.id === objective.id ? "in_progress" : "not_started"])),
    coveredClaimIds: [],
    attemptsPerObjective: {},
    repeatedMisconceptions: {},
    tutorUsed: false,
    awaitingRetell: false,
    needsApplication: false,
    applicationPassed: false,
    offTopicStreak: 0,
    turnsWithoutProgress: 0,
    completed: false,
    paused: false,
  };
}

export function safeSessionState(map: KnowledgeMap, state: SessionState): SessionState {
  const fallback = objectivesIn(map)[0];
  if (!fallback) throw new Error("Knowledge Map has no objectives");
  const objective = objectiveById(map, state.currentObjectiveId) ?? fallback;
  return {
    ...newSessionState(map, objective.id),
    ...state,
    currentObjectiveId: objective.id,
    objectiveStatus: state.objectiveStatus ?? {},
    coveredClaimIds: Array.isArray(state.coveredClaimIds) ? state.coveredClaimIds : [],
    attemptsPerObjective: state.attemptsPerObjective ?? {},
    repeatedMisconceptions: state.repeatedMisconceptions ?? {},
    paused: Boolean(state.paused),
  };
}

export function sourceBundleForMapObjective(objective: MapObjective) {
  const bySlide = new Map<string, { id: string; pdf_page: number; supporting_quotes: string[] }>();
  for (const claim of objective.required_claims) {
    for (const evidence of claim.evidence) {
      const existing = bySlide.get(evidence.slide_id) ?? {
        id: evidence.slide_id,
        pdf_page: evidence.pdf_page,
        supporting_quotes: [],
      };
      if (!existing.supporting_quotes.includes(evidence.supporting_quote)) {
        existing.supporting_quotes.push(evidence.supporting_quote);
      }
      bySlide.set(evidence.slide_id, existing);
    }
  }
  return [...bySlide.values()];
}

/** One grouped citation per response. Its link always targets the first source slide. */
export function citationsForMapClaims(objective: MapObjective, claimIds: string[], approvedOnly = false): SourceCitation[] {
  const selectedIds = new Set(claimIds);
  const evidence = objective.required_claims
    .filter((claim) => selectedIds.has(claim.id))
    .flatMap((claim) => claim.evidence)
    .filter((item) => !approvedOnly || item.review_status === "approved")
    .sort((left, right) => left.pdf_page - right.pdf_page);
  if (!evidence.length) return [];
  const first = evidence[0];
  const uniqueSlides = [...new Set(evidence.map((item) => item.slide_id))];
  const uniquePages = [...new Set(evidence.map((item) => item.pdf_page))];
  const pageLabel = uniquePages.length === 1 ? `Trang PDF ${uniquePages[0]}` : `Trang PDF ${uniquePages.join(", ")}`;
  return [{
    id: `${objective.id}-sources`,
    label: pageLabel,
    firstSlideId: first.slide_id,
    firstPdfPage: first.pdf_page,
    slideIds: uniqueSlides,
    supportingQuotes: [...new Set(evidence.map((item) => item.supporting_quote))],
    reviewStatus: evidence.every((item) => item.review_status === "approved") ? "approved" : "review_required",
  }];
}

export function citationsForMapObjective(objective: MapObjective): SourceCitation[] {
  return citationsForMapClaims(objective, objective.required_claims.map((claim) => claim.id));
}

export function allClaimsCoveredForMap(map: KnowledgeMap, state: SessionState) {
  return objectivesIn(map)
    .flatMap((objective) => objective.required_claims)
    .every((claim) => state.coveredClaimIds.includes(claim.id));
}

/** Missing/empty PDFs must not silently become a successful source-grounded turn. */
export async function requireSourcePdf(map: KnowledgeMap) {
  if (!map.source?.pdf) throw new Error("Missing source PDF metadata");
  const filename = path.basename(map.source.pdf);
  let info;
  try { info = await stat(path.join(process.cwd(), "data", "slides", filename)); }
  catch { info = await stat(path.join(process.cwd(), "..", "data", "slides", filename)); }
  if (!info.isFile() || info.size === 0) throw new Error("Source PDF unavailable");
}
