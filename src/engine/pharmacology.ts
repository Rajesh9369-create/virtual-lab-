/**
 * PHARMACOLOGY — dose–response (Emax) model
 * -----------------------------------------
 * Pure, UI-free pharmacology.
 *
 * The relationships here are standard textbook pharmacology:
 *
 *   E = Emax · C^h / (EC50^h + C^h)          (Hill / Emax equation)
 *   EC50' = EC50 · (1 + [B]/Kb)              (competitive antagonist, Gaddum)
 *
 * Parameter RANGES are educational simulation ranges and carry no clinical
 * meaning. The receptor visual is a conceptual representation of occupancy,
 * not a molecular structure.
 */
import type { NumericRange } from "./types";

export interface DoseResponseParams {
  /** Concentration, in the same arbitrary units as EC50. */
  concentration: number;
  emax: number;
  ec50: number;
  /** Hill coefficient (slope). */
  hill: number;
  /** Antagonist concentration; 0 means no antagonist present. */
  antagonist: number;
  /** Antagonist dissociation constant. */
  kb: number;
}

export const DR_KEYS = {
  concentration: "dr-concentration",
  emax: "dr-emax",
  ec50: "dr-ec50",
  hill: "dr-hill",
  antagonist: "dr-antagonist",
} as const;

/** Apparent EC50 after a competitive antagonist shift. */
export function apparentEc50(p: DoseResponseParams): number {
  return p.kb > 0 ? p.ec50 * (1 + p.antagonist / p.kb) : p.ec50;
}

/** Effect from the Emax (Hill) equation. */
export function effect(p: DoseResponseParams): number {
  const ec50 = apparentEc50(p);
  if (ec50 <= 0) return p.emax;
  const num = Math.pow(p.concentration, p.hill);
  const den = Math.pow(ec50, p.hill) + num;
  return den > 0 ? p.emax * (num / den) : 0;
}

/** Fractional receptor occupancy — conceptual, same functional form. */
export function occupancy(p: DoseResponseParams): number {
  const ec50 = apparentEc50(p);
  if (ec50 <= 0) return 1;
  const num = Math.pow(p.concentration, p.hill);
  const den = Math.pow(ec50, p.hill) + num;
  return den > 0 ? num / den : 0;
}

export interface DoseResponsePoint {
  /** Log10 of concentration, for plotting on a log axis. */
  logC: number;
  concentration: number;
  effect: number;
}

/** The full curve over a log concentration range. */
export function doseResponseCurve(
  p: DoseResponseParams,
  logMin: number,
  logMax: number,
  samples = 140
): DoseResponsePoint[] {
  const points: DoseResponsePoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const logC = logMin + ((logMax - logMin) * i) / samples;
    const concentration = Math.pow(10, logC);
    points.push({
      logC,
      concentration,
      effect: effect({ ...p, concentration }),
    });
  }
  return points;
}

/** How many of a fixed number of receptor slots are occupied. */
export function occupiedReceptors(
  p: DoseResponseParams,
  total: number
): number {
  return Math.round(occupancy(p) * total);
}

/** Educational parameter ranges exposed to the learner. */
export const DR_RANGES = {
  concentration: {
    min: -3,
    max: 3,
    step: 0.05,
    initial: 0,
    unit: "log units",
    label: "Concentration (log)",
  } as NumericRange,
  emax: {
    min: 20,
    max: 100,
    step: 1,
    initial: 100,
    unit: "%",
    label: "Maximum effect (Emax)",
  } as NumericRange,
  ec50: {
    min: 0.01,
    max: 10,
    step: 0.01,
    initial: 1,
    unit: "units",
    label: "EC50",
  } as NumericRange,
  hill: {
    min: 0.5,
    max: 3,
    step: 0.1,
    initial: 1,
    unit: "",
    label: "Hill coefficient",
  } as NumericRange,
  antagonist: {
    min: 0,
    max: 10,
    step: 0.1,
    initial: 0,
    unit: "units",
    label: "Antagonist concentration",
  } as NumericRange,
};
