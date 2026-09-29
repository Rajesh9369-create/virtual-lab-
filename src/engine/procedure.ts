/**
 * PROCEDURE STATE MACHINE
 * -----------------------
 * A pure derivation that answers the only two questions the interface has:
 *
 *   "What should the student do right now?"
 *   "What happens when they do it?"
 *
 * Nothing here stores state — it is computed from the engine's simulation
 * state on every render, so guidance can never disagree with the apparatus.
 */
import type { Experiment, Interaction } from "./types";
import type { SimulationState } from "./simulation";

export interface ProcedureState {
  /** Index of the step currently in progress. */
  currentStepIndex: number;
  stepTitle: string;
  /** The one short instruction to show. */
  requiredAction: string;
  /** The object the student must use. */
  targetObjectId: string | null;
  /** Interactions that are legal right now. */
  allowedInteractions: Interaction[];
  completedActions: string[];
  /** Interactions finished inside the current step. */
  stepDone: number;
  stepTotal: number;
  stepComplete: boolean;
  /** Every step in the experiment has been completed. */
  isComplete: boolean;
  /** Progress across the whole procedure. */
  doneCount: number;
  totalCount: number;
  why?: string;
  /** Short contextual note when the learner uses the wrong object. */
  redirect?: (objectName: string) => string;
}

export function deriveProcedure(
  experiment: Experiment,
  state: SimulationState
): ProcedureState {
  const done = (id: string) => state.completedActions.includes(id);
  const allSteps = experiment.steps;
  const totalCount = allSteps.reduce(
    (sum, s) => sum + s.interactions.length,
    0
  );
  const doneCount = state.completedActions.length;

  /* The current step is the first one with anything left to do. */
  const current =
    allSteps.find((s) => s.interactions.some((i) => !done(i.id))) ??
    allSteps[allSteps.length - 1];

  const pending =
    current?.interactions.find((i) => !done(i.id)) ?? current?.interactions[0];

  const stepDone = current
    ? current.interactions.filter((i) => done(i.id)).length
    : 0;
  const stepTotal = current?.interactions.length ?? 0;

  const allItems = [...experiment.apparatus, ...experiment.materials];
  const targetName = allItems.find((a) => a.id === pending?.targetId)?.name;

  return {
    currentStepIndex: current?.index ?? 0,
    stepTitle: current?.title ?? "",
    requiredAction: pending?.label ?? "",
    targetObjectId: pending?.targetId ?? null,
    allowedInteractions: current?.interactions ?? [],
    completedActions: state.completedActions,
    stepDone,
    stepTotal,
    stepComplete: stepTotal > 0 && stepDone === stepTotal,
    isComplete: totalCount > 0 && doneCount === totalCount,
    doneCount,
    totalCount,
    why: current?.why,
    redirect: (objectName: string) =>
      `Not needed for this step — this step needs the ${(
        targetName ?? "highlighted apparatus"
      ).toLowerCase()}. (You used the ${objectName.toLowerCase()}.)`,
  };
}
