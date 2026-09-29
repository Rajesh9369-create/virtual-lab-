import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BenchItem,
  Experiment,
  Interaction,
  TitrationModel,
} from "../../../engine/types";
import type { SimulationState } from "../../../engine/simulation";
import type { TitrationView } from "../../../engine/titration";
import { TITRATION_KEYS } from "../../../engine/titration";
import type { ExperimentTheme } from "../../../engine/theme";
import { deriveProcedure } from "../../../engine/procedure";
import { anim, useFitScale } from "./anim";
import { LabEnvironment, SceneObject } from "./LabScene";
import TitrationAssembly, { ASSEMBLY_DESIGN } from "./TitrationAssembly";
import TitrationCurve from "./TitrationCurve";
import EvidencePanel from "../../evidence/EvidencePanel";
import { referencesForExperiment } from "../../../data/references";

type Props = {
  experiment: Experiment;
  model: TitrationModel;
  state: SimulationState;
  view: TitrationView;
  theme: ExperimentTheme;
  onInteract: (interaction: Interaction, value?: number) => void;
  onRepeat: () => void;
  onRestart: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

const BENCH_ORDER = ["app-pipette", "mat-base", "mat-acid", "mat-indicator"];
const MAX_VOLUME = 25;

export default function TitrationLab({
  experiment,
  model,
  state,
  view,
  theme,
  onInteract,
  onRepeat,
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
  const [flow, setFlow] = useState<"none" | "drops" | "stream">("none");

  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDelivered = useRef(0);

  const { ref: fitRef, scale, portrait } = useFitScale(
    { width: 900, height: 740 },
    ASSEMBLY_DESIGN,
    0.78,
    0.72
  );

  useEffect(
    () => () => {
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
      if (flowTimer.current) clearTimeout(flowTimer.current);
    },
    []
  );

  const procedure = useMemo(
    () => deriveProcedure(experiment, state),
    [experiment, state]
  );

  const delivered = state.values[TITRATION_KEYS.delivered] ?? 0;
  const buretteFilled = state.flags[TITRATION_KEYS.buretteFilled] ?? false;
  const aliquotAdded = state.flags[TITRATION_KEYS.aliquotAdded] ?? false;
  const indicatorAdded = state.flags[TITRATION_KEYS.indicatorAdded] ?? false;

  const items = useMemo(
    () => [...experiment.apparatus, ...experiment.materials],
    [experiment]
  );
  const benchItems = BENCH_ORDER.map((id) => items.find((i) => i.id === id))
    .filter((i): i is BenchItem => Boolean(i));

  const doneIds = procedure.completedActions
    .map((id) => {
      for (const s of experiment.steps) {
        const found = s.interactions.find((i) => i.id === id);
        if (found) return found.targetId;
      }
      return null;
    })
    .filter((x): x is string => Boolean(x));

  const target = procedure.targetObjectId;

  const indicateFlow = () => {
    const delta = Math.abs(delivered - prevDelivered.current);
    prevDelivered.current = delivered;
    setFlow(delta > 0.45 ? "stream" : "drops");
    if (flowTimer.current) clearTimeout(flowTimer.current);
    flowTimer.current = setTimeout(() => setFlow("none"), 900);
  };

  const actionFor = (item: BenchItem) =>
    item.id === target ? procedure.requiredAction : "Not needed for this step";

  const handleSelect = (item: BenchItem) => {
    const interaction = procedure.allowedInteractions.find(
      (i) => i.targetId === item.id && !state.completedActions.includes(i.id)
    );

    if (interaction) {
      setNudge(null);
      setWrongId(null);
      if (interaction.id === "tit-titrate" && interaction.range) {
        indicateFlow();
        onInteract(
          interaction,
          Math.min(interaction.range.max, delivered + model.dropVolume)
        );
        return;
      }
      onInteract(interaction);
      return;
    }

    const targetName = items.find((i) => i.id === target)?.name ?? "apparatus";
    setWrongId(item.id);
    setNudge(
      `Not needed for this step — this needs the ${targetName.toLowerCase()}.`
    );
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => {
      setNudge(null);
      setWrongId(null);
    }, 3200);
  };

  const titrateInteraction = procedure.allowedInteractions.find(
    (i) => i.id === "tit-titrate"
  );

  /* The one explicit control for the current step, so there is never any
     doubt about how to act. Clicking the apparatus still works too. */
  const primaryInteraction = procedure.allowedInteractions.find(
    (i) => !state.completedActions.includes(i.id)
  );
  const isRecordStep =
    primaryInteraction?.id === "tit-record-initial" ||
    primaryInteraction?.id === "tit-record-final";
  const recordValue = view.buretteReading.toFixed(2);
  const isTitrateStep = primaryInteraction?.id === "tit-titrate";
  const targetName =
    items.find((i) => i.id === target)?.name ?? "the apparatus";

  const stepIndex = procedure.currentStepIndex;
  const totalSteps = experiment.steps.length;

  /* What the chemistry is doing right now, in one clear sentence. */
  const chemistryNote = useMemo(() => {
    if (!aliquotAdded) return "Add the measured acid to the flask to begin.";
    if (!indicatorAdded) return "The indicator will signal the equivalence point.";
    if (delivered === 0) return "Acid is in excess — the solution is strongly acidic.";
    if (view.excess === "analyte")
      return `Acid still in excess — ${(
        (view.molesAnalyte - view.molesTitrant) * 1e3
      ).toFixed(3)} mmol unneutralised.`;
    if (view.excess === "none")
      return "Equivalence: moles of base delivered equal the moles of acid.";
    return `Base is now in excess — the solution has turned alkaline.`;
  }, [aliquotAdded, indicatorAdded, delivered, view]);

  const stageColour = view.atEndpoint
    ? theme.status.endpoint
    : view.phase === "overshot"
      ? theme.status.bad
      : view.excess === "analyte"
        ? theme.status.info
        : theme.panel.muted;

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
            {experiment.domain} · Strong acid / strong base
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
                        : "rgba(190,220,255,0.14)",
                }}
              />
            ))}
          </span>
          <button
            type="button"
            onClick={() => setShowProcedure(true)}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] transition-colors duration-300"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            Steps
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] transition-colors duration-300"
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
        {/* ---------- the laboratory ---------- */}
        <LabEnvironment
          theme={theme}
          className="relative min-h-[280px] overflow-hidden"
          label="Laboratory bench with the burette, stand, conical flask and reagents"
        >
          <div ref={fitRef} className="absolute inset-0">
            <TitrationAssembly
              theme={theme}
              model={model}
              view={view}
              scale={scale}
              buretteFilled={buretteFilled}
              flow={flow}
              targetId={target}
              items={items}
              onSelectObject={handleSelect}
              actionFor={actionFor}
            />

            {/* bench objects, receding when they are not the target */}
            <div
              className={
                portrait
                  ? "absolute inset-x-0 bottom-[2%] flex items-end justify-center gap-2 px-2"
                  : "absolute inset-x-0 bottom-[15%] flex items-end justify-end gap-4 px-[6%] sm:gap-6"
              }
            >
              {benchItems.map((item) => (
                <SceneObject
                  key={item.id}
                  item={item}
                  fill={state.fillLevels[item.id] ?? item.fill ?? 0}
                  theme={theme}
                  isTarget={item.id === target}
                  isDone={doneIds.includes(item.id)}
                  isWrong={wrongId === item.id}
                  onSelect={handleSelect}
                  action={actionFor(item)}
                  objectScale={Math.max(0.46, scale * (portrait ? 0.92 : 1))}
                />
              ))}
            </div>
          </div>

          {/* the chemical equation, always in view */}
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
              HCl + NaOH → NaCl + H₂O
              <span className="ml-2" style={{ color: theme.accent }}>
                1 : 1
              </span>
            </span>
          </div>
        </LabEnvironment>

        {/* ---------- live data panel ---------- */}
        <aside
          className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{
            background: theme.panel.background,
            borderColor: theme.panel.border,
            backdropFilter: "blur(16px)",
          }}
          aria-label="Live measurements and guidance"
        >
          {/* NEXT ACTION */}
          <div
            className="rounded-2xl border p-3.5"
            style={{
              borderColor: nudge ? theme.status.bad : theme.accent,
              background: nudge
                ? `${theme.status.bad}14`
                : `${theme.accent}12`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
                style={{ color: nudge ? theme.status.bad : theme.accent }}
              >
                {nudge ? "Not this one" : "Next action"}
              </span>
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span
                  className="absolute h-full w-full animate-pulse-soft rounded-full motion-reduce:animate-none"
                  style={{ background: nudge ? theme.status.bad : theme.accent }}
                />
                <span
                  className="relative h-1.5 w-1.5 rounded-full"
                  style={{ background: nudge ? theme.status.bad : theme.accent }}
                />
              </span>
            </div>
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
              {procedure.stepTotal > 1 &&
                ` · ${procedure.stepDone}/${procedure.stepTotal}`}
            </p>

            {/* where to act */}
            <p
              className="mt-2 flex items-center gap-1.5 text-[11px]"
              style={{ color: theme.panel.muted }}
            >
              <span aria-hidden="true" style={{ color: theme.accent }}>◎</span>
              On the bench: <span style={{ color: theme.panel.text }}>{targetName}</span>
            </p>

            {/* the explicit control for this step */}
            {primaryInteraction && !isTitrateStep && (
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
                {isRecordStep ? `Record ${recordValue} mL` : primaryInteraction.label} →
              </button>
            )}
            {primaryInteraction?.hint && !isTitrateStep && (
              <p
                className="mt-2 text-[10.5px] leading-snug"
                style={{ color: theme.panel.dim }}
              >
                {primaryInteraction.hint}
              </p>
            )}

            {isTitrateStep && (
              <p
                className="mt-3 rounded-xl px-3 py-2 text-[11px] leading-snug"
                style={{
                  background: `${theme.accent}14`,
                  color: theme.panel.muted,
                }}
              >
                Use the <span style={{ color: theme.accent }}>stopcock control</span> below
                to run the base into the flask.
              </p>
            )}

            {procedure.why && (
              <>
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  aria-expanded={showWhy}
                  className="mt-2.5 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: theme.panel.border,
                    color: theme.panel.muted,
                  }}
                >
                  {showWhy ? "Hide why" : "Why?"}
                </button>
                {showWhy && (
                  <p
                    className="mt-2.5 border-t pt-2.5 text-[11.5px] leading-relaxed"
                    style={{
                      borderColor: theme.panel.border,
                      color: theme.panel.muted,
                    }}
                  >
                    {procedure.why}
                  </p>
                )}
              </>
            )}
          </div>

          {/* READINGS DATA SHEET — where recorded values land */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <div className="flex items-baseline justify-between">
              <p
                className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
                style={{ color: theme.panel.dim }}
              >
                Readings
              </p>
              <p
                className="font-mono text-[8px] uppercase tracking-[0.14em]"
                style={{ color: theme.panel.dim }}
              >
                Data sheet
              </p>
            </div>

            <table className="mt-2.5 w-full border-collapse">
              <tbody>
                {[
                  {
                    label: "Acid aliquot",
                    id: "obs-aliquot",
                    unit: "mL",
                    step: "tit-aliquot",
                  },
                  {
                    label: "Initial reading",
                    id: "obs-initial-reading",
                    unit: "mL",
                    step: "tit-record-initial",
                  },
                  {
                    label: "Final reading",
                    id: "obs-final-reading",
                    unit: "mL",
                    step: "tit-record-final",
                  },
                  {
                    label: "Volume used",
                    id: "obs-volume-used",
                    unit: "mL",
                    step: "tit-record-final",
                  },
                ].map((row) => {
                  const record = state.observations.find((o) => o.id === row.id);
                  const filled = record && record.value !== null;
                  const active = primaryInteraction?.id === row.step;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: `1px solid ${theme.panel.border}`,
                        background: active ? `${theme.accent}10` : "transparent",
                      }}
                    >
                      <td
                        className="py-1.5 pr-2 text-[11.5px]"
                        style={{
                          color: active ? theme.accent : theme.panel.muted,
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        className="py-1.5 text-right font-mono text-[12.5px] tabular-nums"
                        style={{
                          color: filled
                            ? active
                              ? theme.accent
                              : theme.panel.text
                            : theme.panel.dim,
                        }}
                      >
                        {filled
                          ? Number(record.value).toFixed(2)
                          : active
                            ? "\u2014 record now"
                            : "\u2014"}
                        {filled && (
                          <span
                            className="ml-1 text-[9px]"
                            style={{ color: theme.panel.dim }}
                          >
                            {row.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p
              className="mt-2 text-[10.5px] leading-snug"
              style={{ color: theme.panel.muted }}
            >
              {isRecordStep
                ? `Read the burette at the meniscus, then record it here — the value is ${recordValue} mL.`
                : "Readings appear here as you take them at the bench."}
            </p>
          </div>

          {/* LIVE READINGS */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Live readings
            </p>

            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <div>
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.16em]"
                  style={{ color: theme.panel.dim }}
                >
                  Burette
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: theme.panel.text }}
                >
                  {view.buretteReading.toFixed(2)}
                  <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>
                    mL
                  </span>
                </p>
              </div>
              <div>
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.16em]"
                  style={{ color: theme.panel.dim }}
                >
                  Delivered
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: theme.accent }}
                >
                  {delivered.toFixed(2)}
                  <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>
                    mL
                  </span>
                </p>
              </div>
              <div>
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.16em]"
                  style={{ color: theme.panel.dim }}
                >
                  pH
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: stageColour }}
                >
                  {view.pH === null ? "—" : view.pH.toFixed(2)}
                </p>
              </div>
              <div>
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.16em]"
                  style={{ color: theme.panel.dim }}
                >
                  Equivalence
                </p>
                <p
                  className="font-mono text-[19px] font-semibold leading-none tabular-nums"
                  style={{ color: theme.status.ok }}
                >
                  {view.endpointVolume.toFixed(2)}
                  <span className="ml-1 text-[9px]" style={{ color: theme.panel.dim }}>
                    mL
                  </span>
                </p>
              </div>
            </div>

            {/* acid / base balance */}
            <div className="mt-3">
              <div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.14em]"
                   style={{ color: theme.panel.dim }}>
                <span>Acid</span>
                <span>Base</span>
              </div>
              <div
                className="mt-1 flex h-2 overflow-hidden rounded-full"
                style={{ background: "rgba(190,220,255,0.10)" }}
              >
                <span
                  className="transition-[width] duration-500"
                  style={{
                    width: `${
                      view.molesAnalyte > 0
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              ((view.molesAnalyte - view.molesTitrant) /
                                view.molesAnalyte) *
                                100
                            )
                          )
                        : 100
                    }%`,
                    background: theme.status.info,
                  }}
                />
                <span
                  className="flex-1 transition-[width] duration-500"
                  style={{
                    background:
                      view.excess === "titrant" ? theme.status.bad : theme.status.ok,
                  }}
                />
              </div>
              <p
                className="mt-1.5 text-[10.5px] leading-snug"
                style={{ color: theme.panel.muted }}
              >
                {chemistryNote}
              </p>
            </div>
          </div>

          {/* TITRATION CURVE */}
          <div
            className="rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <div className="flex items-baseline justify-between">
              <p
                className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
                style={{ color: theme.panel.dim }}
              >
                Titration curve
              </p>
              <p
                className="font-mono text-[8.5px] tabular-nums"
                style={{ color: stageColour }}
              >
                {view.pH === null ? "—" : `pH ${view.pH.toFixed(2)}`}
              </p>
            </div>
            <div className="mt-1.5">
              <TitrationCurve
                theme={theme}
                model={model}
                view={view}
                maxVolume={MAX_VOLUME}
              />
            </div>
            <p
              className="mt-1.5 text-[10.5px] leading-snug"
              style={{ color: theme.panel.muted }}
            >
              pH stays low, then jumps sharply through 7 at the equivalence
              point — that jump is what the indicator catches.
            </p>
          </div>

          {/* FLOW CONTROL */}
          {titrateInteraction?.range && (
            <div
              className="rounded-2xl border p-3.5"
              style={{ borderColor: theme.accent, background: `${theme.accent}10` }}
            >
              <p
                className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
                style={{ color: theme.accent }}
              >
                Stopcock
              </p>
              <input
                id="stopcock"
                type="range"
                min={titrateInteraction.range.min}
                max={titrateInteraction.range.max}
                step={titrateInteraction.range.step}
                value={delivered}
                aria-valuetext={`${delivered.toFixed(2)} millilitres delivered`}
                onChange={(e) => {
                  indicateFlow();
                  onInteract(titrateInteraction, Number(e.target.value));
                }}
                onPointerDown={indicateFlow}
                className="mt-2.5 h-6 w-full cursor-pointer appearance-none rounded-full sm:h-2"
                style={{
                  background: "rgba(190,220,255,0.14)",
                  accentColor: theme.accent,
                }}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className="font-mono text-[11px] tabular-nums"
                  style={{ color: theme.panel.text }}
                >
                  {delivered.toFixed(2)} mL
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      indicateFlow();
                      onInteract(
                        titrateInteraction,
                        Math.min(
                          titrateInteraction.range?.max ?? MAX_VOLUME,
                          delivered + model.dropVolume
                        )
                      );
                    }}
                    className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                    style={{
                      borderColor: theme.panel.border,
                      color: theme.panel.text,
                    }}
                  >
                    + 1 drop
                  </button>
                  <button
                    type="button"
                    onClick={onRepeat}
                    aria-label="Repeat the titration"
                    className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px]"
                    style={{
                      borderColor: theme.panel.border,
                      color: theme.panel.muted,
                    }}
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTINUE */}
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
            style={{ background: "#0A1018", borderColor: theme.panel.border }}
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
                style={{
                  borderColor: theme.panel.border,
                  color: theme.panel.muted,
                }}
              >
                Close
              </button>
            </div>

            <ol className="mt-4">
              {experiment.steps.map((s) => {
                const complete = s.interactions.every((i) =>
                  state.completedActions.includes(i.id)
                );
                const isCurrent = s.index === stepIndex;
                return (
                  <li
                    key={s.id}
                    className="flex gap-3 border-b py-3 last:border-b-0"
                    style={{ borderColor: theme.panel.border }}
                  >
                    <span
                      className="mt-[3px] font-mono text-[9.5px] tabular-nums"
                      style={{
                        color: complete
                          ? theme.status.ok
                          : isCurrent
                            ? theme.panel.text
                            : theme.panel.dim,
                      }}
                    >
                      {String(s.index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: theme.panel.text }}
                      >
                        {s.title}
                      </p>
                      <p
                        className="mt-0.5 text-[11.5px] leading-relaxed"
                        style={{ color: theme.panel.muted }}
                      >
                        {s.instruction}
                      </p>
                      <p
                        className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em]"
                        style={{
                          color: complete
                            ? theme.status.ok
                            : isCurrent
                              ? theme.accent
                              : theme.panel.dim,
                        }}
                      >
                        {complete
                          ? "✓ Complete"
                          : isCurrent
                            ? "In progress"
                            : "Pending"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p
              className="mt-4 text-[10.5px] leading-relaxed"
              style={{ color: theme.panel.dim }}
            >
              Educational simulation parameters — scientific procedure
              verification required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
