/**
 * STUDENT PROGRESS — data model
 * -----------------------------
 * Pure types. This module knows nothing about localStorage, React or the UI,
 * so Phase 14–15 can swap the persistence layer for an authenticated database
 * without touching anything above it.
 */
import type { MasteryStatus } from "../engine/viva";

export type ExperimentProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REVIEW";

export const EXPERIMENT_STATUS_LABEL: Record<ExperimentProgressStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REVIEW: "Review",
};

export const EXPERIMENT_STATUS_COLOUR: Record<ExperimentProgressStatus, string> = {
  NOT_STARTED: "#8C8580",
  IN_PROGRESS: "#F26A21",
  COMPLETED: "#17B47C",
  REVIEW: "#C94B12",
};

export type LearningEventType =
  | "subjectViewed"
  | "topicViewed"
  | "experimentStarted"
  | "experimentCompleted"
  | "vivaCompleted"
  | "conceptReviewed"
  | "masteryUpdated"
  | "simulationCompleted"
  | "simulationAttempted"
  | "clinicalCaseAttempted"
  | "clinicalCaseCompleted"
  | "medicationReviewCompleted"
  | "counsellingCompleted"
  | "hospitalSimulationCompleted"
  | "resourceViewed";

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  timestamp: number;
  subjectId?: string;
  topicId?: string;
  experimentId?: string;
  /** Human-readable label used by the learning history. */
  label: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface MasteryRecord {
  conceptId: string;
  status: MasteryStatus;
  attempts: number;
  correctAnswers: number;
  lastUpdated: number;
}

export interface VivaResultRecord {
  experimentId: string;
  mastery: MasteryStatus;
  accuracy: number;
  correct: number;
  total: number;
  needsReview: string[];
  timestamp: number;
}

export interface StudentProgress {
  events: LearningEvent[];
  mastery: Record<string, MasteryRecord>;
  vivas: VivaResultRecord[];
  /** experimentId → furthest stage reached. */
  experimentStages: Record<string, string>;
  lastActivity: number | null;
}

export const EMPTY_PROGRESS: StudentProgress = {
  events: [],
  mastery: {},
  vivas: [],
  experimentStages: {},
  lastActivity: null,
};
