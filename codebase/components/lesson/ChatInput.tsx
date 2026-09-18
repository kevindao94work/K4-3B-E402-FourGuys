import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  draft: string;
  onDraftChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
  examples: { id: string; label: string; text: string }[];
  onFastTrack: () => void;
  fastTrackStep: number | null;
}

export function ChatInput({ draft, onDraftChange, onSend, disabled, examples, onFastTrack, fastTrackStep }: ChatInputProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center gap-1.5" aria-label="Câu mẫu demo">
        <span className="text-[10px] text-slate-400">Điền mẫu:</span>
        {examples.map(example => <button key={example.id} type="button" disabled={disabled} title="Điền vào ô chat để bạn xem và gửi" onClick={() => onDraftChange(example.text)} className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40">{example.label}</button>)}
        <button type="button" onClick={onFastTrack} disabled={disabled} title="Tự gửi 3 câu sai liên tiếp, rồi mời Trợ giảng" className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-40">{fastTrackStep === null ? "Sai ×3 → Tutor" : fastTrackStep === 4 ? "Đang mời Tutor…" : `Đang gửi ${fastTrackStep}/3…`}</button>
      </div>
      <p className="sr-only" role="status">{fastTrackStep === null ? "" : fastTrackStep === 4 ? "Đang mời Trợ giảng" : `Đang gửi câu sai ${fastTrackStep} trên 3`}</p>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
        <textarea
          aria-label="Lời giải thích của bạn"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder="Kể cho bạn ấy nghe theo cách của bạn… (Enter để gửi)"
          className="min-h-8 max-h-24 flex-1 resize-none bg-transparent py-1 text-xs text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!draft.trim() || disabled}
          aria-label="Gửi tin nhắn"
          className="grid size-7 place-items-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          <SendHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
