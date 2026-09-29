/**
 * STUDENT PROGRESS — derivation
 * -----------------------------
 * Turns raw learning events into the views the Progress page renders. Pure
 * functions: nothing here reads or writes storage.
 */
import { EXPERIMENTS, LIBRARY } from "../data/experiments";
import { CURRICULUM } from "../data/curriculum";
import type {
  ExperimentProgressStatus,
  LearningEvent,
  StudentProgress,
} from "./types";
import type { MasteryStatus } from "../engine/viva";
import { masteryFor } from "../engine/viva";

export interface ExperimentProgressView {
  experimentId: string;
  slug: string;
  title: string;
  domain: string;
  status: ExperimentProgressStatus;
  /** Stages genuinely reached. */
  stages: { id: string; label: string; reached: boolean }[];
  vivaTaken: boolean;
  vivaAccuracy: number | null;
  updatedAt: number | null;
}

const STAGE_ORDER = [
  { id: "prepare", label: "Procedure" },
  { id: "observe", label: "Observation" },
  { id: "result", label: "Result" },
  { id: "viva", label: "Viva" },
];

const STAGE_RANK: Record<string, number> = {
  introduction: 0,
  prepare: 1,
  perform: 2,
  observe: 3,
  calculate: 4,
  interpret: 5,
  result: 6,
  viva: 7,
  assessment: 8,
};

export function experimentProgress(
  progress: StudentProgress,
  experimentId: string
): ExperimentProgressView | null {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment) return null;

  const completed = progress.events.some(
    (e) => e.type === "experimentCompleted" && e.experimentId === experimentId
  );
  const started =
    completed ||
    progress.events.some(
      (e) => e.type === "experimentStarted" && e.experimentId === experimentId
    ) ||
    Boolean(progress.experimentStages[experimentId]);

  const viva = progress.vivas.find((v) => v.experimentId === experimentId);
  const lastStage = progress.experimentStages[experimentId];
  const rank = lastStage ? (STAGE_RANK[lastStage] ?? 0) : 0;

  const stages = STAGE_ORDER.map((s) => ({
    ...s,
    reached: viva ? true : rank >= (STAGE_RANK[s.id] ?? 0),
  }));

  let status: ExperimentProgressStatus = "NOT_STARTED";
  if (completed) {
    const needsReview = (viva?.needsReview.length ?? 0) > 0;
    status = needsReview ? "REVIEW" : "COMPLETED";
  } else if (started) {
    status = "IN_PROGRESS";
  }

  const updatedAt = progress.events.find(
    (e) => e.experimentId === experimentId
  )?.timestamp;

  return {
    experimentId,
    slug: experiment.slug,
    title: experiment.title,
    domain: experiment.domain,
    status,
    stages,
    vivaTaken: Boolean(viva),
    vivaAccuracy: viva ? viva.accuracy : null,
    updatedAt: updatedAt ?? null,
  };
}

export interface SubjectProgressView {
  subjectId: string;
  subjectName: string;
  yearLabel: string;
  yearNumber: number;
  topicsExplored: number;
  experimentsCompleted: number;
  experimentsTotal: number;
  vivaAverage: number | null;
  hasActivity: boolean;
}

export function subjectProgress(
  progress: StudentProgress
): SubjectProgressView[] {
  const rows: SubjectProgressView[] = [];

  for (const year of CURRICULUM.years) {
    for (const subject of year.subjects) {
      const experimentIds = EXPERIMENTS.filter(
        (e) => e.subjectId === subject.id
      ).map((e) => e.id);

      const topicsExplored = new Set(
        progress.events
          .filter((e) => e.type === "topicViewed" && e.subjectId === subject.id)
          .map((e) => e.topicId)
      ).size;

      const experimentsCompleted = experimentIds.filter((id) =>
        progress.events.some(
          (e) => e.type === "experimentCompleted" && e.experimentId === id
        )
      ).length;

      const vivas = progress.vivas.filter((v) =>
        experimentIds.includes(v.experimentId)
      );
      const vivaAverage =
        vivas.length > 0
          ? vivas.reduce((sum, v) => sum + v.accuracy, 0) / vivas.length
          : null;

      const hasActivity =
        topicsExplored > 0 ||
        experimentsCompleted > 0 ||
        progress.events.some(
          (e) =>
            e.subjectId === subject.id &&
            (e.type === "subjectViewed" || e.type === "experimentStarted")
        );

      rows.push({
        subjectId: subject.id,
        subjectName: subject.name,
        yearLabel: year.label,
        yearNumber: year.number,
        topicsExplored,
        experimentsCompleted,
        experimentsTotal: experimentIds.length,
        vivaAverage,
        hasActivity,
      });
    }
  }

  return rows;
}

export interface ProgressSummary {
  experimentsCompleted: number;
  experimentsAvailable: number;
  experimentsInProgress: number;
  topicsExplored: number;
  subjectsExplored: number;
  vivasCompleted: number;
  conceptsMastered: number;
  conceptsSeen: number;
  conceptsNeedingReview: string[];
  /** 0–1, only meaningful when there is activity. */
  overallRatio: number;
  hasActivity: boolean;
}

export function summarise(progress: StudentProgress): ProgressSummary {
  const available = LIBRARY.filter((e) => e.status === "AVAILABLE");
  const availableIds = available.map((e) => e.experiment!.id);

  const experimentsCompleted = availableIds.filter((id) =>
    progress.events.some(
      (e) => e.type === "experimentCompleted" && e.experimentId === id
    )
  ).length;

  const experimentsInProgress = availableIds.filter((id) => {
    const completed = progress.events.some(
      (e) => e.type === "experimentCompleted" && e.experimentId === id
    );
    const started = progress.events.some(
      (e) => e.type === "experimentStarted" && e.experimentId === id
    );
    return started && !completed;
  }).length;

  const topicsExplored = new Set(
    progress.events
      .filter((e) => e.type === "topicViewed")
      .map((e) => e.topicId)
  ).size;

  const subjectsExplored = new Set(
    progress.events
      .filter((e) => e.subjectId)
      .map((e) => e.subjectId)
  ).size;

  const concepts = Object.values(progress.mastery);
  const conceptsMastered = concepts.filter((m) => m.status === "MASTERED").length;
  const conceptsNeedingReview = concepts
    .filter((m) => m.status === "NEEDS REVIEW" || m.status === "DEVELOPING")
    .map((m) => m.conceptId);

  const vivasCompleted = progress.vivas.length;

  /* Overall ratio is a simple, honest blend of what has actually happened. */
  const denom =
    availableIds.length + Math.max(topicsExplored, 1) + Math.max(vivasCompleted, 1);
  const overallRatio = Math.min(
    1,
    (experimentsCompleted + topicsExplored + vivasCompleted) / denom
  );

  return {
    experimentsCompleted,
    experimentsAvailable: availableIds.length,
    experimentsInProgress,
    topicsExplored,
    subjectsExplored,
    vivasCompleted,
    conceptsMastered,
    conceptsSeen: concepts.length,
    conceptsNeedingReview,
    overallRatio,
    hasActivity: progress.events.length > 0,
  };
}

export interface ContinueTarget {
  kind: "experiment" | "viva" | "review" | "explore";
  title: string;
  detail: string;
  href: string;
}

/** The single most relevant unfinished activity. Never invented. */
export function continueTarget(progress: StudentProgress): ContinueTarget | null {
  const available = LIBRARY.filter((e) => e.status === "AVAILABLE");

  /* 1. An experiment that was started but never finished. */
  const unfinished = available.find((e) => {
    const id = e.experiment!.id;
    const completed = progress.events.some(
      (ev) => ev.type === "experimentCompleted" && ev.experimentId === id
    );
    const started = progress.events.some(
      (ev) => ev.type === "experimentStarted" && ev.experimentId === id
    );
    return started && !completed;
  });
  if (unfinished) {
    return {
      kind: "experiment",
      title: `Continue ${unfinished.title}`,
      detail: "You started this experiment but have not reached the result yet.",
      href: `#/lab/experiment/${unfinished.slug}`,
    };
  }

  /* 2. A viva with concepts that need review. */
  const needsReview = progress.vivas.find((v) => v.needsReview.length > 0);
  if (needsReview) {
    const experiment = EXPERIMENTS.find(
      (e) => e.id === needsReview.experimentId
    );
    if (experiment) {
      return {
        kind: "review",
        title: `Review ${needsReview.needsReview[0]}`,
        detail: `Your viva for ${experiment.title} flagged concepts to revisit.`,
        href: `#/lab/experiment/${experiment.slug}`,
      };
    }
  }

  /* 3. A completed experiment with no viva yet. */
  const awaitingViva = available.find((e) => {
    const id = e.experiment!.id;
    return (
      progress.events.some(
        (ev) => ev.type === "experimentCompleted" && ev.experimentId === id
      ) && !progress.vivas.some((v) => v.experimentId === id)
    );
  });
  if (awaitingViva) {
    return {
      kind: "viva",
      title: `Take the viva for ${awaitingViva.title}`,
      detail: "You completed the procedure — test your understanding of it.",
      href: `#/lab/experiment/${awaitingViva.slug}`,
    };
  }

  /* 4. Otherwise, the next untouched experiment. */
  const next = available.find((e) => {
    const id = e.experiment!.id;
    return !progress.events.some((ev) => ev.experimentId === id);
  });
  if (next) {
    return {
      kind: "experiment",
      title: `Start ${next.title}`,
      detail: next.shortDescription,
      href: `#/lab/experiment/${next.slug}`,
    };
  }

  return null;
}

/* ------------------------------------------------------------ History */

export interface HistoryGroup {
  key: string;
  label: string;
  events: LearningEvent[];
}

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function historyGroups(progress: StudentProgress): HistoryGroup[] {
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - 86400000);

  const groups = new Map<string, HistoryGroup>();
  for (const event of progress.events) {
    const key = dayKey(event.timestamp);
    if (!groups.has(key)) {
      const label =
        key === today ? "Today" : key === yesterday ? "Yesterday" : "";
      groups.set(key, { key, label, events: [] });
    }
    groups.get(key)!.events.push(event);
  }

  return [...groups.values()].map((g) => {
    if (g.label) return g;
    const d = new Date(g.events[0].timestamp);
    return {
      ...g,
      label: d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });
}

/* ------------------------------------------------------------ Mastery */

export interface MasteryView {
  conceptId: string;
  status: MasteryStatus;
  attempts: number;
  correctAnswers: number;
  lastUpdated: number;
}

export function masteryViews(progress: StudentProgress): MasteryView[] {
  return Object.values(progress.mastery)
    .map((m) => ({
      conceptId: m.conceptId,
      status: m.status,
      attempts: m.attempts,
      correctAnswers: m.correctAnswers,
      lastUpdated: m.lastUpdated,
    }))
    .sort((a, b) => a.status.localeCompare(b.status) || b.lastUpdated - a.lastUpdated);
}

/** Overall mastery band for the header, derived only from real records. */
export function overallMastery(progress: StudentProgress): MasteryStatus | null {
  const records = Object.values(progress.mastery);
  if (records.length === 0) return null;
  const correct = records.reduce((s, m) => s + m.correctAnswers, 0);
  const attempts = records.reduce((s, m) => s + m.attempts, 0);
  if (attempts === 0) return null;
  return masteryFor((correct / attempts) * 100);
}
