import OpenAI from "openai";
import { appendAiTrace } from "@/app/lib/ai-trace-log";
import { learnerOpeningContext } from "@/app/lib/agent-context";
import { citationsForMapClaims, loadKnowledgeMap, requireSourcePdf, newSessionState, objectiveById } from "@/app/lib/server-knowledge-map";
import { streamCompletionJsonFields, streamResponse } from "@/app/lib/sse";

type LearnerQuestion = { question: string; used_claim_ids: string[] };

function countCharacter(text: string, character: string) {
  let count = 0;
  for (const value of text) if (value === character) count += 1;
  return count;
}

function learnerQuestionSchema(requiredClaimIds: string[]) {
  return {
  type: "json_schema" as const,
  json_schema: {
    name: "learner_question",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        used_claim_ids: {
          type: "array",
          items: { type: "string", enum: requiredClaimIds },
          minItems: requiredClaimIds.length,
          maxItems: requiredClaimIds.length,
        },
        question: { type: "string" },
      },
      required: ["question", "used_claim_ids"],
    },
  },
  };
}

const openingInstruction = "Bạn là một người bạn đang hơi mơ hồ và muốn nhờ người dùng giải thích bài học, tuyệt đối không phải người phỏng vấn hay chấm thi. Tạo đúng MỘT câu hỏi mở đầu ngắn bằng tiếng Việt, tự nhiên, gần gũi; xưng ‘mình’ và gọi người dùng là ‘bạn’. Câu hỏi phải mời người dùng kết nối TẤT CẢ required_claims để đạt objective, không được chỉ hỏi một claim riêng lẻ. Hãy hỏi như bạn bè trò chuyện (ví dụ có thể bắt đầu bằng ‘Mình hơi lẫn chỗ này…’), tránh giọng kiểm tra, liệt kê ý, hoặc các mẫu câu kiểu ‘hãy giải thích tại sao’. Không tự giải thích, nêu đáp án, gợi ý, nhắc slide, nguồn hay evidence. Trả về JSON đúng schema.";

function isValidQuestion(value: unknown, requiredClaimIds: string[]): value is LearnerQuestion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LearnerQuestion>;
  const question = candidate.question?.trim() ?? "";
  const usedClaimIds = candidate.used_claim_ids;
  const usesEveryRequiredClaim = Array.isArray(usedClaimIds)
    && usedClaimIds.length === requiredClaimIds.length
    && new Set(usedClaimIds).size === requiredClaimIds.length
    && requiredClaimIds.every((id) => usedClaimIds.includes(id));
  return usesEveryRequiredClaim && question.length > 0 && countCharacter(question, "?") === 1;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Bạn học cần OPENAI_API_KEY để phản hồi. Hãy kiểm tra .env.local rồi khởi động lại server." }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { objectiveId?: string };

  return streamResponse(async (send) => {
    let map;
    try { map = await loadKnowledgeMap(); await requireSourcePdf(map); }
    catch { send({ type: "error", error: "Nguồn bài học không khả dụng. Hãy tải lại nguồn hoặc thử lại sau." }); return; }
    const objective = objectiveById(map, body.objectiveId ?? "");
    if (!objective) {
      send({ type: "error", error: "Hãy chọn một mục nhỏ trong cây kiến thức trước khi bắt đầu." });
      return;
    }
    const requiredClaimIds = objective.required_claims.map((claim) => claim.id);
    if (!requiredClaimIds.length) throw new Error("Objective has no required claims");
    const state = newSessionState(map, objective.id);
    send({ type: "meta", state, citations: citationsForMapClaims(objective, requiredClaimIds) });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const promptInput = JSON.stringify(learnerOpeningContext(objective));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      max_tokens: 500,
      stream: true,
      response_format: learnerQuestionSchema(requiredClaimIds),
      messages: [
        { role: "system", content: openingInstruction },
        { role: "user", content: promptInput },
      ],
    });
    const rawResponse = await streamCompletionJsonFields(completion, ["question"], (_field, text) => {
      send({ type: "delta", text });
    });
    try {
      const parsed = JSON.parse(rawResponse) as unknown;
      if (!isValidQuestion(parsed, requiredClaimIds)) throw new Error("Invalid learner question");
    } catch {
      send({ type: "error", error: "Bạn học chưa tạo được câu hỏi bao quát đúng mục tiêu. Hãy thử lại." });
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
      summary: `Agent học viên mở đầu theo toàn bộ claim của mục tiêu: ${requiredClaimIds.join(", ")}.`,
      promptInput,
      rawResponse,
      persisted: true,
    } });
  });
}
