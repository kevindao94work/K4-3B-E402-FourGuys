import { ChevronRight } from "lucide-react";
import { allMapObjectives, type KnowledgeMap } from "@/app/lib/knowledge-map-types";

export function LessonCard({ map, loading, error, onEnter, onRetry }: {
  map: KnowledgeMap | null; loading: boolean; error: string; onEnter: () => void; onRetry: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      {error ? <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm"><p>{error}</p><button onClick={onRetry} className="mt-3 font-bold text-blue-700">Tải lại tài liệu</button></div> :
        <button onClick={onEnter} disabled={!map || loading} className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md disabled:opacity-60">
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">Day 1 · Tự giải thích để hiểu bài</span>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{map?.title ?? "Đang tải tài liệu…"}</h3>
          <p className="mt-2 break-all text-xs text-slate-500">{map?.source.pdf.split("/").pop()}</p>
          {map && <p className="mt-4 text-sm text-slate-600">{map.source.page_count} trang PDF · {map.learning_units.length} nhóm kiến thức · {allMapObjectives(map).length} mục tiêu</p>}
          <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Xem cây kiến thức và slide <ChevronRight size={15} /></span>
        </button>}
    </section>
  );
}
