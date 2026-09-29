import { useMemo, useState } from "react";
import type { Experiment, Interaction } from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import type { SimulationState } from "../../engine/simulation";
import { deriveProcedure } from "../../engine/procedure";
import {
  DR_KEYS,
  DR_RANGES,
  apparentEc50,
  doseResponseCurve,
  effect,
  occupancy,
  occupiedReceptors,
  type DoseResponseParams,
} from "../../engine/pharmacology";
import { anim } from "../experiment/lab/anim";
import EvidencePanel from "../evidence/EvidencePanel";
import { referencesForExperiment } from "../../data/references";

type Props = {
  experiment: Experiment;
  state: SimulationState;
  theme: ExperimentTheme;
  onInteract: (interaction: Interaction, value?: number) => void;
  onRestart: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

const RECEPTORS = 12;
const W = 620;
const H = 380;
const PAD = { top: 24, right: 18, bottom: 34, left: 50 };
const LOG_MIN = -3;
const LOG_MAX = 3;

/** A receptor slot — occupied or free. */
function ReceptorSlot({
  filled,
  index,
  colour,
}: {
  filled: boolean;
  index: number;
  colour: string;
}) {
  return (
    <span
      className="relative flex h-11 w-11 items-center justify-center sm:h-14 sm:w-14"
      style={{ transitionDelay: `${index * 35}ms` }}
    >
      {/* the receptor */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[14px] border-2 transition-all duration-500"
        style={{
          borderColor: filled ? colour : "rgba(255,200,230,0.28)",
          background: filled ? `${colour}22` : "rgba(255,200,230,0.05)",
          transform: filled ? "scale(1.04)" : "scale(1)",
          boxShadow: filled ? `0 0 22px ${colour}44` : "none",
        }}
      />
      {/* the bound drug molecule */}
      <span
        aria-hidden="true"
        className="relative h-4 w-4 rounded-full transition-all duration-500 sm:h-5 sm:w-5"
        style={{
          background: filled ? colour : "rgba(255,255,255,0.10)",
          boxShadow: filled ? `0 0 12px ${colour}` : "none",
          transform: filled ? "scale(1)" : "scale(0.6)",
          opacity: filled ? 1 : 0.35,
        }}
      />
    </span>
  );
}

export default function DoseResponseLab({
  experiment,
  state,
  theme,
  onInteract,
  onRestart,
  onContinue,
  canContinue,
}: Props) {
  const references = useMemo(
    () => referencesForExperiment(experiment.id),
    [experiment.id]
  );

  const [nudge, setNudge] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);

  const procedure = useMemo(
    () => deriveProcedure(experiment, state),
    [experiment, state]
  );

  const params: DoseResponseParams = useMemo(
    () => ({
      concentration:
        Math.pow(10, state.values[DR_KEYS.concentration] ?? 0) || 1e-3,
      emax: state.values[DR_KEYS.emax] ?? DR_RANGES.emax.initial,
      ec50: state.values[DR_KEYS.ec50] ?? DR_RANGES.ec50.initial,
      hill: state.values[DR_KEYS.hill] ?? DR_RANGES.hill.initial,
      antagonist: state.values[DR_KEYS.antagonist] ?? 0,
      kb: 1,
    }),
    [state.values]
  );

  /* The curve the student compares against: no antagonist present. */
  const baseline = useMemo(
    () => doseResponseCurve({ ...params, antagonist: 0 }, LOG_MIN, LOG_MAX),
    [params]
  );
  const current = useMemo(
    () => doseResponseCurve(params, LOG_MIN, LOG_MAX),
    [params]
  );

  const response = effect(params);
  const occ = occupancy(params);
  const filled = occupiedReceptors(params, RECEPTORS);
  const shiftedEc50 = apparentEc50(params);
  const shifted = Math.abs(shiftedEc50 - params.ec50) > 0.005;

  const primaryInteraction = procedure.allowedInteractions.find(
    (i) => !state.completedActions.includes(i.id)
  );
  const target = procedure.targetObjectId;
  const stepIndex = procedure.currentStepIndex;
  const totalSteps = experiment.steps.length;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (logC: number) => PAD.left + ((logC - LOG_MIN) / (LOG_MAX - LOG_MIN)) * plotW;
  const y = (e: number) => PAD.top + (1 - e / 100) * plotH;

  const toPath = (pts: { logC: number; effect: number }[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.logC).toFixed(1)},${y(p.effect).toFixed(1)}`)
      .join(" ");

  const currentLogC = Math.log10(Math.max(1e-3, params.concentration));

  const sliders = [
    { key: DR_KEYS.concentration, range: DR_RANGES.concentration, value: Math.log10(Math.max(1e-3, params.concentration)), id: "dr-concentration" },
    { key: DR_KEYS.ec50, range: DR_RANGES.ec50, value: params.ec50, id: "dr-ec50" },
    { key: DR_KEYS.emax, range: DR_RANGES.emax, value: params.emax, id: "dr-emax" },
    { key: DR_KEYS.hill, range: DR_RANGES.hill, value: params.hill, id: "dr-hill" },
    { key: DR_KEYS.antagonist, range: DR_RANGES.antagonist, value: params.antagonist, id: "dr-antagonist" },
  ];

  const readouts = [
    { label: "Response", value: response.toFixed(1), unit: "%", colour: theme.accent },
    { label: "Occupancy", value: (occ * 100).toFixed(1), unit: "%", colour: theme.status.info },
    { label: "EC50", value: params.ec50.toFixed(2), unit: "u", colour: theme.status.warn },
    { label: shifted ? "EC50 (shifted)" : "Antagonist", value: shifted ? shiftedEc50.toFixed(2) : params.antagonist.toFixed(1), unit: "u", colour: shifted ? theme.status.bad : theme.panel.dim },
  ];

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden">
      {/* top bar */}
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-5"
        style={{ background: theme.panel.background, borderColor: theme.panel.border, backdropFilter: "blur(14px)" }}
      >
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold sm:text-[13.5px]" style={{ color: theme.panel.text }}>
            {experiment.title}
          </p>
          <p className="mt-0.5 hidden font-mono text-[8.5px] uppercase tracking-[0.2em] sm:block" style={{ color: theme.panel.dim }}>
            {experiment.domain} · Emax model · conceptual receptor view
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums" style={{ color: theme.panel.dim }}>
            <span style={{ color: theme.accent }}>{String(stepIndex + 1).padStart(2, "0")}</span>
            /{String(totalSteps).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => setShowProcedure(true)} className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>Steps</button>
          <button type="button" onClick={onRestart} className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>↻</button>
          <EvidencePanel
              references={references}
              theme={theme}
              contextLabel={experiment.title}
              data-lab-evidence
            />
            <a href="#/lab" className="rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>Exit</a>
        </div>
      </div>

      {/* workspace */}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ backgroundImage: `${theme.environment.light}, ${theme.environment.background}` }}
      >
        {/* ---------------- simulation space ---------------- */}
        <div className="relative min-h-[320px] overflow-hidden p-3 sm:p-4">
          {/* readouts */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {readouts.map((r) => (
              <div
                key={r.label}
                className="flex-1 rounded-2xl border px-3 py-2 backdrop-blur-md"
                style={{ background: theme.panel.background, borderColor: theme.panel.border, minWidth: 104 }}
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: theme.panel.dim }}>{r.label}</p>
                <p className="mt-0.5 font-mono text-[21px] font-semibold leading-none tabular-nums sm:text-[25px]" style={{ color: r.colour }}>
                  {r.value}
                  <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>{r.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* receptor panel */}
          <div
            className="mt-3 rounded-[22px] border p-4 sm:p-5"
            style={{ background: theme.panel.background, borderColor: theme.panel.border }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
                Receptor occupancy
              </p>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>
                Conceptual model
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {Array.from({ length: RECEPTORS }, (_, i) => (
                <ReceptorSlot key={i} index={i} filled={i < filled} colour={theme.accent} />
              ))}
            </div>

            {/* response meter */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>
                <span>Response</span>
                <span className="tabular-nums" style={{ color: theme.accent }}>{response.toFixed(1)}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,200,230,0.12)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, response))}%`,
                    background: `linear-gradient(90deg, ${theme.status.info}, ${theme.accent})`,
                    transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* dose–response curve */}
          <div className="mt-3 rounded-[22px] border p-3 sm:p-4" style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
                Dose–response curve
              </p>
              {shifted && (
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.status.bad }}>
                  competitive antagonist → rightward shift
                </p>
              )}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img"
              aria-label={`Dose response curve. Response ${response.toFixed(1)} percent at the current concentration.`}>
              {[0, 25, 50, 75, 100].map((e) => (
                <line key={e} x1={PAD.left} x2={W - PAD.right} y1={y(e)} y2={y(e)} stroke="rgba(255,200,230,0.10)" />
              ))}
              {[-3, -2, -1, 0, 1, 2, 3].map((l) => (
                <line key={l} y1={PAD.top} y2={H - PAD.bottom} x1={x(l)} x2={x(l)} stroke="rgba(255,200,230,0.06)" />
              ))}

              {/* baseline (no antagonist) */}
              {shifted && (
                <path d={toPath(baseline)} fill="none" stroke="rgba(255,200,230,0.32)" strokeWidth="1.5" strokeDasharray="5 5" />
              )}
              {/* current curve */}
              <path d={toPath(current)} fill="none" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${theme.accent}55)` }} />

              {/* EC50 markers */}
              <line x1={x(Math.log10(params.ec50))} x2={x(Math.log10(params.ec50))} y1={y(params.emax / 2)} y2={H - PAD.bottom} stroke={theme.status.warn} strokeDasharray="3 4" opacity="0.7" />
              {shifted && (
                <line x1={x(Math.log10(shiftedEc50))} x2={x(Math.log10(shiftedEc50))} y1={y(params.emax / 2)} y2={H - PAD.bottom} stroke={theme.status.bad} strokeDasharray="3 4" opacity="0.7" />
              )}

              {/* operating point */}
              <circle cx={x(currentLogC)} cy={y(response)} r="6" fill={theme.accent} stroke="#fff" strokeWidth="1.5" />

              <text x={PAD.left} y={H - 10} fontSize="9" fill={theme.panel.dim} fontFamily="monospace">10⁻³</text>
              <text x={W - PAD.right} y={H - 10} fontSize="9" fill={theme.panel.dim} fontFamily="monospace" textAnchor="end">10³</text>
              <text x={PAD.left - 8} y={PAD.top + 3} fontSize="9" fill={theme.panel.dim} fontFamily="monospace" textAnchor="end">100</text>
              <text x={PAD.left - 8} y={H - PAD.bottom} fontSize="9" fill={theme.panel.dim} fontFamily="monospace" textAnchor="end">0</text>
              <text x={PAD.left - 32} y={PAD.top + plotH / 2} fontSize="9.5" fill={theme.panel.muted} fontFamily="monospace" textAnchor="middle" transform={`rotate(-90 ${PAD.left - 32} ${PAD.top + plotH / 2})`}>Response</text>
            </svg>
          </div>
        </div>

        {/* ---------------- control panel ---------------- */}
        <aside
          className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{ background: theme.panel.background, borderColor: theme.panel.border, backdropFilter: "blur(16px)" }}
          aria-label="Parameters and guidance"
        >
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.accent, background: `${theme.accent}12` }}>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.accent }}>Next action</span>
            <p key={procedure.requiredAction} className={`mt-2 text-[15px] font-semibold leading-snug ${anim.riseIn}`} style={{ color: theme.panel.text }}>
              {nudge ?? procedure.requiredAction}
            </p>
            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>{procedure.stepTitle}</p>

            {primaryInteraction && (
              <button type="button" onClick={() => onInteract(primaryInteraction)} className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]" style={{ background: theme.accent, color: "#fff", boxShadow: `0 10px 24px -12px ${theme.accent}` }}>
                {primaryInteraction.label} →
              </button>
            )}

            {procedure.why && (
              <>
                <button type="button" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy} className="mt-2.5 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>
                  {showWhy ? "Hide why" : "Why?"}
                </button>
                {showWhy && (
                  <p className="mt-2.5 border-t pt-2.5 text-[11.5px] leading-relaxed" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>{procedure.why}</p>
                )}
              </>
            )}
          </div>

          {/* parameters */}
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Parameters</p>
            <div className="mt-3 space-y-3.5">
              {sliders.map((s) => {
                const isTarget = target === s.id;
                return (
                  <div key={s.key} className="rounded-xl px-2.5 py-2 transition-colors duration-500"
                    style={{ background: isTarget ? `${theme.accent}18` : "transparent", border: `1px solid ${isTarget ? `${theme.accent}55` : "transparent"}` }}>
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor={s.key} className="text-[11.5px] font-medium" style={{ color: theme.panel.text }}>
                        {s.range.label}
                        {isTarget && <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: theme.accent }}>adjust this</span>}
                      </label>
                      <span className="font-mono text-[12px] tabular-nums" style={{ color: isTarget ? theme.accent : theme.panel.text }}>
                        {s.value.toFixed(2)}
                        {s.range.unit && <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>{s.range.unit}</span>}
                      </span>
                    </div>
                    <input
                      id={s.key}
                      type="range"
                      min={s.range.min}
                      max={s.range.max}
                      step={s.range.step}
                      value={s.value}
                      onChange={(e) =>
                        onInteract({ id: "dr-param", type: "adjust", targetId: s.id, label: s.range.label }, Number(e.target.value))
                      }
                      className="mt-2 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                      style={{ background: "rgba(255,200,230,0.16)", accentColor: theme.accent }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-snug" style={{ color: theme.panel.dim }}>
              Educational simulation values — the receptor view is a conceptual
              model of occupancy.
            </p>
          </div>

          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Governing relations</p>
            <div className="mt-2 space-y-1.5 font-mono text-[11.5px] leading-relaxed" style={{ color: theme.panel.text }}>
              <p>E = Emax · C<sup>h</sup> / (EC50<sup>h</sup> + C<sup>h</sup>)</p>
              <p style={{ color: theme.panel.muted }}>EC50′ = EC50 · (1 + [B]/K<sub>B</sub>)</p>
            </div>
          </div>

          <button type="button" onClick={() => { if (!canContinue) { setNudge("Finish the current step first."); setTimeout(() => setNudge(null), 2200); return; } onContinue(); }}
            aria-disabled={!canContinue}
            className="mt-auto w-full cursor-pointer rounded-2xl px-4 py-3 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]"
            style={{ background: canContinue ? theme.accent : "transparent", color: canContinue ? "#fff" : theme.panel.dim, border: `1px solid ${canContinue ? theme.accent : theme.panel.border}` }}>
            {canContinue ? "Continue →" : "Complete the step to continue"}
          </button>
        </aside>
      </div>

      {showProcedure && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Procedure">
          <button type="button" aria-label="Close" onClick={() => setShowProcedure(false)} className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm" />
          <div className="scroll-thin relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border p-5" style={{ background: "#150C19", borderColor: theme.panel.border }}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: theme.accent }}>Procedure</h2>
              <button type="button" onClick={() => setShowProcedure(false)} className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>Close</button>
            </div>
            <ol className="mt-4">
              {experiment.steps.map((st) => {
                const complete = st.interactions.every((i) => state.completedActions.includes(i.id));
                return (
                  <li key={st.id} className="border-b py-3 last:border-b-0" style={{ borderColor: theme.panel.border }}>
                    <p className="text-[13px] font-medium" style={{ color: theme.panel.text }}>{st.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: theme.panel.muted }}>{st.instruction}</p>
                    <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: complete ? theme.status.ok : theme.panel.dim }}>{complete ? "✓ Complete" : "Pending"}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
