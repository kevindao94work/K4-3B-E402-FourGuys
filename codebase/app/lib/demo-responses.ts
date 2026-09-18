import examples from "../../../eval/demo-prompts.vi.json";
import type { MapObjective } from "./knowledge-map-types";

export function demoResponses(objective: MapObjective) {
  const example = (kind: string) => examples.cac_ca.find((item) => item.objectiveId === objective.id && item.loai === kind)?.prompt;
  const incorrect = example("sai") ?? objective.common_misconceptions[0]?.text;
  return [
    { id: "correct", label: "Đủ ý", text: example("đúng") ?? objective.required_claims.map((claim) => claim.text).join(" ") },
    { id: "partial", label: "Đúng một phần", text: example("đúng một phần") ?? objective.required_claims[0]?.text ?? objective.title },
    { id: "incorrect", label: "Sai", text: incorrect ?? "Mình cho rằng kết quả AI tạo ra luôn đúng nên không cần kiểm tra." },
    { id: "off-topic", label: "Ngoài lề", text: "Bún chả ngon lắm." },
  ];
}
