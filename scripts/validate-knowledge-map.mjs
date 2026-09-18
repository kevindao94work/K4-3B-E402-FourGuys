import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mapPath = path.join(root, "data", "ingested", "d1-knowledge-map.json");
const indexPath = path.join(root, "data", "ingested", "d1-slide-index.md");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const index = fs.readFileSync(indexPath, "utf8");
const slideIds = new Set([...index.matchAll(/^## \[(d1-p\d{3})\]/gm)].map((match) => match[1]));
const indexSections = new Map();
const headings = [...index.matchAll(/^## \[(d1-p\d{3})\]/gm)];
for (let i = 0; i < headings.length; i += 1) {
  const heading = headings[i];
  const start = heading.index ?? 0;
  const end = headings[i + 1]?.index ?? index.length;
  indexSections.set(heading[1], index.slice(start, end));
}
const problems = [];
const evidence = [];
const normalize = (value) => value
  .toLocaleLowerCase("vi-VN")
  .replaceAll("**", "")
  .replace(/[“”‘’]/g, '"')
  .replace(/\s+/g, " ")
  .trim();
const unitIds = new Set(map.learning_units.map((unit) => unit.id));
const objectiveIds = new Set();

for (const unit of map.learning_units) {
  if (!unit.slide_ids?.length) problems.push(`${unit.id}: missing slide_ids`);
  for (const objective of unit.objectives ?? []) {
    if (objectiveIds.has(objective.id)) problems.push(`duplicate objective id: ${objective.id}`);
    objectiveIds.add(objective.id);
    if (!objective.required_claims?.length) problems.push(`${objective.id}: missing required_claims`);
    for (const claim of objective.required_claims ?? []) {
      if (!claim.evidence?.length) problems.push(`${claim.id}: missing evidence`);
      for (const item of claim.evidence ?? []) {
        evidence.push(item);
        if (!slideIds.has(item.slide_id)) problems.push(`${claim.id}: unknown slide ${item.slide_id}`);
        if (!item.supporting_quote?.trim()) problems.push(`${claim.id}: missing supporting_quote`);
        const slideText = indexSections.get(item.slide_id) ?? "";
        if (item.supporting_quote?.trim() && !normalize(slideText).includes(normalize(item.supporting_quote))) {
          problems.push(`${claim.id}: quote not found in indexed ${item.slide_id}: ${item.supporting_quote}`);
        }
      }
    }
  }
}

for (const unit of map.learning_units) {
  for (const [from, to] of unit.dependencies ?? []) {
    if (!objectiveIds.has(from) || !objectiveIds.has(to)) problems.push(`${unit.id}: invalid objective dependency ${from} → ${to}`);
  }
}
for (const [from, to] of map.cross_unit_dependencies ?? []) {
  if (!unitIds.has(from) || !unitIds.has(to)) problems.push(`invalid unit dependency ${from} → ${to}`);
}

const supportedPages = new Set(evidence.map((item) => item.slide_id));
const unrepresentedLearningPages = map.scope.learning_pages.filter((slideId) => !supportedPages.has(slideId));
if (unrepresentedLearningPages.length) problems.push(`Learning pages with no evidence: ${unrepresentedLearningPages.join(", ")}`);

if (problems.length) {
  console.error("Knowledge Map validation failed:\n- " + problems.join("\n- "));
  process.exit(1);
}

const objectiveCount = map.learning_units.reduce((total, unit) => total + unit.objectives.length, 0);
const claimCount = map.learning_units.reduce(
  (total, unit) => total + unit.objectives.reduce((count, objective) => count + objective.required_claims.length, 0),
  0,
);
console.log(`Knowledge Map valid: ${map.learning_units.length} units, ${objectiveCount} objectives, ${claimCount} claims, ${evidence.length} evidence links.`);
