import { Sparkles } from "lucide-react";

export function CatalogHero() {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-12 pb-10 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
        <Sparkles size={14} /> Trao đổi & hỏi bài cùng AI
      </div>

      <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        Ôn bài hiệu quả bằng cách{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          giảng lại
        </span>{" "}
        cho AI
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Nhập vai người hướng dẫn, cùng bạn học AI thảo luận và giải đáp thắc mắc để
        làm chủ mọi khái niệm cốt lõi trong tài liệu.
      </p>
    </section>
  );
}
