/**
 * VIVA ENGINE — types, state and scoring
 * --------------------------------------
 * Everything here is pure and UI-free: question shape, the session state
 * machine, scoring and mastery. Question banks live in src/data/viva.ts and
 * are experiment-specific; the presentation lives in src/components/viva.
 *
 * A viva is a session result only — no persistence, no XP, no streaks.
 */
import type { DevelopmentStatus, SourceStatus } from "../data/curriculum";

export type VivaQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "APPARATUS_IDENTIFICATION"
  | "PROCEDURE_SEQUENCING"
  | "OBSERVATION_INTERPRETATION"
  | "CALCULATION"
  | "WHAT_HAPPENS_NEXT"
  | "WHY"
  | "ERROR_DETECTION";

export const VIVA_TYPE_LABEL: Record<VivaQuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True or false",
  APPARATUS_IDENTIFICATION: "Identify the apparatus",
  PROCEDURE_SEQUENCING: "Put the steps in order",
  OBSERVATION_INTERPRETATION: "Interpret the observation",
  CALCULATION: "Calculation",
  WHAT_HAPPENS_NEXT: "What happens next?",
  WHY: "Why did this happen?",
  ERROR_DETECTION: "Spot the problem",
};

export type VivaDifficulty =
  | "FOUNDATION"
  | "UNDERSTANDING"
  | "APPLICATION"
  | "ANALYSIS";

export const VIVA_DIFFICULTY_LABEL: Record<VivaDifficulty, string> = {
  FOUNDATION: "Foundation",
  UNDERSTANDING: "Understanding",
  APPLICATION: "Application",
  ANALYSIS: "Analysis",
};

/** How the question should be illustrated. */
export type VivaVisual = "apparatus" | "state" | "graph" | "none";

export interface VivaOption {
  id: string;
  text: string;
  /** True when this option is the correct one. */
  correct?: boolean;
}

export interface VivaQuestion {
  id: string;
  type: VivaQuestionType;
  difficulty: VivaDifficulty;
  /** One short sentence. */
  prompt: string;
  /** Concept this question tests — used for remediation. */
  concept: string;
  /** Short explanation shown after answering. */
  explanation: string;
  /** Visual context to keep on screen. */
  visual: VivaVisual;
  /** For identification questions: the correct object in the scene. */
  targetObjectId?: string;
  /** For identification questions: textual alternatives. */
  options?: VivaOption[];
  /** For sequencing questions: the steps in the correct order. */
  sequence?: string[];
  /** Scene state to display, when the question depends on one. */
  sceneState?: "endpoint" | "overshot" | "start";
  status: DevelopmentStatus;
  sourceStatus?: SourceStatus;
  /** Specific references for this question; falls back to the experiment's. */
  referenceIds?: string[];
}

export interface VivaBank {
  experimentId: string;
  questions: VivaQuestion[];
}

/* --------------------------------------------------------------- State */

export interface VivaAnswer {
  questionId: string;
  concept: string;
  correct: boolean;
  attempts: number;
}

export type VivaStatus = "asking" | "feedback" | "complete";

export interface VivaState {
  experimentId: string;
  currentIndex: number;
  status: VivaStatus;
  /** Option chosen in the current question. */
  selectedOptionId: string | null;
  /** Object clicked in the scene, for identification questions. */
  identifiedObjectId: string | null;
  /** Steps tapped so far, for sequencing questions. */
  sequencePicks: string[];
  answers: VivaAnswer[];
  /** Whether the current question was answered correctly. */
  lastCorrect: boolean;
  /** Increments each time a question changes, to re-trigger animations. */
  round: number;
}

export function createVivaState(bank: VivaBank): VivaState {
  return {
    experimentId: bank.experimentId,
    currentIndex: 0,
    status: "asking",
    selectedOptionId: null,
    identifiedObjectId: null,
    sequencePicks: [],
    answers: [],
    lastCorrect: false,
    round: 0,
  };
}

export type VivaAction =
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "IDENTIFY_OBJECT"; objectId: string }
  | { type: "PICK_STEP"; step: string }
  | { type: "RESET_SEQUENCE" }
  | { type: "SUBMIT"; correct: boolean }
  | { type: "NEXT" }
  | { type: "RETRY" }
  | { type: "RESTART" };

export function vivaReducer(
  state: VivaState,
  action: VivaAction,
  bank: VivaBank
): VivaState {
  switch (action.type) {
    case "SELECT_OPTION":
      return { ...state, selectedOptionId: action.optionId };

    case "IDENTIFY_OBJECT":
      return { ...state, identifiedObjectId: action.objectId };

    case "PICK_STEP":
      if (state.sequencePicks.includes(action.step)) return state;
      return {
        ...state,
        sequencePicks: [...state.sequencePicks, action.step],
      };

    case "RESET_SEQUENCE":
      return { ...state, sequencePicks: [] };

    case "SUBMIT":
      return {
        ...state,
        status: "feedback",
        lastCorrect: action.correct,
        answers: [
          ...state.answers.filter(
            (a) => a.questionId !== bank.questions[state.currentIndex].id
          ),
          {
            questionId: bank.questions[state.currentIndex].id,
            concept: bank.questions[state.currentIndex].concept,
            correct: action.correct,
            attempts:
              (state.answers.find(
                (a) => a.questionId === bank.questions[state.currentIndex].id
              )?.attempts ?? 0) + 1,
          },
        ],
      };

    case "RETRY":
      return {
        ...state,
        status: "asking",
        selectedOptionId: null,
        identifiedObjectId: null,
        sequencePicks: [],
        lastCorrect: false,
      };

    case "NEXT": {
      const next = state.currentIndex + 1;
      if (next >= bank.questions.length) {
        return { ...state, status: "complete", currentIndex: next - 1, round: state.round + 1 };
      }
      return {
        ...state,
        currentIndex: next,
        status: "asking",
        selectedOptionId: null,
        identifiedObjectId: null,
        sequencePicks: [],
        lastCorrect: false,
        round: state.round + 1,
      };
    }

    case "RESTART":
      return { ...createVivaState(bank), round: state.round + 1 };

    default:
      return state;
  }
}

/* ------------------------------------------------------------- Scoring */

export type MasteryStatus =
  | "NEEDS REVIEW"
  | "DEVELOPING"
  | "UNDERSTOOD"
  | "MASTERED";

export interface VivaScore {
  total: number;
  answered: number;
  correct: number;
  accuracy: number;
  mastery: MasteryStatus;
  mastered: string[];
  needsReview: string[];
}

export function masteryFor(accuracy: number): MasteryStatus {
  if (accuracy >= 90) return "MASTERED";
  if (accuracy >= 70) return "UNDERSTOOD";
  if (accuracy >= 50) return "DEVELOPING";
  return "NEEDS REVIEW";
}

export const MASTERY_COLOUR: Record<MasteryStatus, string> = {
  "NEEDS REVIEW": "#E05050",
  DEVELOPING: "#F0B24A",
  UNDERSTOOD: "#3ED9B0",
  MASTERED: "#17B47C",
};

export function scoreViva(bank: VivaBank, answers: VivaAnswer[]): VivaScore {
  const byConcept = new Map<string, boolean>();
  for (const q of bank.questions) {
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer) byConcept.set(q.concept, answer.correct);
  }

  const answered = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const accuracy = answered > 0 ? (correct / answered) * 100 : 0;

  const mastered: string[] = [];
  const needsReview: string[] = [];
  for (const [concept, ok] of byConcept) {
    (ok ? mastered : needsReview).push(concept);
  }

  return {
    total: bank.questions.length,
    answered,
    correct,
    accuracy,
    mastery: masteryFor(accuracy),
    mastered,
    needsReview,
  };
}
