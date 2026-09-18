import OpenAI from "openai";
import { appendAiTrace } from "@/app/lib/ai-trace-log";
import { approvedTutorEvidence, tutorContext } from "@/app/lib/agent-context";
import { citationsForMapClaims, loadKnowledgeMap, objectiveById, safeSessionState } from "@/app/lib/server-knowledge-map";
import { streamCompletionText, streamResponse } from "@/app/lib/sse";
import type { SessionState } from "@/app/lib/types";

type TutorRequest = { state: SessionState; reason?: string; history: { role: string; content: string }[] };
type TutorResponse = { explanation: string; used_evidence_ids: string[]; retell_question: string };

const tutorInstruction = "Bạn là Agent Tutor. Chỉ giải thích target_claim bằng approved_evidence được cung cấp; không dùng kiến thức ngoài phạm vi này. Viết tiếng Việt, giọng đồng cảm, phần explanation tối đa 120 từ. Bắt buộc kết thúc bằng retell_question mời người dùng tự giảng lại. Trả về đúng JSON schema. used_evidence_ids phải có ít nhất một ID evidence được cung cấp.";

const tutorSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "grounded_tutor_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        explanation: { type: "string" },
        used_evidence_ids: { type: "array", items: { type: "string" } },
        retell_question: { type: "string" },
      },
      required: ["explanation", "used_evidence_ids", "retell_question"],
    },
  },
};

function isValidTutorResponse(value: unknown, allowedEvidenceIds: Set<string>): value is TutorResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TutorResponse>;
  const wordCount = typeof candidate.explanation === "string" ? candidate.explanation.trim().split(/\s+/).filter(Boolean).length : Infinity;
  return typeof candidate.explanation === "string"
    && typeof candidate.retell_question === "string"
    && candidate.retell_question.trim().length > 0
    && Array.isArray(candidate.used_evidence_ids)
    && candidate.used_evidence_ids.length > 0
    && candidate.used_evidence_ids.every((id) => typeof id === "string" && allowedEvidenceIds.has(id))
    && wordCount <= 120;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as TutorRequest | null;
  if (!body?.state) return Response.json({ error: "Thiếu trạng thái phiên học." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Trợ giảng cần OPENAI_API_KEY để phản hồi." }, { status: 503 });

  return streamResponse(async (send) => {
    const map = await loadKnowledgeMap();
    const state = safeSessionState(map, body.state);
    const objective = objectiveById(map, state.currentObjectiveId);
    if (!objective) throw new Error("Unknown objective");
    const targetClaim = objective.required_claims.find((claim) => !state.coveredClaimIds.includes(claim.id)) ?? objective.required_claims[0];
    if (!targetClaim) throw new Error("Objective has no required claims");
    const approvedEvidence = approvedTutorEvidence(targetClaim);
    if (!approvedEvidence.length) {
      send({ type: "error", error: "Chưa thể mời Trợ giảng vì phần này chưa có dẫn chứng slide đã được duyệt." });
      return;
    }

    const citations = citationsForMapClaims(objective, [targetClaim.id], true);
    const evidenceSlideIds = citations.flatMap((citation) => citation.slideIds);
    send({ type: "meta", evidenceSlideIds, citations, state: { ...state, tutorUsed: true, awaitingRetell: true, paused: false } });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const promptInput = JSON.stringify(tutorContext(objective, targetClaim, body.reason, body.history));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 300,
      stream: true,
      response_format: tutorSchema,
      messages: [
        { role: "system", content: tutorInstruction },
        { role: "user", content: promptInput },
      ],
    });
    const rawResponse = await streamCompletionText(completion, () => undefined);
    let response: TutorResponse;
    try {
      const parsed = JSON.parse(rawResponse) as unknown;
      if (!isValidTutorResponse(parsed, new Set(approvedEvidence.map((item) => item.id)))) throw new Error("Ungrounded tutor response");
      response = parsed;
    } catch {
      send({ type: "error", error: "Trợ giảng tạo phản hồi không đủ căn cứ từ slide đã duyệt. Hãy thử lại." });
      return;
    }

    const content = `${response.explanation.trim()}\n\n${response.retell_question.trim()}`;
    const saved = await appendAiTrace({
      route: "/api/tutor", agent: "tutor", model, objective: { id: objective.id, title: objective.title },
      prompt: { system: tutorInstruction, input: promptInput }, rawResponse,
      decision: { target_claim_id: targetClaim.id, used_evidence_ids: response.used_evidence_ids },
    });
    send({ type: "delta", text: content });
    send({ type: "trace", trace: {
      ...saved, agent: "tutor", model, objectiveTitle: objective.title,
      action: "Giải thích một claim có evidence đã duyệt",
      summary: `Claim: ${targetClaim.id}; evidence: ${response.used_evidence_ids.join(", ")}.`,
      promptInput, rawResponse, persisted: true,
    } });
  });
}
