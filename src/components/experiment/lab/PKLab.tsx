import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Experiment,
  Interaction,
  PharmacokineticModel,
} from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import type { ExperimentTheme } from "../../../engine/theme";
import { deriveProcedure } from "../../../engine/procedure";
import {
  PK_KEYS,
  derivePK,
  pkParamsFrom,
  type PKDerived,
} from "../../../engine/pharmacokinetics";
import { anim } from "./anim";
import EvidencePanel from "../../evidence/EvidencePanel";
import { referencesForExperiment } from "../../../data/references";

type Props = {
  experiment: Experiment;
  model: PharmacokineticModel;
  state: SimulationState;
  theme: ExperimentTheme;
  onInteract: (interaction: Interaction, value?: number) => void;
  onRestart: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

/** Friendly names for the controls the guidance points at. */
const TARGET_LABEL: Record<string, string> = {
  "pk-dose": "Dose slider",
  "pk-volume": "Volume slider",
  "pk-clearance": "Clearance slider",
  "pk-c0": "C₀ readout",
  "pk-half-life": "Half-life readout",
  "pk-reference": "Reference line slider",
};

const W = 720;
const H = 420;
const PAD = { top: 26, right: 18, bottom: 34, left: 54 };

export default function PKLab({
  experiment,
  model,
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
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    },
    []
  );

  const procedure = useMemo(
    () => deriveProcedure(experiment, state),
    [experiment, state]
  );

  const params = useMemo(
    () => pkParamsFrom(model, state.values),
    [model, state.values]
  );
  const derived: PKDerived = useMemo(
    () => derivePK(model, params),
    [model, params]
  );

  const primaryInteraction = procedure.allowedInteractions.find(
    (i) => !state.completedActions.includes(i.id)
  );
  const target = procedure.targetObjectId;
  const targetLabel = TARGET_LABEL[target ?? ""] ?? "the panel";

  const stepIndex = procedure.currentStepIndex;
  const totalSteps = experiment.steps.length;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const yMax = Math.max(derived.cMax * 1.15, params.reference * 1.4, 1);
  const x = (t: number) => PAD.left + (t / model.timeMax) * plotW;
  const y = (c: number) => PAD.top + (1 - c / yMax) * plotH;

  const curvePath = derived.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
    .join(" ");

  /* Half-life markers: each one halves the concentration. */
  const halfLifeMarks = [1, 2, 3]
    .map((n) => ({ n, t: derived.halfLife * n, c: derived.c0 / 2 ** n }))
    .filter((m) => Number.isFinite(m.t) && m.t <= model.timeMax);

  const setParam = (key: string, value: number, interaction?: Interaction) => {
    onInteract(
      { id: "noop", type: "adjust", targetId: key, label: key } as Interaction,
      undefined
    );
    void key;
    void value;
    void interaction;
  };
  void setParam;

  const nudgeBack = (msg: string, ms = 2200) => {
    setNudge(msg);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudge(null), ms);
  };

  const readouts = [
    {
      label: "C₀",
      value: derived.c0.toFixed(2),
      unit: model.units.concentration,
      colour: theme.accent,
    },
    {
      label: "t½",
      value: Number.isFinite(derived.halfLife) ? derived.halfLife.toFixed(2) : "∞",
      unit: model.units.time,
      colour: theme.status.info,
    },
    {
      label: "AUC",
      value: Number.isFinite(derived.auc) ? derived.auc.toFixed(1) : "∞",
      unit: `${model.units.dose}·${model.units.time}/${model.units.volume}`,
      colour: theme.status.ok,
    },
    {
      label: "k",
      value: derived.k.toFixed(4),
      unit: `1/${model.units.time}`,
      colour: theme.status.warn,
    },
  ];

  const sliders = [
    { key: PK_KEYS.dose, range: model.dose, value: params.dose, id: "pk-dose" },
    {
      key: PK_KEYS.volume,
      range: model.volumeOfDistribution,
      value: params.volume,
      id: "pk-volume",
    },
    {
      key: PK_KEYS.clearance,
      range: model.clearance,
      value: params.clearance,
      id: "pk-clearance",
    },
    {
      key: PK_KEYS.reference,
      range: model.referenceConcentration,
      value: params.reference,
      id: "pk-reference",
    },
  ];

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden">
      {/* ================= TOP BAR ================= */}
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-5"
        style={{
          background: theme.panel.background,
          borderColor: theme.panel.border,
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="min-w-0">
          <p
            className="truncate text-[12.5px] font-semibold sm:text-[13.5px]"
            style={{ color: theme.panel.text }}
          >
            {experiment.title}
          </p>
          <p
            className="mt-0.5 hidden font-mono text-[8.5px] uppercase tracking-[0.2em] sm:block"
            style={{ color: theme.panel.dim }}
          >
            {experiment.domain} · One compartment, IV bolus
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums"
            style={{ color: theme.panel.dim }}
          >
            <span style={{ color: theme.accent }}>
              {String(stepIndex + 1).padStart(2, "0")}
            </span>
            /{String(totalSteps).padStart(2, "0")}
          </span>
          <span className="hidden items-center gap-1 md:flex" aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className="h-1 w-3.5 rounded-full transition-colors duration-500"
                style={{
                  background:
                    i < stepIndex
                      ? `${theme.status.ok}aa`
                      : i === stepIndex
                        ? theme.accent
                        : "rgba(180,170,255,0.16)",
                }}
              />
            ))}
          </span>
          <button
            type="button"
            onClick={() => setShowProcedure(true)}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            Steps
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            ↻
          </button>
          <EvidencePanel
              references={references}
              theme={theme}
              contextLabel={experiment.title}
              data-lab-evidence
            />
            <a
            href="#/lab"
            className="rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            Exit
          </a>
        </div>
      </div>

      {/* ================= WORKSPACE ================= */}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ background: theme.environment.background }}
      >
        {/* ---------- the simulation space ---------- */}
        <div
          className="relative min-h-[300px] overflow-hidden"
          role="group"
          aria-label="Concentration against time, updating as parameters change"
          style={{
            backgroundImage: `${theme.environment.light}, ${theme.environment.background}`,
          }}
        >
          {/* big readouts across the top */}
          <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap gap-2 p-3 sm:gap-3 sm:p-4">
            {readouts.map((r) => (
              <div
                key={r.label}
                className="flex-1 rounded-2xl border px-3 py-2 backdrop-blur-md"
                style={{
                  background: theme.panel.background,
                  borderColor: theme.panel.border,
                  minWidth: 110,
                }}
              >
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.18em]"
                  style={{ color: theme.panel.dim }}
                >
                  {r.label}
                </p>
                <p
                  className="mt-0.5 font-mono text-[22px] font-semibold leading-none tabular-nums sm:text-[26px]"
                  style={{ color: r.colour }}
                >
                  {r.value}
                  <span
                    className="ml-1 text-[9px]"
                    style={{ color: theme.panel.dim }}
                  >
                    {r.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            style={{ paddingTop: 96 }}
            role="img"
            aria-label={`Concentration time curve. Initial concentration ${derived.c0.toFixed(
              2
            )} milligrams per litre, half-life ${
              Number.isFinite(derived.halfLife)
                ? derived.halfLife.toFixed(2)
                : "infinite"
            } hours.`}
          >
            {/* grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + f * plotH}
                y2={PAD.top + f * plotH}
                stroke="rgba(180,170,255,0.10)"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 7 }, (_, i) => (model.timeMax * i) / 6).map(
              (t) => (
                <line
                  key={t}
                  y1={PAD.top}
                  y2={H - PAD.bottom}
                  x1={x(t)}
                  x2={x(t)}
                  stroke="rgba(180,170,255,0.07)"
                  strokeWidth="1"
                />
              )
            )}

            {/* half-life markers */}
            {halfLifeMarks.map((m) => (
              <g key={m.n}>
                <line
                  x1={x(m.t)}
                  x2={x(m.t)}
                  y1={y(m.c)}
                  y2={H - PAD.bottom}
                  stroke={theme.status.info}
                  strokeWidth="1"
                  strokeDasharray="2 5"
                  opacity="0.55"
                />
                <circle cx={x(m.t)} cy={y(m.c)} r="3" fill={theme.status.info} />
                <text
                  x={x(m.t) + 5}
                  y={y(m.c) - 6}
                  fontSize="9"
                  fill={theme.status.info}
                  fontFamily="monospace"
                  opacity="0.85"
                >
                  {m.n}t½
                </text>
              </g>
            ))}

            {/* reference concentration line */}
            {params.reference > 0 && (
              <>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(params.reference)}
                  y2={y(params.reference)}
                  stroke={theme.status.warn}
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                  opacity="0.8"
                />
                <text
                  x={W - PAD.right}
                  y={y(params.reference) - 6}
                  textAnchor="end"
                  fontSize="9.5"
                  fill={theme.status.warn}
                  fontFamily="monospace"
                >
                  reference {params.reference} {model.units.concentration}
                </text>
              </>
            )}

            {/* the curve */}
            <path
              d={curvePath}
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 10px ${theme.accent}66)`,
                transition: "d 240ms ease-out",
              }}
            />

            {/* C0 marker */}
            <circle cx={x(0)} cy={y(derived.c0)} r="5.5" fill={theme.accent} />
            <text
              x={x(0) + 10}
              y={y(derived.c0) - 10}
              fontSize="10"
              fill={theme.accent}
              fontFamily="monospace"
            >
              C₀
            </text>

            {/* axes */}
            <text
              x={PAD.left - 8}
              y={PAD.top + 3}
              textAnchor="end"
              fontSize="9"
              fill={theme.panel.dim}
              fontFamily="monospace"
            >
              {yMax.toFixed(1)}
            </text>
            <text
              x={PAD.left - 8}
              y={H - PAD.bottom}
              textAnchor="end"
              fontSize="9"
              fill={theme.panel.dim}
              fontFamily="monospace"
            >
              0
            </text>
            <text
              x={PAD.left}
              y={H - 10}
              fontSize="9"
              fill={theme.panel.dim}
              fontFamily="monospace"
            >
              0
            </text>
            <text
              x={W - PAD.right}
              y={H - 10}
              textAnchor="end"
              fontSize="9"
              fill={theme.panel.dim}
              fontFamily="monospace"
            >
              {model.timeMax} {model.units.time}
            </text>
            <text
              x={PAD.left - 34}
              y={PAD.top + plotH / 2}
              fontSize="9.5"
              fill={theme.panel.muted}
              fontFamily="monospace"
              transform={`rotate(-90 ${PAD.left - 34} ${PAD.top + plotH / 2})`}
              textAnchor="middle"
            >
              Concentration
            </text>
          </svg>
        </div>

        {/* ---------- control panel ---------- */}
        <aside
          className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{
            background: theme.panel.background,
            borderColor: theme.panel.border,
            backdropFilter: "blur(16px)",
          }}
          aria-label="Parameters and guidance"
        >
          {/* NEXT ACTION */}
          <div
            className="rounded-2xl border p-3.5"
            style={{
              borderColor: nudge ? theme.status.bad : theme.accent,
              background: nudge ? `${theme.status.bad}14` : `${theme.accent}12`,
            }}
          >
            <span
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: nudge ? theme.status.bad : theme.accent }}
            >
              {nudge ? "Note" : "Next action"}
            </span>
            <p
              key={procedure.requiredAction}
              className={`mt-2 text-[15px] font-semibold leading-snug ${anim.riseIn}`}
              style={{ color: theme.panel.text }}
            >
              {nudge ?? procedure.requiredAction}
            </p>
            <p
              className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em]"
              style={{ color: theme.panel.dim }}
            >
              {procedure.stepTitle}
            </p>

            <p
              className="mt-2 flex items-center gap-1.5 text-[11px]"
              style={{ color: theme.panel.muted }}
            >
              <span aria-hidden="true" style={{ color: theme.accent }}>◎</span>
              In the panel: <span style={{ color: theme.panel.text }}>{targetLabel}</span>
            </p>

            {primaryInteraction && (
              <button
                type="button"
                onClick={() => onInteract(primaryInteraction)}
                className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]"
                style={{
                  background: theme.accent,
                  color: "#fff",
                  boxShadow: `0 10px 24px -12px ${theme.accent}`,
                }}
              >
                {primaryInteraction.label} →
              </button>
            )}

            {procedure.why && (
              <>
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  aria-expanded={showWhy}
                  className="mt-2.5 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
                  style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
                >
                  {showWhy ? "Hide why" : "Why?"}
                </button>
                {showWhy && (
                  <p
                    className="mt-2.5 border-t pt-2.5 text-[11.5px] leading-relaxed"
                    style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
                  >
                    {procedure.why}
                  </p>
                )}
              </>
            )}
          </div>

          {/* PARAMETERS */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Parameters
            </p>
            <div className="mt-3 space-y-3.5">
              {sliders.map((s) => {
                const isTarget = target === s.id;
                return (
                  <div
                    key={s.key}
                    className="rounded-xl px-2.5 py-2 transition-colors duration-500"
                    style={{
                      background: isTarget ? `${theme.accent}18` : "transparent",
                      border: `1px solid ${isTarget ? `${theme.accent}55` : "transparent"}`,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <label
                        htmlFor={s.key}
                        className="text-[11.5px] font-medium"
                        style={{ color: theme.panel.text }}
                      >
                        {s.range.label}
                        {isTarget && (
                          <span
                            className="ml-2 font-mono text-[8px] uppercase tracking-[0.14em]"
                            style={{ color: theme.accent }}
                          >
                            adjust this
                          </span>
                        )}
                      </label>
                      <span
                        className="font-mono text-[12.5px] tabular-nums"
                        style={{ color: isTarget ? theme.accent : theme.panel.text }}
                      >
                        {s.value}
                        <span
                          className="ml-1 text-[9px]"
                          style={{ color: theme.panel.dim }}
                        >
                          {s.range.unit}
                        </span>
                      </span>
                    </div>
                    <input
                      id={s.key}
                      type="range"
                      min={s.range.min}
                      max={s.range.max}
                      step={s.range.step}
                      value={s.value}
                      aria-valuetext={`${s.value} ${s.range.unit}`}
                      onChange={(e) => {
                        onInteract(
                          {
                            id: "pk-param",
                            type: "adjust",
                            targetId: s.id,
                            label: s.range.label,
                          },
                          Number(e.target.value)
                        );
                      }}
                      className="mt-2 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                      style={{
                        background: "rgba(180,170,255,0.16)",
                        accentColor: theme.accent,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <p
              className="mt-3 text-[10px] leading-snug"
              style={{ color: theme.panel.dim }}
            >
              Educational simulation ranges — not clinical values.
            </p>
          </div>

          {/* EQUATION */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Governing relations
            </p>
            <div
              className="mt-2 space-y-1.5 font-mono text-[11.5px] leading-relaxed"
              style={{ color: theme.panel.text }}
            >
              <p>C(t) = (Dose / V) · e^(−kt)</p>
              <p style={{ color: theme.panel.muted }}>k = CL / V</p>
              <p style={{ color: theme.panel.muted }}>t½ = 0.693 / k</p>
              <p style={{ color: theme.panel.muted }}>AUC = Dose / CL</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!canContinue) {
                nudgeBack("Finish the current step first.");
                return;
              }
              onContinue();
            }}
            aria-disabled={!canContinue}
            className="mt-auto w-full cursor-pointer rounded-2xl px-4 py-3 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]"
            style={{
              background: canContinue ? theme.accent : "transparent",
              color: canContinue ? "#fff" : theme.panel.dim,
              border: `1px solid ${canContinue ? theme.accent : theme.panel.border}`,
              boxShadow: canContinue ? `0 10px 26px -12px ${theme.accent}` : "none",
            }}
          >
            {canContinue ? "Continue →" : "Complete the step to continue"}
          </button>
        </aside>
      </div>

      {/* ================= PROCEDURE DRAWER ================= */}
      {showProcedure && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Full procedure"
        >
          <button
            type="button"
            aria-label="Close procedure"
            onClick={() => setShowProcedure(false)}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div
            className="scroll-thin relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border p-5"
            style={{ background: "#0B0E1E", borderColor: theme.panel.border }}
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: theme.accent }}
              >
                Procedure
              </h2>
              <button
                type="button"
                onClick={() => setShowProcedure(false)}
                className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
              >
                Close
              </button>
            </div>
            <ol className="mt-4">
              {experiment.steps.map((st) => {
                const complete = st.interactions.every((i) =>
                  state.completedActions.includes(i.id)
                );
                return (
                  <li
                    key={st.id}
                    className="border-b py-3 last:border-b-0"
                    style={{ borderColor: theme.panel.border }}
                  >
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: theme.panel.text }}
                    >
                      {st.title}
                    </p>
                    <p
                      className="mt-0.5 text-[11.5px] leading-relaxed"
                      style={{ color: theme.panel.muted }}
                    >
                      {st.instruction}
                    </p>
                    <p
                      className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em]"
                      style={{
                        color: complete ? theme.status.ok : theme.panel.dim,
                      }}
                    >
                      {complete ? "✓ Complete" : "Pending"}
                    </p>
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
