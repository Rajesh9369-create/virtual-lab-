/**
 * SOLUTION PREPARATION BY DILUTION
 * --------------------------------
 * Pure, UI-free derivation. The governing relation is the conservation of
 * solute on dilution, C1V1 = C2V2 — the amount of solute transferred from the
 * stock is the amount that ends up in the final volume.
 *
 * All concentrations and volumes are educational simulation parameters.
 */
import type { DilutionModel } from "./types";

export const DILUTION_KEYS = {
  targetConcentration: "dilution-target-concentration",
  targetVolume: "dilution-target-volume",
  transferred: "dilution-transferred",
  transferredConfirmed: "dilution-transferred-confirmed",
  madeUp: "dilution-made-up",
  flaskReady: "dilution-flask-ready",
} as const;

export interface DilutionState {
  targetConcentration: number;
  targetVolume: number;
  /** The volume of stock the learner chose to transfer, mL. */
  transferred: number | null;
  madeUpToVolume: boolean;
}

export interface DilutionDerived {
  /** mL of stock required for the target, C2V2 / C1. */
  requiredStockVolume: number;
  /** mol or equivalent of solute actually transferred. */
  soluteTransferred: number | null;
  /** Concentration actually achieved in the final volume. */
  achievedConcentration: number | null;
  /** Percentage deviation from the target. */
  deviationPercent: number | null;
  isCorrect: boolean;
  /** Liquid level in the flask, 0–100. */
  flaskFillPercent: number;
  /** Liquid level in the stock bottle, 0–100. */
  stockRemainingPercent: number;
}

export function dilutionStateFrom(
  model: DilutionModel,
  values: Record<string, number>,
  flags: Record<string, boolean>
): DilutionState {
  return {
    targetConcentration:
      values[DILUTION_KEYS.targetConcentration] ??
      model.targetConcentration.initial,
    targetVolume: values[DILUTION_KEYS.targetVolume] ?? model.targetVolume.initial,
    transferred: flags[DILUTION_KEYS.transferredConfirmed]
      ? (values[DILUTION_KEYS.transferred] ?? null)
      : null,
    madeUpToVolume: flags[DILUTION_KEYS.madeUp] ?? false,
  };
}

export function deriveDilution(
  model: DilutionModel,
  state: DilutionState
): DilutionDerived {
  const { stockConcentration, flaskVolume } = model;
  const { targetConcentration, targetVolume, transferred, madeUpToVolume } = state;

  const required =
    stockConcentration > 0
      ? (targetConcentration * targetVolume) / stockConcentration
      : 0;

  const soluteTransferred =
    transferred !== null ? stockConcentration * (transferred / 1000) : null;

  const achievedConcentration =
    transferred !== null && madeUpToVolume && targetVolume > 0
      ? (stockConcentration * transferred) / targetVolume
      : null;

  const deviationPercent =
    achievedConcentration !== null && targetConcentration > 0
      ? ((achievedConcentration - targetConcentration) / targetConcentration) * 100
      : null;

  const isCorrect =
    achievedConcentration !== null &&
    Math.abs(deviationPercent ?? 100) <= 1;

  /* Visual levels. The flask receives the aliquot, then is made up to the mark. */
  const flaskFillPercent = madeUpToVolume
    ? 100
    : transferred !== null
      ? Math.min(100, (transferred / flaskVolume) * 100)
      : 0;

  const stockRemainingPercent = Math.max(
    0,
    100 - (transferred !== null ? transferred / 4 : 0)
  );

  return {
    requiredStockVolume: required,
    soluteTransferred,
    achievedConcentration,
    deviationPercent,
    isCorrect,
    flaskFillPercent,
    stockRemainingPercent,
  };
}

import type { Interaction } from "./types";
import type { SimulationAction } from "./simulation";

const round3 = (n: number) => Number(n.toFixed(3));

/** Translate a dilution interaction into simulation actions. */
export function dilutionActions(
  interaction: Interaction,
  value: number | undefined,
  state: {
    values: Record<string, number>;
    flags: Record<string, boolean>;
    completedActions: string[];
    fillLevels: Record<string, number>;
  },
  model: DilutionModel
): SimulationAction[] {
  const actions: SimulationAction[] = [];
  const already = state.completedActions.includes(interaction.id);
  const dstate = dilutionStateFrom(model, state.values, state.flags);
  const derived = deriveDilution(model, dstate);

  const record = (id: string, label: string, v: number, unit: string) => {
    actions.push({
      type: "RECORD_OBSERVATION",
      record: { id, label, value: v, unit, kind: "quantitative", origin: "simulation" },
    });
  };

  if (interaction.type === "select") {
    actions.push({ type: "SELECT_OBJECT", id: interaction.targetId });
    if (!already) {
      actions.push({
        type: "COMPLETE_ACTION",
        interactionId: interaction.id,
        feedback: { kind: "success", message: "Selected" },
      });
    }
    return actions;
  }

  /* The aliquot slider sets a value; the first adjustment completes the step. */
  if (interaction.id === "dil-set-aliquot" && value !== undefined) {
    actions.push({ type: "SET_VALUE", key: DILUTION_KEYS.transferred, value });
    if (!already) {
      actions.push({
        type: "COMPLETE_ACTION",
        interactionId: interaction.id,
        feedback: { kind: "success", message: "Aliquot set" },
      });
    }
    return actions;
  }

  if (!already) {
    actions.push({
      type: "COMPLETE_ACTION",
      interactionId: interaction.id,
      feedback: { kind: "success", message: "Done" },
    });
  }

  switch (interaction.id) {
    case "dil-confirm-target":
      record("obs-dil-target", "Target concentration", round3(dstate.targetConcentration), "mol/L");
      record("obs-dil-volume", "Final volume", round3(dstate.targetVolume), "mL");
      break;

    case "dil-transfer": {
      const transferred = state.values[DILUTION_KEYS.transferred];
      if (transferred !== undefined) {
        actions.push({ type: "SET_FLAG", key: DILUTION_KEYS.transferredConfirmed, value: true });
        record("obs-dil-aliquot", "Stock aliquot transferred", round3(transferred), "mL");
        actions.push({
          type: "ADJUST_FILL",
          itemId: "app-flask",
          fill: Math.min(100, (transferred / model.flaskVolume) * 100),
        });
        actions.push({
          type: "ADJUST_FILL",
          itemId: "app-stock",
          fill: Math.max(0, 100 - transferred / 4),
        });
      }
      break;
    }

    case "dil-make-up":
      actions.push({ type: "SET_FLAG", key: DILUTION_KEYS.madeUp, value: true });
      actions.push({ type: "ADJUST_FILL", itemId: "app-flask", fill: 100 });
      break;

    case "dil-record":
      if (derived.achievedConcentration !== null) {
        record(
          "obs-dil-achieved",
          "Concentration achieved",
          round3(derived.achievedConcentration),
          "mol/L"
        );
      }
      break;

    default:
      break;
  }
  return actions;
}
