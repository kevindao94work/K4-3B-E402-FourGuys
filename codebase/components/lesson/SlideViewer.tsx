import { BookOpen, ExternalLink } from "lucide-react";

export function SlideViewer({ activePage }: { activePage: number }) {
  const pdfUrl = `/api/source-pdf#page=${Math.max(1, activePage)}&toolbar=1`;

  return (
    <aside className="relative flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white md:w-1/2">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Tài liệu Slide bài giảng</span>
          {activePage > 1 && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">Trang {activePage}</span>}
        </div>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
          Mở tab mới <ExternalLink size={12} />
        </a>
      </div>
      <div className="relative min-h-0 flex-1 bg-slate-200">
        <iframe key={pdfUrl} title="Slide bài giảng" className="h-full w-full border-0 bg-white" src={pdfUrl} />
      </div>
    </aside>
  );
}
