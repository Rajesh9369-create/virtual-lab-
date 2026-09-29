/**
 * EXPERIMENT ENGINE — Simulation state
 * ------------------------------------
 * Pure, UI-free simulation state. The reducer is the single source of truth
 * for the experiment; React components only dispatch and render.
 */
import type {
  BenchItem,
  Experiment,
  ExperimentStageId,
  Interaction,
  ObservationDef,
} from "./types";

export interface ObservationRecord {
  id: string;
  label: string;
  /** null when no simulation is connected yet. */
  value: string | number | null;
  unit?: string;
  kind: ObservationDef["kind"];
  origin: "simulation" | "pending";
}

export type FeedbackKind = "success" | "info" | "attention";

export interface Feedback {
  kind: FeedbackKind;
  message: string;
  /** Monotonic counter so repeated identical feedback re-triggers. */
  seq: number;
}

export interface SimulationState {
  /** Currently selected bench object. */
  selectedObjectId: string | null;
  /** Index into experiment.steps. */
  currentStepIndex: number;
  /** Parameter values keyed by interaction id. */
  parameterValues: Record<string, number>;
  /** Liquid levels keyed by bench item id (0–100). */
  fillLevels: Record<string, number>;
  /** Interaction ids the learner has completed. */
  completedActions: string[];
  /** Whether a running action is in progress. */
  running: boolean;
  /** Latest visual feedback — never the only channel (see aria-live). */
  feedback: Feedback | null;
  /** Observations recorded from simulation state. */
  observations: ObservationRecord[];
  /**
   * Generic boolean flags — experiment steps flip these (e.g. "burette filled").
   * Keeps the reducer generic so new experiments need no new action types.
   */
  flags: Record<string, boolean>;
  /** Generic numeric slots — e.g. mL delivered by a titration. */
  values: Record<string, number>;
}

export type SimulationAction =
  | { type: "SELECT_OBJECT"; id: string | null }
  | { type: "SET_PARAMETER"; interactionId: string; value: number }
  | { type: "ADJUST_FILL"; itemId: string; fill: number }
  | { type: "COMPLETE_ACTION"; interactionId: string; feedback?: Omit<Feedback, "seq"> }
  | { type: "SET_STEP"; index: number }
  | { type: "SET_RUNNING"; running: boolean }
  | { type: "RECORD_OBSERVATION"; record: ObservationRecord }
  | { type: "SET_FLAG"; key: string; value: boolean }
  | { type: "SET_VALUE"; key: string; value: number }
  | { type: "CLEAR_FEEDBACK" }
  | { type: "RESET" };

let feedbackSeq = 0;

export function createSimulationState(experiment: Experiment): SimulationState {
  const parameterValues: Record<string, number> = {};
  const fillLevels: Record<string, number> = {};
  const observations: ObservationRecord[] = [];

  for (const step of experiment.steps) {
    for (const interaction of step.interactions) {
      if (interaction.range) {
        parameterValues[interaction.id] = interaction.range.initial;
      }
    }
  }
  for (const item of [...experiment.apparatus, ...experiment.materials]) {
    if (typeof item.fill === "number") fillLevels[item.id] = item.fill;
  }
  for (const def of experiment.observations) {
    observations.push({
      id: def.id,
      label: def.label,
      value: null,
      unit: def.unit,
      kind: def.kind,
      origin: "pending",
    });
  }

  return {
    selectedObjectId: null,
    currentStepIndex: 0,
    parameterValues,
    fillLevels,
    completedActions: [],
    running: false,
    feedback: null,
    observations,
    flags: {},
    values: {},
  };
}

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case "SELECT_OBJECT":
      return {
        ...state,
        selectedObjectId: action.id,
      };

    case "SET_PARAMETER":
      return {
        ...state,
        parameterValues: {
          ...state.parameterValues,
          [action.interactionId]: action.value,
        },
      };

    case "ADJUST_FILL":
      return {
        ...state,
        fillLevels: {
          ...state.fillLevels,
          [action.itemId]: Math.max(0, Math.min(100, action.fill)),
        },
      };

    case "COMPLETE_ACTION": {
      if (state.completedActions.includes(action.interactionId)) return state;
      feedbackSeq += 1;
      return {
        ...state,
        completedActions: [...state.completedActions, action.interactionId],
        feedback: action.feedback
          ? { ...action.feedback, seq: feedbackSeq }
          : state.feedback,
      };
    }

    case "SET_STEP":
      return { ...state, currentStepIndex: action.index };

    case "SET_RUNNING":
      return { ...state, running: action.running };

    case "RECORD_OBSERVATION":
      return {
        ...state,
        observations: state.observations.some((o) => o.id === action.record.id)
          ? state.observations.map((o) =>
              o.id === action.record.id ? action.record : o
            )
          : [...state.observations, action.record],
      };

    case "SET_FLAG":
      return { ...state, flags: { ...state.flags, [action.key]: action.value } };

    case "SET_VALUE":
      return {
        ...state,
        values: { ...state.values, [action.key]: action.value },
      };

    case "CLEAR_FEEDBACK":
      return { ...state, feedback: null };

    case "RESET":
      return createSimulationState(
        // RESET is dispatched with the experiment captured in a closure.
        RESET_EXPERIMENT as Experiment
      );

    default:
      return state;
  }
}

/** Captured by the shell so RESET can rebuild initial state. */
let RESET_EXPERIMENT: Experiment;

export function bindReset(experiment: Experiment) {
  RESET_EXPERIMENT = experiment;
}

/* ------------------------------------------------------------- Derived */

/** All interactions belonging to a step. */
export function interactionsForStep(
  experiment: Experiment,
  stepIndex: number
): Interaction[] {
  return experiment.steps[stepIndex]?.interactions ?? [];
}

/** True when every interaction of a step has been completed. */
export function stepIsComplete(
  state: SimulationState,
  experiment: Experiment,
  stepIndex: number
): boolean {
  const interactions = interactionsForStep(experiment, stepIndex);
  if (interactions.length === 0) return false;
  return interactions.every((i) => state.completedActions.includes(i.id));
}

/** Number of completed steps in a phase. */
export function completedStepCount(
  state: SimulationState,
  experiment: Experiment
): number {
  return experiment.steps.filter((step) =>
    step.interactions.every((i) => state.completedActions.includes(i.id))
  ).length;
}

/** Find a bench item by id across apparatus and materials. */
export function findBenchItem(
  experiment: Experiment,
  itemId: string
): BenchItem | undefined {
  return (
    experiment.apparatus.find((a) => a.id === itemId) ??
    experiment.materials.find((m) => m.id === itemId)
  );
}

/**
 * Which stages the learner may move into. Introduction and Prepare are always
 * reachable; later stages unlock as steps are completed.
 */
export function reachableStages(
  state: SimulationState,
  experiment: Experiment
): Set<ExperimentStageId> {
  const reached = new Set<ExperimentStageId>(["introduction", "prepare"]);
  const anyComplete = completedStepCount(state, experiment) > 0;
  const allComplete =
    experiment.steps.length > 0 &&
    completedStepCount(state, experiment) === experiment.steps.length;

  if (anyComplete) {
    reached.add("perform");
    reached.add("observe");
    reached.add("calculate");
    /* These render a clear empty state until their inputs exist, so they stay
       reachable early rather than locking the learner out. */
    reached.add("interpret");
    reached.add("result");
  }
  if (allComplete) {
    reached.add("viva");
    reached.add("assessment");
  }
  return reached;
}
