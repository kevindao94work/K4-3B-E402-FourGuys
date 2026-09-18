import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export type TraceLogRecord = {
  traceId?: string;
  route: "/api/start" | "/api/learn" | "/api/tutor";
  agent: "learner" | "tutor" | "assessment" | "router" | "policy";
  model: string;
  objective: { id: string; title: string };
  prompt: { system: string; input: string };
  rawResponse: string;
  decision?: Record<string, unknown>;
  loggedAt?: string;
};

export const aiTraceDirectory = path.join(process.cwd(), "storage", "ai-traces");

/** Appends one JSON record per model or policy response for technical auditing. */
export async function appendAiTrace(record: TraceLogRecord) {
  const loggedAt = record.loggedAt ?? new Date().toISOString();
  const traceId = record.traceId ?? randomUUID();
  await mkdir(aiTraceDirectory, { recursive: true });
  await appendFile(
    path.join(aiTraceDirectory, `${loggedAt.slice(0, 10)}.jsonl`),
    `${JSON.stringify({ ...record, traceId, loggedAt })}\n`,
    "utf8",
  );
  return { traceId, loggedAt };
}
