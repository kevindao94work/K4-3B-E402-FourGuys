"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { lesson } from "@/app/data/lesson";
import { allMapObjectives, type DashboardObjective, type KnowledgeMap, type MapObjective } from "@/app/lib/knowledge-map-types";
import { peerForObjective } from "@/app/lib/learning-peer";
import { initialState, type AgentTrace, type ChatMessage, type SessionState, type SourceCitation } from "@/app/lib/types";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { LessonCard } from "@/components/catalog/LessonCard";
import { ChatFeed } from "@/components/lesson/ChatFeed";
import { ChatInput } from "@/components/lesson/ChatInput";
import { KnowledgeTree } from "@/components/lesson/KnowledgeTree";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { SlideViewer } from "@/components/lesson/SlideViewer";
import { SummaryDashboard, type DashboardStats } from "@/components/lesson/SummaryDashboard";

const STORAGE_KEY = "teachback-ai-demo-v4";

type StreamEvent = {
  type: "meta" | "delta" | "trace" | "error" | "done";
  text?: string;
  error?: string;
  state?: SessionState;
  offerTutor?: boolean;
  callTutor?: boolean;
  tutorReason?: string;
  evidenceSlideIds?: string[];
  citations?: SourceCitation[];
  trace?: AgentTrace;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Send conversational meaning only; never send UI ids, timestamps or trace metadata. */
function compactHistoryForApi(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "student" || message.role === "tutor")
    .slice(-2)
    .map(({ role, content }) => ({ role, content: content.trim().slice(0, 600) }))
    .filter((message) => message.content.length > 0);
}

async function consumeSse(url: string, body: unknown, onEvent: (event: StreamEvent) => void) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "AI chưa thể phản hồi.");
  }
  if (!response.body) throw new Error("Trình duyệt không nhận được luồng phản hồi.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const next = await reader.read();
    buffer += decoder.decode(next.value, { stream: !next.done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";
    for (const block of blocks) {
      const line = block.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6)) as StreamEvent;
      if (event.type === "error") throw new Error(event.error || "AI chưa thể phản hồi.");
      onEvent(event);
    }
    if (next.done) break;
  }
}

export default function Home() {
  const [inLesson, setInLesson] = useState(false);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<SessionState>(initialState);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"learner" | "tutor" | null>(null);
  const [offerTutor, setOfferTutor] = useState(false);
  const [tutorReason, setTutorReason] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [tutorUsedObjectives, setTutorUsedObjectives] = useState<string[]>([]);
  const [activeSlidePage, setActiveSlidePage] = useState(1);
  const chatEndReference = useRef<HTMLDivElement | null>(null);

  const objectives = useMemo(() => knowledgeMap ? allMapObjectives(knowledgeMap) : [], [knowledgeMap]);
  const selectedObjective = useMemo(() => objectives.find((objective) => objective.id === selectedObjectiveId), [objectives, selectedObjectiveId]);
  const currentObjective = useMemo(() => objectives.find((objective) => objective.id === session.currentObjectiveId) ?? selectedObjective, [objectives, selectedObjective, session.currentObjectiveId]);
  const peer = peerForObjective(currentObjective ?? selectedObjective);

  useEffect(() => {
    if (!inLesson || knowledgeMap) return;
    const controller = new AbortController();
    setMapLoading(true);
    setMapError("");
    fetch("/api/knowledge-map", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as KnowledgeMap & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Không thể tải Knowledge Map.");
        setKnowledgeMap(payload);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setMapError(error instanceof Error ? error.message : "Không thể tải Knowledge Map.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMapLoading(false);
        }
      });
    return () => controller.abort();
  }, [inLesson, knowledgeMap]);

  useEffect(() => {
    if (!knowledgeMap) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { messages: ChatMessage[]; session: SessionState; selectedObjectiveId: string; tutorUsedObjectives?: string[] };
      if (!saved.messages?.length || !saved.session || !objectives.some((item) => item.id === saved.session.currentObjectiveId)) return;
      setMessages(saved.messages);
      setSession(saved.session);
      setSelectedObjectiveId(saved.selectedObjectiveId || saved.session.currentObjectiveId);
      setTutorUsedObjectives(saved.tutorUsedObjectives ?? []);
      setStarted(true);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [knowledgeMap, objectives]);

  useEffect(() => {
    if (!started) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, session, selectedObjectiveId, tutorUsedObjectives }));
  }, [started, messages, session, selectedObjectiveId, tutorUsedObjectives]);

  useEffect(() => {
    if (started) chatEndReference.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, offerTutor, started]);

  function addMessage(message: Omit<ChatMessage, "id" | "createdAt">) {
    const id = uid();
    setMessages((previous) => [...previous, { ...message, id, createdAt: new Date().toISOString() }]);
    return id;
  }

  function appendMessage(id: string, text: string) {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, content: message.content + text } : message));
  }

  function patchMessage(id: string, patch: Partial<ChatMessage>) {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, ...patch } : message));
  }

  function removeMessage(id: string) {
    setMessages((previous) => previous.filter((message) => message.id !== id));
  }

  function selectObjective(objective: MapObjective) {
    if (loading) return;
    setSelectedObjectiveId(objective.id);
    setStarted(false);
    setMessages([]);
    setOfferTutor(false);
    setSession(initialState);
  }

  async function startLearning(objectiveId = selectedObjectiveId) {
    if (loading || !objectiveId) return;
    setStarted(true);
    setMessages([]);
    setOfferTutor(false);
    setLoading(true);
    setActiveSpeaker("learner");
    setSelectedObjectiveId(objectiveId);
    const messageId = uid();
    setMessages([{ id: messageId, role: "student", content: "", createdAt: new Date().toISOString() }]);
    try {
      await consumeSse("/api/start", { objectiveId }, (event) => {
        if (event.type === "meta" && event.state) setSession(event.state);
        if (event.type === "meta" && event.citations) patchMessage(messageId, { citations: event.citations });
        if (event.type === "delta" && event.text) appendMessage(messageId, event.text);
        if (event.type === "trace" && event.trace) patchMessage(messageId, { trace: event.trace });
      });
    } catch (error) {
      removeMessage(messageId);
      addMessage({ role: "system", content: error instanceof Error ? error.message : "Có lỗi xảy ra. Hãy thử lại." });
      setStarted(false);
    } finally {
      setLoading(false);
      setActiveSpeaker(null);
    }
  }

  async function inviteTutor(reason: string, stateForTutor = session, historyForTutor = messages) {
    setOfferTutor(false);
    setLoading(true);
    setActiveSpeaker("tutor");
    setTutorUsedObjectives((previous) => previous.includes(session.currentObjectiveId) ? previous : [...previous, session.currentObjectiveId]);
    const messageId = addMessage({ role: "tutor", content: "" });
    try {
      await consumeSse("/api/tutor", { state: stateForTutor, reason, history: compactHistoryForApi(historyForTutor) }, (event) => {
        if (event.type === "meta") {
          if (event.state) setSession(event.state);
          if (event.evidenceSlideIds) patchMessage(messageId, { evidenceSlideIds: event.evidenceSlideIds });
          if (event.citations) patchMessage(messageId, { citations: event.citations });
        }
        if (event.type === "delta" && event.text) appendMessage(messageId, event.text);
        if (event.type === "trace" && event.trace) patchMessage(messageId, { trace: event.trace });
      });
    } catch (error) {
      removeMessage(messageId);
      addMessage({ role: "system", content: error instanceof Error ? error.message : "Có lỗi xảy ra. Hãy thử lại." });
    } finally {
      setLoading(false);
      setActiveSpeaker(null);
    }
  }

  async function sendMessage() {
    const userMessage = draft.trim();
    if (!userMessage || loading || session.completed || !started) return;
    setDraft("");
    const userEntry: ChatMessage = { id: uid(), role: "user", content: userMessage, createdAt: new Date().toISOString() };
    const history = [...messages, userEntry];
    setMessages(history);
    setOfferTutor(false);
    setLoading(true);
    setActiveSpeaker("learner");
    let learnerMessageId: string | null = null;
    let nextState = session;
    let callTutor = false;
    let tutorOffer = false;
    let responseCitations: SourceCitation[] = [];
    let reason = "Cần làm rõ phần đang trao đổi";
    try {
      await consumeSse("/api/learn", { userMessage, state: session, history: compactHistoryForApi(messages) }, (event) => {
        if (event.type === "meta") {
          if (event.state) { nextState = event.state; setSession(event.state); }
          callTutor = Boolean(event.callTutor);
          tutorOffer = Boolean(event.offerTutor);
          reason = event.tutorReason || reason;
          responseCitations = event.citations ?? [];
          setTutorReason(reason);
          setOfferTutor(tutorOffer);
        }
        if (event.type === "delta" && event.text) {
          if (!learnerMessageId) learnerMessageId = addMessage({ role: "student", content: "", citations: responseCitations });
          appendMessage(learnerMessageId, event.text);
        }
        if (event.type === "trace" && event.trace && learnerMessageId) patchMessage(learnerMessageId, { trace: event.trace });
      });
      if (callTutor) await inviteTutor(reason, nextState, history);
    } catch (error) {
      if (learnerMessageId) removeMessage(learnerMessageId);
      addMessage({ role: "system", content: error instanceof Error ? error.message : "Có lỗi xảy ra. Hãy thử lại." });
    } finally {
      setLoading(false);
      setActiveSpeaker(null);
    }
  }

  function resetLesson() {
    if (!window.confirm("Bạn có chắc muốn xóa tiến trình phiên này không?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setSession(initialState);
    setSelectedObjectiveId("");
    setOfferTutor(false);
    setStarted(false);
    setShowDashboard(false);
    setTutorUsedObjectives([]);
  }

  const dashboardStats: DashboardStats = useMemo(() => {
    const needReviewList: { objective: DashboardObjective; reason: string }[] = [];
    const skippedList: DashboardObjective[] = [];
    const masteredList: DashboardObjective[] = [];
    let firstTryCount = 0;
    for (const objective of objectives) {
      const status = session.objectiveStatus[objective.id] ?? "not_started";
      const attempts = session.attemptsPerObjective[objective.id] ?? 0;
      const usedTutor = tutorUsedObjectives.includes(objective.id);
      const misconceptions = Object.entries(session.repeatedMisconceptions).some(([id, count]) => objective.common_misconceptions.some((item) => item.id === id) && count > 0);
      if (status === "mastered") {
        masteredList.push(objective);
        if (attempts <= 1 && !usedTutor && !misconceptions) firstTryCount += 1;
        if (usedTutor || misconceptions) needReviewList.push({ objective, reason: usedTutor ? "Đã cần Trợ giảng hỗ trợ" : "Có ngộ nhận cần ôn lại" });
      } else if (attempts || usedTutor || misconceptions) {
        needReviewList.push({ objective, reason: "Chưa hoàn tất phần giải thích" });
      } else skippedList.push(objective);
    }
    const masteredCount = masteredList.length;
    const masteryLevel = masteredCount === objectives.length && objectives.length > 0
      ? { title: "Hoàn thành", tone: "text-emerald-700 bg-emerald-50 border-emerald-300", desc: "Bạn đã hoàn thành các chủ đề đã chọn." }
      : masteredCount > 0
        ? { title: "Đang tiến bộ", tone: "text-blue-700 bg-blue-50 border-blue-300", desc: "Bạn đã giúp một vài bạn học hiểu bài." }
        : { title: "Chưa hoàn thành", tone: "text-slate-600 bg-slate-100 border-slate-300", desc: "Chọn một nhánh trong cây để bắt đầu." };
    return { total: objectives.length, masteredCount, firstTryCount, tutorHelpCount: tutorUsedObjectives.length, skippedCount: skippedList.length, masteryLevel, needReviewList, skippedList, masteredList };
  }, [objectives, session, tutorUsedObjectives]);

  if (!inLesson) {
    return <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-white text-slate-900"><CatalogHeader /><CatalogHero /><LessonCard lesson={lesson} onEnter={() => { setMapError(""); setInLesson(true); }} /></main>;
  }

  return (
    <main className="flex h-screen max-h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full w-full overflow-hidden">
        <SlideViewer activePage={activeSlidePage} />
        <div className="hidden lg:block border-l border-slate-200"><KnowledgeTree map={knowledgeMap} selectedObjectiveId={selectedObjectiveId} onSelectObjective={selectObjective} loading={mapLoading || loading} error={mapError} /></div>
        <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white border-l border-slate-200">
          <LessonHeader onBack={() => setInLesson(false)} currentTopicTitle={currentObjective?.title ?? "Chọn một mục trong cây kiến thức"} friend={peer} started={started} activeSpeaker={activeSpeaker} onOpenDashboard={() => setShowDashboard(true)} onReset={resetLesson} />
          {!started ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="mx-auto w-full max-w-xl">
                <div className="mb-5 lg:hidden"><KnowledgeTree map={knowledgeMap} selectedObjectiveId={selectedObjectiveId} onSelectObjective={selectObjective} loading={mapLoading || loading} error={mapError} /></div>
                {selectedObjective ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <div className={`mx-auto grid size-14 place-items-center rounded-full text-sm font-extrabold ${peer.avatarClass}`}>{peer.avatar}</div>
                    <p className="mt-4 text-xs font-bold text-blue-600">{peer.name} đang chờ bạn</p>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{selectedObjective.title}</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">{peer.name} muốn bạn giúp hiểu nội dung này. Hãy bắt đầu khi bạn sẵn sàng giải thích lại bằng lời của mình.</p>
                    <p className="mt-3 text-[11px] text-slate-400">Chưa có câu hỏi nào được tạo ở bước này.</p>
                    <button type="button" onClick={() => void startLearning()} disabled={loading} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">Bắt đầu trò chuyện</button>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><h2 className="text-lg font-extrabold text-slate-800">Bạn muốn kiểm tra phần nào?</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">Mở một nhánh trong Cây kiến thức và chọn mục nhỏ nhất. Lúc đó bạn mới thấy bạn học đang muốn hiểu điều gì.</p></div>
                )}
              </div>
            </div>
          ) : (
            <ChatFeed messages={messages} friend={peer} loading={loading} activeSpeaker={activeSpeaker} paused={session.paused} offerTutor={offerTutor} tutorReason={tutorReason} onRejectTutor={() => setOfferTutor(false)} onInviteTutor={() => void inviteTutor(tutorReason)} onOpenCitation={(citation) => setActiveSlidePage(citation.firstPdfPage)} chatEndRef={chatEndReference} />
          )}
          {started && <ChatInput draft={draft} onDraftChange={setDraft} onSend={() => void sendMessage()} disabled={loading || session.completed || session.paused || session.objectiveStatus[session.currentObjectiveId] === "mastered"} />}
        </section>
      </div>
      {showDashboard && <SummaryDashboard stats={dashboardStats} onClose={() => setShowDashboard(false)} onReset={resetLesson} onStartObjective={(id) => { setShowDashboard(false); const objective = objectives.find((item) => item.id === id); if (objective) selectObjective(objective); }} onBackToCatalog={() => { setShowDashboard(false); setInLesson(false); }} />}
    </main>
  );
}
