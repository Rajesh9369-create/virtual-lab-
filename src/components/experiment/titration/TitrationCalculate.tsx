import { useMemo } from "react";
import type { CalculationDef, Experiment } from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import {
  evaluateCalculation,
  formatResult,
  validateNumericInput,
  type CalculationInput,
} from "../../../engine/calculations";

type Props = {
  experiment: Experiment;
  state: SimulationState;
  /** Learner-entered values keyed by calculation input id. */
  values: Record<string, string>;
  onChange: (inputId: string, value: string) => void;
};

function observationValue(state: SimulationState, id: string): number | null {
  const record = state.observations.find((o) => o.id === id);
  if (!record || record.value === null) return null;
  const n = Number(record.value);
  return Number.isFinite(n) ? n : null;
}

/** CALCULATE — INPUT → FORMULA → CALCULATION → RESULT. */
export default function TitrationCalculate({
  experiment,
  state,
  values,
  onChange,
}: Props) {
  const def: CalculationDef | undefined = experiment.calculations[0];

  const { inputs, result, errors } = useMemo(() => {
    if (!def) {
      return {
        inputs: [] as CalculationInput[],
        result: null,
        errors: {} as Record<string, string | null>,
      };
    }

    const built: CalculationInput[] = def.inputs.map((input) => {
      const raw = values[input.id] ?? "";
      const parsed = raw.trim() === "" ? null : Number(raw);
      return {
        id: input.id,
        label: input.label,
        value: Number.isFinite(parsed as number) ? (parsed as number) : null,
        unit: input.unit,
        origin: input.fromObservationId ? "simulation" : "manual",
      };
    });

    const validation: Record<string, string | null> = {};
    for (const input of def.inputs) {
      const raw = values[input.id] ?? "";
      if (raw.trim() === "") {
        validation[input.id] = input.required ? "A value is required." : null;
      } else {
        validation[input.id] = validateNumericInput(raw, {
          required: input.required,
          min: 0,
          unit: input.unit,
        }).error;
      }
    }

    return {
      inputs: built,
      result: evaluateCalculation(def, built),
      errors: validation,
    };
  }, [def, values]);

  if (!def) {
    return (
      <div className="animate-swap">
        <h2 className="text-sm font-medium text-ink">Calculate</h2>
        <p className="mt-5 text-sm text-smoke">Calculation verification required.</p>
      </div>
    );
  }

  const allValid = def.inputs.every((i) => !errors[i.id]);

  const insertRecorded = () => {
    for (const input of def.inputs) {
      if (input.fromObservationId) {
        const observed = observationValue(state, input.fromObservationId);
        if (observed !== null) onChange(input.id, String(observed));
      } else if (typeof input.defaultValue === "number") {
        onChange(input.id, String(input.defaultValue));
      }
    }
  };

  const missingReadings = def.inputs
    .filter((i) => i.fromObservationId && observationValue(state, i.fromObservationId) === null)
    .map((i) => i.label);

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Calculate</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 05
        </span>
      </div>

      {/* FORMULA */}
      <div className="relative mt-6 overflow-hidden rounded-[22px] border border-clay bg-gradient-to-b from-white to-sand px-6 py-7 sm:px-8">
        <span aria-hidden="true" className="absolute left-4 top-4 h-3 w-3 border-l border-t border-ink/25" />
        <span aria-hidden="true" className="absolute right-4 top-4 h-3 w-3 border-r border-t border-ink/25" />
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
          Formula
        </p>
        <p className="mt-3 font-mono text-base font-medium tracking-tight text-ink sm:text-lg">
          {def.expression}
        </p>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-smoke">
          {def.source?.note}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* INPUT */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
              Input
            </p>
            <button
              type="button"
              onClick={insertRecorded}
              disabled={missingReadings.length > 0}
              className="cursor-pointer rounded-full border border-clay bg-white px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-ink/35 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Insert recorded values
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {def.inputs.map((input) => {
              const error = errors[input.id];
              return (
                <div key={input.id}>
                  <label
                    htmlFor={input.id}
                    className="block text-[12.5px] font-medium text-ink"
                  >
                    {input.label}
                    <span className="ml-1.5 font-mono text-[11px] font-normal text-smoke">
                      ({input.unit})
                    </span>
                  </label>
                  <input
                    id={input.id}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    value={values[input.id] ?? ""}
                    onChange={(e) => onChange(input.id, e.target.value)}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? `${input.id}-error` : undefined}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 font-mono text-sm tabular-nums text-ink transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ember/40 ${
                      error ? "border-ember-deep/60" : "border-clay"
                    }`}
                    placeholder="—"
                  />
                  {error && (
                    <p
                      id={`${input.id}-error`}
                      className="mt-1 text-[11px] text-ember-deep"
                    >
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {missingReadings.length > 0 && (
            <p className="mt-4 text-[11.5px] leading-relaxed text-smoke">
              Take the readings in the Perform stage first — then insert them
              here.
            </p>
          )}
        </div>

        {/* CALCULATION → RESULT */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
            Result
          </p>
          <div
            className={`mt-4 rounded-[22px] border p-6 transition-colors duration-500 ${
              result?.computed
                ? "border-ember/40 bg-ember/[0.05]"
                : "border-clay bg-white/70"
            }`}
          >
            <p className="text-[12px] text-smoke">{def.output.label}</p>
            <p
              className={`mt-2 font-mono text-3xl font-medium tabular-nums tracking-tight sm:text-4xl ${
                result?.computed ? "text-ink" : "text-smoke/45"
              }`}
            >
              {result?.computed ? formatResult(result) : "—"}
            </p>

            {result?.computed && (
              <p className="mt-4 font-mono text-[11px] leading-relaxed text-smoke">
                {def.expression}
                <br />
                <span className="text-ink">
                  = {inputs.find((i) => i.id === "in-titrant-concentration")?.value} ×{" "}
                  {inputs.find((i) => i.id === "in-titrant-volume")?.value} ÷{" "}
                  {inputs.find((i) => i.id === "in-analyte-volume")?.value}
                </span>
              </p>
            )}

            {!allValid && (
              <p className="mt-4 text-[11.5px] leading-relaxed text-smoke">
                Enter every required value to calculate the result.
              </p>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-smoke">
            Concentrations and volumes are educational simulation parameters —
            not official values.
          </p>
        </div>
      </div>

      {/* keep the engine's input list reachable for assistive tech */}
      <ul className="sr-only">
        {inputs.map((input) => (
          <li key={input.id}>
            {input.label}: {input.value === null ? "not entered" : `${input.value} ${input.unit}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
