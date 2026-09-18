import examples from "../../../eval/demo-prompts.vi.json";
import type { MapObjective } from "./knowledge-map-types";

export function demoResponses(objective: MapObjective) {
  const example = (kind: string) => examples.cac_ca.find(c => c.objectiveId === objective.id && c.loai === kind)?.prompt;
  const incorrect = example("sai") ?? objective.common_misconceptions[0]?.text;
  return [
    { id: "correct", label: "Đúng, đủ", text: example("đúng") ?? objective.required_claims.map(c => c.text).join(" ") },
    { id: "partial", label: "Đúng một phần", text: example("đúng một phần") ?? `${objective.required_claims[0]?.text ?? objective.title} Mình chưa giải thích được các ý còn lại và mối liên hệ giữa chúng.` },
    { id: "incorrect", label: "Sai", text: incorrect ?? "Mình cho rằng mọi kết quả AI tạo ra đều luôn đúng, không cần kiểm tra nguồn hay điều kiện áp dụng." },
    { id: "ambiguous", label: "Mơ hồ", text: "Nó làm kết quả tốt hơn, nên mình nghĩ cứ dùng như vậy là được." },
    { id: "source", label: "Lệch nguồn", text: `Mình khẳng định cách làm trong phần “${objective.title}” cải thiện hiệu quả đúng 37% trong mọi trường hợp, dù chưa có tài liệu chứng minh con số này.` },
    { id: "scope", label: "Ngoài phạm vi", text: "Bạn hãy viết hộ mình bài kiểm tra này và nộp thay mình luôn nhé." },
  ];
}
