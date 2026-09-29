import { useMemo } from "react";
import type { Experiment } from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import type { ExperimentTheme } from "../../../engine/theme";
import {
  evaluateCalculation,
  type CalculationInput,
} from "../../../engine/calculations";

/* -------------------------------------------------------------- OBSERVE */

/** Every reading the learner took, as one instrument readout. */
export function LabObserve({
  state,
  theme,
}: {
  state: SimulationState;
  theme: ExperimentTheme;
}) {
  const recorded = state.observations.filter((o) => o.value !== null);

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Observe</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 04
        </span>
      </div>

      <div
        className="mt-6 rounded-[24px] border p-6 sm:p-8"
        style={{ background: theme.panel.background, borderColor: theme.panel.border }}
      >
        {recorded.length === 0 ? (
          <p className="text-sm leading-relaxed" style={{ color: theme.panel.muted }}>
            No readings recorded yet — values appear here once you take them.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
            {recorded.map((r) => (
              <div key={r.id}>
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: theme.panel.dim }}
                >
                  {r.label}
                </p>
                <p
                  className="mt-2 font-mono text-2xl font-semibold leading-none tabular-nums sm:text-3xl"
                  style={{ color: theme.panel.text }}
                >
                  {typeof r.value === "number"
                    ? Number.isInteger(r.value)
                      ? r.value
                      : r.value.toFixed(3)
                    : r.value}
                  {r.unit && (
                    <span className="ml-1 text-[11px]" style={{ color: theme.panel.dim }}>
                      {r.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 max-w-xl text-xs leading-relaxed text-smoke">
        Every value is read straight out of simulation state — nothing is filled
        in for you.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ CALCULATE */

export function LabCalculate({
  experiment,
  state,
  theme,
  values,
  onChange,
}: {
  experiment: Experiment;
  state: SimulationState;
  theme: ExperimentTheme;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  const defs = experiment.calculations;

  const built = useMemo(() => {
    const inputs: CalculationInput[] = [];
    for (const def of defs) {
      for (const input of def.inputs) {
        const raw = values[input.id];
        const parsed = raw !== undefined && raw !== "" ? Number(raw) : NaN;
        inputs.push({
          id: input.id,
          label: input.label,
          value: Number.isFinite(parsed) ? parsed : null,
          unit: input.unit,
          origin: input.fromObservationId ? "simulation" : "manual",
        });
      }
    }
    return inputs;
  }, [defs, values]);

  const observationValue = (id?: string): number | null => {
    if (!id) return null;
    const r = state.observations.find((o) => o.id === id);
    if (!r || r.value === null) return null;
    const n = Number(r.value);
    return Number.isFinite(n) ? n : null;
  };

  const insertRecorded = () => {
    for (const def of defs) {
      for (const input of def.inputs) {
        if (input.fromObservationId) {
          const v = observationValue(input.fromObservationId);
          if (v !== null) onChange(input.id, String(v));
        } else if (typeof input.defaultValue === "number") {
          onChange(input.id, String(input.defaultValue));
        }
      }
    }
  };

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Calculate</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 05
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
        {defs.map((def) => {
          const inputs = built.filter((i) =>
            def.inputs.some((d) => d.id === i.id)
          );
          const result = evaluateCalculation(def, inputs);
          return (
            <div
              key={def.id}
              className="rounded-[24px] border p-5 sm:p-6"
              style={{
                background: theme.panel.background,
                borderColor: theme.panel.border,
              }}
            >
              <p
                className="font-mono text-[9px] uppercase tracking-[0.2em]"
                style={{ color: theme.panel.dim }}
              >
                {def.label}
              </p>
              <p
                className="mt-2 font-mono text-base font-medium"
                style={{ color: theme.panel.text }}
              >
                {def.expression}
              </p>

              <div className="mt-4 space-y-2.5">
                {def.inputs.map((input) => (
                  <div key={input.id}>
                    <label
                      htmlFor={input.id}
                      className="block text-[12px]"
                      style={{ color: theme.panel.muted }}
                    >
                      {input.label}
                      <span
                        className="ml-1.5 font-mono text-[10px]"
                        style={{ color: theme.panel.dim }}
                      >
                        ({input.unit})
                      </span>
                    </label>
                    <input
                      id={input.id}
                      type="number"
                      step="any"
                      min={0}
                      value={values[input.id] ?? ""}
                      onChange={(e) => onChange(input.id, e.target.value)}
                      className="mt-1 w-full rounded-xl border bg-white/5 px-3 py-2 font-mono text-sm tabular-nums outline-none"
                      style={{
                        borderColor: theme.panel.border,
                        color: theme.panel.text,
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{
                  background: result.computed
                    ? `${theme.status.ok}18`
                    : "rgba(255,255,255,0.04)",
                }}
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: theme.panel.dim }}
                >
                  {def.output.label}
                </p>
                <p
                  className="mt-1 font-mono text-3xl font-semibold tabular-nums"
                  style={{
                    color: result.computed ? theme.status.ok : theme.panel.dim,
                  }}
                >
                  {result.computed && result.value !== null
                    ? Number.isInteger(result.value)
                      ? result.value
                      : result.value.toFixed(4)
                    : "—"}
                  {result.computed && (
                    <span
                      className="ml-1.5 text-[11px]"
                      style={{ color: theme.panel.dim }}
                    >
                      {def.output.unit}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={insertRecorded}
          className="cursor-pointer rounded-full border border-clay bg-white/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-smoke transition-colors duration-300 hover:border-ink/35 hover:text-ink"
        >
          Insert recorded values
        </button>
        <p className="max-w-md text-xs leading-relaxed text-smoke">
          Values come from your own readings — insert them, then check the
          result.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ INTERPRET */

export function LabInterpret({
  experiment,
  theme,
}: {
  experiment: Experiment;
  theme: ExperimentTheme;
}) {
  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Interpret</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 06
        </span>
      </div>

      <div
        className="mt-6 rounded-[24px] border p-6 sm:p-8"
        style={{ background: theme.panel.background, borderColor: theme.panel.border }}
      >
        <p
          className="text-base font-medium leading-snug"
          style={{ color: theme.panel.text }}
        >
          {experiment.concept}
        </p>
        <p
          className="mt-3 max-w-2xl text-sm leading-relaxed"
          style={{ color: theme.panel.muted }}
        >
          The recorded values and the calculated result follow directly from
          that relation.
        </p>
      </div>

      <p className="mt-5 max-w-xl text-xs leading-relaxed text-smoke">
        Comparing the result against an official limit or specification requires
        a verified source — none is asserted here.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- RESULT */

export function LabResult({
  experiment,
  state,
  theme,
  calculated,
  onStartViva,
}: {
  experiment: Experiment;
  state: SimulationState;
  theme: ExperimentTheme;
  calculated: { label: string; value: string }[];
  onStartViva?: () => void;
}) {
  const recorded = state.observations.filter((o) => o.value !== null);

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Result</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 07
        </span>
      </div>

      <div
        className="relative mt-6 overflow-hidden rounded-[26px] border p-7 sm:p-10"
        style={{
          background: `linear-gradient(180deg, ${theme.environment.background.split(",")[0].replace("linear-gradient(180deg,", "").trim()}, #05080D)`,
          borderColor: theme.panel.border,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: theme.status.ok }}
          >
            ✓
          </span>
          <div>
            <p
              className="text-lg font-semibold tracking-[-0.015em]"
              style={{ color: theme.panel.text }}
            >
              Experiment Complete
            </p>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              {experiment.title}
            </p>
          </div>
        </div>

        {calculated.length > 0 && (
          <div
            className="mt-8 border-y py-7"
            style={{ borderColor: theme.panel.border }}
          >
            {calculated.map((c) => (
              <div key={c.label} className="mt-3 first:mt-0">
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: theme.panel.dim }}
                >
                  {c.label}
                </p>
                <p
                  className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl"
                  style={{ color: theme.status.ok }}
                >
                  {c.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: theme.panel.dim }}
            >
              Observations
            </p>
            <ul className="mt-3 space-y-1.5">
              {recorded.length === 0 && (
                <li className="text-xs" style={{ color: theme.panel.muted }}>
                  No readings recorded.
                </li>
              )}
              {recorded.map((r) => (
                <li
                  key={r.id}
                  className="flex items-baseline justify-between gap-3 text-[12.5px]"
                >
                  <span style={{ color: theme.panel.muted }}>{r.label}</span>
                  <span className="font-mono tabular-nums" style={{ color: theme.panel.text }}>
                    {typeof r.value === "number" ? r.value : r.value}
                    {r.unit ? ` ${r.unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: theme.panel.dim }}
            >
              Interpretation
            </p>
            <p
              className="mt-3 text-xs leading-relaxed"
              style={{ color: theme.panel.muted }}
            >
              {experiment.concept}
            </p>
          </div>
        </div>
      </div>

      {onStartViva && (
        <button
          type="button"
          onClick={onStartViva}
          className="mt-6 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-bone transition-all duration-300 hover:bg-ember-deep active:scale-[0.99]"
        >
          Start the viva
          <span aria-hidden="true">→</span>
        </button>
      )}

      <p className="mt-6 max-w-xl text-xs leading-relaxed text-smoke">
        Educational simulation parameters — scientific procedure verification
        required. No official reference or acceptance limit is asserted.
      </p>
    </div>
  );
}
