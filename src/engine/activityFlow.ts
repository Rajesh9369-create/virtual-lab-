/**
 * CLINICAL & HOSPITAL ACTIVITY ENGINE
 * ----------------------------------
 * One reusable state machine behind every clinical and hospital pharmacy
 * activity: medication review, counselling, drug information, inventory,
 * dispensing workflow and medication-error recognition.
 *
 * Flow: OBSERVE → ASSESS → IDENTIFY → PLAN → ACT → REASSESS → RESULT
 *
 * Pure and UI-free. Case data lives in src/data/clinicalActivities.ts.
 */
import type { SourceStatus } from "../data/curriculum";

export type ActivityKind =
  | "MEDICATION_REVIEW"
  | "COUNSELLING"
  | "DRUG_INFORMATION"
  | "INVENTORY"
  | "DISPENSING_WORKFLOW"
  | "MEDICATION_ERROR";

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  MEDICATION_REVIEW: "Medication review",
  COUNSELLING: "Patient counselling",
  DRUG_INFORMATION: "Drug information",
  INVENTORY: "Inventory",
  DISPENSING_WORKFLOW: "Dispensing workflow",
  MEDICATION_ERROR: "Medication error recognition",
};

export type PanelKind =
  | "patient"
  | "vitals"
  | "labs"
  | "medications"
  | "notes"
  | "counselling"
  | "inventory"
  | "workflow"
  | "formulary";

export type ItemTone = "normal" | "attention" | "recent" | "ok" | "warn" | "low";

export interface ActivityItem {
  id: string;
  label: string;
  value: string;
  tone?: ItemTone;
  note?: string;
  /** For inventory rows: units in stock. */
  stock?: number;
  /** For inventory rows: expiry as an ISO date string. */
  expiry?: string;
}

export interface ActivityPanel {
  kind: PanelKind;
  title: string;
  /** Honest framing, e.g. "Simulated educational values". */
  caption?: string;
  items: ActivityItem[];
}

export interface ActivityOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

export interface ActivityStage {
  id: string;
  /** The stage name shown in the pathway. */
  title: string;
  instruction: string;
  reveals: ActivityPanel[];
  /** A single-choice decision. */
  choice?: { prompt: string; options: ActivityOption[] };
  /** A select-all-that-apply decision. */
  multi?: { prompt: string; options: ActivityOption[] };
}

export interface ClinicalActivity {
  id: string;
  kind: ActivityKind;
  environment: "clinical" | "hospital";
  title: string;
  objective: string;
  skills: string[];
  concepts: string[];
  stages: ActivityStage[];
  sourceStatus: SourceStatus;
  sourceNote: string;
}

/* --------------------------------------------------------------- State */

export interface ActivityAnswer {
  stageId: string;
  concept: string;
  correct: boolean;
}

export type ActivityStatus = "reading" | "feedback" | "complete";

export interface ActivityState {
  currentIndex: number;
  /** Panels revealed so far, in order. */
  revealed: ActivityPanel[];
  chosen: Record<string, string>;
  multiPicks: string[];
  feedback: { option: ActivityOption; allCorrect: boolean } | null;
  answers: ActivityAnswer[];
  status: ActivityStatus;
  round: number;
}

export type ActivityAction =
  | { type: "CONTINUE" }
  | { type: "CHOOSE"; optionId: string }
  | { type: "TOGGLE_PICK"; optionId: string }
  | { type: "SUBMIT_MULTI" }
  | { type: "NEXT" }
  | { type: "RETRY" }
  | { type: "RESTART" };

export function createActivityState(): ActivityState {
  return {
    currentIndex: 0,
    revealed: [],
    chosen: {},
    multiPicks: [],
    feedback: null,
    answers: [],
    status: "reading",
    round: 0,
  };
}

export function activityReducer(
  state: ActivityState,
  action: ActivityAction,
  activity: ClinicalActivity
): ActivityState {
  const stage = activity.stages[state.currentIndex];
  const bump = state.round + 1;

  switch (action.type) {
    case "CONTINUE": {
      if (!stage) return state;
      return {
        ...state,
        revealed: [...state.revealed, ...stage.reveals],
        currentIndex: Math.min(
          activity.stages.length - 1,
          state.currentIndex + 1
        ),
        status: "reading",
        round: bump,
      };
    }

    case "CHOOSE": {
      if (!stage?.choice) return state;
      const option = stage.choice.options.find((o) => o.id === action.optionId);
      if (!option) return state;
      return {
        ...state,
        chosen: { ...state.chosen, [stage.id]: option.id },
        feedback: { option, allCorrect: option.correct },
        status: "feedback",
        answers: [
          ...state.answers.filter((a) => a.stageId !== stage.id),
          { stageId: stage.id, concept: stage.title, correct: option.correct },
        ],
        round: bump,
      };
    }

    case "TOGGLE_PICK": {
      const has = state.multiPicks.includes(action.optionId);
      return {
        ...state,
        multiPicks: has
          ? state.multiPicks.filter((p) => p !== action.optionId)
          : [...state.multiPicks, action.optionId],
      };
    }

    case "SUBMIT_MULTI": {
      if (!stage?.multi) return state;
      const picks = state.multiPicks;
      const required = stage.multi.options.filter((o) => o.correct);
      const pickedCorrect = required.filter((o) => picks.includes(o.id)).length;
      const pickedWrong = stage.multi.options.filter(
        (o) => !o.correct && picks.includes(o.id)
      );
      const allCorrect =
        pickedCorrect === required.length && pickedWrong.length === 0;

      /* Point the feedback at the first missed or wrongly picked option. */
      const missed = required.find((o) => !picks.includes(o.id));
      const wrong = pickedWrong[0];
      const focus = missed ?? wrong ?? required[0];

      return {
        ...state,
        feedback: { option: focus, allCorrect },
        status: "feedback",
        answers: [
          ...state.answers.filter((a) => a.stageId !== stage.id),
          { stageId: stage.id, concept: stage.title, correct: allCorrect },
        ],
        round: bump,
      };
    }

    case "RETRY":
      return {
        ...state,
        multiPicks: [],
        feedback: null,
        status: "reading",
        round: bump,
      };

    case "NEXT": {
      const next = state.currentIndex + 1;
      if (next >= activity.stages.length) {
        return { ...state, status: "complete", round: bump };
      }
      return {
        ...state,
        currentIndex: next,
        multiPicks: [],
        feedback: null,
        status: "reading",
        round: bump,
      };
    }

    case "RESTART":
      return { ...createActivityState(), round: bump };

    default:
      return state;
  }
}

/** Per-concept results, for mastery recording. */
export function activityConceptResults(
  activity: ClinicalActivity,
  answers: ActivityAnswer[]
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const stage of activity.stages) {
    if (!stage.choice && !stage.multi) continue;
    const answer = answers.find((a) => a.stageId === stage.id);
    if (answer) out[stage.title] = answer.correct;
  }
  return out;
}

/** Number of decision stages that were answered appropriately. */
export function activityScore(answers: ActivityAnswer[]) {
  const decisions = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  return {
    decisions,
    correct,
    accuracy: decisions > 0 ? (correct / decisions) * 100 : 0,
  };
}
