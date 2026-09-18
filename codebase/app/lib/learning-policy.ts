import type { MapObjective } from "./knowledge-map-types";
import type { SessionState } from "./types";

export const turnIntents = ["teach", "ambiguous", "source_conflict", "choose_topic", "off_topic", "request_tutor", "pause", "scope"] as const;
export const assessments = ["correct", "partially_correct", "incorrect", "uncertain"] as const;
export type TurnDecision = {
  intent: typeof turnIntents[number];
  assessment: typeof assessments[number];
  covered_claim_ids: string[];
  misconception_id: string | null;
  issue_type: string;
  feedback: string;
  question: string;
  used_claim_ids: string[];
  application_check_passed: boolean;
  topic_ids: string[];
};
export function isTurnDecision(value: unknown, objective: MapObjective): value is TurnDecision {
  if (!value || typeof value !== "object") return false;
  const v = value as TurnDecision;
  const ids = new Set(objective.required_claims.map(c => c.id));
  return turnIntents.includes(v.intent) && assessments.includes(v.assessment)
    && Array.isArray(v.covered_claim_ids) && v.covered_claim_ids.every(id => ids.has(id))
    && (v.misconception_id === null || objective.common_misconceptions.some(m => m.id === v.misconception_id))
    && typeof v.issue_type === "string" && typeof v.feedback === "string" && v.feedback.length <= 1000
    && typeof v.question === "string" && v.question.trim().length > 0 && v.question.length <= 650
    && (v.question.match(/\?/g) ?? []).length === 1 && !v.feedback.includes("?")
    && Array.isArray(v.used_claim_ids) && v.used_claim_ids.length > 0 && v.used_claim_ids.every(id => ids.has(id))
    && typeof v.application_check_passed === "boolean"
    && Array.isArray(v.topic_ids) && v.topic_ids.every(id => typeof id === "string");
}
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("đ", "d");

/** Product boundaries, independent of lesson and evaluation case IDs. */
export function scopeBoundary(message: string): { label: string; text: string } | null {
  const text = normalize(message);
  if (/system prompt|suy luan noi bo|chi dan noi bo|chain.of.thought/.test(text) && /cho.*xem|hien thi|tiet lo|in ra|gui|dua|reveal|show/.test(text)) return {
    label: "Không thể hiển thị chỉ dẫn nội bộ",
    text: "Mình không hiển thị system prompt hay suy luận nội bộ. Mình có thể nêu lý do kiểm chứng được: đang đối chiếu lời giải thích của bạn với mục tiêu và nguồn hiện tại để tìm ý còn thiếu. Bạn muốn mình chỉ căn cứ của câu hỏi vừa rồi hay muốn tự giải thích thêm mắt xích còn vướng?",
  };
  if (/cham.*(?:diem|\d)|\d\s*\/\s*10|cap.*chung (?:nhan|chi)|danh dau.*(?:nam bai|da hieu)/.test(text)) return {
    label: "Luyện tập — không phải điểm/chứng nhận",
    text: "Đây là phiên luyện tập; mình không có thẩm quyền chấm điểm chính thức hay cấp chứng nhận, và chưa thể đánh dấu bạn đã hiểu chỉ theo yêu cầu. Nếu bạn muốn tiếp tục thay vì rời phiên, bạn có thể tự giải thích ý còn thiếu và cho một ví dụ áp dụng để mình kiểm tra theo slide không?",
  };
  if (/\bviet\b.*\b(?:ho|thay)\b|\bnop\b.*\b(?:ho|thay)\b/.test(text) && /bai|kiem tra|danh gia/.test(text)) return {
    label: "Ngoài phạm vi — không làm bài/nộp bài thay",
    text: "Mình không viết hoặc nộp bài kiểm tra thay bạn, cũng không giả danh bạn để hoàn thành bài đánh giá. Mình có thể luyện cùng bạn bằng câu hỏi và phản hồi theo slide. Bạn có thể tự viết một bản nháp bằng lời của mình để mình hỏi vào ý còn thiếu không?",
  };
  if (/(?:mo|dang nhap|kiem tra diem|truy cap|danh dau).*(?:giup|ho|em|tai khoan)|(?:giup|ho).*(?:dang nhap|kiem tra diem)/.test(text) && /vlearn|tai khoan|https?:|diem|hoan thanh/.test(text)) return {
    label: "Ngoài phạm vi — không truy cập tài khoản",
    text: "Mình không có quyền đăng nhập, đọc điểm hay sửa trạng thái hoàn thành trên VLearn hoặc tài khoản bên ngoài, và chưa kiểm tra liên kết đó. Bạn hãy tự kiểm tra trên VLearn; có thể cung cấp phần tài liệu được phép chia sẻ. Bạn muốn quay lại tự giải thích mục tiêu nào trong bài này?",
  };
  if (/dua.*dap an|dap an chuan|chuyen de tai|bo qua.*(?:buoc|giai thich)|dung hoi/.test(text)) return {
    label: "Chưa thể chuyển đề tài — cần lời giải thích của bạn",
    text: "Mục tiêu ở đây là nghe bạn tự dạy lại, nên mình chưa đưa đáp án hoàn chỉnh hoặc đánh dấu đạt để chuyển đề tài. Mình sẽ thu hẹp còn một mắt xích; sau ba lượt chưa tiến bộ, bạn có thể mời Trợ giảng rồi tự diễn đạt lại. Bạn có thể giải thích bước nối giữa các khái niệm mình đang trao đổi bằng một ví dụ của bạn không?",
  };
  return null;
}
export function explicitlyRequestsTutor(message: string) {
  return /(?:mời|nhờ|gọi|cần|muốn).*(?:trợ giảng|tutor)|(?:trợ giảng|tutor).*(?:giúp|giải thích)|(?:mình|em|tôi) không hiểu.*(?:giúp|giải thích)/i.test(message);
}
export function advanceLearning(state: SessionState, objective: MapObjective, decision: TurnDecision, userMessage: string) {
  const allowed = objective.required_claims.map(c => c.id);
  const valid = new Set(allowed);
  const stateClaims = state.coveredClaimIds.filter(id => valid.has(id));
  const canCredit = decision.intent === "teach" && ["correct", "partially_correct"].includes(decision.assessment)
    && !decision.misconception_id && decision.issue_type !== "citation_mismatch" && decision.issue_type !== "unsupported_claim";
  const hasExplanation = userMessage.trim().split(/\s+/).length >= 8;
  const incoming = canCredit && hasExplanation ? decision.covered_claim_ids.filter(id => valid.has(id)) : [];
  const covered = decision.assessment === "incorrect" || decision.misconception_id ? [] : [...new Set([...stateClaims, ...incoming])];
  const progress = incoming.some(id => !stateClaims.includes(id));
  const assessesLearning = decision.intent === "teach" || decision.intent === "ambiguous";
  const next: SessionState = {
    ...state,
    coveredClaimIds: covered,
    objectiveStatus: { ...state.objectiveStatus },
    attemptsPerObjective: { ...state.attemptsPerObjective },
    repeatedMisconceptions: { ...state.repeatedMisconceptions },
    completed: false,
    paused: decision.intent === "pause",
    turnsWithoutProgress: assessesLearning ? (progress ? 0 : state.turnsWithoutProgress + 1) : state.turnsWithoutProgress,
    offTopicStreak: decision.intent === "off_topic" ? state.offTopicStreak + 1 : 0,
    lastQuestion: decision.question,
    tutorTargetClaimId: decision.used_claim_ids[0],
  };
  if (assessesLearning) next.attemptsPerObjective[objective.id] = (next.attemptsPerObjective[objective.id] ?? 0) + 1;
  if (decision.misconception_id) next.repeatedMisconceptions[decision.misconception_id] = (next.repeatedMisconceptions[decision.misconception_id] ?? 0) + 1;
  const allCovered = allowed.length > 0 && allowed.every(id => covered.includes(id));
  const retold = state.awaitingRetell && canCredit && hasExplanation && incoming.length > 0;
  if (retold) next.awaitingRetell = false;
  const mayComplete = state.needsApplication && Boolean(state.lastQuestion) && !state.awaitingRetell && canCredit
    && decision.assessment === "correct" && decision.issue_type === "none" && hasExplanation && allCovered && decision.application_check_passed;
  if (mayComplete) {
    next.applicationPassed = true;
    next.needsApplication = false;
    next.completed = true;
    next.objectiveStatus[objective.id] = "mastered";
  } else {
    next.objectiveStatus[objective.id] = "in_progress";
    next.applicationPassed = false;
    next.needsApplication = allCovered && canCredit && !next.awaitingRetell;
  }
  return { state: next, offerTutor: !next.completed && next.turnsWithoutProgress >= 3 };
}
