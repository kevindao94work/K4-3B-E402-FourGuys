"use client";

import { useMemo, useRef, useState } from "react";

type EvalCheck = { name: string; pass: boolean; reason: string };
type EvalResult = {
  id: string;
  category?: string;
  status: "pass" | "fail" | "error" | "blocked";
  input: string;
  response: string;
  checks: EvalCheck[];
  failedChecks: Array<{ name: string; reason: string }>;
  durationMs: number;
};
type EvalSummary = { pass: number; fail: number; error: number; blocked: number; total: number; passRate: number };

function statusLabel(status: EvalResult["status"]) {
  return status === "pass" ? "Đạt" : status === "fail" ? "Không đạt" : status === "error" ? "Lỗi" : "Chưa chạy";
}

function statusClass(status: EvalResult["status"]) {
  return status === "pass"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "fail"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
}

async function consumeEvalStream(
  onEvent: (event: Record<string, unknown>) => void,
  signal: AbortSignal,
) {
  const response = await fetch("/api/eval/golden", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    signal,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload.error === "string" ? payload.error : "Không thể chạy golden test.");
  }
  if (!response.body) throw new Error("Trình duyệt không nhận được luồng đánh giá.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let doneReceived = false;
  const consumeBlock = (block: string) => {
    const line = block.split("\n").find((item) => item.startsWith("data: "));
    if (!line) return;
    const event = JSON.parse(line.slice(6)) as Record<string, unknown>;
    if (event.type === "error") throw new Error(typeof event.error === "string" ? event.error : "Golden test gặp lỗi.");
    if (event.type === "done") doneReceived = true;
    onEvent(event);
  };

  while (true) {
    const next = await reader.read();
    buffer += decoder.decode(next.value, { stream: !next.done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";
    for (const block of blocks) consumeBlock(block);
    if (next.done) break;
  }
  if (buffer.trim()) consumeBlock(buffer);
  if (!doneReceived) throw new Error("Golden test bị gián đoạn.");
}

export function GoldenRunPanel() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  const orderedResults = useMemo(() => [...results].sort((left, right) => left.id.localeCompare(right.id)), [results]);

  async function run() {
    if (running) return;
    controller.current?.abort();
    controller.current = new AbortController();
    setOpen(true);
    setRunning(true);
    setCompleted(0);
    setTotal(0);
    setResults([]);
    setSummary(null);
    setError("");
    try {
      await consumeEvalStream((event) => {
        if (event.type === "eval_started") {
          setTotal(typeof event.total === "number" ? event.total : 0);
        }
        if (event.type === "eval_case" && event.result) {
          setCompleted(typeof event.completed === "number" ? event.completed : 0);
          setResults((previous) => [...previous, event.result as EvalResult]);
        }
        if (event.type === "eval_complete") {
          setSummary(event.summary as EvalSummary);
        }
      }, controller.current.signal);
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError(caught instanceof Error ? caught.message : "Golden test gặp lỗi.");
      }
    } finally {
      setRunning(false);
      controller.current = null;
    }
  }

  function close() {
    if (running) controller.current?.abort();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        disabled={running}
        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-wait disabled:opacity-60"
      >
        {running ? `Đang chạy ${completed}/${total || "…"}` : "Chạy golden test"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Golden test">
          <section className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet-600">Evaluation console</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Golden set — Agent học trò</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Chạy các case hiện hành và giải thích vì sao từng case đạt hoặc không đạt.</p>
              </div>
              <button type="button" onClick={close} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">Đóng</button>
            </header>

            <div className="space-y-5 p-5 sm:p-7">
              {running && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Đang chạy {completed}/{total || "…"} case. Không đóng tab nếu muốn xem đầy đủ kết quả.
                </div>
              )}
              {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

              {summary && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Pass" value={summary.pass} tone="text-emerald-700" />
                  <Metric label="Không đạt" value={summary.fail} tone="text-rose-700" />
                  <Metric label="Lỗi" value={summary.error + summary.blocked} tone="text-amber-700" />
                  <Metric label="Tỷ lệ pass" value={`${(summary.passRate * 100).toFixed(1)}%`} tone="text-violet-700" />
                </div>
              )}

              {!results.length && !running && !error && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Bấm “Chạy golden test” để bắt đầu.</div>
              )}

              <div className="space-y-3">
                {orderedResults.map((result) => (
                  <details key={`${result.id}-${result.durationMs}`} className="rounded-2xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">{result.id}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{result.category || "Không phân nhóm"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
                    </summary>
                    <div className="space-y-4 border-t border-slate-100 px-4 py-4 text-sm">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Câu hỏi / input</p>
                        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 leading-relaxed text-slate-700">{result.input}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Phản hồi của agent</p>
                        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-blue-50/60 p-3 leading-relaxed text-slate-700">{result.response || "(Không có phản hồi)"}</p>
                      </div>
                      {result.failedChecks.length > 0 && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-rose-700">Vì sao không đạt</p>
                          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-rose-900">
                            {result.failedChecks.map((failure) => <li key={failure.name}><strong>{failure.name}:</strong> {failure.reason}</li>)}
                          </ul>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400">Thời gian: {result.durationMs} ms</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</p></div>;
}
