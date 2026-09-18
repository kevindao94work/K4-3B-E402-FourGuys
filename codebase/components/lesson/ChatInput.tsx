import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  draft: string;
  onDraftChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInput({ draft, onDraftChange, onSend, disabled }: ChatInputProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
        <textarea
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
