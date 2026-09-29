/**
 * DEVELOPMENT ADAPTER — NOT A DATABASE
 * ------------------------------------
 * ⚠️  This adapter exists so the application can be developed and demoed
 *     without backend credentials. It holds records in memory only:
 *
 *       • Nothing is persisted. A page reload loses everything.
 *       • It is NOT a database and must never be described as one.
 *       • It must never be used in production.
 *
 * The production adapter is supabaseAdapter.ts, which is selected
 * automatically as soon as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are configured. Every method here implements the same contract.
 */
import type {
  Backend,
  CompetencyEvidence,
  ContentSummary,
  CreditEntry,
  ExperimentAttempt,
  LearningEventRecord,
  MasteryRecord,
  MasteryStatus,
  Profile,
  StudentSummary,
  UserRole,
  VivaAttempt,
} from "./types";

export interface DevBackend extends Backend {
  /** Always false — this is not a persisted database. */
  readonly isRealDatabase: false;
}

export function createDevBackend(): DevBackend {
  /* In-memory stores. Cleared on reload by design. */
  const profiles = new Map<string, Profile>();
  const learningEvents: LearningEventRecord[] = [];
  const attempts: ExperimentAttempt[] = [];
  const attemptPayloads = new Map<string, Record<string, unknown>>();
  const vivaAttempts: VivaAttempt[] = [];
  const vivaAnswers: Array<{
    attemptId: string;
    questionId: string;
    answer: string;
    correct: boolean;
    attempts: number;
    answeredAt: string;
  }> = [];
  const competency: CompetencyEvidence[] = [];
  const mastery = new Map<string, MasteryRecord>();
  const credits: CreditEntry[] = [];
  const auditLogs: Array<{
    id: string;
    actorId: string | null;
    action: string;
    entityType: string | null;
    entityId: string | null;
    details: Record<string, unknown>;
    createdAt: string;
  }> = [];

  let sessionUserId: string | null = null;
  let counter = 0;
  const uid = (prefix: string) => `${prefix}-${Date.now()}-${++counter}`;

  const authListeners = new Set<(userId: string | null) => void>();
  const emit = () => authListeners.forEach((cb) => cb(sessionUserId));

  const ensureProfile = (userId: string): Profile => {
    let p = profiles.get(userId);
    if (!p) {
      p = {
        id: uid("profile"),
        userId,
        displayName: "Development user",
        pharmdYear: null,
        avatarUrl: null,
        role: "STUDENT",
        createdAt: new Date().toISOString(),
      };
      profiles.set(userId, p);
    }
    return p;
  };

  return {
    kind: "dev",
    isRealDatabase: false,

    /* ------------------------------------------------------- Auth */

    async getCurrentUserId() {
      return sessionUserId;
    },

    async signUp(_email, _password, displayName) {
      const userId = uid("user");
      profiles.set(userId, {
        id: uid("profile"),
        userId,
        displayName,
        pharmdYear: null,
        avatarUrl: null,
        role: "STUDENT",
        createdAt: new Date().toISOString(),
      });
      sessionUserId = userId;
      emit();
      return { userId };
    },

    async signIn(_email, _password) {
      // Development sign-in: reuse the first profile, or create one.
      const existing = [...profiles.values()][0];
      const userId = existing?.userId ?? uid("user");
      ensureProfile(userId);
      sessionUserId = userId;
      emit();
      return { userId };
    },

    async signOut() {
      sessionUserId = null;
      emit();
    },

    onAuthStateChange(cb) {
      authListeners.add(cb);
      return () => authListeners.delete(cb);
    },

    /* ---------------------------------------------------- Profile */

    async getProfile(userId) {
      return profiles.get(userId) ?? null;
    },

    async upsertProfile(userId, patch) {
      const base = ensureProfile(userId);
      const next: Profile = {
        ...base,
        displayName: patch.displayName ?? base.displayName,
        pharmdYear: patch.pharmdYear ?? base.pharmdYear,
        avatarUrl: patch.avatarUrl ?? base.avatarUrl,
        role: (patch.role as UserRole) ?? base.role,
      };
      profiles.set(userId, next);
      return next;
    },

    /* --------------------------------------------- Learning events */

    async recordLearningEvent(_userId, event) {
      learningEvents.unshift({
        id: uid("ev"),
        eventType: event.eventType,
        subjectId: event.subjectId ?? null,
        topicId: event.topicId ?? null,
        experimentId: event.experimentId ?? null,
        simulationId: event.simulationId ?? null,
        metadata: event.metadata ?? {},
        createdAt: new Date().toISOString(),
      });
    },

    async listLearningEvents(_userId, limit = 100) {
      return learningEvents.slice(0, limit);
    },

    async listMastery(_userId) {
      return [...mastery.values()].filter((m) =>
        competency.some((c) => c.conceptId === m.conceptId)
      );
    },

    async listCompetencyEvidence(_userId) {
      return competency;
    },

    /* --------------------------------------------------- Attempts */

    async startAttempt(userId, experimentId, experimentVersion) {
      const number =
        attempts.filter(
          (a) => a.userId === userId && a.experimentId === experimentId
        ).length + 1;
      const attempt: ExperimentAttempt = {
        id: uid("attempt"),
        userId,
        experimentId,
        experimentVersion,
        attemptNumber: number,
        status: "STARTED",
        startedAt: new Date().toISOString(),
        completedAt: null,
      };
      attempts.unshift(attempt);
      return attempt;
    },

    async recordEvent(_userId, attemptId, event) {
      const payload = attemptPayloads.get(attemptId) ?? {};
      const list = (payload.events as unknown[]) ?? [];
      list.push({ type: event.eventType, stepId: event.stepId ?? null, at: new Date().toISOString() });
      attemptPayloads.set(attemptId, { ...payload, events: list });
    },

    async recordObservation(_userId, attemptId, observation) {
      const payload = attemptPayloads.get(attemptId) ?? {};
      const list = (payload.observations as unknown[]) ?? [];
      list.push(observation);
      attemptPayloads.set(attemptId, { ...payload, observations: list });
    },

    async recordCalculation(_userId, attemptId, calculation) {
      const payload = attemptPayloads.get(attemptId) ?? {};
      const list = (payload.calculations as unknown[]) ?? [];
      list.push(calculation);
      attemptPayloads.set(attemptId, { ...payload, calculations: list });
    },

    async completeAttempt(_userId, attemptId, summary) {
      const attempt = attempts.find((a) => a.id === attemptId);
      if (attempt) {
        attempt.status = "COMPLETED";
        attempt.completedAt = new Date().toISOString();
      }
      attemptPayloads.set(attemptId, {
        ...(attemptPayloads.get(attemptId) ?? {}),
        summary,
      });
    },

    async listAttempts(userId, experimentId) {
      return attempts.filter(
        (a) =>
          a.userId === userId &&
          (experimentId ? a.experimentId === experimentId : true)
      );
    },

    /* ------------------------------------------------------ Viva */

    async startVivaAttempt(userId, experimentId, assessmentVersion) {
      const attempt: VivaAttempt = {
        id: uid("viva"),
        userId,
        experimentId,
        assessmentVersion,
        startedAt: new Date().toISOString(),
        completedAt: null,
        score: null,
        correctCount: 0,
        incorrectCount: 0,
      };
      vivaAttempts.unshift(attempt);
      return attempt;
    },

    async recordAnswer(_userId, attemptId, answer) {
      vivaAnswers.push({ attemptId, ...answer, answeredAt: new Date().toISOString() });
    },

    async completeVivaAttempt(_userId, attemptId, result) {
      const attempt = vivaAttempts.find((a) => a.id === attemptId);
      if (attempt) {
        attempt.completedAt = new Date().toISOString();
        attempt.score = result.score;
        attempt.correctCount = result.correctCount;
        attempt.incorrectCount = result.incorrectCount;
      }
    },

    async listVivaAttempts(userId, experimentId) {
      return vivaAttempts.filter(
        (a) =>
          a.userId === userId &&
          (experimentId ? a.experimentId === experimentId : true)
      );
    },

    /* --------------------------------------------------- Credits */

    async awardCredit(userId, entry) {
      // Anti-abuse: the same activity cannot be credited twice.
      const duplicate = credits.some(
        (c) =>
          c.referenceId === entry.referenceId && c.eventType === entry.eventType
      );
      if (duplicate) return false;

      void userId;
      credits.unshift({
        id: uid("credit"),
        eventType: entry.eventType,
        amount: entry.amount,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        description: entry.description ?? "",
        createdAt: new Date().toISOString(),
      });
      return true;
    },

    async listCredits(_userId) {
      return credits;
    },

    async getBalance(_userId) {
      return {
        balance: credits.reduce((s, c) => s + c.amount, 0),
        entries: credits.length,
      };
    },

    /* --------------------------------------------------- Mastery */

    async recordCompetencyEvidence(userId, evidence) {
      competency.push({
        ...evidence,
        sourceId: evidence.sourceId ?? null,
        createdAt: new Date().toISOString(),
      });
      await this.recomputeMastery(userId, evidence.conceptId);
    },

    async recomputeMastery(_userId, conceptId) {
      const rows = competency.filter((c) => c.conceptId === conceptId);
      const attemptsCount = rows.length;
      const correctAnswers = rows.filter((r) => r.correct).length;

      /* Deliberately mirrors the database logic: multiple signals are
         required before MASTERED can be reached. */
      const minEvidence = 3;
      const minAttempts = 2;
      const ratio = attemptsCount > 0 ? correctAnswers / attemptsCount : 0;

      let status: MasteryStatus = "NEEDS_REVIEW";
      if (attemptsCount < minAttempts || attemptsCount < minEvidence) {
        status = ratio >= 0.5 ? "DEVELOPING" : "NEEDS_REVIEW";
      } else if (ratio >= 0.9) {
        status = "MASTERED";
      } else if (ratio >= 0.7) {
        status = "UNDERSTOOD";
      } else if (ratio >= 0.5) {
        status = "DEVELOPING";
      }

      const record: MasteryRecord = {
        conceptId,
        status,
        attempts: attemptsCount,
        correctAnswers,
        evidenceCount: attemptsCount,
        lastUpdated: new Date().toISOString(),
      };
      mastery.set(conceptId, record);
      return record;
    },

    /* ----------------------------------------------------- Admin */

    async getOverview() {
      return {
        registeredStudents: profiles.size,
        activeLearners: sessionUserId ? 1 : 0,
        experimentsCompleted: attempts.filter((a) => a.status === "COMPLETED").length,
        vivasCompleted: vivaAttempts.filter((a) => a.completedAt).length,
        simulationsCompleted: 0,
        contentRequiringVerification: 0,
      };
    },

    async listStudents() {
      return [...profiles.values()].map((p) => {
        const own = attempts.filter((a) => a.userId === p.userId);
        return {
          profile: p,
          experimentAttempts: own.length,
          experimentsCompleted: own.filter((a) => a.status === "COMPLETED").length,
          vivasCompleted: vivaAttempts.filter(
            (v) => v.userId === p.userId && v.completedAt
          ).length,
          credits: credits.reduce((s, c) => s + c.amount, 0),
          lastActivity: own[0]?.startedAt ?? null,
        } satisfies StudentSummary;
      });
    },

    async getStudent(userId) {
      const all = await this.listStudents();
      return all.find((s) => s.profile.userId === userId) ?? null;
    },

    async listContent() {
      return [] as ContentSummary[];
    },

    async setContentStatus(actorId, entityId, entityType, status) {
      void entityId;
      void entityType;
      void status;
      await this.logAction(actorId, {
        action: "content_status_changed",
        entityType: String(entityType),
        entityId: String(entityId),
        details: { to: status },
      });
    },

    async listAuditLogs(limit = 100) {
      return auditLogs.slice(0, limit);
    },

    async logAction(actorId, entry) {
      auditLogs.unshift({
        id: uid("audit"),
        actorId,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        details: entry.details ?? {},
        createdAt: new Date().toISOString(),
      });
    },
  };
}
