"use client";
import { ChevronDown, ClipboardCheck } from "lucide-react";
import type { AgentTrace } from "@/app/lib/types";

export function AgentTracePanel({ trace }: { trace: AgentTrace }) {
  return <details className="group mt-2 rounded-lg border border-slate-200 bg-white/70 text-left">
    <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold text-slate-500"><ClipboardCheck size={13} className="text-blue-600" /><span>Vì sao hỏi câu này?</span><ChevronDown size={13} className="ml-auto" /></summary>
    <div className="space-y-1 border-t border-slate-100 p-2.5 text-[10px] leading-relaxed text-slate-600">
      <p><b>Mục tiêu:</b> {trace.objectiveTitle}</p><p><b>Trạng thái:</b> {trace.action}</p><p>{trace.summary}</p>
      <p className="text-slate-400">Lý do và nguồn có thể kiểm chứng; không hiển thị chỉ dẫn hay suy luận nội bộ.</p>
    </div>
  </details>;
}
