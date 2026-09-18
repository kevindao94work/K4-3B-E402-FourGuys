"use client";
import { ChevronDown, ClipboardCheck } from "lucide-react";
import type { AgentTrace } from "@/app/lib/types";

function formatAsJson(value: string, fallbackKey: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return JSON.stringify({ [fallbackKey]: value }, null, 2);
  }
}

export function AgentTracePanel({ trace }: { trace: AgentTrace }) {
  const agentLabel = trace.agent === "tutor" ? "Agent trợ giảng" : trace.agent === "policy" ? "Luật điều phối" : "Agent học viên";
  const inputJson = formatAsJson(trace.promptInput, "input");
  const rawResponseJson = formatAsJson(trace.rawResponse, "content");
  const decisionJson = trace.decision ? JSON.stringify(trace.decision, null, 2) : null;

  return (
    <details className="group mt-2 rounded-lg border border-slate-200 bg-white/70 text-left">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold text-slate-500 marker:content-none hover:text-slate-700">
        <ClipboardCheck size={13} className="text-blue-600" />
        <span>Dấu vết xử lý</span>
        <ChevronDown size={13} className="ml-auto transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-slate-100 px-2.5 py-2.5 text-[10px] leading-relaxed text-slate-600">
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
          <dt className="font-semibold text-slate-500">Agent</dt><dd>{agentLabel} · {trace.model}</dd>
          <dt className="font-semibold text-slate-500">Mục tiêu</dt><dd>{trace.objectiveTitle}</dd>
          <dt className="font-semibold text-slate-500">Cách xử lý</dt><dd>{trace.action}</dd>
          <dt className="font-semibold text-slate-500">Tóm tắt</dt><dd>{trace.summary}</dd>
          {trace.decision && <><dt className="font-semibold text-slate-500">Quyết định</dt><dd>Các nhãn và dữ liệu điều phối đã kiểm chứng</dd></>}
          <dt className="font-semibold text-slate-500">Đã lưu</dt><dd>{trace.persisted ? "JSONL trên máy chủ" : "Chưa ghi được file"}</dd>
        </dl>
        <details className="mt-2 rounded-md bg-slate-50 p-2">
          <summary className="cursor-pointer font-semibold text-slate-600">Xem input và phản hồi dạng JSON</summary>
          <p className="mt-2 font-semibold text-slate-500">Input JSON</p>
          <pre className="mt-0.5 max-h-44 overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200 bg-white p-2 font-mono text-[9px] text-slate-600">{inputJson}</pre>
          <p className="mt-2 font-semibold text-slate-500">Phản hồi thô JSON</p>
          <pre className="mt-0.5 max-h-44 overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200 bg-white p-2 font-mono text-[9px] text-slate-600">{rawResponseJson}</pre>
          {decisionJson && <>
            <p className="mt-2 font-semibold text-slate-500">Quyết định / intent đã kiểm chứng</p>
            <pre className="mt-0.5 max-h-44 overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200 bg-white p-2 font-mono text-[9px] text-slate-600">{decisionJson}</pre>
          </>}
        </details>
        <p className="mt-2 text-[9px] text-slate-400">Đây là tóm tắt quyết định và dấu vết I/O để kiểm chứng kỹ thuật; không hiển thị chuỗi suy luận nội bộ.</p>
      </div>
    </details>
  );
}
