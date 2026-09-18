import { Bot, LoaderCircle, Shuffle, Sparkles } from "lucide-react";
import type { Objective } from "@/app/data/lesson";

interface TopicPickerProps {
  objectives: Objective[];
  selectedObjectiveId: string;
  onSelectObjectiveId: (id: string) => void;
  onPickRandom: () => void;
  onStart: (id: string) => void;
  loading: boolean;
}

export function TopicPicker({
  objectives,
  selectedObjectiveId,
  onSelectObjectiveId,
  onPickRandom,
  onStart,
  loading,
}: TopicPickerProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center overflow-y-auto">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600">
          <Bot size={24} />
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900">
          Chào bạn! Hôm nay chúng mình cùng thảo luận phần nào?
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Hãy chọn một chủ đề bạn muốn thử giảng cho mình nghe, hoặc để mình chọn ngẫu nhiên nhé!
        </p>

        {/* Topic Selector List */}
        <div className="mt-5 space-y-2 text-left">
          {objectives.map((obj, i) => {
            const isSelected = selectedObjectiveId === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => onSelectObjectiveId(obj.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectObjectiveId(obj.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-6 place-items-center rounded-lg text-xs font-bold ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold">{obj.title}</span>
                </div>
                {isSelected && <span className="size-2 rounded-full bg-blue-600" />}
              </div>
            );
          })}
        </div>

        {/* Random Button & Start Button */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPickRandom}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Shuffle size={14} className="text-blue-600" />
            Chọn ngẫu nhiên một chủ đề
          </button>

          <button
            type="button"
            onClick={() => onStart(selectedObjectiveId)}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={15} />
                Đang kết nối bạn học AI...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Bắt đầu thảo luận với bạn học
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
