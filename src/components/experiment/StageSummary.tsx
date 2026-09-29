import type {
  AssessmentDef,
  Experiment,
  ObservationDef,
} from "../../engine/types";
import type { CalculationResult } from "../../engine/calculations";
import type { SimulationState } from "../../engine/simulation";
import type { CalculationInput } from "../../engine/calculations";
import SourceBadge from "../curriculum/SourceBadge";
import { GRID_STYLE } from "../HeroVisual";

/* ----------------------------------------------------------- Shared bits */

function StageHead({
  title,
  stage,
}: {
  title: string;
  stage: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h2 className="text-sm font-medium text-ink">{title}</h2>
      <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
        {stage}
      </span>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-[22px] border border-clay bg-gradient-to-b from-white to-sand px-6 py-10 text-center sm:px-10">
      <div className="absolute inset-0" style={GRID_STYLE} aria-hidden="true" />
      <span
        aria-hidden="true"
        className="relative mx-auto flex h-1.5 w-1.5 items-center justify-center"
      >
        <span className="absolute h-full w-full animate-pulse-soft rounded-full bg-ember motion-reduce:animate-none" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-ember" />
      </span>
      <p className="relative mt-5 text-sm leading-relaxed text-smoke">
        {children}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- OBSERVE */

const KIND_LABEL: Record<ObservationDef["kind"], string> = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  instrument: "Instrument",
  visual: "Visual",
};

export function StageObserve({ state }: { state: SimulationState }) {
  const recorded = state.observations.filter((o) => o.value !== null);

  return (
    <div className="animate-swap">
      <StageHead title="Observe" stage="STAGE 04" />
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-smoke">
        Observations are read directly from simulation state — never invented.
      </p>

      {state.observations.length === 0 ? (
        <EmptyState>
          Simulation data will be connected during experiment implementation.
        </EmptyState>
      ) : (
        <>
          <ul className="mt-8 border-t border-clay">
            {state.observations.map((record) => (
              <li
                key={record.id}
                className="grid gap-2 border-b border-clay/70 py-4 sm:grid-cols-[150px_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="text-sm font-medium text-ink">
                  {record.label}
                </span>

                <span>
                  <span className="sr-only">
                    {KIND_LABEL[record.kind]} —{" "}
                  </span>
                  <span
                    className={`text-sm tabular-nums ${
                      record.value === null ? "text-smoke/70" : "text-ink"
                    }`}
                  >
                    {record.value === null
                      ? "Pending simulation"
                      : `${record.value}${record.unit ? ` ${record.unit}` : ""}`}
                  </span>
                  {typeof record.value === "number" && (
                    <span className="mt-2 block h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-clay/70">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-ember-deep to-ember transition-[width] duration-700 ease-out"
                        style={{
                          width: `${Math.max(0, Math.min(100, record.value))}%`,
                        }}
                      />
                    </span>
                  )}
                </span>

                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-smoke/60 sm:text-right">
                  {KIND_LABEL[record.kind]}
                </span>
              </li>
            ))}
          </ul>

          {recorded.length === 0 && (
            <p className="mt-6 text-xs leading-relaxed text-smoke">
              Simulation data will be connected during experiment
              implementation — no values are shown until the simulation produces
              them.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ CALCULATE */

export function StageCalculate({
  results,
  inputs,
}: {
  results: CalculationResult[];
  inputs: CalculationInput[];
}) {
  return (
    <div className="animate-swap">
      <StageHead title="Calculate" stage="STAGE 05" />
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-smoke">
        All mathematics runs in a separate calculation layer, away from the
        interface.
      </p>

      {inputs.length > 0 && (
        <div className="mt-8">
          <h3 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
            Inputs
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {inputs.map((input) => (
              <li
                key={input.id}
                className="flex items-center gap-2 rounded-full border border-clay bg-white/70 px-3 py-1.5"
              >
                <span className="text-[11px] text-ink">{input.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-ember-deep">
                  {input.value === null
                    ? "—"
                    : `${input.value}${input.unit ? ` ${input.unit}` : ""}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-8 border-t border-clay">
        {results.map((result) => (
          <li
            key={result.id}
            className="grid gap-2 border-b border-clay/70 py-4 sm:grid-cols-[170px_1fr] sm:gap-6"
          >
            <span className="text-sm font-medium text-ink">{result.label}</span>
            <span>
              <span
                className={`text-sm tabular-nums ${
                  result.computed ? "text-ink" : "text-smoke/70"
                }`}
              >
                {result.computed ? result.value : "Not connected"}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-smoke">
                {result.note}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-lg text-xs leading-relaxed text-smoke">
        No formula, unit or acceptance limit is implemented until it comes from
        a verified source.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ INTERPRET */

export function StageInterpret() {
  const WILL_SHOW = [
    "Reading the observations",
    "Comparing against the calculation",
    "Drawing a conclusion",
    "Stating the uncertainty",
  ];

  return (
    <div className="animate-swap">
      <StageHead title="Interpret" stage="STAGE 06" />
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-smoke">
        Interpretation turns a result into understanding. It arrives with the
        first connected experiment.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-px sm:grid-cols-2">
        {WILL_SHOW.map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-3 border-b border-clay/70 py-3.5 sm:border-b-0"
          >
            <span className="font-mono text-[9.5px] tracking-[0.2em] text-smoke/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-ink">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- RESULT */

export function StageResult({
  experiment,
  state,
}: {
  experiment: Experiment;
  state: SimulationState;
}) {
  const totalInteractions = experiment.steps.reduce(
    (sum, s) => sum + s.interactions.length,
    0
  );
  const doneInteractions = state.completedActions.length;
  const allDone = doneInteractions === totalInteractions;

  return (
    <div className="animate-swap">
      <StageHead title="Result" stage="STAGE 07" />

      <div className="relative mt-6 overflow-hidden rounded-[26px] border border-clay bg-gradient-to-b from-white to-sand">
        <div className="absolute inset-0" style={GRID_STYLE} aria-hidden="true" />
        <span aria-hidden="true" className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-ink/25" />
        <span aria-hidden="true" className="absolute right-5 top-5 h-3.5 w-3.5 border-r border-t border-ink/25" />
        <span aria-hidden="true" className="absolute bottom-5 left-5 h-3.5 w-3.5 border-b border-l border-ink/25" />
        <span aria-hidden="true" className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-ink/25" />

        <div className="relative p-7 sm:p-10">
          <div className="grid grid-cols-3 gap-4 border-b border-clay/70 pb-7">
            {[
              { label: "Steps", value: doneInteractions, of: totalInteractions },
              {
                label: "Observations",
                value: state.observations.filter((o) => o.value !== null).length,
                of: state.observations.length,
              },
              {
                label: "Calculations",
                value: 0,
                of: experiment.calculations.length,
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-smoke/70">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-ink sm:text-3xl">
                  {stat.value}
                  <span className="text-base text-smoke/70">
                    /{stat.of}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <p className="text-base font-medium leading-snug text-ink">
              Experiment result will appear here.
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-smoke">
              {allDone
                ? "You completed every framework interaction. A scientific result requires a connected, verified experiment — none exists yet."
                : "Complete the framework interactions to see how the result stage assembles itself."}
            </p>
          </div>

          {/* interaction completion visual */}
          <div className="mt-7 flex flex-wrap gap-1.5" aria-hidden="true">
            {Array.from({ length: totalInteractions }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${
                  i < doneInteractions ? "bg-ember" : "bg-clay"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- ASSESSMENT */

const TYPE_LABEL: Record<string, string> = {
  "multiple-choice": "Multiple choice",
  numeric: "Numeric",
  "short-answer": "Short answer",
};

export function StageAssessment({
  assessment,
}: {
  assessment: AssessmentDef;
}) {
  return (
    <div className="animate-swap">
      <StageHead title="Assessment" stage="STAGE 08" />
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-smoke">
        Assessment checks that understanding holds. The viva layer expands in a
        later phase.
      </p>

      <ul className="mt-8 border-t border-clay">
        {assessment.items.map((item, i) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-clay/70 py-4"
          >
            <span className="flex items-center gap-4">
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-smoke/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-ink">{TYPE_LABEL[item.type]}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-smoke/70">
                {item.status === "PLANNED" ? "Planned" : item.status}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full bg-clay"
                aria-hidden="true"
              />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SourceBadge status="VERIFICATION_REQUIRED" />
        <p className="text-xs leading-relaxed text-smoke">
          {assessment.note ?? "Assessment content is pending verification."}
        </p>
      </div>
    </div>
  );
}
