/**
 * STUDENT PROGRESS — local store
 * ------------------------------
 * A tiny observable store persisted to localStorage. The public surface is
 * deliberately narrow (read, record, reset) so the whole module can be
 * replaced by an API-backed store in a later phase without changing callers.
 *
 * Nothing personal is stored — only learning events and derived counts.
 */
import { useSyncExternalStore } from "react";
import {
  EMPTY_PROGRESS,
  type LearningEvent,
  type LearningEventType,
  type MasteryRecord,
  type StudentProgress,
  type VivaResultRecord,
} from "./types";
import type { MasteryStatus } from "../engine/viva";

const STORAGE_KEY = "pvl.student-progress.v1";

function load(): StudentProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as StudentProgress;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      mastery: parsed.mastery && typeof parsed.mastery === "object" ? parsed.mastery : {},
      vivas: Array.isArray(parsed.vivas) ? parsed.vivas : [],
      experimentStages:
        parsed.experimentStages && typeof parsed.experimentStages === "object"
          ? parsed.experimentStages
          : {},
      lastActivity: typeof parsed.lastActivity === "number" ? parsed.lastActivity : null,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function persist(next: StudentProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Storage may be unavailable — progress simply stays in memory. */
  }
}

let state: StudentProgress = load();
const listeners = new Set<() => void>();

function commit(next: StudentProgress) {
  state = next;
  persist(next);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

/** Read the current progress inside React. */
export function useProgress(): StudentProgress {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let eventCounter = 0;

export interface RecordEventInput {
  type: LearningEventType;
  label: string;
  subjectId?: string;
  topicId?: string;
  experimentId?: string;
  metadata?: Record<string, string | number | boolean>;
}

/** Append a learning event. Idempotent per (type, key) within one second. */
export function recordEvent(input: RecordEventInput) {
  const now = Date.now();
  const key = input.experimentId ?? input.topicId ?? input.subjectId ?? input.label;
  const duplicate = state.events.some(
    (e) =>
      e.type === input.type &&
      (e.experimentId ?? e.topicId ?? e.subjectId ?? e.label) === key &&
      now - e.timestamp < 1000
  );
  if (duplicate) return;

  eventCounter += 1;
  const event: LearningEvent = {
    id: `${now}-${eventCounter}`,
    timestamp: now,
    type: input.type,
    label: input.label,
    subjectId: input.subjectId,
    topicId: input.topicId,
    experimentId: input.experimentId,
    metadata: input.metadata,
  };

  commit({
    ...state,
    events: [event, ...state.events].slice(0, 400),
    lastActivity: now,
  });
}

/** Note the furthest stage an experiment has reached. */
export function recordStage(experimentId: string, stage: string) {
  if (state.experimentStages[experimentId] === stage) return;
  commit({
    ...state,
    experimentStages: { ...state.experimentStages, [experimentId]: stage },
    lastActivity: Date.now(),
  });
}

export interface RecordVivaInput {
  experimentId: string;
  mastery: MasteryStatus;
  accuracy: number;
  correct: number;
  total: number;
  /** concept → correct on the question that tested it */
  concepts: Record<string, boolean>;
}

/** Store a completed viva and update every concept's mastery record. */
export function recordViva(input: RecordVivaInput) {
  const now = Date.now();
  const viva: VivaResultRecord = {
    experimentId: input.experimentId,
    mastery: input.mastery,
    accuracy: input.accuracy,
    correct: input.correct,
    total: input.total,
    needsReview: Object.entries(input.concepts)
      .filter(([, ok]) => !ok)
      .map(([c]) => c),
    timestamp: now,
  };

  const mastery = { ...state.mastery };
  for (const [conceptId, correct] of Object.entries(input.concepts)) {
    const existing: MasteryRecord = mastery[conceptId] ?? {
      conceptId,
      status: "NEEDS REVIEW",
      attempts: 0,
      correctAnswers: 0,
      lastUpdated: now,
    };
    const attempts = existing.attempts + 1;
    const correctAnswers = existing.correctAnswers + (correct ? 1 : 0);
    /* Mastery is deliberately conservative: it takes repeated success to
       reach MASTERED, and one miss pulls a concept back down. */
    const ratio = correctAnswers / attempts;
    const status: MasteryStatus =
      attempts < 2
        ? correct
          ? "UNDERSTOOD"
          : "NEEDS REVIEW"
        : ratio >= 0.9
          ? "MASTERED"
          : ratio >= 0.7
            ? "UNDERSTOOD"
            : ratio >= 0.5
              ? "DEVELOPING"
              : "NEEDS REVIEW";

    mastery[conceptId] = {
      conceptId,
      status,
      attempts,
      correctAnswers,
      lastUpdated: now,
    };
  }

  const events = [
    {
      id: `${now}-viva`,
      type: "vivaCompleted" as const,
      timestamp: now,
      experimentId: input.experimentId,
      label: `Completed viva — ${input.accuracy.toFixed(0)}% accuracy`,
      metadata: { mastery: input.mastery },
    },
    ...state.events,
  ];

  commit({
    ...state,
    vivas: [viva, ...state.vivas].slice(0, 80),
    mastery,
    events: events.slice(0, 400),
    lastActivity: now,
  });
}

/** Clear everything (used by the student's own reset control). */
export function resetProgress() {
  commit(EMPTY_PROGRESS);
}
