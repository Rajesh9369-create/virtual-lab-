/**
 * BACKEND LAYER — shared contracts
 * -------------------------------
 * Everything the application needs from a backend, expressed as interfaces so
 * the Supabase adapter and the development adapter are interchangeable and a
 * future adapter could be dropped in without touching feature code.
 *
 * These types mirror supabase/migrations/0001_initial_schema.sql.
 */

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  pharmdYear: number | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export type AttemptStatus = "STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface ExperimentAttempt {
  id: string;
  userId: string;
  experimentId: string;
  experimentVersion: number;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  completedAt: string | null;
}

export type ExperimentEventType =
  | "experiment_started"
  | "apparatus_selected"
  | "material_selected"
  | "procedure_step_completed"
  | "observation_recorded"
  | "calculation_submitted"
  | "result_submitted"
  | "experiment_completed"
  | "experiment_abandoned";

export interface ExperimentEventRecord {
  id: string;
  attemptId: string;
  eventType: ExperimentEventType;
  stepId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ObservationRecord {
  id: string;
  attemptId: string;
  observationKey: string;
  observedValue: number | null;
  unit: string | null;
  interpretation: string | null;
  recordedAt: string;
}

export interface CalculationResultRecord {
  id: string;
  attemptId: string;
  calculationKey: string;
  studentInput: number | null;
  /** Never fabricated — only present when the calculation is deterministic. */
  expectedValue: number | null;
  unit: string | null;
  tolerance: number | null;
  correct: boolean;
  calculationVersion: number;
  createdAt: string;
}

export interface VivaAttempt {
  id: string;
  userId: string;
  experimentId: string;
  assessmentVersion: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  correctCount: number;
  incorrectCount: number;
}

export interface VivaAnswerRecord {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  correct: boolean;
  attempts: number;
  answeredAt: string;
}

export type MasteryStatus =
  | "NEEDS_REVIEW"
  | "DEVELOPING"
  | "UNDERSTOOD"
  | "MASTERED";

export interface MasteryRecord {
  conceptId: string;
  status: MasteryStatus;
  attempts: number;
  correctAnswers: number;
  evidenceCount: number;
  lastUpdated: string;
}

export type CompetencyDimension =
  | "procedure"
  | "observation"
  | "calculation"
  | "interpretation"
  | "conceptual_understanding"
  | "viva";

export interface CompetencyEvidence {
  conceptId: string;
  dimension: CompetencyDimension;
  correct: boolean;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
}

export type LearningEventType =
  | "topic_viewed"
  | "subject_viewed"
  | "experiment_started"
  | "experiment_completed"
  | "viva_completed"
  | "concept_reviewed"
  | "simulation_completed"
  | "clinical_case_completed"
  | "medication_review_completed"
  | "counselling_completed"
  | "hospital_simulation_completed"
  | "resource_viewed";

export interface LearningEventRecord {
  id: string;
  eventType: LearningEventType;
  subjectId: string | null;
  topicId: string | null;
  experimentId: string | null;
  simulationId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CreditEventType =
  | "experiment_completed"
  | "viva_completed"
  | "simulation_completed"
  | "clinical_case_completed"
  | "concept_reviewed";

export interface CreditEntry {
  id: string;
  eventType: CreditEventType;
  amount: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface CreditBalance {
  balance: number;
  entries: number;
}

export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "VERIFIED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface ContentSummary {
  id: string;
  title: string;
  entityType: "subject" | "topic" | "experiment" | "simulation" | "viva_question" | "reference" | "clinical_case";
  contentStatus: ContentStatus;
  version: number;
  verificationStatus?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface AdminOverview {
  registeredStudents: number;
  activeLearners: number;
  experimentsCompleted: number;
  vivasCompleted: number;
  simulationsCompleted: number;
  contentRequiringVerification: number;
}

export interface StudentSummary {
  profile: Profile;
  experimentAttempts: number;
  experimentsCompleted: number;
  vivasCompleted: number;
  credits: number;
  lastActivity: string | null;
}

/* ------------------------------------------------------------ Contracts */

export interface AuthContract {
  /** Current signed-in user id, or null. */
  getCurrentUserId(): Promise<string | null>;
  signUp(email: string, password: string, displayName: string): Promise<{ userId: string }>;
  signIn(email: string, password: string): Promise<{ userId: string }>;
  signOut(): Promise<void>;
  onAuthStateChange(cb: (userId: string | null) => void): () => void;
}

export interface ProgressContract {
  getProfile(userId: string): Promise<Profile | null>;
  upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile>;
  recordLearningEvent(
    userId: string,
    event: {
      eventType: LearningEventType;
      subjectId?: string;
      topicId?: string;
      experimentId?: string;
      simulationId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void>;
  listLearningEvents(userId: string, limit?: number): Promise<LearningEventRecord[]>;
  listMastery(userId: string): Promise<MasteryRecord[]>;
  listCompetencyEvidence(userId: string): Promise<CompetencyEvidence[]>;
}

export interface AttemptContract {
  startAttempt(
    userId: string,
    experimentId: string,
    experimentVersion: number
  ): Promise<ExperimentAttempt>;
  recordEvent(
    userId: string,
    attemptId: string,
    event: {
      eventType: ExperimentEventType;
      stepId?: string;
      payload?: Record<string, unknown>;
    }
  ): Promise<void>;
  recordObservation(
    userId: string,
    attemptId: string,
    observation: {
      stepId?: string;
      observationKey: string;
      observedValue?: number | null;
      unit?: string | null;
      interpretation?: string | null;
    }
  ): Promise<void>;
  recordCalculation(
    userId: string,
    attemptId: string,
    calculation: {
      calculationKey: string;
      studentInput: number | null;
      expectedValue: number | null;
      unit?: string | null;
      tolerance?: number | null;
      correct: boolean;
      calculationVersion?: number;
    }
  ): Promise<void>;
  completeAttempt(
    userId: string,
    attemptId: string,
    summary: Record<string, unknown>
  ): Promise<void>;
  listAttempts(userId: string, experimentId?: string): Promise<ExperimentAttempt[]>;
}

export interface VivaContract {
  startVivaAttempt(
    userId: string,
    experimentId: string,
    assessmentVersion: number
  ): Promise<VivaAttempt>;
  recordAnswer(
    userId: string,
    attemptId: string,
    answer: {
      questionId: string;
      answer: string;
      correct: boolean;
      attempts: number;
    }
  ): Promise<void>;
  completeVivaAttempt(
    userId: string,
    attemptId: string,
    result: { score: number; correctCount: number; incorrectCount: number }
  ): Promise<void>;
  listVivaAttempts(userId: string, experimentId?: string): Promise<VivaAttempt[]>;
}

export interface CreditsContract {
  /**
   * Award credit for a completed activity. Idempotent: awarding twice for the
   * same reference returns false the second time, which is the anti-abuse
   * control enforced by the database unique constraint.
   */
  awardCredit(
    userId: string,
    entry: {
      eventType: CreditEventType;
      referenceType: string;
      referenceId: string;
      amount: number;
      description?: string;
    }
  ): Promise<boolean>;
  listCredits(userId: string): Promise<CreditEntry[]>;
  getBalance(userId: string): Promise<CreditBalance>;
}

export interface MasteryContract {
  /** Record one piece of competency evidence. */
  recordCompetencyEvidence(
    userId: string,
    evidence: {
      conceptId: string;
      dimension: CompetencyDimension;
      correct: boolean;
      sourceType: string;
      sourceId?: string | null;
    }
  ): Promise<void>;
  /**
   * Recompute mastery for a concept from all recorded evidence. Never
   * declares MASTERED from a single signal.
   */
  recomputeMastery(userId: string, conceptId: string): Promise<MasteryRecord>;
}

export interface AdminContract {
  getOverview(): Promise<AdminOverview>;
  listStudents(): Promise<StudentSummary[]>;
  getStudent(userId: string): Promise<StudentSummary | null>;
  listContent(): Promise<ContentSummary[]>;
  setContentStatus(
    actorId: string,
    entityId: string,
    entityType: ContentSummary["entityType"],
    status: ContentStatus
  ): Promise<void>;
  listAuditLogs(limit?: number): Promise<AuditLogEntry[]>;
  logAction(
    actorId: string,
    entry: { action: string; entityType?: string; entityId?: string; details?: Record<string, unknown> }
  ): Promise<void>;
}

/** The complete backend surface. */
export interface Backend
  extends AuthContract,
    ProgressContract,
    AttemptContract,
    VivaContract,
    CreditsContract,
    MasteryContract,
    AdminContract {
  readonly kind: "supabase" | "dev";
  readonly isRealDatabase: boolean;
}
