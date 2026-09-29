/**
 * EXPERIMENT ENGINE — Calculation layer
 * ------------------------------------
 * All mathematics lives here, entirely separate from presentation.
 *
 * POLICY: a formula is only implemented when it is standard, verifiable
 * science. The registry below is keyed by `formulaKey` and each entry states
 * what it is. Nothing else computes — a definition without an implementation
 * returns `null` and reports itself as not connected.
 */
import type { CalculationDef } from "./types";

/** A single input feeding a calculation. */
export interface CalculationInput {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  /** Where the value comes from — simulation or the learner. */
  origin: "simulation" | "manual";
}

export interface CalculationResult {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
  expression?: string;
  /** True only when a registered formula actually produced the value. */
  computed: boolean;
  note?: string;
}

export type FormulaFn = (values: Record<string, number>) => number | null;

/** Round to a given number of significant figures. */
export function toSignificantFigures(value: number, figures: number): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const power = figures - 1 - magnitude;
  const factor = 10 ** power;
  return Math.round(value * factor) / factor;
}

/**
 * VERIFIED FORMULA REGISTRY
 *
 * titration-analyte-molarity
 *   For a 1:1 acid–base reaction at the equivalence point the moles of
 *   titrant equal the moles of analyte, so
 *       M(analyte) = M(titrant) × V(titrant) / V(analyte)
 *   Volumes may be in any common unit because their ratio is dimensionless.
 */
const FORMULAS: Record<string, FormulaFn> = {
  /**
   * AUC = Dose / CL — standard one-compartment pharmacokinetics.
   */
  "pk-auc": (v) => {
    const dose = v["in-pk-dose"];
    const clearance = v["in-pk-clearance"];
    if (dose === undefined || clearance === undefined || clearance === 0) {
      return null;
    }
    return toSignificantFigures(dose / clearance, 4);
  },

  /**
   * t(1/2) = 0.693 · V / CL — standard one-compartment pharmacokinetics.
   */
  "pk-half-life": (v) => {
    const volume = v["in-pk-volume"];
    const clearance = v["in-pk-clearance"];
    if (volume === undefined || clearance === undefined || clearance === 0) {
      return null;
    }
    return toSignificantFigures((0.693 * volume) / clearance, 4);
  },

  /**
   * C2 = C1 · V1 / V2 — conservation of solute on dilution.
   */
  "dilution-achieved-concentration": (v) => {
    const c1 = v["in-dilution-stock"];
    const v1 = v["in-dilution-transferred"];
    const v2 = v["in-dilution-final"];
    if (c1 === undefined || v1 === undefined || v2 === undefined || v2 === 0) {
      return null;
    }
    return toSignificantFigures((c1 * v1) / v2, 4);
  },

  /**
   * E = Emax · C^h / (EC50^h + C^h) — standard Emax (Hill) equation.
   */
  "dose-response-effect": (v) => {
    const emax = v["in-dr-emax"];
    const conc = v["in-dr-concentration"];
    const ec50 = v["in-dr-ec50"];
    if (emax === undefined || conc === undefined || ec50 === undefined || ec50 <= 0) {
      return null;
    }
    const hill = v["in-dr-hill"] ?? 1;
    const num = Math.pow(conc, hill);
    const den = Math.pow(ec50, hill) + num;
    return den > 0 ? toSignificantFigures((emax * num) / den, 4) : null;
  },

  /**
   * AUC = Dose / (V · ke) — standard one-compartment pharmacokinetics.
   */
  "pk-auc-iv": (v) => {
    const dose = v["in-pkd-dose"];
    const volume = v["in-pkd-volume"];
    const ke = v["in-pkd-ke"];
    if (dose === undefined || volume === undefined || ke === undefined || volume <= 0 || ke <= 0) {
      return null;
    }
    return toSignificantFigures(dose / (volume * ke), 4);
  },

  "titration-analyte-molarity": (v) => {
    const mTitrant = v["in-titrant-concentration"];
    const vTitrant = v["in-titrant-volume"];
    const vAnalyte = v["in-analyte-volume"];
    if (mTitrant === undefined || vTitrant === undefined || vAnalyte === undefined) {
      return null;
    }
    if (vAnalyte === 0) return null;
    return toSignificantFigures((mTitrant * vTitrant) / vAnalyte, 4);
  },
};

const NOT_CONNECTED_NOTE =
  "Calculation will be connected during experiment implementation.";

/** Evaluate one calculation definition against a set of inputs. */
export function evaluateCalculation(
  def: CalculationDef,
  inputs: CalculationInput[]
): CalculationResult {
  const fn = def.formulaKey ? FORMULAS[def.formulaKey] : undefined;
  if (!fn) {
    return {
      id: def.id,
      label: def.label,
      value: null,
      unit: def.unit ?? def.output.unit,
      expression: def.expression,
      computed: false,
      note: def.note ?? NOT_CONNECTED_NOTE,
    };
  }

  const values: Record<string, number> = {};
  for (const input of inputs) {
    if (input.value !== null && Number.isFinite(input.value)) {
      values[input.id] = input.value;
    }
  }

  const value = fn(values);

  return {
    id: def.id,
    label: def.label,
    value,
    unit: def.output.unit,
    expression: def.expression,
    computed: value !== null && Number.isFinite(value),
    note:
      value === null
        ? "Enter every required value to calculate the result."
        : def.note,
  };
}

/** Evaluate every calculation in an experiment. */
export function evaluateAll(
  defs: CalculationDef[],
  inputs: CalculationInput[]
): CalculationResult[] {
  return defs.map((def) => evaluateCalculation(def, inputs));
}

/** Format a value with an optional unit, respecting null. */
export function formatResult(result: CalculationResult): string {
  if (result.value === null || !Number.isFinite(result.value)) return "—";
  const number = Number.isInteger(result.value)
    ? String(result.value)
    : result.value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return result.unit ? `${number} ${result.unit}` : number;
}

/** Validate a learner-entered numeric value. */
export function validateNumericInput(
  raw: string,
  opts: { required?: boolean; min?: number; max?: number; unit?: string } = {}
): { value: number | null; error: string | null } {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return {
      value: null,
      error: opts.required ? "A value is required." : null,
    };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: "Enter a number." };
  }
  if (parsed < (opts.min ?? -Infinity)) {
    return {
      value: null,
      error: `Must be ${opts.min} ${opts.unit ?? ""} or more.`.trim(),
    };
  }
  if (parsed > (opts.max ?? Infinity)) {
    return {
      value: null,
      error: `Must be ${opts.max} ${opts.unit ?? ""} or less.`.trim(),
    };
  }
  return { value: parsed, error: null };
}
