import { Award, CheckCircle2, X } from "lucide-react";
import type { DashboardObjective } from "@/app/lib/knowledge-map-types";

export type DashboardStats = {
  total: number;
  masteredCount: number;
  firstTryCount: number;
  tutorHelpCount: number;
  skippedCount: number;
  masteryLevel: {
    title: string;
    tone: string;
    desc: string;
  };
  needReviewList: { objective: DashboardObjective; reason: string }[];
  skippedList: DashboardObjective[];
  masteredList: DashboardObjective[];
};

interface SummaryDashboardProps {
  stats: DashboardStats;
  onClose: () => void;
  onReset: () => void;
  onStartObjective: (id: string) => void;
  onBackToCatalog: () => void;
}

export function SummaryDashboard({
  stats,
  onClose,
  onReset,
  onStartObjective,
  onBackToCatalog,
}: SummaryDashboardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-blue-600 text-white">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bảng Tổng Kết Buổi Ôn Tập
              </h3>
              <p className="text-xs text-slate-500">
                Đánh giá chi tiết năng lực giải thích & độ thấu hiểu kiến thức
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Overall Assessment Banner */}
          <div className={`rounded-xl border p-4 ${stats.masteryLevel.tone}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Đánh giá tổng quan
              </span>
              <span className="text-xs font-bold">
                {stats.masteredCount}/{stats.total} Chủ đề đạt
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold">
              {stats.masteryLevel.title}
            </h4>
            <p className="mt-0.5 text-xs opacity-90">
              {stats.masteryLevel.desc}
            </p>
          </div>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Đã giải thích được
              </span>
              <span className="mt-1 text-xl font-extrabold text-emerald-600 block">
                {stats.masteredCount}
              </span>
              <span className="text-[10px] text-slate-400">
                trên {stats.total} chủ đề
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Giải thích được ngay
              </span>
              <span className="mt-1 text-xl font-extrabold text-blue-600 block">
                {stats.firstTryCount}
              </span>
              <span className="text-[10px] text-slate-400">ngay từ lần đầu</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Cần Trợ giảng
              </span>
              <span className="mt-1 text-xl font-extrabold text-violet-600 block">
                {stats.tutorHelpCount}
              </span>
              <span className="text-[10px] text-slate-400">lần hỗ trợ</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Bỏ qua chưa giảng
              </span>
              <span className="mt-1 text-xl font-extrabold text-slate-500 block">
                {stats.skippedCount}
              </span>
              <span className="text-[10px] text-slate-400">chủ đề chưa chọn</span>
            </div>
          </div>

          {/* Distinct Section: CẦN ÔN TẬP LẠI */}
          <div>
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wide">
              <span>⚠️ Cần ôn tập lại</span>
              <span className="rounded bg-rose-100 px-1.5 text-[10px] text-rose-800">
                {stats.needReviewList.length}
              </span>
            </h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Các phần bạn học còn hiểu nhầm hoặc bạn cần đến sự hỗ trợ của Trợ giảng:
            </p>

            {stats.needReviewList.length > 0 ? (
              <div className="mt-2 space-y-2">
                {stats.needReviewList.map(({ objective, reason }) => (
                  <div
                    key={objective.id}
                    className="flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50/50 p-3"
                  >
                    <div>
                      <span className="text-xs font-bold text-rose-950">
                        {objective.title}
                      </span>
                      <p className="text-[11px] text-rose-700 mt-0.5">{reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStartObjective(objective.id)}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-rose-700"
                    >
                      Ôn lại ngay
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 text-center">
                Không có chủ đề nào bị hiểu nhầm nghiêm trọng trong phiên này!
              </div>
            )}
          </div>

          {/* Distinct Section: BỎ QUA CHƯA GIẢI THÍCH */}
          <div>
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">
              <span>⏭️ Bỏ qua chưa giải thích</span>
              <span className="rounded bg-slate-100 px-1.5 text-[10px] text-slate-600">
                {stats.skippedList.length}
              </span>
            </h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Các chủ đề bạn chưa chọn ôn tập trong buổi này (có thể bạn đã nắm vững rồi hoặc để dành ôn buổi khác):
            </p>

            {stats.skippedList.length > 0 ? (
              <div className="mt-2 space-y-2">
                {stats.skippedList.map((obj) => (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <span className="text-xs font-medium text-slate-700">
                      {obj.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartObjective(obj.id)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Bắt đầu chủ đề này
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 text-center">
                Bạn đã chạm tới tất cả các chủ đề trong bài học!
              </div>
            )}
          </div>

          {/* Mastered list summary */}
          {stats.masteredList.length > 0 && (
            <div>
              <h5 className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                <CheckCircle2 size={13} />
                <span>Đã giải thích thành công</span>
                <span className="rounded bg-emerald-100 px-1.5 text-[10px] text-emerald-800">
                  {stats.masteredList.length}
                </span>
              </h5>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stats.masteredList.map((obj) => (
                  <span
                    key={obj.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                  >
                    ✓ {obj.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Làm lại từ đầu
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Tiếp tục thảo luận
            </button>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Về danh mục bài học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
