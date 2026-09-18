import path from "node:path";
import { access } from "node:fs/promises";
import OpenAI from "openai";
import {
  failedChecks,
  loadEvalSuite,
  runGoldenCase,
  type EvalCaseResult,
} from "../../../../scripts/eval-runner.mjs";
import { loadKnowledgeMap, objectivesIn } from "@/app/lib/server-knowledge-map";
import { streamResponse } from "@/app/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EvalRequest = {
  caseIds?: unknown;
};

function publicResult(result: EvalCaseResult) {
  return {
    id: result.id,
    category: result.category,
    status: result.status,
    input: result.fixture?.message ?? "",
    response: result.response ?? result.reason ?? "",
    checks: (result.checks ?? []).map((check) => ({
      name: check.name,
      pass: check.pass,
      reason: check.reason,
    })),
    failedChecks: failedChecks(result),
    durationMs: result.durationMs ?? 0,
  };
}

function summary(results: EvalCaseResult[]) {
  const counts = {
    pass: results.filter((result) => result.status === "pass").length,
    fail: results.filter((result) => result.status === "fail").length,
    error: results.filter((result) => result.status === "error").length,
    blocked: results.filter((result) => result.status === "blocked").length,
  };
  return {
    ...counts,
    total: results.length,
    passRate: results.length ? counts.pass / results.length : 0,
  };
}

async function workspaceRoot() {
  const candidates = [process.cwd(), path.resolve(process.cwd(), "..")];
  for (const candidate of candidates) {
    try {
      await access(path.join(candidate, "eval", "golden-set.json"));
      return candidate;
    } catch {
      // Try the next workspace layout.
    }
  }
  throw new Error("Không tìm thấy eval/golden-set.json.");
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.EVAL_UI_ENABLED !== "true") {
    return Response.json({ error: "Golden runner chỉ bật trong môi trường demo." }, { status: 404 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Cần OPENAI_API_KEY để chạy golden test." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as EvalRequest;
  const root = await workspaceRoot();
  const { golden, fixtures } = await loadEvalSuite(root);
  const requestedIds = Array.isArray(body.caseIds)
    ? body.caseIds.filter((id): id is string => typeof id === "string")
    : golden.cases.map((item) => String(item.id));
  const caseIds = [...new Set(requestedIds)];
  const knownIds = new Set(golden.cases.map((item) => String(item.id)));
  const unknownId = caseIds.find((id) => !knownIds.has(id));
  if (unknownId) return Response.json({ error: `Không có golden case: ${unknownId}` }, { status: 400 });
  if (!caseIds.length) return Response.json({ error: "Không có golden case để chạy." }, { status: 400 });
  if (caseIds.length > 30) return Response.json({ error: "Tối đa 30 case mỗi lượt chạy." }, { status: 400 });

  const map = await loadKnowledgeMap();
  const objectives = objectivesIn(map);
  const model = process.env.EVAL_JUDGE_MODEL || "gpt-4o";
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 90000,
    maxRetries: 4,
  });
  const baseUrl = new URL(request.url).origin;

  return streamResponse(async (send) => {
    send({ type: "eval_started", total: caseIds.length, caseIds });
    const results: EvalCaseResult[] = [];

    for (const [index, caseId] of caseIds.entries()) {
      const goldenCase = golden.cases.find((item) => item.id === caseId);
      if (!goldenCase) continue;
      const result = await runGoldenCase({
        root,
        baseUrl,
        goldenCase,
        fixture: fixtures[caseId],
        objectives,
        client,
        model,
      });
      results.push(result);
      send({
        type: "eval_case",
        result: publicResult(result),
        completed: index + 1,
        total: caseIds.length,
      });
    }

    send({
      type: "eval_complete",
      summary: summary(results),
      results: results.map(publicResult),
    });
  });
}
