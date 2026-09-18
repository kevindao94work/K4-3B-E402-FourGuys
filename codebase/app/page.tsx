"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allMapObjectives, type DashboardObjective, type KnowledgeMap, type MapObjective } from "@/app/lib/knowledge-map-types";
import { demoResponses } from "@/app/lib/demo-responses";
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

const STORAGE_PREFIX = "teachback-ai-v7";

type StreamEvent = {
  type: "meta" | "delta" | "trace" | "error" | "done";
  text?: string;
  error?: string;
  state?: SessionState;
  offerTutor?: boolean;
  callTutor?: boolean;
  tutorReason?: string;
  learnerDecision?: Record<string, unknown>;
  evidenceSlideIds?: string[];
  citations?: SourceCitation[];
  trace?: AgentTrace;
  statusLabel?: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Send conversational meaning only; never send UI ids, timestamps or trace metadata. */
function compactHistoryForApi(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "student" || message.role === "tutor")
    .slice(-8)
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
  let doneReceived = false;
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
      if (event.type === "done") doneReceived = true;
      onEvent(event);
    }
    if (next.done) break;
  }
  if (!doneReceived) throw new Error("Phản hồi bị gián đoạn. Hãy thử lại lượt này.");
}

export default function Home() {
  const [inLesson, setInLesson] = useState(false);
  const [panel, setPanel] = useState<"tree" | "slides" | "chat">("tree");
  const [mapRevision, setMapRevision] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<SessionState>(initialState);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [fastTrackStep, setFastTrackStep] = useState<number | null>(null);
  const turnInFlight = useRef(false);
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
  const responseExamples = useMemo(() => currentObjective ? demoResponses(currentObjective) : [], [currentObjective]);
  const peer = peerForObjective(currentObjective ?? selectedObjective);
  const sourceVersion = knowledgeMap?.source.sha256 ?? knowledgeMap?.lesson_id ?? "loading";
  const storageKey = `${STORAGE_PREFIX}:${sourceVersion}`;

  useEffect(() => {

    const controller = new AbortController();
    setMapLoading(true);
    setMapError("");
    fetch("/api/knowledge-map", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as KnowledgeMap & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Không thể tải Knowledge Map.");
        setKnowledgeMap((previous) => JSON.stringify(previous) === JSON.stringify(payload) ? previous : payload);
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
  }, [mapRevision]);

  useEffect(() => {
    if (!knowledgeMap) return;
    setSessionLoaded(false);
    setStarted(false);
    setMessages([]);
    setSession(initialState);
    setSelectedObjectiveId("");
    setActiveSlidePage(1);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) { setSessionLoaded(true); return; }
    try {
      const saved = JSON.parse(raw) as { messages: ChatMessage[]; session: SessionState; selectedObjectiveId: string; tutorUsedObjectives?: string[] };
      if (!saved.messages?.length || !saved.session || !objectives.some((item) => item.id === saved.session.currentObjectiveId)) return;
      setMessages(saved.messages);
      setSession(saved.session);
      setSelectedObjectiveId(saved.selectedObjectiveId || saved.session.currentObjectiveId);
      setTutorUsedObjectives(saved.tutorUsedObjectives ?? []);
      setStarted(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally { setSessionLoaded(true); }
  }, [knowledgeMap, objectives, storageKey]);

  useEffect(() => {
    if (!started || !sessionLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ messages, session, selectedObjectiveId, tutorUsedObjectives }));
  }, [started, messages, session, selectedObjectiveId, tutorUsedObjectives, storageKey, sessionLoaded]);

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
    setActiveSlidePage(objective.required_claims[0]?.evidence[0]?.pdf_page ?? 1);
    setPanel("chat");
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

  async function inviteTutor(reason: string, stateForTutor = session, historyForTutor = messages, learnerDecision?: Record<string, unknown>) {
    setOfferTutor(false);
    setLoading(true);
    setActiveSpeaker("tutor");
    setTutorUsedObjectives((previous) => previous.includes(session.currentObjectiveId) ? previous : [...previous, session.currentObjectiveId]);
    const messageId = addMessage({ role: "tutor", content: "" });
    try {
      await consumeSse("/api/tutor", { state: stateForTutor, reason, history: compactHistoryForApi(historyForTutor), learnerDecision }, (event) => {
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

  // Both manual and demo turns use the same endpoint and returned session state.
  async function learnTurn(userMessage: string, state: SessionState, priorMessages: ChatMessage[]) {
    const userEntry: ChatMessage = { id: uid(), role: "user", content: userMessage, createdAt: new Date().toISOString() };
    const history = [...priorMessages, userEntry];
    setMessages(history);
    setOfferTutor(false);
    setActiveSpeaker("learner");
    let nextState = state;
    let callTutor = false;
    let learnerDecision: Record<string, unknown> | undefined;
    let reason = "Cần làm rõ phần đang trao đổi";
    const reply: ChatMessage = { id: uid(), role: "student", content: "", createdAt: new Date().toISOString() };
    await consumeSse("/api/learn", { userMessage, state, history: compactHistoryForApi(priorMessages) }, (event) => {
      if (event.type === "meta") {
        if (event.state) { nextState = event.state; setSession(event.state); }
        callTutor = Boolean(event.callTutor);
        learnerDecision = event.learnerDecision;
        reason = event.tutorReason || reason;
        reply.citations = event.citations ?? [];
        reply.statusLabel = event.statusLabel;
        setTutorReason(reason);
        setOfferTutor(Boolean(event.offerTutor));
      }
      if (event.type === "delta" && event.text) reply.content += event.text;
      if (event.type === "trace" && event.trace) reply.trace = event.trace;
      if (reply.content) setMessages([...history, { ...reply }]);
    });
    return { state: nextState, history: [...history, reply], callTutor, reason, learnerDecision };
  }

  async function sendMessage() {
    const userMessage = draft.trim();
    if (!userMessage || turnInFlight.current || loading || session.completed || session.paused || !started) return;
    turnInFlight.current = true;
    setDraft("");
    setLoading(true);
    try {
      const result = await learnTurn(userMessage, session, messages);
      if (result.callTutor) await inviteTutor(result.reason, result.state, result.history, result.learnerDecision);
    } catch (error) {
      addMessage({ role: "system", content: error instanceof Error ? error.message : "Có lỗi xảy ra. Hãy thử lại." });
    } finally {
      turnInFlight.current = false;
      setLoading(false);
      setActiveSpeaker(null);
    }
  }

  async function fastTrackTutor() {
    if (turnInFlight.current || loading || !started || session.completed || session.paused) return;
    const incorrect = responseExamples.find(example => example.id === "incorrect")?.text;
    if (!incorrect) return;
    turnInFlight.current = true;
    setLoading(true);
    let state = session;
    let history = messages;
    try {
      for (let turn = 1; turn <= 3; turn++) {
        setFastTrackStep(turn);
        const result = await learnTurn(incorrect, state, history);
        state = result.state;
        history = result.history;
        if (state.completed || state.paused) throw new Error("Đã dừng demo vì phiên học đổi trạng thái. Hãy chọn lại mục tiêu để thử tiếp.");
      }
      setFastTrackStep(4);
      // Clicking this button explicitly requests Tutor after the three real turns.
      await inviteTutor("Demo: cần Trợ giảng hỗ trợ sau ba lượt giải thích sai.", state, history);
    } catch (error) {
      addMessage({ role: "system", content: error instanceof Error ? error.message : "Demo bị gián đoạn. Hãy thử lại." });
    } finally {
      turnInFlight.current = false;
      setFastTrackStep(null);
      setLoading(false);
      setActiveSpeaker(null);
    }
  }

  function resetLesson() {
    if (loading || turnInFlight.current) return;
    if (!window.confirm("Bạn có chắc muốn xóa tiến trình phiên này không?")) return;
    window.localStorage.removeItem(storageKey);
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
    return <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-white text-slate-900"><CatalogHeader /><CatalogHero /><LessonCard map={knowledgeMap} loading={mapLoading} error={mapError} onRetry={() => setMapRevision(v => v + 1)} onEnter={() => { setPanel("tree"); setInLesson(true); }} /></main>;
  }

  return (
    <main className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-semibold text-slate-600">{knowledgeMap?.source.pdf.split("/").pop()} · {knowledgeMap?.source.page_count} trang · {objectives.length} mục tiêu</p>
        <div className="flex gap-2">
          <nav aria-label="Khu vực bài học" className="flex gap-1 xl:hidden">{([['tree','Cây kiến thức'],['slides','Slide'],['chat','Trò chuyện']] as const).map(([id,label]) => <button key={id} onClick={() => setPanel(id)} aria-pressed={panel===id} className={`rounded-lg px-3 py-2 text-xs font-bold ${panel===id?'bg-blue-600 text-white':'bg-slate-100 text-slate-700'}`}>{label}</button>)}</nav>
          <button onClick={() => setMapRevision(v => v + 1)} disabled={loading || mapLoading} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50">Tải lại nguồn</button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[50%_minmax(200px,0.65fr)_minmax(280px,1.25fr)]">
        <div className={`${panel === "slides" ? "block" : "hidden"} min-h-0 xl:block`}><SlideViewer activePage={activeSlidePage} sourceVersion={sourceVersion} pageCount={knowledgeMap?.source.page_count ?? 0} filename={knowledgeMap?.source.pdf.split("/").pop() ?? "Đang tải"} /></div>
        <div className={`${panel === "tree" ? "block" : "hidden"} min-h-0 border-l border-slate-200 xl:block`}><KnowledgeTree map={knowledgeMap} selectedObjectiveId={selectedObjectiveId} onSelectObjective={selectObjective} loading={mapLoading || loading} error={mapError} /></div>
        <section className={`${panel === "chat" ? "flex" : "hidden"} h-full min-h-0 min-w-0 flex-col overflow-hidden border-l border-slate-200 bg-white xl:flex`}>
          <LessonHeader onBack={() => setInLesson(false)} currentTopicTitle={currentObjective?.title ?? "Chọn một mục trong cây kiến thức"} friend={peer} started={started} activeSpeaker={activeSpeaker} onOpenDashboard={() => setShowDashboard(true)} onReset={resetLesson} />
          {!started ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="mx-auto w-full max-w-xl">

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
            <ChatFeed messages={messages} friend={peer} loading={loading} activeSpeaker={activeSpeaker} paused={session.paused} offerTutor={offerTutor} tutorReason={tutorReason} onRejectTutor={() => setOfferTutor(false)} onInviteTutor={() => { if (!loading && !turnInFlight.current) void inviteTutor(tutorReason); }} onOpenCitation={(citation) => { setActiveSlidePage(citation.firstPdfPage); setPanel("slides"); }} chatEndRef={chatEndReference} />
          )}
          {started && <ChatInput examples={responseExamples} onFastTrack={() => void fastTrackTutor()} fastTrackStep={fastTrackStep} draft={draft} onDraftChange={setDraft} onSend={() => void sendMessage()} disabled={loading || session.completed || session.paused || session.objectiveStatus[session.currentObjectiveId] === "mastered"} />}
        </section>
      </div>
      {showDashboard && <SummaryDashboard stats={dashboardStats} onClose={() => setShowDashboard(false)} onReset={resetLesson} onStartObjective={(id) => { setShowDashboard(false); const objective = objectives.find((item) => item.id === id); if (objective) selectObjective(objective); }} onBackToCatalog={() => { setShowDashboard(false); setInLesson(false); }} />}
    </main>
  );
}
