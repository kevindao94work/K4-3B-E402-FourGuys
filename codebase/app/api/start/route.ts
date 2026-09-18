import OpenAI from "openai";
import { appendAiTrace } from "@/app/lib/ai-trace-log";
import { learnerOpeningContext } from "@/app/lib/agent-context";
import { citationsForMapClaims, loadKnowledgeMap, newSessionState, objectiveById } from "@/app/lib/server-knowledge-map";
import { streamCompletionText, streamResponse } from "@/app/lib/sse";

type LearnerQuestion = { question: string; used_claim_id: string };

const learnerQuestionSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "learner_question",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: { question: { type: "string" }, used_claim_id: { type: "string" } },
      required: ["question", "used_claim_id"],
    },
  },
};

const openingInstruction = "Bạn là một người bạn đang nhờ người dùng giải thích bài học, không phải người phỏng vấn. Tạo một tin nhắn mở đầu ngắn bằng tiếng Việt, tự nhiên và gần gũi, xưng ‘mình’ và gọi người dùng là ‘bạn’. Chỉ hỏi đúng MỘT câu về target_claim; không tự giải thích, nêu đáp án, gợi ý, nhắc slide, nguồn hay evidence. Trả về JSON đúng schema.";

function isValidQuestion(value: unknown, targetClaimId: string): value is LearnerQuestion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LearnerQuestion>;
  const question = candidate.question?.trim() ?? "";
  return candidate.used_claim_id === targetClaimId && question.length > 0 && question.length <= 360 && (question.match(/\?/g) ?? []).length === 1;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Bạn học cần OPENAI_API_KEY để phản hồi. Hãy kiểm tra .env.local rồi khởi động lại server." }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { objectiveId?: string };

  return streamResponse(async (send) => {
    const map = await loadKnowledgeMap();
    const objective = objectiveById(map, body.objectiveId ?? "");
    if (!objective) {
      send({ type: "error", error: "Hãy chọn một mục nhỏ trong cây kiến thức trước khi bắt đầu." });
      return;
    }
    const targetClaim = objective.required_claims[0];
    if (!targetClaim) throw new Error("Objective has no required claims");
    const state = newSessionState(map, objective.id);
    send({ type: "meta", state, citations: citationsForMapClaims(objective, [targetClaim.id]) });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const promptInput = JSON.stringify(learnerOpeningContext(objective, targetClaim));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      max_tokens: 120,
      stream: true,
      response_format: learnerQuestionSchema,
      messages: [
        { role: "system", content: openingInstruction },
        { role: "user", content: promptInput },
      ],
    });
    const rawResponse = await streamCompletionText(completion, () => undefined);
    let response: LearnerQuestion;
    try {
      const parsed = JSON.parse(rawResponse) as unknown;
      if (!isValidQuestion(parsed, targetClaim.id)) throw new Error("Invalid learner question");
      response = parsed;
    } catch {
      send({ type: "error", error: "Bạn học chưa tạo được câu hỏi đúng phạm vi. Hãy thử lại." });
      return;
    }

    const saved = await appendAiTrace({
      route: "/api/start",
      agent: "learner",
      model,
      objective: { id: objective.id, title: objective.title },
      prompt: { system: openingInstruction, input: promptInput },
      rawResponse,
    });
    send({ type: "trace", trace: {
      ...saved,
      agent: "learner",
      model,
      objectiveTitle: objective.title,
      action: "Tạo câu hỏi mở đầu",
      summary: `Agent học viên hỏi đúng claim: ${targetClaim.id}.`,
      promptInput,
      rawResponse,
      persisted: true,
    } });
    send({ type: "delta", text: response.question.trim() });
  });
}
