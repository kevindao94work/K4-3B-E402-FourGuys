import { ChevronRight } from "lucide-react";
import type { KnowledgeMap } from "@/app/lib/knowledge-map-types";

interface LessonCardProps {
  map: KnowledgeMap | null;
  onEnter: () => void;
}

export function LessonCard({ map, onEnter }: LessonCardProps) {
  const objectives = map?.learning_units.flatMap((unit) => unit.objectives) ?? [];
  const slideCount = map?.source?.page_count ?? new Set(map?.learning_units.flatMap((unit) => unit.slide_ids) ?? []).size;

  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      <div
        onClick={onEnter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              Day 1 · {map?.title ?? "Đang tải bài học"}
            </span>
            <h3 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-blue-600">
              {map?.title ?? "AI & LLM Foundation"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Tự giảng lại kiến thức theo từng mục tiêu học tập</p>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>📄 {slideCount || "…"} trang slide</span>
              <span>•</span>
              <span>🎯 {objectives.length || "…"} mục tiêu ôn tập</span>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition group-hover:bg-blue-700">
              Vào bài học ngay
              <ChevronRight size={15} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
