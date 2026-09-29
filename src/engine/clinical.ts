/**
 * CLINICAL DECISION SIMULATION — state machine
 * --------------------------------------------
 * An educational case simulation about the pharmaceutical care process:
 * review information → identify the problem → decide → see a consequence →
 * reassess. It is not a diagnosis generator and produces no dosing
 * instruction. Every outcome is labelled as a simulated educational outcome.
 */
import type { SourceStatus } from "../data/curriculum";

export type ClinicalInfoKind =
  | "patient"
  | "vitals"
  | "labs"
  | "medications"
  | "notes";

export interface ClinicalInfo {
  kind: ClinicalInfoKind;
  label: string;
  /** Short value or statement, shown as a chip. */
  value: string;
  /** Qualitative status, when the information carries one. */
  tone?: "normal" | "attention" | "recent";
  note?: string;
}

export interface ClinicalOption {
  id: string;
  text: string;
  correct: boolean;
  /** Explanation shown as the consequence of this choice. */
  feedback: string;
}

export interface ClinicalStage {
  id: string;
  title: string;
  /** One short instruction. */
  instruction: string;
  /** Information revealed at this stage. */
  reveals: ClinicalInfo[];
  /** The decision, when this stage asks for one. */
  choice?: {
    prompt: string;
    options: ClinicalOption[];
  };
}

export interface ClinicalCase {
  id: string;
  title: string;
  domain: string;
  objective: string;
  scientificConcept: string;
  stages: ClinicalStage[];
  sourceStatus: SourceStatus;
  sourceNote: string;
}

export interface ClinicalState {
  currentIndex: number;
  /** Information revealed so far, by kind. */
  revealed: ClinicalInfo[];
  chosen: Record<string, string>;
  feedback: ClinicalOption | null;
  status: "reading" | "feedback" | "complete";
  round: number;
}

export type ClinicalAction =
  | { type: "CONTINUE" }
  | { type: "CHOOSE"; optionId: string }
  | { type: "NEXT" }
  | { type: "RETRY" }
  | { type: "RESTART" };

export function createClinicalState(): ClinicalState {
  return {
    currentIndex: 0,
    revealed: [],
    chosen: {},
    feedback: null,
    status: "reading",
    round: 0,
  };
}

export function clinicalReducer(
  state: ClinicalState,
  action: ClinicalAction,
  clinicalCase: ClinicalCase
): ClinicalState {
  switch (action.type) {
    case "CONTINUE": {
      const stage = clinicalCase.stages[state.currentIndex];
      if (!stage) return state;
      const revealed = [...state.revealed, ...stage.reveals];
      const nextIndex = state.currentIndex + 1;
      const isLast = nextIndex >= clinicalCase.stages.length;
      return {
        ...state,
        revealed,
        currentIndex: isLast ? state.currentIndex : nextIndex,
        status: clinicalCase.stages[nextIndex]?.choice ? "reading" : "reading",
        round: state.round + 1,
      };
    }

    case "CHOOSE": {
      const stage = clinicalCase.stages[state.currentIndex];
      if (!stage?.choice) return state;
      const option = stage.choice.options.find((o) => o.id === action.optionId);
      if (!option) return state;
      return {
        ...state,
        chosen: { ...state.chosen, [stage.id]: option.id },
        feedback: option,
        status: "feedback",
        round: state.round + 1,
      };
    }

    case "RETRY":
      return {
        ...state,
        feedback: null,
        status: "reading",
        round: state.round + 1,
      };

    case "NEXT": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= clinicalCase.stages.length) {
        return { ...state, status: "complete", round: state.round + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        feedback: null,
        status: "reading",
        round: state.round + 1,
      };
    }

    case "RESTART":
      return { ...createClinicalState(), round: state.round + 1 };

    default:
      return state;
  }
}

/** Concepts answered correctly, for mastery recording. */
export function clinicalConceptResults(
  clinicalCase: ClinicalCase,
  chosen: Record<string, string>
): { concept: string; correct: boolean }[] {
  const results: { concept: string; correct: boolean }[] = [];
  for (const stage of clinicalCase.stages) {
    if (!stage.choice) continue;
    const picked = chosen[stage.id];
    const option = stage.choice.options.find((o) => o.id === picked);
    results.push({ concept: stage.title, correct: Boolean(option?.correct) });
  }
  return results;
}
