import { ArrowLeft, Award, RotateCcw, Sparkles } from "lucide-react";
import type { LearningPeer } from "@/app/lib/learning-peer";

interface LessonHeaderProps {
  onBack: () => void;
  currentTopicTitle: string;
  friend: LearningPeer;
  started: boolean;
  activeSpeaker: "learner" | "tutor" | null;
  onOpenDashboard: () => void;
  onReset: () => void;
}

export function LessonHeader({ onBack, currentTopicTitle, friend, started, activeSpeaker, onOpenDashboard, onReset }: LessonHeaderProps) {
  const tutorIsSpeaking = activeSpeaker === "tutor";
  const speakerName = tutorIsSpeaking ? "Trợ giảng" : friend.name;
  const speakerSubtitle = tutorIsSpeaking ? `Đang hỗ trợ: ${currentTopicTitle}` : started ? `${friend.name} cần bạn giúp: ${currentTopicTitle}` : friend.preview;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onBack} title="Quay lại danh mục" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><ArrowLeft size={18} /></button>
        <div className={`relative grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${tutorIsSpeaking ? "bg-violet-100 text-violet-700" : friend.avatarClass}`}>
          {tutorIsSpeaking ? <Sparkles size={15} /> : friend.avatar}
          <span className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white ${tutorIsSpeaking ? "bg-violet-500" : "bg-emerald-500"}`} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-xs font-extrabold text-slate-900">{speakerName}</h3>
          <p className="max-w-40 truncate text-[10px] text-slate-500 sm:max-w-xs">{speakerSubtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {started && <button type="button" onClick={onOpenDashboard} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"><Award size={14} /><span className="hidden sm:inline">Kết quả</span></button>}
        <button type="button" onClick={onReset} title="Làm lại từ đầu" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><RotateCcw size={16} /></button>
      </div>
    </header>
  );
}
