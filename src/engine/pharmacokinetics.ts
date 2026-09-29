/**
 * ONE-COMPARTMENT PHARMACOKINETICS
 * -------------------------------
 * Pure, UI-free derivation. The relations are standard textbook
 * pharmacokinetics for a single intravenous bolus dose in a one-compartment
 * model with first-order elimination:
 *
 *   C(t) = (Dose / V) · e^(−kt)      where k = CL / V
 *   t½   = 0.693 / k
 *   AUC  = Dose / CL
 *
 * Parameter ranges are educational simulation ranges, never clinical guidance.
 */
import type { PharmacokineticModel } from "./types";

export interface PKParams {
  dose: number;
  volume: number;
  clearance: number;
  reference: number;
}

export interface PKPoint {
  t: number;
  c: number;
}

export interface PKDerived {
  /** Elimination rate constant, CL / V. */
  k: number;
  /** Initial concentration, Dose / V. */
  c0: number;
  /** Elimination half-life, 0.693 / k. */
  halfLife: number;
  /** Area under the curve, Dose / CL. */
  auc: number;
  /** Time to fall below the reference concentration, hours. */
  timeBelowReference: number | null;
  points: PKPoint[];
  /** Maximum concentration on the plotted range. */
  cMax: number;
}

export const PK_KEYS = {
  dose: "pk-dose",
  volume: "pk-volume",
  clearance: "pk-clearance",
  reference: "pk-reference",
  confirmed: "pk-confirmed",
} as const;

/** Read the learner's current parameter values out of simulation state. */
export function pkParamsFrom(
  model: PharmacokineticModel,
  values: Record<string, number>
): PKParams {
  return {
    dose: values[PK_KEYS.dose] ?? model.dose.initial,
    volume: values[PK_KEYS.volume] ?? model.volumeOfDistribution.initial,
    clearance: values[PK_KEYS.clearance] ?? model.clearance.initial,
    reference:
      values[PK_KEYS.reference] ?? model.referenceConcentration.initial,
  };
}

/** Derive every quantity the interface shows, from first principles. */
export function derivePK(
  model: PharmacokineticModel,
  params: PKParams
): PKDerived {
  const { dose, volume, clearance, reference } = params;

  const k = volume > 0 ? clearance / volume : 0;
  const c0 = volume > 0 ? dose / volume : 0;
  const halfLife = k > 0 ? 0.693 / k : Infinity;
  const auc = clearance > 0 ? dose / clearance : Infinity;

  const points: PKPoint[] = [];
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const t = (model.timeMax * i) / steps;
    points.push({ t, c: c0 * Math.exp(-k * t) });
  }

  const cMax = points.reduce((m, p) => Math.max(m, p.c), 0);

  let timeBelowReference: number | null = null;
  if (reference > 0 && c0 > reference && k > 0) {
    const t = Math.log(c0 / reference) / k;
    timeBelowReference = t <= model.timeMax ? t : null;
  }

  return { k, c0, halfLife, auc, timeBelowReference, points, cMax };
}

/** Concentration at a specific time. */
export function concentrationAt(params: PKParams, t: number): number {
  const k = params.volume > 0 ? params.clearance / params.volume : 0;
  const c0 = params.volume > 0 ? params.dose / params.volume : 0;
  return c0 * Math.exp(-k * t);
}

import type { Interaction } from "./types";
import type { SimulationAction } from "./simulation";

/** Translate a pharmacokinetics interaction into simulation actions. */
export function pkActions(
  interaction: Interaction,
  _value: number | undefined,
  state: { values: Record<string, number>; completedActions: string[] },
  model: PharmacokineticModel
): SimulationAction[] {
  const params = pkParamsFrom(model, state.values);
  const derived = derivePK(model, params);
  const actions: SimulationAction[] = [];
  const already = state.completedActions.includes(interaction.id);

  const record = (
    id: string,
    label: string,
    value: number,
    unit: string
  ) => {
    actions.push({
      type: "RECORD_OBSERVATION",
      record: { id, label, value, unit, kind: "quantitative", origin: "simulation" },
    });
  };

  if (!already) {
    actions.push({
      type: "COMPLETE_ACTION",
      interactionId: interaction.id,
      feedback: { kind: "success", message: "Recorded" },
    });
  }

  switch (interaction.id) {
    case "pk-confirm-dose":
      record("obs-pk-dose", "Dose", params.dose, "mg");
      break;
    case "pk-confirm-volume":
      record("obs-pk-volume", "Volume of distribution", params.volume, "L");
      break;
    case "pk-confirm-clearance":
      record("obs-pk-clearance", "Clearance", params.clearance, "L/h");
      break;
    case "pk-record-c0":
      record("obs-pk-c0", "Initial concentration", Number(derived.c0.toFixed(3)), "mg/L");
      break;
    case "pk-record-half-life":
      if (Number.isFinite(derived.halfLife)) {
        record("obs-pk-half-life", "Half-life", Number(derived.halfLife.toFixed(3)), "h");
      }
      break;
    case "pk-confirm-reference":
      record("obs-pk-reference", "Reference concentration", params.reference, "mg/L");
      break;
    default:
      break;
  }
  return actions;
}
