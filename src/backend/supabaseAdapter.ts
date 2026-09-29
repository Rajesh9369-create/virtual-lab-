/**
 * SUPABASE ADAPTER — the real production database
 * ----------------------------------------------
 * Real Supabase Auth + PostgreSQL access. All data protection comes from Row
 * Level Security in the database (see supabase/migrations/0002), never from
 * this file. Only the public anon key is used here — the service-role key
 * must never reach the browser.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminOverview,
  Backend,
  ContentStatus,
  ContentSummary,
  CreditEntry,
  CreditEventType,
  CompetencyDimension,
  CompetencyEvidence,
  ExperimentAttempt,
  LearningEventRecord,
  LearningEventType,
  MasteryRecord,
  MasteryStatus,
  StudentSummary,
  UserRole,
  VivaAttempt,
} from "./types";

export interface SupabaseBackend extends Backend {
  readonly client: SupabaseClient;
}

export function createSupabaseBackend(
  url: string,
  anonKey: string
): SupabaseBackend {
  const client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return {
    kind: "supabase",
    isRealDatabase: true,
    client,

    /* ------------------------------------------------------ Auth */

    async getCurrentUserId() {
      const { data } = await client.auth.getUser();
      return data.user?.id ?? null;
    },

    async signUp(email, password, displayName) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Sign-up did not return a user");

      await client.from("profiles").upsert({
        user_id: data.user.id,
        display_name: displayName,
        role: "STUDENT",
      });

      return { userId: data.user.id };
    },

    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Sign-in did not return a user");
      return { userId: data.user.id };
    },

    async signOut() {
      await client.auth.signOut();
    },

    onAuthStateChange(cb) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        cb(session?.user?.id ?? null);
      });
      return () => subscription.unsubscribe();
    },

    /* --------------------------------------------------- Profile */

    async getProfile(userId) {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        displayName: data.display_name,
        pharmdYear: data.pharmd_year,
        avatarUrl: data.avatar_url,
        role: data.role as UserRole,
        createdAt: data.created_at,
      };
    },

    async upsertProfile(userId, patch) {
      const row: Record<string, unknown> = { user_id: userId };
      if (patch.displayName !== undefined) row.display_name = patch.displayName;
      if (patch.pharmdYear !== undefined) row.pharmd_year = patch.pharmdYear;
      if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;

      const { data, error } = await client
        .from("profiles")
        .upsert(row)
        .select()
        .single();
      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        displayName: data.display_name,
        pharmdYear: data.pharmd_year,
        avatarUrl: data.avatar_url,
        role: data.role as UserRole,
        createdAt: data.created_at,
      };
    },

    /* ---------------------------------------------- Learning events */

    async recordLearningEvent(userId, event) {
      const { error } = await client.from("learning_events").insert({
        user_id: userId,
        event_type: event.eventType,
        subject_id: event.subjectId ?? null,
        topic_id: event.topicId ?? null,
        experiment_id: event.experimentId ?? null,
        simulation_id: event.simulationId ?? null,
        metadata: event.metadata ?? {},
      });
      if (error) throw error;
    },

    async listLearningEvents(userId, limit = 100) {
      const { data, error } = await client
        .from("learning_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(mapLearningEvent);
    },

    async listMastery(userId) {
      const { data, error } = await client
        .from("mastery_records")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => ({
        conceptId: r.concept_id as string,
        status: r.status as MasteryStatus,
        attempts: r.attempts as number,
        correctAnswers: r.correct_answers as number,
        evidenceCount: r.evidence_count as number,
        lastUpdated: r.last_updated as string,
      }));
    },

    async listCompetencyEvidence(userId) {
      const { data, error } = await client
        .from("competency_evidence")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map(
        (r: Record<string, unknown>): CompetencyEvidence => ({
          conceptId: r.concept_id as string,
          dimension: r.dimension as CompetencyDimension,
          correct: r.correct as boolean,
          sourceType: r.source_type as string,
          sourceId: (r.source_id as string | null) ?? null,
          createdAt: r.created_at as string,
        })
      );
    },

    /* ---------------------------------------------------- Attempts */

    async startAttempt(userId, experimentId, experimentVersion) {
      const existing = await client
        .from("experiment_attempts")
        .select("attempt_number")
        .eq("user_id", userId)
        .eq("experiment_id", experimentId);

      const attemptNumber =
        (existing.data?.length ?? 0) > 0
          ? Math.max(...(existing.data ?? []).map((r) => r.attempt_number)) + 1
          : 1;

      const { data, error } = await client
        .from("experiment_attempts")
        .insert({
          user_id: userId,
          experiment_id: experimentId,
          experiment_version: experimentVersion,
          attempt_number: attemptNumber,
          status: "STARTED",
        })
        .select()
        .single();
      if (error) throw error;
      return mapAttempt(data);
    },

    async recordEvent(userId, attemptId, event) {
      const { error } = await client.from("experiment_events").insert({
        attempt_id: attemptId,
        user_id: userId,
        event_type: event.eventType,
        step_id: event.stepId ?? null,
        payload: event.payload ?? {},
      });
      if (error) throw error;
    },

    async recordObservation(userId, attemptId, observation) {
      const { error } = await client.from("experiment_observations").insert({
        attempt_id: attemptId,
        user_id: userId,
        step_id: observation.stepId ?? null,
        observation_key: observation.observationKey,
        observed_value: observation.observedValue ?? null,
        unit: observation.unit ?? null,
        interpretation: observation.interpretation ?? null,
      });
      if (error) throw error;
    },

    async recordCalculation(userId, attemptId, calculation) {
      const { error } = await client.from("calculation_results").insert({
        attempt_id: attemptId,
        user_id: userId,
        calculation_key: calculation.calculationKey,
        student_input: calculation.studentInput ?? null,
        expected_value: calculation.expectedValue ?? null,
        unit: calculation.unit ?? null,
        tolerance: calculation.tolerance ?? null,
        correct: calculation.correct,
        calculation_version: calculation.calculationVersion ?? 1,
      });
      if (error) throw error;
    },

    async completeAttempt(userId, attemptId, summary) {
      await client
        .from("experiment_attempts")
        .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
        .eq("id", attemptId)
        .eq("user_id", userId);

      const { error } = await client.from("experiment_results").upsert({
        attempt_id: attemptId,
        user_id: userId,
        summary,
      });
      if (error) throw error;
    },

    async listAttempts(userId, experimentId) {
      let query = client
        .from("experiment_attempts")
        .select("*")
        .eq("user_id", userId);
      if (experimentId) query = query.eq("experiment_id", experimentId);
      const { data, error } = await query.order("started_at", {
        ascending: false,
      });
      if (error) throw error;
      return (data ?? []).map(mapAttempt);
    },

    /* -------------------------------------------------------- Viva */

    async startVivaAttempt(userId, experimentId, assessmentVersion) {
      const { data, error } = await client
        .from("viva_attempts")
        .insert({
          user_id: userId,
          experiment_id: experimentId,
          assessment_version: assessmentVersion,
        })
        .select()
        .single();
      if (error) throw error;
      return mapVivaAttempt(data);
    },

    async recordAnswer(userId, attemptId, answer) {
      const { error } = await client.from("viva_answers").insert({
        attempt_id: attemptId,
        user_id: userId,
        question_id: answer.questionId,
        answer: answer.answer,
        correct: answer.correct,
        attempts: answer.attempts,
      });
      if (error) throw error;
    },

    async completeVivaAttempt(userId, attemptId, result) {
      const { error } = await client
        .from("viva_attempts")
        .update({
          completed_at: new Date().toISOString(),
          score: result.score,
          correct_count: result.correctCount,
          incorrect_count: result.incorrectCount,
        })
        .eq("id", attemptId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async listVivaAttempts(userId, experimentId) {
      let query = client
        .from("viva_attempts")
        .select("*")
        .eq("user_id", userId);
      if (experimentId) query = query.eq("experiment_id", experimentId);
      const { data, error } = await query.order("started_at", {
        ascending: false,
      });
      if (error) throw error;
      return (data ?? []).map(mapVivaAttempt);
    },

    /* ----------------------------------------------------- Credits */

    async awardCredit(userId, entry) {
      void userId;
      // Ownership is re-derived server-side; the client cannot credit anyone      // else. The unique constraint makes repeat awards a no-op.
      const { data, error } = await client.rpc("award_credit", {
        p_event_type: entry.eventType,
        p_reference_type: entry.referenceType,
        p_reference_id: entry.referenceId,
        p_amount: entry.amount,
        p_description: entry.description ?? "",
      });
      if (error) throw error;
      return Boolean(data);
    },

    async listCredits(userId) {
      const { data, error } = await client
        .from("credits_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(
        (r: Record<string, unknown>): CreditEntry => ({
          id: r.id as string,
          eventType: r.event_type as CreditEventType,
          amount: r.amount as number,
          referenceType: r.reference_type as string,
          referenceId: r.reference_id as string,
          description: r.description as string,
          createdAt: r.created_at as string,
        })
      );
    },

    async getBalance(userId) {
      const entries = await this.listCredits(userId);
      return {
        balance: entries.reduce((s, e) => s + e.amount, 0),
        entries: entries.length,
      };
    },

    /* ----------------------------------------------------- Mastery */

    async recordCompetencyEvidence(userId, evidence) {
      void userId;
      const { error } = await client.from("competency_evidence").insert({
        user_id: userId,
        concept_id: evidence.conceptId,
        dimension: evidence.dimension,
        correct: evidence.correct,
        source_type: evidence.sourceType,
        source_id: evidence.sourceId ?? null,
      });
      if (error) throw error;

      await recomputeMasteryViaAdapter(userId, evidence.conceptId);
    },

    async recomputeMastery(userId, conceptId) {
      return recomputeMasteryViaAdapter(userId, conceptId);
    },

    /* ------------------------------------------------------- Admin */

    async getOverview(): Promise<AdminOverview> {
      const [profiles, attempts, vivas, sims, unverified] = await Promise.all([
        client.from("profiles").select("user_id, role", { count: "exact", head: true }),
        client
          .from("experiment_attempts")
          .select("id", { count: "exact", head: true })
          .eq("status", "COMPLETED"),
        client
          .from("viva_attempts")
          .select("id", { count: "exact", head: true })
          .not("completed_at", "is", null),
        client
          .from("simulation_attempts")
          .select("id", { count: "exact", head: true })
          .eq("status", "COMPLETED"),
        client
          .from("references")
          .select("id", { count: "exact", head: true })
          .eq("status", "VERIFICATION_REQUIRED"),
      ]);

      return {
        registeredStudents: profiles.count ?? 0,
        activeLearners: 0,
        experimentsCompleted: attempts.count ?? 0,
        vivasCompleted: vivas.count ?? 0,
        simulationsCompleted: sims.count ?? 0,
        contentRequiringVerification: unverified.count ?? 0,
      };
    },

    async listStudents() {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const out: StudentSummary[] = [];
      for (const p of data ?? []) {
        const [attempts, vivas, credits] = await Promise.all([
          client
            .from("experiment_attempts")
            .select("status, started_at")
            .eq("user_id", p.user_id),
          client
            .from("viva_attempts")
            .select("id")
            .eq("user_id", p.user_id)
            .not("completed_at", "is", null),
          client.from("credits_ledger").select("amount").eq("user_id", p.user_id),
        ]);

        const times = (attempts.data ?? []).map((r) => r.started_at as string);
        out.push({
          profile: {
            id: p.id,
            userId: p.user_id,
            displayName: p.display_name,
            pharmdYear: p.pharmd_year,
            avatarUrl: p.avatar_url,
            role: p.role as UserRole,
            createdAt: p.created_at,
          },
          experimentAttempts: attempts.data?.length ?? 0,
          experimentsCompleted:
            (attempts.data ?? []).filter((r) => r.status === "COMPLETED")
              .length ?? 0,
          vivasCompleted: vivas.data?.length ?? 0,
          credits: (credits.data ?? []).reduce((s, r) => s + r.amount, 0),
          lastActivity: times.length ? times.sort().reverse()[0] : null,
        });
      }
      return out;
    },

    async getStudent(userId) {
      const all = await this.listStudents();
      return all.find((s) => s.profile.userId === userId) ?? null;
    },

    async listContent() {
      const out: ContentSummary[] = [];
      const tables: Array<{
        table: string;
        type: ContentSummary["entityType"];
      }> = [
        { table: "subjects", type: "subject" },
        { table: "topics", type: "topic" },
        { table: "experiments", type: "experiment" },
        { table: "simulations", type: "simulation" },
        { table: "viva_questions", type: "viva_question" },
        { table: "references", type: "reference" },
        { table: "clinical_cases", type: "clinical_case" },
      ];

      for (const { table, type } of tables) {
        const { data, error } = await client
          .from(table)
          .select("id, title, content_status, version");
        if (error) continue;
        for (const r of data ?? []) {
          out.push({
            id: r.id,
            title: r.title ?? r.id,
            entityType: type,
            contentStatus: r.content_status as ContentStatus,
            version: r.version ?? 1,
          });
        }
      }
      return out;
    },

    async setContentStatus(actorId, entityId, entityType, status) {
      const table = entityType === "viva_question" ? "viva_questions" : `${entityType}s`;
      const { error } = await client
        .from(table)
        .update({ content_status: status })
        .eq("id", entityId);
      if (error) throw error;

      await this.logAction(actorId, {
        action: `content_status_changed`,
        entityType,
        entityId,
        details: { to: status },
      });
    },

    async listAuditLogs(limit = 100) {
      const { data, error } = await client
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        actorId: (r.actor_id as string | null) ?? null,
        action: r.action as string,
        entityType: (r.entity_type as string | null) ?? null,
        entityId: (r.entity_id as string | null) ?? null,
        details: (r.details as Record<string, unknown>) ?? {},
        createdAt: r.created_at as string,
      }));
    },

    async logAction(actorId, entry) {
      const { error } = await client.from("audit_logs").insert({
        actor_id: actorId,
        action: entry.action,
        entity_type: entry.entityType ?? null,
        entity_id: entry.entityId ?? null,
        details: entry.details ?? {},
      });
      if (error) throw error;
    },
  } as SupabaseBackend;

  /* --------------------------------------------------------- helpers */

  async function recomputeMasteryViaAdapter(
    userId: string,
    conceptId: string
  ): Promise<MasteryRecord> {
    const { data, error } = await client
      .from("competency_evidence")
      .select("correct")
      .eq("user_id", userId)
      .eq("concept_id", conceptId);
    if (error) throw error;

    const rows = data ?? [];
    const attempts = rows.length;
    const correctAnswers = rows.filter((r) => r.correct).length;
    const evidenceCount = attempts;

    const thresholds = await client
      .from("mastery_thresholds")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    const ratio = attempts > 0 ? correctAnswers / attempts : 0;
    const minEvidence = (thresholds.data?.min_evidence as number) ?? 3;
    const minAttempts = (thresholds.data?.min_attempts as number) ?? 2;

    const masteredMin = (thresholds.data?.mastered_min as number) ?? 0.9;
    const understoodMin = (thresholds.data?.understood_max as number) ?? 0.7;
    const developingMin = (thresholds.data?.developing_max as number) ?? 0.5;

    let status: MasteryStatus = "NEEDS_REVIEW";
    if (attempts < minAttempts || evidenceCount < minEvidence) {
      status = ratio >= 0.5 ? "DEVELOPING" : "NEEDS_REVIEW";
    } else if (ratio >= masteredMin) {
      status = "MASTERED";
    } else if (ratio >= understoodMin) {
      status = "UNDERSTOOD";
    } else if (ratio >= developingMin) {
      status = "DEVELOPING";
    }

    const record: MasteryRecord = {
      conceptId,
      status,
      attempts,
      correctAnswers,
      evidenceCount,
      lastUpdated: new Date().toISOString(),
    };

    await client.from("mastery_records").upsert({
      user_id: userId,
      concept_id: conceptId,
      status,
      attempts,
      correct_answers: correctAnswers,
      evidence_count: evidenceCount,
      last_updated: record.lastUpdated,
    });

    return record;
  }
}

function mapAttempt(r: Record<string, unknown>): ExperimentAttempt {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    experimentId: r.experiment_id as string,
    experimentVersion: r.experiment_version as number,
    attemptNumber: r.attempt_number as number,
    status: r.status as ExperimentAttempt["status"],
    startedAt: r.started_at as string,
    completedAt: (r.completed_at as string | null) ?? null,
  };
}

function mapVivaAttempt(r: Record<string, unknown>): VivaAttempt {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    experimentId: r.experiment_id as string,
    assessmentVersion: r.assessment_version as number,
    startedAt: r.started_at as string,
    completedAt: (r.completed_at as string | null) ?? null,
    score: (r.score as number | null) ?? null,
    correctCount: r.correct_count as number,
    incorrectCount: r.incorrect_count as number,
  };
}

function mapLearningEvent(r: Record<string, unknown>): LearningEventRecord {
  return {
    id: r.id as string,
    eventType: r.event_type as LearningEventType,
    subjectId: (r.subject_id as string | null) ?? null,
    topicId: (r.topic_id as string | null) ?? null,
    experimentId: (r.experiment_id as string | null) ?? null,
    simulationId: (r.simulation_id as string | null) ?? null,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: r.created_at as string,
  };
}
