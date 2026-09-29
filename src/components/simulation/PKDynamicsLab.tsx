import { useEffect, useMemo, useState } from "react";
import type { Experiment, Interaction } from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import type { SimulationState } from "../../engine/simulation";
import { deriveProcedure } from "../../engine/procedure";
import {
  PKD_KEYS,
  PKD_RANGES,
  PKD_TIME_MAX,
  curvePoints,
  derivePKDynamics,
  type PkRoute,
} from "../../engine/pkDynamics";
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

const W = 640;
const H = 300;
const PAD = { top: 22, right: 18, bottom: 32, left: 50 };

/** A compartment with an animated fill proportional to the drug it holds. */
function Compartment({
  label,
  sublabel,
  amount,
  max,
  colour,
  theme,
  active,
}: {
  label: string;
  sublabel: string;
  amount: number;
  max: number;
  colour: string;
  theme: ExperimentTheme;
  active: boolean;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, amount / max)) : 0;
  return (
    <div
      className="relative flex-1 overflow-hidden rounded-2xl border p-3.5 transition-all duration-500"
      style={{
        borderColor: active ? `${colour}88` : theme.panel.border,
        background: theme.panel.background,
        boxShadow: active ? `0 0 26px -8px ${colour}55` : "none",
      }}
    >
      <p className="font-mono text-[8.5px] uppercase tracking-[0.18em]" style={{ color: theme.panel.dim }}>
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold leading-tight" style={{ color: theme.panel.text }}>
        {sublabel}
      </p>

      {/* animated fill */}
      <div
        className="mt-3 h-2 overflow-hidden rounded-full"
        style={{ background: "rgba(180,170,255,0.14)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${ratio * 100}%`,
            background: colour,
            transition: "width 120ms linear",
          }}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10.5px] tabular-nums" style={{ color: theme.panel.muted }}>
        {amount.toFixed(1)} mg
      </p>

      {/* drug particles */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const on = ratio * 10 > i;
          return (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{
                background: on ? colour : "rgba(180,170,255,0.14)",
                boxShadow: on ? `0 0 8px ${colour}88` : "none",
                transition: "background 200ms, box-shadow 200ms",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PKDynamicsLab({
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
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /* the simulation clock */
  useEffect(() => {
    if (!playing) return;
    const step = reduceMotion ? 1 : 0.25;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + step;
        if (next >= PKD_TIME_MAX) {
          setPlaying(false);
          return PKD_TIME_MAX;
        }
        return next;
      });
    }, reduceMotion ? 400 : 60);
    return () => window.clearInterval(id);
  }, [playing, reduceMotion]);

  const procedure = useMemo(
    () => deriveProcedure(experiment, state),
    [experiment, state]
  );

  const route: PkRoute = state.values["pkd-route"] === 0 ? "IV_BOLUS" : "ORAL";
  const params = useMemo(
    () => ({
      route,
      dose: state.values[PKD_KEYS.dose] ?? PKD_RANGES.dose.initial,
      volume: state.values[PKD_KEYS.volume] ?? PKD_RANGES.volume.initial,
      ka: state.values[PKD_KEYS.ka] ?? PKD_RANGES.ka.initial,
      ke: state.values[PKD_KEYS.ke] ?? PKD_RANGES.ke.initial,
    }),
    [route, state.values]
  );

  const derived = useMemo(() => derivePKDynamics(params, time), [params, time]);
  const curve = useMemo(() => curvePoints(params, PKD_TIME_MAX), [params]);
  const cMax = useMemo(
    () => curve.reduce((m, p) => Math.max(m, p.c), 0),
    [curve]
  );

  const primaryInteraction = procedure.allowedInteractions.find(
    (i) => !state.completedActions.includes(i.id)
  );
  const target = procedure.targetObjectId;
  const stepIndex = procedure.currentStepIndex;
  const totalSteps = experiment.steps.length;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + (t / PKD_TIME_MAX) * plotW;
  const yMax = Math.max(cMax * 1.15, 1);
  const y = (c: number) => PAD.top + (1 - c / yMax) * plotH;

  const path = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
    .join(" ");
  const travelled = curve.filter((p) => p.t <= time);
  const travelledPath = travelled
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
    .join(" ");

  const sliders = [
    { key: PKD_KEYS.dose, range: PKD_RANGES.dose, value: params.dose, id: "pkd-dose" },
    { key: PKD_KEYS.volume, range: PKD_RANGES.volume, value: params.volume, id: "pkd-volume" },
    { key: PKD_KEYS.ka, range: PKD_RANGES.ka, value: params.ka, id: "pkd-ka" },
    { key: PKD_KEYS.ke, range: PKD_RANGES.ke, value: params.ke, id: "pkd-ke" },
  ];

  const readouts = [
    { label: "Concentration", value: derived.current.toFixed(2), unit: "mg/L", colour: theme.accent },
    { label: "Time", value: time.toFixed(1), unit: "h", colour: theme.status.info },
    { label: "Cmax", value: derived.cmax.toFixed(2), unit: "mg/L", colour: theme.status.ok },
    { label: "Tmax", value: derived.tmax.toFixed(1), unit: "h", colour: theme.status.ok },
    { label: "t½", value: Number.isFinite(derived.halfLife) ? derived.halfLife.toFixed(1) : "∞", unit: "h", colour: theme.status.warn },
    { label: "AUC", value: Number.isFinite(derived.auc) ? derived.auc.toFixed(1) : "∞", unit: "mg·h/L", colour: theme.status.endpoint },
  ];

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[540px] w-full flex-col overflow-hidden">
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
            {experiment.domain} · {route === "ORAL" ? "Oral, first-order absorption" : "IV bolus"} · F = 1
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
        <div className="scroll-thin min-h-0 overflow-y-auto p-3 sm:p-4">
          {/* readouts */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {readouts.map((r) => (
              <div key={r.label} className="rounded-xl border px-2.5 py-2 backdrop-blur-md" style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
                <p className="font-mono text-[7.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>{r.label}</p>
                <p className="mt-0.5 font-mono text-[16px] font-semibold leading-none tabular-nums sm:text-[18px]" style={{ color: r.colour }}>
                  {r.value}
                  <span className="ml-1 text-[8px]" style={{ color: theme.panel.dim }}>{r.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* compartments */}
          <div className="mt-3 rounded-[22px] border p-3.5 sm:p-4" style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Compartments</p>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>One-compartment model</p>
            </div>

            <div className="mt-3.5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {route === "ORAL" && (
                <>
                  <Compartment label="Absorption site" sublabel="Gut" amount={derived.gutAmount} max={params.dose} colour={theme.status.info} theme={theme} active={derived.gutAmount > derived.centralAmount} />
                  <span aria-hidden="true" className="shrink-0 self-center text-lg" style={{ color: theme.panel.dim }}>→</span>
                </>
              )}
              <Compartment label="Central compartment" sublabel="Plasma" amount={derived.centralAmount} max={params.dose} colour={theme.accent} theme={theme} active={derived.centralAmount >= derived.gutAmount} />
              <span aria-hidden="true" className="shrink-0 self-center text-lg" style={{ color: theme.panel.dim }}>→</span>
              <Compartment label="Elimination" sublabel="Removed" amount={derived.eliminatedAmount} max={params.dose} colour={theme.status.ok} theme={theme} active={time > 0 && derived.eliminatedAmount > derived.centralAmount} />
            </div>

            {/* time controls */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (time >= PKD_TIME_MAX) setTime(0);
                  setPlaying((p) => !p);
                }}
                className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-300 active:scale-[0.97]"
                style={{ background: theme.accent, color: "#fff", minWidth: 92 }}
              >
                {playing ? "❙❙ Pause" : time >= PKD_TIME_MAX ? "↻ Replay" : "▶ Play"}
              </button>
              <button
                type="button"
                onClick={() => { setPlaying(false); setTime(0); }}
                className="cursor-pointer rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
              >
                Reset
              </button>
              <div className="min-w-[140px] flex-1">
                <div className="flex items-baseline justify-between font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>
                  <span>Time</span>
                  <span className="tabular-nums" style={{ color: theme.accent }}>{time.toFixed(1)} h</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={PKD_TIME_MAX}
                  step={0.1}
                  value={time}
                  aria-label="Simulation time in hours"
                  onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)); }}
                  className="mt-1.5 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                  style={{ background: "rgba(180,170,255,0.16)", accentColor: theme.accent }}
                />
              </div>
            </div>
          </div>

          {/* concentration–time graph */}
          <div className="mt-3 rounded-[22px] border p-3 sm:p-4" style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Concentration against time</p>
              <p className="font-mono text-[8.5px] tabular-nums" style={{ color: theme.accent }}>{derived.current.toFixed(2)} mg/L at {time.toFixed(1)} h</p>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img"
              aria-label={`Concentration against time. Current concentration ${derived.current.toFixed(2)} milligrams per litre at ${time.toFixed(1)} hours.`}>
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + f * plotH} y2={PAD.top + f * plotH} stroke="rgba(180,170,255,0.10)" />
              ))}
              {Array.from({ length: 7 }, (_, i) => (PKD_TIME_MAX * i) / 6).map((t) => (
                <line key={t} y1={PAD.top} y2={H - PAD.bottom} x1={x(t)} x2={x(t)} stroke="rgba(180,170,255,0.07)" />
              ))}

              {/* Cmax / Tmax marker */}
              {derived.tmax > 0 && (
                <>
                  <line x1={x(derived.tmax)} x2={x(derived.tmax)} y1={y(derived.cmax)} y2={H - PAD.bottom} stroke={theme.status.ok} strokeDasharray="3 4" opacity="0.7" />
                  <circle cx={x(derived.tmax)} cy={y(derived.cmax)} r="3.5" fill={theme.status.ok} />
                  <text x={x(derived.tmax) + 6} y={y(derived.cmax) - 7} fontSize="9" fill={theme.status.ok} fontFamily="monospace">Cmax</text>
                </>
              )}

              {/* full profile */}
              <path d={path} fill="none" stroke="rgba(180,170,255,0.32)" strokeWidth="1.5" />
              {/* travelled portion */}
              {travelled.length > 1 && (
                <path d={travelledPath} fill="none" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${theme.accent}55)` }} />
              )}

              {/* time cursor */}
              {time > 0 && (
                <>
                  <line x1={x(time)} x2={x(time)} y1={PAD.top} y2={H - PAD.bottom} stroke={theme.panel.muted} strokeWidth="1" strokeDasharray="2 4" />
                  <circle cx={x(time)} cy={y(derived.current)} r="5.5" fill={theme.accent} stroke="#fff" strokeWidth="1.5" />
                </>
              )}

              <text x={PAD.left} y={H - 10} fontSize="9" fill={theme.panel.dim} fontFamily="monospace">0</text>
              <text x={W - PAD.right} y={H - 10} fontSize="9" fill={theme.panel.dim} fontFamily="monospace" textAnchor="end">{PKD_TIME_MAX} h</text>
              <text x={PAD.left - 8} y={PAD.top + 3} fontSize="9" fill={theme.panel.dim} fontFamily="monospace" textAnchor="end">{yMax.toFixed(1)}</text>
              <text x={PAD.left - 32} y={PAD.top + plotH / 2} fontSize="9.5" fill={theme.panel.muted} fontFamily="monospace" textAnchor="middle" transform={`rotate(-90 ${PAD.left - 32} ${PAD.top + plotH / 2})`}>Concentration</text>
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
              <button type="button" onClick={() => onInteract(primaryInteraction)} className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]" style={{ background: theme.accent, color: "#fff" }}>
                {primaryInteraction.label} →
              </button>
            )}
            {procedure.why && (
              <>
                <button type="button" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy} className="mt-2.5 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>
                  {showWhy ? "Hide why" : "Why?"}
                </button>
                {showWhy && <p className="mt-2.5 border-t pt-2.5 text-[11.5px] leading-relaxed" style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>{procedure.why}</p>}
              </>
            )}
          </div>

          {/* route */}
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Route</p>
            <div className="mt-2.5 flex gap-2">
              {(["ORAL", "IV_BOLUS"] as PkRoute[]).map((r) => {
                const active = route === r;
                return (
                  <button key={r} type="button"
                    onClick={() => onInteract({ id: "pkd-route", type: "press", targetId: "pkd-route", label: "Route" }, r === "ORAL" ? 1 : 0)}
                    className="flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-all duration-300"
                    style={{ borderColor: active ? theme.accent : theme.panel.border, background: active ? `${theme.accent}18` : "transparent", color: theme.panel.text }}>
                    {r === "ORAL" ? "Oral" : "IV bolus"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* parameters */}
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Parameters</p>
            <div className="mt-3 space-y-3.5">
              {sliders.map((s) => {
                const disabled = s.key === PKD_KEYS.ka && route === "IV_BOLUS";
                const isTarget = target === s.id;
                return (
                  <div key={s.key} className="rounded-xl px-2.5 py-2" style={{ background: isTarget ? `${theme.accent}18` : "transparent", border: `1px solid ${isTarget ? `${theme.accent}55` : "transparent"}` }}>
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor={s.key} className="text-[11.5px] font-medium" style={{ color: disabled ? theme.panel.dim : theme.panel.text }}>
                        {s.range.label}
                        {disabled && <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.12em]" style={{ color: theme.panel.dim }}>oral only</span>}
                      </label>
                      <span className="font-mono text-[12px] tabular-nums" style={{ color: isTarget ? theme.accent : theme.panel.text }}>
                        {s.value}
                        <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>{s.range.unit}</span>
                      </span>
                    </div>
                    <input
                      id={s.key} type="range" min={s.range.min} max={s.range.max} step={s.range.step} value={s.value} disabled={disabled}
                      onChange={(e) => onInteract({ id: "pkd-param", type: "adjust", targetId: s.id, label: s.range.label }, Number(e.target.value))}
                      className="mt-2 h-6 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40 sm:h-2"
                      style={{ background: "rgba(180,170,255,0.16)", accentColor: theme.accent }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-snug" style={{ color: theme.panel.dim }}>
              Educational simulation ranges. Bioavailability is fixed at 1 — a
              stated modelling assumption.
            </p>
          </div>

          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Model</p>
            <div className="mt-2 space-y-1.5 font-mono text-[11px] leading-relaxed" style={{ color: theme.panel.text }}>
              {route === "ORAL" ? (
                <p>C(t) = (D·ka)/(V·(ka−ke))·(e<sup>−ke·t</sup> − e<sup>−ka·t</sup>)</p>
              ) : (
                <p>C(t) = (D/V)·e<sup>−ke·t</sup></p>
              )}
              <p style={{ color: theme.panel.muted }}>t½ = 0.693 / ke</p>
              <p style={{ color: theme.panel.muted }}>AUC = D / (V·ke)</p>
              {route === "ORAL" && <p style={{ color: theme.panel.muted }}>Tmax = ln(ka/ke) / (ka−ke)</p>}
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
          <div className="scroll-thin relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border p-5" style={{ background: "#0B0E1E", borderColor: theme.panel.border }}>
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
