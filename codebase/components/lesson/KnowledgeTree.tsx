import { BookOpen, ChevronDown, CircleHelp, LoaderCircle } from "lucide-react";
import { peerForObjective } from "@/app/lib/learning-peer";
import type { KnowledgeMap, MapObjective } from "@/app/lib/knowledge-map-types";

interface KnowledgeTreeProps {
  map: KnowledgeMap | null;
  selectedObjectiveId: string;
  onSelectObjective: (objective: MapObjective) => void;
  loading?: boolean;
  error?: string;
}

export function KnowledgeTree({ map, selectedObjectiveId, onSelectObjective, loading, error }: KnowledgeTreeProps) {
  return (
    <aside className="flex h-full w-full min-w-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><BookOpen size={17} /></div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">Cây kiến thức</h1>
            <p className="text-[11px] text-slate-500">{map?.learning_units.length ?? 0} nhóm · {map?.learning_units.reduce((n, unit) => n + unit.objectives.length, 0) ?? 0} mục tiêu</p>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading && <div className="flex items-center gap-2 px-3 py-4 text-xs text-slate-500"><LoaderCircle size={15} className="animate-spin text-blue-600" /> Đang tải Knowledge Map...</div>}
        {error && <p className="m-2 rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">{error}</p>}
        {map?.learning_units.map((unit, index) => (
          <details key={unit.id} open={index === 0} className="group rounded-xl">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2.5 py-2.5 text-left hover:bg-slate-50">
              <ChevronDown size={15} className="shrink-0 text-slate-400 transition group-open:rotate-180" />
              <span className="min-w-0 flex-1 text-xs font-extrabold text-slate-800">{unit.title}</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{unit.objectives.length}</span>
            </summary>
            <div className="mb-1 ml-5 border-l border-slate-200 pl-2">
              {unit.objectives.map((objective) => {
                const selected = objective.id === selectedObjectiveId;
                const peer = peerForObjective(objective);
                return (
                  <button
                    key={objective.id}
                    type="button"
                    disabled={loading}
                    onClick={() => onSelectObjective(objective)}
                    className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 ${selected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <CircleHelp size={14} className={`mt-0.5 shrink-0 ${selected ? "text-blue-600" : "text-slate-400"}`} />
                    <span>
                      <span className={`block text-[11px] font-bold ${selected ? "text-blue-900" : "text-slate-700"}`}>{objective.title}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">{peer.name} muốn bạn giúp phần này</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
      <div className="m-3 rounded-xl bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">
        Cây này chỉ cho biết chủ đề. AI chưa tạo câu hỏi cho đến khi bạn bấm bắt đầu trò chuyện.
      </div>
    </aside>
  );
}
