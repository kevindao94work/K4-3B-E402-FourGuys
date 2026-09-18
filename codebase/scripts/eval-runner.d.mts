export type EvalCheck = { name: string; pass: boolean; reason: string };
export type EvalCaseResult = {
  id: string;
  category?: string;
  repeat?: number;
  fixture?: { message?: string };
  status: "pass" | "fail" | "error" | "blocked";
  checks?: EvalCheck[];
  response?: string;
  reason?: string;
  durationMs?: number;
  [key: string]: unknown;
};

export function loadEvalSuite(root: string): Promise<{
  goldenRaw: string;
  fixtureRaw: string;
  golden: { cases: Array<Record<string, unknown>> };
  fixtures: Record<string, Record<string, unknown>>;
}>;
export function requestRoute(baseUrl: string, route: string, body?: unknown, options?: { allowSseError?: boolean }): Promise<any>;
export function runGoldenCase(options: Record<string, unknown>): Promise<EvalCaseResult>;
export function failedChecks(result: EvalCaseResult): Array<{ name: string; reason: string }>;
