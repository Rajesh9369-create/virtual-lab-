/**
 * PHARMACOKINETICS — one-compartment models with time
 * ---------------------------------------------------
 * Pure, UI-free pharmacokinetics. Standard textbook relations:
 *
 *   IV bolus:        C(t) = (Dose / V) · e^(−ke·t)
 *   Oral (F = 1):    C(t) = (Dose·ka) / (V·(ka − ke)) · (e^(−ke·t) − e^(−ka·t))
 *   t½  = 0.693 / ke
 *   AUC = Dose / (V·ke)
 *   Tmax (oral) = ln(ka / ke) / (ka − ke)
 *
 * Bioavailability is fixed at 1 in this simulation — a stated modelling
 * assumption, not a claim about any real medicine. All parameter ranges are
 * educational simulation ranges.
 */
import type { NumericRange } from "./types";

export type PkRoute = "IV_BOLUS" | "ORAL";

export interface PKDynamicsParams {
  route: PkRoute;
  dose: number;
  volume: number;
  /** Absorption rate constant — oral only. */
  ka: number;
  /** Elimination rate constant. */
  ke: number;
}

export const PKD_KEYS = {
  dose: "pkd-dose",
  volume: "pkd-volume",
  ka: "pkd-ka",
  ke: "pkd-ke",
} as const;

/** Concentration at a given time for the selected route. */
export function concentrationAt(p: PKDynamicsParams, t: number): number {
  if (t < 0) return 0;
  if (p.route === "IV_BOLUS") {
    return (p.dose / p.volume) * Math.exp(-p.ke * t);
  }
  const { dose, volume, ka, ke } = p;
  if (ka <= 0 || ke <= 0) return 0;
  if (Math.abs(ka - ke) < 1e-9) {
    /* Degenerate case — avoid dividing by zero. */
    return (dose / volume) * ka * t * Math.exp(-ka * t);
  }
  return (
    ((dose * ka) / (volume * (ka - ke))) *
    (Math.exp(-ke * t) - Math.exp(-ka * t))
  );
}

export interface PKTimePoint {
  t: number;
  c: number;
}

/** The concentration–time profile over a range. */
export function curvePoints(
  p: PKDynamicsParams,
  tMax: number,
  samples = 200
): PKTimePoint[] {
  const points: PKTimePoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (tMax * i) / samples;
    points.push({ t, c: concentrationAt(p, t) });
  }
  return points;
}

export interface PKDerived {
  cmax: number;
  tmax: number;
  halfLife: number;
  auc: number;
  /** Concentration at the current time. */
  current: number;
  /** Amount remaining at the absorption site, oral only. */
  gutAmount: number;
  /** Amount in the central compartment. */
  centralAmount: number;
  /** Cumulative amount eliminated. */
  eliminatedAmount: number;
}

/** Every derived quantity the interface shows, from first principles. */
export function derivePKDynamics(
  p: PKDynamicsParams,
  t: number
): PKDerived {
  const { dose, volume, ka, ke, route } = p;

  let tmax: number;
  if (route === "IV_BOLUS") {
    tmax = 0;
  } else if (ka > 0 && ke > 0 && Math.abs(ka - ke) > 1e-9) {
    tmax = Math.log(ka / ke) / (ka - ke);
  } else {
    tmax = 0;
  }
  tmax = Math.max(0, tmax);

  const cmax = concentrationAt(p, tmax);
  const halfLife = ke > 0 ? 0.693 / ke : Infinity;
  const auc = volume > 0 && ke > 0 ? dose / (volume * ke) : Infinity;

  const current = concentrationAt(p, t);
  const centralAmount = current * volume;
  const gutAmount =
    route === "ORAL" && ka > 0 ? dose * Math.exp(-ka * t) : 0;
  const eliminatedAmount = Math.max(0, dose - gutAmount - centralAmount);

  return {
    cmax,
    tmax,
    halfLife,
    auc,
    current,
    gutAmount,
    centralAmount,
    eliminatedAmount,
  };
}

export const PKD_RANGES = {
  dose: { min: 50, max: 1000, step: 10, initial: 500, unit: "mg", label: "Dose" },
  volume: { min: 5, max: 100, step: 1, initial: 25, unit: "L", label: "Volume of distribution" },
  ka: { min: 0.1, max: 3, step: 0.05, initial: 1, unit: "1/h", label: "Absorption rate (ka)" },
  ke: { min: 0.02, max: 0.6, step: 0.01, initial: 0.15, unit: "1/h", label: "Elimination rate (ke)" },
} satisfies Record<string, NumericRange>;

/** Total simulated hours. */
export const PKD_TIME_MAX = 48;
