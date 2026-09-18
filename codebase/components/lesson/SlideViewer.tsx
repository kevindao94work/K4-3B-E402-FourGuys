import { BookOpen, ExternalLink } from "lucide-react";

export function SlideViewer({ activePage, sourceVersion, pageCount, filename }: {
  activePage: number; sourceVersion: string; pageCount: number; filename: string;
}) {
  const page = Math.min(Math.max(1, activePage), pageCount || 1);
  const pdfUrl = `/api/source-pdf?v=${encodeURIComponent(sourceVersion)}#page=${page}&toolbar=1`;
  return (
    <aside className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3">
        <div className="min-w-0"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><BookOpen size={16} />Trang {page} / {pageCount}</div><p className="mt-1 truncate text-[10px] text-slate-500" title={filename}>{filename}</p></div>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600">Mở PDF <ExternalLink size={12} /></a>
      </div>
      <iframe key={pdfUrl} title={`Slide bài giảng: ${filename}`} className="min-h-0 w-full flex-1 border-0 bg-slate-100" src={pdfUrl} />
    </aside>
  );
}
