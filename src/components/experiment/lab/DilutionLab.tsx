import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BenchItem,
  DilutionModel,
  Experiment,
  Interaction,
} from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import type { ExperimentTheme } from "../../../engine/theme";
import { deriveProcedure } from "../../../engine/procedure";
import {
  DILUTION_KEYS,
  deriveDilution,
  dilutionStateFrom,
} from "../../../engine/dilution";
import { anim, useFitScale } from "./anim";
import { GlassObject, LabEnvironment } from "./LabScene";
import EvidencePanel from "../../evidence/EvidencePanel";
import { referencesForExperiment } from "../../../data/references";

type Props = {
  experiment: Experiment;
  model: DilutionModel;
  state: SimulationState;
  theme: ExperimentTheme;
  onInteract: (interaction: Interaction, value?: number) => void;
  onRestart: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export default function DilutionLab({
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
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [pouring, setPouring] = useState(false);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ref: fitRef, scale, portrait } = useFitScale(
    { width: 760, height: 700 },
    { width: 420, height: 760 },
    0.8,
    0.7
  );

  useEffect(
    () => () => {
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
      if (pourTimer.current) clearTimeout(pourTimer.current);
    },
    []
  );

  const procedure = useMemo(
    () => deriveProcedure(experiment, state),
    [experiment, state]
  );

  const dstate = useMemo(
    () => dilutionStateFrom(model, state.values, state.flags),
    [model, state.values, state.flags]
  );
  const derived = useMemo(
    () => deriveDilution(model, dstate),
    [model, dstate]
  );

  const items = useMemo(
    () => [...experiment.apparatus, ...experiment.materials],
    [experiment]
  );

  const primaryInteraction = procedure.allowedInteractions.find(
    (i) => !state.completedActions.includes(i.id)
  );
  const target = procedure.targetObjectId;
  const stepIndex = procedure.currentStepIndex;
  const totalSteps = experiment.steps.length;

  const aliquotValue =
    state.values[DILUTION_KEYS.transferred] ??
    3; /* C2V2/C1 = 0.1 × 100 / 1 = 10 mL */
  const aliquotInteraction = procedure.allowedInteractions.find(
    (i) => i.id === "dil-set-aliquot"
  );

  const actionFor = (item: BenchItem) =>
    item.id === target ? procedure.requiredAction : "Not needed for this step";

  const handleSelect = (item: BenchItem) => {
    const interaction = procedure.allowedInteractions.find(
      (i) => i.targetId === item.id && !state.completedActions.includes(i.id)
    );
    if (interaction) {
      setNudge(null);
      setWrongId(null);
      onInteract(interaction);
      return;
    }
    const targetName = items.find((i) => i.id === target)?.name ?? "the apparatus";
    setWrongId(item.id);
    setNudge(`Not needed for this step — this needs the ${targetName.toLowerCase()}.`);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => {
      setNudge(null);
      setWrongId(null);
    }, 3200);
  };

  const runPour = (fn: () => void) => {
    setPouring(true);
    fn();
    if (pourTimer.current) clearTimeout(pourTimer.current);
    pourTimer.current = setTimeout(() => setPouring(false), 900);
  };

  const targetName =
    items.find((i) => i.id === target)?.name ?? "the apparatus";

  /* Flask + pipette + stock, laid out along the bench. */
  const stock = items.find((i) => i.id === "app-stock");
  const pipette = items.find((i) => i.id === "app-pipette");
  const flask = items.find((i) => i.id === "app-flask");
  const solvent = items.find((i) => i.id === "app-solvent");

  const benchItems = [stock, pipette, flask, solvent].filter(
    (i): i is BenchItem => Boolean(i)
  );

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
            {experiment.domain} · C₁V₁ = C₂V₂
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
                        : "rgba(255,214,160,0.16)",
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
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <LabEnvironment
          theme={theme}
          className="relative min-h-[280px] overflow-hidden"
          label="Formulation bench with stock solution, pipette and volumetric flask"
        >
          <div ref={fitRef} className="absolute inset-0">
            <div
              className={
                portrait
                  ? "absolute inset-x-0 bottom-[8%] flex items-end justify-center gap-4 px-3"
                  : "absolute inset-x-0 bottom-[18%] flex items-end justify-center gap-10 px-[6%] lg:gap-16"
              }
            >
              {benchItems.map((item) => {
                const isTarget = item.id === target;
                const isWrong = wrongId === item.id;
                const done = procedure.completedActions.some((id) => {
                  for (const st of experiment.steps) {
                    const f = st.interactions.find((ii) => ii.id === id);
                    if (f) return f.targetId === item.id;
                  }
                  return false;
                });
                const fill =
                  item.id === "app-flask"
                    ? derived.flaskFillPercent
                    : item.id === "app-stock"
                      ? derived.stockRemainingPercent
                      : (state.fillLevels[item.id] ?? item.fill ?? 0);

                return (
                  <span
                    key={item.id}
                    className="group relative flex shrink-0 flex-col items-center"
                    style={{
                      width: Math.round(160 * scale),
                      height: Math.round(260 * scale),
                    }}
                  >
                    {isTarget && (
                      <span
                        aria-hidden="true"
                        className={`absolute -inset-4 rounded-[26px] ${anim.focusTarget} motion-reduce:animate-none`}
                        style={{
                          background: `radial-gradient(50% 50% at 50% 60%, ${theme.accentGlow}, transparent 72%)`,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      aria-label={`${item.name} — ${item.note}. ${actionFor(item)}`}
                      className={`absolute bottom-0 left-1/2 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        isWrong ? anim.shakeSoft : ""
                      } ${
                        isTarget
                          ? "brightness-125"
                          : "opacity-80 transition-[filter,opacity] duration-300 hover:opacity-100 hover:brightness-110"
                      } ${target && !isTarget ? "opacity-45 saturate-[0.6]" : ""}`}
                      style={{
                        width: 160,
                        height: 260,
                        transform: `translateX(-50%) scale(${scale})`,
                        transformOrigin: "bottom center",
                      }}
                    >
                      <GlassObject
                        shape={item.shape}
                        fill={fill}
                        colour={undefined}
                        theme={theme}
                      />
                    </button>

                    <span
                      className={`pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-center backdrop-blur-md transition-all duration-300 ${
                        isTarget ? `${anim.hintBob} opacity-100` : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                      }`}
                      style={{
                        background: theme.panel.background,
                        borderColor: theme.panel.border,
                      }}
                    >
                      <span
                        className="block text-[10.5px] font-medium"
                        style={{ color: theme.panel.text }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="mt-0.5 block text-[8.5px]"
                        style={{ color: theme.panel.muted }}
                      >
                        {isTarget ? procedure.requiredAction : item.note}
                      </span>
                    </span>

                    {done && !isTarget && (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 top-0 z-30 flex h-[17px] w-[17px] items-center justify-center rounded-full text-[8.5px] font-bold text-white"
                        style={{ background: theme.accent }}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* pouring indicator */}
            {pouring && (
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 backdrop-blur-md"
                style={{
                  background: theme.panel.background,
                  border: `1px solid ${theme.accent}`,
                }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: theme.accent }}
                >
                  Transferring…
                </span>
              </span>
            )}

            {/* the governing relation, always visible */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-1.5"
              aria-hidden="true"
            >
              <span
                className="rounded-full border px-3 py-1 font-mono text-[9.5px] tracking-[0.08em] backdrop-blur-md"
                style={{
                  background: theme.panel.background,
                  borderColor: theme.panel.border,
                  color: theme.panel.muted,
                }}
              >
                C₁V₁ = C₂V₂
                <span className="ml-2" style={{ color: theme.accent }}>
                  solute is conserved
                </span>
              </span>
            </div>
          </div>
        </LabEnvironment>

        {/* ---------- control panel ---------- */}
        <aside
          className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{
            background: theme.panel.background,
            borderColor: theme.panel.border,
            backdropFilter: "blur(16px)",
          }}
          aria-label="Target, calculations and guidance"
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
              On the bench:{" "}
              <span style={{ color: theme.panel.text }}>{targetName}</span>
            </p>

            {primaryInteraction && aliquotInteraction?.id !== primaryInteraction.id && (
              <button
                type="button"
                onClick={() => {
                  if (
                    primaryInteraction.id === "dil-transfer" ||
                    primaryInteraction.id === "dil-make-up"
                  ) {
                    runPour(() => onInteract(primaryInteraction));
                    return;
                  }
                  onInteract(primaryInteraction);
                }}
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

          {/* TARGET */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Target
            </p>
            <div className="mt-2.5 flex items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.14em]"
                  style={{ color: theme.panel.dim }}
                >
                  Concentration
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: theme.panel.text }}
                >
                  {dstate.targetConcentration.toFixed(2)}
                  <span
                    className="ml-1 text-[9px]"
                    style={{ color: theme.panel.dim }}
                  >
                    {model.targetConcentration.unit}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.14em]"
                  style={{ color: theme.panel.dim }}
                >
                  Final volume
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: theme.panel.text }}
                >
                  {dstate.targetVolume.toFixed(0)}
                  <span
                    className="ml-1 text-[9px]"
                    style={{ color: theme.panel.dim }}
                  >
                    {model.targetVolume.unit}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {[
                {
                  key: DILUTION_KEYS.targetConcentration,
                  range: model.targetConcentration,
                  value: dstate.targetConcentration,
                },
                {
                  key: DILUTION_KEYS.targetVolume,
                  range: model.targetVolume,
                  value: dstate.targetVolume,
                },
              ].map((s) => (
                <div key={s.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <label
                      htmlFor={s.key}
                      className="text-[11.5px]"
                      style={{ color: theme.panel.muted }}
                    >
                      {s.range.label}
                    </label>
                    <span
                      className="font-mono text-[11.5px] tabular-nums"
                      style={{ color: theme.panel.text }}
                    >
                      {s.value}
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
                      onInteract(
                        {
                          id: "dilution-param",
                          type: "adjust",
                          targetId: s.key,
                          label: s.range.label,
                        },
                        Number(e.target.value)
                      )
                    }
                    className="mt-1.5 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                    style={{
                      background: "rgba(255,214,160,0.16)",
                      accentColor: theme.accent,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ALIQUOT CALCULATION */}
          {aliquotInteraction && (
            <div
              className="rounded-2xl border p-3.5"
              style={{
                borderColor:
                  primaryInteraction?.id === "dil-set-aliquot"
                    ? theme.accent
                    : theme.panel.border,
                background:
                  primaryInteraction?.id === "dil-set-aliquot"
                    ? `${theme.accent}10`
                    : "transparent",
              }}
            >
              <p
                className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
                style={{ color: theme.panel.dim }}
              >
                Your aliquot
              </p>
              <p
                className="mt-1 font-mono text-[11px]"
                style={{ color: theme.panel.muted }}
              >
                V₁ = C₂V₂ ÷ C₁
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <label
                  htmlFor="aliquot"
                  className="text-[11.5px]"
                  style={{ color: theme.panel.text }}
                >
                  Stock to transfer
                </label>
                <span
                  className="font-mono text-[19px] font-semibold tabular-nums"
                  style={{ color: theme.accent }}
                >
                  {aliquotValue.toFixed(1)}
                  <span
                    className="ml-1 text-[9px]"
                    style={{ color: theme.panel.dim }}
                  >
                    mL
                  </span>
                </span>
              </div>
              <input
                id="aliquot"
                type="range"
                min={aliquotInteraction.range?.min ?? 1}
                max={aliquotInteraction.range?.max ?? 50}
                step={aliquotInteraction.range?.step ?? 0.5}
                value={aliquotValue}
                onChange={(e) =>
                  onInteract(aliquotInteraction, Number(e.target.value))
                }
                className="mt-1.5 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                style={{
                  background: "rgba(255,214,160,0.16)",
                  accentColor: theme.accent,
                }}
              />
            </div>
          )}

          {/* RESULT CHECK */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Achieved
            </p>
            {derived.achievedConcentration === null ? (
              <p
                className="mt-1.5 text-[11.5px] leading-snug"
                style={{ color: theme.panel.muted }}
              >
                Transfer the aliquot and make up to volume to see the
                concentration you produced.
              </p>
            ) : (
              <>
                <p
                  className="mt-1.5 font-mono text-[26px] font-semibold leading-none tabular-nums"
                  style={{
                    color: derived.isCorrect ? theme.status.ok : theme.status.bad,
                  }}
                >
                  {derived.achievedConcentration.toFixed(4)}
                  <span
                    className="ml-1 text-[10px]"
                    style={{ color: theme.panel.dim }}
                  >
                    {model.targetConcentration.unit}
                  </span>
                </p>
                <p
                  className="mt-1.5 text-[11.5px]"
                  style={{
                    color: derived.isCorrect ? theme.status.ok : theme.status.bad,
                  }}
                >
                  {derived.isCorrect
                    ? "✓ On target"
                    : `${(derived.deviationPercent ?? 0) > 0 ? "Too concentrated" : "Too dilute"} by ${Math.abs(
                        derived.deviationPercent ?? 0
                      ).toFixed(1)}%`}
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!canContinue) {
                setNudge("Finish the current step first.");
                if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
                nudgeTimer.current = setTimeout(() => setNudge(null), 2200);
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
            style={{ background: "#181109", borderColor: theme.panel.border }}
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
                      style={{ color: complete ? theme.status.ok : theme.panel.dim }}
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
