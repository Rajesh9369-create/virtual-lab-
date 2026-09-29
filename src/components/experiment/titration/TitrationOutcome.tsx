import type { Experiment } from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import type { CalculationResult } from "../../../engine/calculations";
import { formatResult } from "../../../engine/calculations";
import type { TitrationView } from "../../../engine/titration";
import SourceBadge from "../../curriculum/SourceBadge";

/* -------------------------------------------------------------- OBSERVE */

const READOUTS = [
  { id: "obs-initial-reading", label: "Initial reading" },
  { id: "obs-aliquot", label: "Acid aliquot" },
  { id: "obs-final-reading", label: "Final reading" },
  { id: "obs-volume-used", label: "Base delivered" },
];

/**
 * OBSERVE — a continuation of the instrument console rather than a sudden
 * table. Every value is read straight out of simulation state.
 */
export function TitrationObserve({
  state,
  view,
}: {
  state: SimulationState;
  view: TitrationView;
}) {
  const colour = state.observations.find((o) => o.id === "obs-colour");

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Observe</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 04
        </span>
      </div>

      {/* instrument readout */}
      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#1B1715] p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
          {READOUTS.map((row) => {
            const record = state.observations.find((o) => o.id === row.id);
            const has = record && record.value !== null;
            return (
              <div key={row.id}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#F4F0EC]/45">
                  {row.label}
                </p>
                <p
                  className={`mt-2 font-mono text-2xl font-medium tabular-nums leading-none sm:text-3xl ${
                    has ? "text-[#F4F0EC]" : "text-[#F4F0EC]/25"
                  }`}
                >
                  {has ? Number(record.value).toFixed(2) : "—"}
                  {has && (
                    <span className="ml-1 text-[11px] text-[#F4F0EC]/45">
                      {record.unit}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* delivered volume on the burette scale */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#F4F0EC]/45">
            <span>0 mL</span>
            <span>Volume delivered</span>
            <span>25 mL</span>
          </div>
          <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ember-deep to-ember transition-[width] duration-700 ease-out"
              style={{ width: `${Math.min(100, (view.delivered / 25) * 100)}%` }}
            />
          </div>
        </div>

        {/* qualitative observation */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-white/10 pt-6">
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-8 w-8 rounded-lg border border-white/15"
              style={{ backgroundColor: view.colour }}
            />
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#F4F0EC]/45">
                Colour at endpoint
              </span>
              <span className="mt-0.5 block text-sm text-[#F4F0EC]">
                {colour?.value ?? "Not yet observed"}
              </span>
            </span>
          </span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.18em] text-[#F4F0EC]/35">
            Read from simulation state
          </span>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-xs leading-relaxed text-smoke">
        Values appear only once you take them at the bench — nothing here is
        filled in for you.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- INTERPRET */

export function TitrationInterpret({
  result,
}: {
  result: CalculationResult | null;
}) {
  const computed = result?.computed ?? false;

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Interpret</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 06
        </span>
      </div>

      {computed ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "01",
              head: "Moles delivered",
              line: "The base delivered exactly neutralised the acid in the flask.",
            },
            {
              step: "02",
              head: "Equivalence",
              line: "At that point the moles of base equal the moles of acid present.",
            },
            {
              step: "03",
              head: "Concentration",
              line: "Dividing by the aliquot volume gives the acid concentration.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[20px] border border-clay bg-white/75 p-5"
            >
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-smoke/70">
                {item.step}
              </span>
              <p className="mt-2.5 text-sm font-semibold text-ink">{item.head}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-smoke">
                {item.line}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-clay bg-white/70 px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-smoke">
            Complete the calculation to see the interpretation.
          </p>
        </div>
      )}

      <p className="mt-6 max-w-xl text-xs leading-relaxed text-smoke">
        Comparing this result against an official limit or specification
        requires a verified source — none is asserted here.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- RESULT */

export function TitrationResult({
  experiment,
  state,
  result,
  onStartViva,
}: {
  experiment: Experiment;
  state: SimulationState;
  result: CalculationResult | null;
  onStartViva?: () => void;
}) {
  const recorded = state.observations.filter((o) => o.value !== null);
  const computed = result?.computed ?? false;

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">Result</h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          STAGE 07
        </span>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[26px] border border-clay bg-gradient-to-b from-white to-sand">
        <span aria-hidden="true" className="absolute left-5 top-5 h-3 w-3 border-l border-t border-white/25" />
        <span aria-hidden="true" className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-ink/25" />
        <span aria-hidden="true" className="absolute right-5 top-5 h-3.5 w-3.5 border-r border-t border-ink/25" />
        <span aria-hidden="true" className="absolute bottom-5 left-5 h-3.5 w-3.5 border-b border-l border-ink/25" />
        <span aria-hidden="true" className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-ink/25" />

        <div className="relative p-7 sm:p-10">
          {/* completion mark */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ember text-[13px] font-bold text-white"
            >
              ✓
            </span>
            <div>
              <p className="text-lg font-semibold tracking-[-0.015em]" style={{ color: "#EAF2FA" }}>
                Experiment Complete
              </p>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: "rgba(214,232,246,0.5)" }}>
                {experiment.title}
              </p>
            </div>
          </div>

          {/* the result */}
          <div className="mt-8 border-y py-7" style={{ borderColor: "rgba(190,220,255,0.14)" }}>
            <p className="text-[12px] text-[#D6E8F6]/70">{result?.label}</p>
            <p
              className="mt-2 font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl"
             style={{ color: computed ? "#17B47C" : "rgba(214,232,246,0.3)" }}
            >
              {computed && result ? formatResult(result) : "—"}
            </p>
            {!computed && (
              <p className="mt-3 text-xs leading-relaxed text-smoke">
                Complete the calculation stage to see the result here.
              </p>
            )}
          </div>

          {/* observations */}
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
                Observations
              </p>
              <ul className="mt-3 space-y-1.5">
                {recorded.length === 0 && (
                  <li className="text-xs text-smoke">No readings recorded.</li>
                )}
                {recorded.map((record) => (
                  <li
                    key={record.id}
                    className="flex items-baseline justify-between gap-3 text-[12.5px]"
                  >
                    <span className="text-smoke">{record.label}</span>
                    <span className="font-mono tabular-nums text-ink">
                      {typeof record.value === "number"
                        ? `${record.value.toFixed(2)}${record.unit ? ` ${record.unit}` : ""}`
                        : record.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke">
                Interpretation
              </p>
              <p className="mt-3 text-xs leading-relaxed text-smoke">
                {computed
                  ? "At the equivalence point the moles of base delivered equalled the moles of acid in the aliquot, so the calculated concentration follows directly from the volumes used."
                  : "The interpretation appears once the result is calculated."}
              </p>
              <div className="mt-4">
                <SourceBadge status="VERIFICATION_REQUIRED" />
              </div>
            </div>
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
        Reference verification required — no pharmacopoeial monograph,
        acceptance limit or official procedure is cited.
      </p>
    </div>
  );
}
