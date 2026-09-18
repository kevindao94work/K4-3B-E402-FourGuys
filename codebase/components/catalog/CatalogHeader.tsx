import { GraduationCap } from "lucide-react";

export function CatalogHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              TeachBack AI
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              Học sâu bằng cách giảng lại cho bạn học AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs">
            Feynman Method Demo
          </span>
        </div>
      </div>
    </header>
  );
}
