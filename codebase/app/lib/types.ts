export type ObjectiveStatus = "not_started" | "in_progress" | "mastered";

export type SessionState = {
  currentObjectiveId: string;
  objectiveStatus: Record<string, ObjectiveStatus>;
  coveredClaimIds: string[];
  attemptsPerObjective: Record<string, number>;
  repeatedMisconceptions: Record<string, number>;
  tutorUsed: boolean;
  awaitingRetell: boolean;
  needsApplication: boolean;
  applicationPassed: boolean;
  offTopicStreak: number;
  turnsWithoutProgress: number;
  completed: boolean;
  paused: boolean;
};

export type ChatRole = "student" | "tutor" | "user" | "system";

export type SourceCitation = {
  id: string;
  label: string;
  firstSlideId: string;
  firstPdfPage: number;
  slideIds: string[];
  supportingQuotes: string[];
  reviewStatus: "approved" | "review_required";
};

/** A concise, auditable trace for a visible agent response; never hidden reasoning. */
export type AgentTrace = {
  traceId: string;
  agent: "learner" | "tutor" | "policy";
  model: string;
  objectiveTitle: string;
  action: string;
  summary: string;
  promptInput: string;
  rawResponse: string;
  loggedAt: string;
  persisted: boolean;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  evidenceSlideIds?: string[];
  citations?: SourceCitation[];
  trace?: AgentTrace;
};

export type LearnResult = {
  message: string;
  state: SessionState;
  offerTutor?: boolean;
  callTutor?: boolean;
  tutorReason?: string;
  evidenceSlideIds?: string[];
  isDemoFallback?: boolean;
};

export const initialState: SessionState = {
  currentObjectiveId: "",
  objectiveStatus: {},
  coveredClaimIds: [],
  attemptsPerObjective: {},
  repeatedMisconceptions: {},
  tutorUsed: false,
  awaitingRetell: false,
  needsApplication: false,
  applicationPassed: false,
  offTopicStreak: 0,
  turnsWithoutProgress: 0,
  completed: false,
  paused: false,
};
