import { ChevronRight } from "lucide-react";
import type { Lesson } from "@/app/data/lesson";

interface LessonCardProps {
  lesson: Lesson;
  onEnter: () => void;
}

export function LessonCard({ lesson, onEnter }: LessonCardProps) {
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
              Day 1 · AI & LLM Foundation
            </span>
            <h3 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-blue-600">
              {lesson.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{lesson.subtitle}</p>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>⏱️ {lesson.duration}</span>
              <span>•</span>
              <span>📄 {lesson.slides.length} trang slide</span>
              <span>•</span>
              <span>🎯 {lesson.objectives.length} chủ đề ôn tập</span>
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
