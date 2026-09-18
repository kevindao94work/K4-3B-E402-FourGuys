import React from "react";
import { FileText, HelpCircle, LoaderCircle, Sparkles } from "lucide-react";
import type { LearningPeer } from "@/app/lib/learning-peer";
import type { ChatMessage, SourceCitation } from "@/app/lib/types";
import { AgentTracePanel } from "@/components/lesson/AgentTracePanel";

interface ChatFeedProps {
  messages: ChatMessage[];
  friend: LearningPeer;
  loading: boolean;
  activeSpeaker: "learner" | "tutor" | null;
  paused: boolean;
  offerTutor: boolean;
  tutorReason: string;
  onRejectTutor: () => void;
  onInviteTutor: () => void;
  onSelectTopic: (id: string) => void;
  onOpenCitation: (citation: SourceCitation) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

function CitationLinks({ citations, onOpenCitation }: { citations: SourceCitation[]; onOpenCitation: (citation: SourceCitation) => void }) {
  if (!citations.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Nguồn trích dẫn">
      {citations.map((citation) => (
        <button
          key={citation.id}
          type="button"
          onClick={() => onOpenCitation(citation)}
          title={`${citation.supportingQuotes.join(" · ")} — mở từ ${citation.firstSlideId}`}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition ${citation.reviewStatus === "approved" ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
        >
          <FileText size={11} /> {citation.label}
        </button>
      ))}
    </div>
  );
}

function formatTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatFeed({ messages, friend, loading, activeSpeaker, paused, offerTutor, tutorReason, onRejectTutor, onInviteTutor, onSelectTopic, onOpenCitation, chatEndRef }: ChatFeedProps) {
  return (
    <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-xl text-center text-[11px] leading-relaxed text-slate-400">
        <p className="mb-2 font-semibold">Luyện tập — không phải điểm/chứng nhận</p>
        {activeSpeaker === "tutor" ? "Trợ giảng đang hỗ trợ bạn với phần này." : `${friend.name} đang cần bạn giúp hiểu bài. Cứ nói như đang kể cho một người bạn nhé.`}
      </div>

      {messages.map((message) => {
        const isUser = message.role === "user";
        const isTutor = message.role === "tutor";
        const isSystem = message.role === "system";

        if (isSystem) {
          return <div key={message.id} className="my-2 flex justify-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">{message.content}</span></div>;
        }
        if (isTutor) {
          return (
            <div key={message.id} className="mx-auto my-2 max-w-lg rounded-xl border border-violet-200 bg-violet-50/80 p-3 text-xs text-violet-950">
              <div className="mb-1 flex items-center gap-1.5 font-bold text-violet-800"><Sparkles size={13} /><span>Gợi ý từ Trợ giảng</span></div>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <CitationLinks citations={message.citations ?? []} onOpenCitation={onOpenCitation} />
              {message.trace && <AgentTracePanel trace={message.trace} />}
            </div>
          );
        }

        return (
          <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] gap-2 sm:max-w-[78%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {!isUser && <div className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-extrabold ${friend.avatarClass}`}>{friend.avatar}</div>}
              <div>
                {!isUser && <p className="mb-0.5 ml-1 text-[10px] font-semibold text-slate-500">{friend.name}</p>}
                <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${isUser ? "rounded-br-sm bg-blue-600 text-white shadow-sm" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}>
                  {message.content || (
                    <span className="flex items-center gap-1 text-slate-400" aria-label={`${friend.name} đang nhập tin nhắn`}><span className="animate-dot-1">•</span><span className="animate-dot-2">•</span><span className="animate-dot-3">•</span></span>
                  )}
                </div>
                {!isUser && message.statusLabel && <p className="mt-2 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">{message.statusLabel}</p>}
                {!isUser && message.topicChoices?.length ? <div className="mt-2 flex flex-wrap gap-2">{message.topicChoices.map(topic => <button key={topic.id} disabled={loading} onClick={() => onSelectTopic(topic.id)} className="rounded-lg border border-blue-200 px-2 py-1 text-xs text-blue-700">{topic.title}</button>)}</div> : null}
                <span className={`mt-1 block text-[10px] text-slate-400 ${isUser ? "mr-1 text-right" : "ml-1 text-left"}`}>{formatTime(message.createdAt)}</span>
                {!isUser && <CitationLinks citations={message.citations ?? []} onOpenCitation={onOpenCitation} />}
                {!isUser && message.trace && <AgentTracePanel trace={message.trace} />}
              </div>
            </div>
          </div>
        );
      })}

      {loading && <div className="flex items-center gap-2 pl-9 text-xs text-slate-400"><LoaderCircle className="animate-spin text-blue-500" size={14} /><span>{activeSpeaker === "tutor" ? "Trợ giảng đang trả lời..." : `${friend.name} đang nhập tin nhắn...`}</span></div>}

      {paused && (
        <div className="mx-auto max-w-md rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
          <p className="text-xs font-extrabold text-sky-800">Đã tạm dừng phiên với {friend.name}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-sky-700">Tiến trình đã được lưu. Bạn có thể chọn một mục khác trong Cây kiến thức để tiếp tục sau.</p>
        </div>
      )}

      {offerTutor && !loading && (
        <div className="mx-auto my-2 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-amber-800"><HelpCircle size={14} /><span>Có vẻ chỗ này đang hơi khó với {friend.name}:</span></div>
          <p className="mt-1 text-amber-900">{tutorReason}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <button type="button" onClick={onRejectTutor} className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-50">Để mình thử kể lại</button>
            <button type="button" onClick={onInviteTutor} className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-700">Nhờ Trợ giảng gợi ý</button>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
