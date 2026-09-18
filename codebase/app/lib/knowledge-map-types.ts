export type MapEvidence = {
  type: "slide";
  slide_id: string;
  pdf_page: number;
  supporting_quote: string;
  evidence_type: "text" | "visual";
  review_status: "approved" | "auto_generated" | "needs_review";
};

export type MapClaim = {
  id: string;
  text: string;
  evidence: MapEvidence[];
};

export type MapObjective = {
  id: string;
  title: string;
  required_claims: MapClaim[];
  common_misconceptions: { id: string; text: string; severity: "core" }[];
};

export type LearningUnit = {
  id: string;
  title: string;
  slide_ids: string[];
  status: string;
  objectives: MapObjective[];
  dependencies: [string, string][];
};

export type KnowledgeMap = {
  lesson_id: string;
  title: string;
  source: {
    pdf: string;
    page_count: number;
    sha256?: string;
    slide_index?: string;
    generated_at?: string;
    generation_method?: string;
  };
  learning_units: LearningUnit[];
  cross_unit_dependencies: [string, string][];
};

export type DashboardObjective = Pick<MapObjective, "id" | "title">;

export function allMapObjectives(map: KnowledgeMap) {
  return map.learning_units.flatMap((unit) => unit.objectives);
}
