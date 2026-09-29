import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { Experiment, ExperimentStageId, Interaction } from "../../engine/types";
import { EXPERIMENT_STAGES } from "../../engine/types";
import {
  bindReset,
  createSimulationState,
  reachableStages,
  simulationReducer,
  type SimulationAction,
} from "../../engine/simulation";
import {
  evaluateAll,
  evaluateCalculation,
  type CalculationInput,
} from "../../engine/calculations";
import {
  deriveTitration,
  repeatTitrationActions,
  titrationActions,
} from "../../engine/titration";
import { themeFor } from "../../engine/theme";
import { pkActions, PK_KEYS } from "../../engine/pharmacokinetics";
import { dilutionActions } from "../../engine/dilution";
import { DR_KEYS, effect, occupancy } from "../../engine/pharmacology";
import {
  PKD_KEYS,
  PKD_TIME_MAX,
  derivePKDynamics as derivePKD,
} from "../../engine/pkDynamics";
import PKLab from "./lab/PKLab";
import DoseResponseLab from "../simulation/DoseResponseLab";
import PKDynamicsLab from "../simulation/PKDynamicsLab";
import ClinicalLab from "../simulation/ClinicalLab";
import ActivityRunner from "../clinical/ActivityRunner";
import { ACTIVITY_BY_EXPERIMENT_ID } from "../../data/clinicalActivities";
import DilutionLab from "./lab/DilutionLab";
import { LabCalculate, LabInterpret, LabObserve, LabResult } from "./lab/StagePanels";
import VivaEngine from "../viva/VivaEngine";
import { vivaBankFor } from "../../data/viva";
import { recordEvent, recordStage, recordViva } from "../../progress/store";
import EvidencePanel from "../evidence/EvidencePanel";
import { referencesForExperiment } from "../../data/references";
import type { MasteryStatus } from "../../engine/viva";
import StageIntroduction from "./StageIntroduction";
import StageBench from "./StageBench";
import {
  StageAssessment,
  StageCalculate,
  StageInterpret,
  StageObserve,
  StageResult,
} from "./StageSummary";
import TitrationLab from "./lab/TitrationLab";
import TitrationCalculate from "./titration/TitrationCalculate";
import {
  TitrationInterpret,
  TitrationObserve,
  TitrationResult,
} from "./titration/TitrationOutcome";

/* ------------------------------------------------------------- Feedback */

function FeedbackPill({
  message,
  kind,
  seq,
}: {
  message: string;
  kind: string;
  seq: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [seq]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6"
    >
      <p
        className={`flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-bone shadow-xl transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
            kind === "attention" ? "bg-clay text-ink" : "bg-ember text-white"
          }`}
        >
          {kind === "attention" ? "!" : "✓"}
        </span>
        {message}
      </p>
    </div>
  );
}

/** Visual feedback per interaction type — never the only channel. */
const FEEDBACK_BY_TYPE: Record<
  Interaction["type"],
  { kind: "success" | "info" | "attention"; message: string }
> = {
  select: { kind: "success", message: "Selected" },
  adjust: { kind: "success", message: "Parameter set" },
  add: { kind: "success", message: "Reagent added" },
  press: { kind: "info", message: "Pressed" },
  toggle: { kind: "info", message: "Toggled" },
  start: { kind: "success", message: "Action started" },
  stop: { kind: "info", message: "Stopped" },
};

/* ------------------------------------------------------------ Stage rail */

function StageRail({
  active,
  reached,
  onSelect,
}: {
  active: ExperimentStageId;
  reached: Set<ExperimentStageId>;
  onSelect: (id: ExperimentStageId) => void;
}) {
  const activeIndex = EXPERIMENT_STAGES.findIndex((s) => s.id === active);

  return (
    <div className="sticky top-[75px] z-40 border-y border-clay/70 bg-bone/85 backdrop-blur-xl">
      <div className="container">
        <ol
          className="-mx-1 flex gap-1 overflow-x-auto px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Experiment stages"
        >
          {EXPERIMENT_STAGES.map((stage, i) => {
            const isActive = stage.id === active;
            const isReached = reached.has(stage.id);
            const isPast = i < activeIndex;

            return (
              <li key={stage.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(stage.id)}
                  disabled={!isReached}
                  aria-current={isActive ? "step" : undefined}
                  className={`group flex cursor-pointer items-center gap-2.5 rounded-full px-3 py-2 transition-colors duration-300 disabled:cursor-not-allowed ${
                    isActive ? "bg-ink" : "hover:bg-white/70"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] transition-colors duration-300 ${
                      isActive
                        ? "bg-ember text-white"
                        : isPast
                          ? "bg-ember/25 text-ember-deep"
                          : isReached
                            ? "border border-clay bg-white text-smoke"
                            : "border border-clay/70 bg-transparent text-smoke/50"
                    }`}
                  >
                    {isPast ? "✓" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`whitespace-nowrap text-[12px] transition-colors duration-300 ${
                      isActive
                        ? "font-medium text-bone"
                        : isReached
                          ? "text-smoke group-hover:text-ink"
                          : "text-smoke/50"
                    }`}
                  >
                    <span className="hidden sm:inline">{stage.label}</span>
                    <span className="sm:hidden">{stage.short}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Shell */

export default function ExperimentShell({ experiment }: { experiment: Experiment }) {
  bindReset(experiment);

  const [state, dispatch] = useReducer(
    simulationReducer,
    experiment,
    createSimulationState
  );
  const [stage, setStage] = useState<ExperimentStageId>("introduction");

  /** Learner-entered calculation values, keyed by calculation input id. */
  const [calcValues, setCalcValues] = useState<Record<string, string>>({});

  /** Session-only viva result, shown on the summary stage. */
  const [vivaResult, setVivaResult] = useState<{
    mastery: string;
    accuracy: number;
  } | null>(null);

  const vivaBank = vivaBankFor(experiment.id);

  const titration =
    experiment.simulation.kind === "titration"
      ? experiment.simulation.model
      : null;
  const pk =
    experiment.simulation.kind === "pharmacokinetics"
      ? experiment.simulation.model
      : null;
  const dilution =
    experiment.simulation.kind === "dilution" ? experiment.simulation.model : null;
  const doseResponse = experiment.simulation.kind === "doseResponse";
  const pkDynamics = experiment.simulation.kind === "pkDynamics";
  const clinicalCase = experiment.simulation.kind === "clinicalCase";
  const clinicalActivity = experiment.simulation.kind === "clinicalActivity";
  const activityData = clinicalActivity
    ? ACTIVITY_BY_EXPERIMENT_ID[experiment.id]
    : null;
  const immersiveLab =
    titration || pk || dilution || doseResponse || pkDynamics || clinicalCase || clinicalActivity;

  const titrationView = useMemo(
    () => (titration ? deriveTitration(titration, state) : null),
    [titration, pk, dilution, state]
  );

  /** True while the learner is inside the laboratory itself. */
  const immersive =
    (stage === "prepare" || stage === "perform") && Boolean(immersiveLab);

  const reached = useMemo(
    () => reachableStages(state, experiment),
    [state, experiment]
  );

  /* Auto-advance within a phase once the current step is complete. */
  useEffect(() => {
    const current = experiment.steps.find(
      (s) => s.index === state.currentStepIndex
    );
    if (!current) return;
    const complete = current.interactions.every((i) =>
      state.completedActions.includes(i.id)
    );
    if (!complete) return;
    /* Only advance to a step in the same phase — crossing from Prepare into
       Perform stays a deliberate choice made in the stage rail. */
    const next = experiment.steps.find(
      (s) => s.index > state.currentStepIndex && s.phase === current.phase
    );
    if (next) dispatch({ type: "SET_STEP", index: next.index });
  }, [state.completedActions, state.currentStepIndex, experiment.steps]);

  const heroVisual = experiment.visuals.find((v) => v.role === "heroVisual");

  /** Evidence for this experiment, resolved from the reference registry. */
  const evidence = useMemo(
    () => referencesForExperiment(experiment.id),
    [experiment.id]
  );

  /** The laboratory is themed to its subject, not to the website. */
  const theme = useMemo(() => themeFor(experiment.themeId), [experiment.themeId]);

  /* Every stage reached becomes part of the student's learning record. */
  useEffect(() => {
    recordStage(experiment.id, stage);
    if (stage === "prepare" || stage === "perform") {
      recordEvent({
        type: "experimentStarted",
        experimentId: experiment.id,
        subjectId: experiment.subjectId,
        label: `Started ${experiment.title}`,
      });
    }
    if (stage === "result") {
      recordEvent({
        type: "experimentCompleted",
        experimentId: experiment.id,
        subjectId: experiment.subjectId,
        label: `Completed ${experiment.title}`,
      });
    }
  }, [stage, experiment.id, experiment.subjectId, experiment.title]);

  /** Full restart — simulation, apparatus, measurements, guidance, stage. */
  const restartExperiment = useCallback(() => {
    dispatch({ type: "RESET" });
    setCalcValues({});
    setVivaResult(null);
    setStage("introduction");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  /** Can the learner leave the bench for the next stage? */
  const canContinue = useMemo(() => {
    if (!immersiveLab) return false;
    const phase = stage === "prepare" ? "prepare" : "perform";
    const phaseSteps = experiment.steps.filter((st) => st.phase === phase);
    return (
      phaseSteps.length > 0 &&
      phaseSteps.every((st) =>
        st.interactions.every((i) => state.completedActions.includes(i.id))
      )
    );
  }, [stage, state.completedActions, experiment.steps, immersiveLab]);

  /**
   * Move on from the bench once a phase is finished, so the learner is never
   * left waiting on a step list that has nothing left to do.
   */
  useEffect(() => {
    if (!titration) return;
    if (stage !== "prepare" && stage !== "perform") return;

    const phase = stage === "prepare" ? "prepare" : "perform";
    const phaseSteps = experiment.steps.filter((s) => s.phase === phase);
    if (phaseSteps.length === 0) return;
    const finished = phaseSteps.every((s) =>
      s.interactions.every((i) => state.completedActions.includes(i.id))
    );
    if (!finished) return;

    const next = stage === "prepare" ? "perform" : "observe";
    const t = window.setTimeout(() => {
      /* Advance the step index too, so the view matches the new phase. */
      if (stage === "prepare") {
        const firstPerform = experiment.steps.find(
          (s) => s.phase === "perform"
        );
        if (firstPerform) dispatch({ type: "SET_STEP", index: firstPerform.index });
      }
      setStage(next);
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [stage, state.completedActions, experiment.steps, titration]);

  /* Titration result, computed from the learner's entered values. */
  /** Values for the generic result stage. */
  const labCalculated = useMemo(() => {
    if (!immersiveLab) return [];
    return experiment.calculations.map((def) => {
      const inputs: CalculationInput[] = def.inputs.map((input) => {
        const raw = calcValues[input.id];
        const parsed = raw !== undefined && raw !== "" ? Number(raw) : NaN;
        return {
          id: input.id,
          label: input.label,
          value: Number.isFinite(parsed) ? parsed : null,
          unit: input.unit,
          origin: input.fromObservationId ? ("simulation" as const) : ("manual" as const),
        };
      });
      const res = evaluateCalculation(def, inputs);
      return {
        label: def.output.label,
        value:
          res.computed && res.value !== null ? String(res.value) : "—",
      };
    });
  }, [immersiveLab, experiment.calculations, calcValues]);

  /** Dose–response parameters read out of simulation state. */
  function deriveDRParams(values: Record<string, number>) {
    const p = {
      concentration: Math.pow(10, values[DR_KEYS.concentration] ?? 0) || 1e-3,
      emax: values[DR_KEYS.emax] ?? 100,
      ec50: values[DR_KEYS.ec50] ?? 1,
      hill: values[DR_KEYS.hill] ?? 1,
      antagonist: values[DR_KEYS.antagonist] ?? 0,
      kb: 1,
    };
    return {
      ...p,
      response: effect(p),
      occ: occupancy(p),
    };
  }

  const titrationResult = useMemo(() => {
    if (!titration || experiment.calculations.length === 0) return null;
    const def = experiment.calculations[0];
    const inputs = def.inputs.map((input) => {
      const raw = calcValues[input.id];
      const parsed = raw !== undefined && raw !== "" ? Number(raw) : NaN;
      return {
        id: input.id,
        label: input.label,
        value: Number.isFinite(parsed) ? parsed : null,
        unit: input.unit,
        origin: input.fromObservationId ? ("simulation" as const) : ("manual" as const),
      };
    });
    return evaluateCalculation(def, inputs);
  }, [titration, experiment.calculations, calcValues]);

  /* One place defines what every interaction type does. */
  const runInteraction = useCallback(
    (interaction: Interaction, value?: number) => {
      /* A titration defers all chemistry to the pure titration model. */
      if (titration) {
        titrationActions(interaction, value, state, titration).forEach(dispatch);
        return;
      }

      /* Pharmacokinetics: sliders write parameters, buttons confirm readings. */
      if (pk) {
        if (interaction.id === "pk-param" && value !== undefined) {
          const keyMap: Record<string, string> = {
            "pk-dose": PK_KEYS.dose,
            "pk-volume": PK_KEYS.volume,
            "pk-clearance": PK_KEYS.clearance,
            "pk-reference": PK_KEYS.reference,
          };
          const key = keyMap[interaction.targetId];
          if (key) dispatch({ type: "SET_VALUE", key, value });
          return;
        }
        pkActions(interaction, value, state, pk).forEach(dispatch);
        return;
      }

      /* Dose–response: sliders write the model parameters. */
      if (doseResponse) {
        if (interaction.id === "dr-param" && value !== undefined) {
          dispatch({ type: "SET_VALUE", key: interaction.targetId, value });
          return;
        }
        const derived = deriveDRParams(state.values);
        const actions: SimulationAction[] = [];
        if (!state.completedActions.includes(interaction.id)) {
          actions.push({
            type: "COMPLETE_ACTION",
            interactionId: interaction.id,
            feedback: { kind: "success", message: "Recorded" },
          });
        }
        const record = (id: string, label: string, v: number, unit: string) =>
          actions.push({
            type: "RECORD_OBSERVATION",
            record: { id, label, value: v, unit, kind: "quantitative", origin: "simulation" },
          });
        switch (interaction.id) {
          case "dr-confirm-concentration":
            record("obs-dr-concentration", "Concentration (log)", state.values[DR_KEYS.concentration] ?? 0, "");
            record("obs-dr-occupancy", "Receptor occupancy", Number((derived.occ * 100).toFixed(1)), "%");
            break;
          case "dr-confirm-ec50":
            record("obs-dr-ec50", "EC50", derived.ec50, "units");
            break;
          case "dr-confirm-antagonist":
            record("obs-dr-antagonist", "Antagonist concentration", derived.antagonist, "units");
            break;
          case "dr-record-response":
            record("obs-dr-response", "Response", Number(derived.response.toFixed(1)), "%");
            break;
          default:
            break;
        }
        actions.forEach(dispatch);
        return;
      }

      /* PK dynamics: route, parameters and running the clock. */
      if (pkDynamics) {
        if (interaction.id === "pkd-param" && value !== undefined) {
          dispatch({ type: "SET_VALUE", key: interaction.targetId, value });
          return;
        }
        if (interaction.id === "pkd-route") {
          dispatch({ type: "SET_VALUE", key: "pkd-route", value: value ?? 1 });
          return;
        }
        const actions: SimulationAction[] = [];
        if (!state.completedActions.includes(interaction.id)) {
          actions.push({
            type: "COMPLETE_ACTION",
            interactionId: interaction.id,
            feedback: { kind: "success", message: "Recorded" },
          });
        }
        const record = (id: string, label: string, v: number | string, unit?: string) =>
          actions.push({
            type: "RECORD_OBSERVATION",
            record: { id, label, value: v, unit, kind: "quantitative", origin: "simulation" },
          });
        switch (interaction.id) {
          case "pkd-confirm-route":
            record("obs-pkd-route", "Route", (state.values["pkd-route"] ?? 1) === 0 ? "IV bolus" : "Oral");
            break;
          case "pkd-confirm-dose":
            record("obs-pkd-dose", "Dose", state.values[PKD_KEYS.dose] ?? 500, "mg");
            break;
          case "pkd-confirm-rates":
            record("obs-pkd-half-life", "Half-life", Number((0.693 / (state.values[PKD_KEYS.ke] ?? 0.15)).toFixed(1)), "h");
            break;
          case "pkd-run":
          case "pkd-record": {
            const p = {
              route: (state.values["pkd-route"] ?? 1) === 0 ? ("IV_BOLUS" as const) : ("ORAL" as const),
              dose: state.values[PKD_KEYS.dose] ?? 500,
              volume: state.values[PKD_KEYS.volume] ?? 25,
              ka: state.values[PKD_KEYS.ka] ?? 1,
              ke: state.values[PKD_KEYS.ke] ?? 0.15,
            };
            const derived = derivePKD(p, PKD_TIME_MAX);
            record("obs-pkd-cmax", "Cmax", Number(derived.cmax.toFixed(2)), "mg/L");
            record("obs-pkd-half-life", "Half-life", Number(derived.halfLife.toFixed(1)), "h");
            break;
          }
          default:
            break;
        }
        actions.forEach(dispatch);
        return;
      }

      /* Dilution: sliders set the target or the aliquot. */
      if (dilution) {
        if (interaction.id === "dilution-param" && value !== undefined) {
          dispatch({ type: "SET_VALUE", key: interaction.targetId, value });
          return;
        }
        dilutionActions(interaction, value, state, dilution).forEach(dispatch);
        return;
      }

      const alreadyDone = state.completedActions.includes(interaction.id);

      if (!alreadyDone) {
        dispatch({
          type: "COMPLETE_ACTION",
          interactionId: interaction.id,
          feedback: FEEDBACK_BY_TYPE[interaction.type],
        });
      }

      switch (interaction.type) {
        case "select":
          dispatch({ type: "SELECT_OBJECT", id: interaction.targetId });
          break;

        case "adjust": {
          const v = value ?? interaction.range?.initial ?? 0;
          dispatch({
            type: "SET_PARAMETER",
            interactionId: interaction.id,
            value: v,
          });
          dispatch({ type: "ADJUST_FILL", itemId: interaction.targetId, fill: v });
          dispatch({
            type: "RECORD_OBSERVATION",
            record: {
              id: "obs-level",
              label: "Delivery level",
              value: v,
              unit: "%",
              kind: "quantitative",
              origin: "simulation",
            },
          });
          break;
        }

        case "add": {
          /* Fill the first other vessel on the bench that already holds liquid. */
          const vessel = experiment.apparatus.find(
            (a) => a.id !== interaction.targetId && typeof a.fill === "number"
          );
          if (vessel) {
            const current = state.fillLevels[vessel.id] ?? vessel.fill ?? 0;
            dispatch({
              type: "ADJUST_FILL",
              itemId: vessel.id,
              fill: Math.min(100, current + 30),
            });
          }
          dispatch({ type: "SELECT_OBJECT", id: interaction.targetId });
          break;
        }

        case "start":
        case "toggle":
        case "press":
        case "stop": {
          dispatch({ type: "SELECT_OBJECT", id: interaction.targetId });
          dispatch({ type: "SET_RUNNING", running: true });
          window.setTimeout(() => {
            dispatch({ type: "SET_RUNNING", running: false });
            dispatch({
              type: "RECORD_OBSERVATION",
              record: {
                id: "obs-appearance",
                label: "Appearance",
                value: "Observed in simulation",
                kind: "qualitative",
                origin: "simulation",
              },
            });
          }, 1200);
          break;
        }
      }
    },
    [state.completedActions, state.fillLevels]
  );

  const handleSelectObject = useCallback(
    (itemId: string) => {
      dispatch({ type: "SELECT_OBJECT", id: itemId });

      /* Selecting a step's target on the bench completes that interaction. */
      const step = experiment.steps.find((s) => s.index === state.currentStepIndex);
      const match = step?.interactions.find(
        (i) => i.targetId === itemId && i.type === "select"
      );
      if (match && !state.completedActions.includes(match.id)) {
        dispatch({
          type: "COMPLETE_ACTION",
          interactionId: match.id,
          feedback: { kind: "success", message: "Selected" },
        });
      }
    },
    [experiment.steps, state.currentStepIndex, state.completedActions]
  );

  const calculationInputs: CalculationInput[] = useMemo(() => {
    const inputs: CalculationInput[] = [];
    for (const [interactionId, value] of Object.entries(state.parameterValues)) {
      const interaction = experiment.steps
        .flatMap((s) => s.interactions)
        .find((i) => i.id === interactionId);
      if (interaction?.range) {
        inputs.push({
          id: interactionId,
          label: interaction.label,
          value,
          unit: interaction.range.unit,
          origin: "simulation",
        });
      }
    }
    return inputs;
  }, [state.parameterValues, experiment.steps]);

  const calculationResults = useMemo(
    () => evaluateAll(experiment.calculations, calculationInputs),
    [experiment.calculations, calculationInputs]
  );

  const goStage = (id: ExperimentStageId) => {
    setStage(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      {/* Experiment header — hidden inside the laboratory */}
      {!immersive && (
      <header className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 70% 10%, rgba(242,106,33,0.06), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative pb-10 pt-12 lg:pt-16">
          <a
            href="#/lab"
            className="group inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke transition-colors duration-300 hover:text-ink"
          >
            <span
              className="transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            >
              ←
            </span>
            Virtual Lab
          </a>

          <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-ember-deep">
              {experiment.domain}
            </span>
            <span className="h-3 w-px bg-clay" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
              Year {String(experiment.yearNumber).padStart(2, "0")}
            </span>
          </p>

          <h1 className="mt-5 max-w-3xl text-[32px] font-semibold leading-[1.06] tracking-[-0.035em] text-ink [text-wrap:balance] sm:text-5xl">
            {experiment.title}
            <span className="text-ember">.</span>
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-ink px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute h-full w-full animate-pulse-soft rounded-full bg-ember" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-bone">
                {titration ? "Interactive experiment" : "Engine demonstration"}
              </span>
            </span>
            <span className="rounded-full border border-clay bg-white/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-smoke">
              {titration
                ? "Scientific procedure verification required"
                : "Not a scientific experiment"}
            </span>
            <EvidencePanel
              references={evidence}
              contextLabel={experiment.title}
              data-experiment-evidence
            />
            <button
              type="button"
              onClick={restartExperiment}
              data-restart-button
              className="cursor-pointer rounded-full border border-clay bg-white/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-smoke transition-colors duration-300 hover:border-ink/35 hover:text-ink"
            >
              ↻ Restart
            </button>
          </div>
        </div>
      </header>
      )}

      {/* The viva takes over the viewport, keeping the experiment's theme. */}
      {stage === "viva" && vivaBank ? (
        <VivaEngine
          experiment={experiment}
          bank={vivaBank}
          state={state}
          theme={theme}
          onExit={() => {
            setStage("result");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onReview={(concept) => {
            recordEvent({
              type: "conceptReviewed",
              experimentId: experiment.id,
              subjectId: experiment.subjectId,
              topicId: concept,
              label: `Reviewed ${concept}`,
            });
            setStage("introduction");
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          onComplete={(result) => {
            setVivaResult(result);
            recordViva({
              experimentId: experiment.id,
              mastery: result.mastery as MasteryStatus,
              accuracy: result.accuracy,
              correct: result.correct,
              total: result.total,
              concepts: result.concepts,
            });
          }}
        />
      ) : stage === "assessment" && vivaBank ? (
        /* Session summary — the mastery outcome of this viva attempt. */
        <div
          className="flex h-[calc(100dvh-76px)] min-h-[440px] w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
          style={{ background: theme.environment.background }}
        >
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.24em]"
            style={{ color: theme.panel.dim }}
          >
            Session summary
          </p>
          {vivaResult ? (
            <>
              <p
                className="mt-5 font-mono text-3xl font-semibold uppercase tracking-[0.05em] sm:text-4xl"
                style={{ color: theme.panel.text }}
              >
                {vivaResult.mastery}
              </p>
              <p
                className="mt-3 font-mono text-[12px] tabular-nums"
                style={{ color: theme.panel.muted }}
              >
                Viva accuracy {vivaResult.accuracy.toFixed(0)}%
              </p>
              <button
                type="button"
                onClick={() => setStage("viva")}
                className="mt-8 cursor-pointer rounded-full px-5 py-2.5 text-[12.5px] font-semibold"
                style={{ background: theme.accent, color: "#fff" }}
              >
                ↻ Take the viva again
              </button>
            </>
          ) : (
            <>
              <p
                className="mt-5 max-w-sm text-sm leading-relaxed"
                style={{ color: theme.panel.muted }}
              >
                Take the viva to see how your understanding of this experiment
                is developing.
              </p>
              <button
                type="button"
                onClick={() => setStage("viva")}
                className="mt-8 cursor-pointer rounded-full px-5 py-2.5 text-[12.5px] font-semibold"
                style={{ background: theme.accent, color: "#fff" }}
              >
                Start the viva →
              </button>
            </>
          )}
          <p
            className="mt-8 max-w-sm text-[10.5px] leading-relaxed"
            style={{ color: theme.panel.dim }}
          >
            Current session result only — nothing is saved.
          </p>
        </div>
      ) : null}

      {/* The laboratory takes over the whole viewport — no page chrome. */}
      {immersive && titration && titrationView ? (
        <TitrationLab
          experiment={experiment}
          model={titration}
          state={state}
          view={titrationView}
          theme={theme}
          onInteract={runInteraction}
          onRepeat={() => repeatTitrationActions().forEach(dispatch)}
          onRestart={restartExperiment}
          onContinue={() => {
            if (stage === "prepare") {
              const firstPerform = experiment.steps.find(
                (st) => st.phase === "perform"
              );
              if (firstPerform) {
                dispatch({ type: "SET_STEP", index: firstPerform.index });
              }
              setStage("perform");
            } else {
              setStage("observe");
            }
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          canContinue={canContinue}
        />
      ) : immersive && pk ? (
        <PKLab
          experiment={experiment}
          model={pk}
          state={state}
          theme={theme}
          onInteract={runInteraction}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("observe");
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          canContinue={canContinue}
        />
      ) : immersive && doseResponse ? (
        <DoseResponseLab
          experiment={experiment}
          state={state}
          theme={theme}
          onInteract={runInteraction}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("observe");
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          canContinue={canContinue}
        />
      ) : immersive && pkDynamics ? (
        <PKDynamicsLab
          experiment={experiment}
          state={state}
          theme={theme}
          onInteract={runInteraction}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("observe");
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          canContinue={canContinue}
        />
      ) : immersive && clinicalCase ? (
        <ClinicalLab
          experiment={experiment}
          theme={theme}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("result");
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          onComplete={() => undefined}
        />
      ) : immersive && clinicalActivity && activityData ? (
        <ActivityRunner
          key={experiment.id}
          experiment={experiment}
          activity={activityData}
          theme={theme}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("result");
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          onComplete={(concepts) => {
            const correct = Object.values(concepts).filter(Boolean).length;
            const total = Object.keys(concepts).length;
            recordViva({
              experimentId: experiment.id,
              mastery:
                total > 0 && correct === total
                  ? "MASTERED"
                  : correct > 0
                    ? "UNDERSTOOD"
                    : "NEEDS REVIEW",
              accuracy: total > 0 ? (correct / total) * 100 : 0,
              correct,
              total,
              concepts,
            });
            recordEvent({
              type:
                activityData.kind === "MEDICATION_REVIEW"
                  ? "medicationReviewCompleted"
                  : activityData.kind === "COUNSELLING"
                    ? "counsellingCompleted"
                    : "hospitalSimulationCompleted",
              experimentId: experiment.id,
              subjectId: experiment.subjectId,
              label: `Completed ${experiment.title}`,
            });
          }}
        />
      ) : immersive && dilution ? (
        <DilutionLab
          experiment={experiment}
          model={dilution}
          state={state}
          theme={theme}
          onInteract={runInteraction}
          onRestart={restartExperiment}
          onContinue={() => {
            setStage("observe");
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          canContinue={canContinue}
        />
      ) : (
        <>
      <StageRail active={stage} reached={reached} onSelect={goStage} />

      <div className="container py-12 lg:py-16">
        {stage === "introduction" && (
          <StageIntroduction
            experiment={experiment}
            heroSrc={heroVisual?.src}
            heroAlt={heroVisual?.alt ?? experiment.title}
            heroCaption={heroVisual?.caption}
            onBegin={() => {
              dispatch({ type: "SET_STEP", index: 0 });
              goStage("prepare");
            }}
          />
        )}

        {/* Non-titration experiments keep the generic framework bench. */}
        {stage === "prepare" &&
          !(titration && titrationView) && (
            <StageBench
              experiment={experiment}
              phase="prepare"
              currentStepIndex={state.currentStepIndex}
              selectedObjectId={state.selectedObjectId}
              completedActions={state.completedActions}
              parameterValues={state.parameterValues}
              fillLevels={state.fillLevels}
              running={state.running}
              onSelectObject={handleSelectObject}
              onInteract={runInteraction}
              onStepChange={(index) => dispatch({ type: "SET_STEP", index })}
            />
          )}

        {stage === "perform" &&
          !(titration && titrationView) && (
            <StageBench
              experiment={experiment}
              phase="perform"
              currentStepIndex={state.currentStepIndex}
              selectedObjectId={state.selectedObjectId}
              completedActions={state.completedActions}
              parameterValues={state.parameterValues}
              fillLevels={state.fillLevels}
              running={state.running}
              onSelectObject={handleSelectObject}
              onInteract={runInteraction}
              onStepChange={(index) => dispatch({ type: "SET_STEP", index })}
            />
          )}

        {stage === "observe" &&
          (titration && titrationView ? (
            <TitrationObserve state={state} view={titrationView} />
          ) : immersiveLab ? (
            <LabObserve state={state} theme={theme} />
          ) : (
            <StageObserve state={state} />
          ))}

        {stage === "calculate" &&
          (titration ? (
            <TitrationCalculate
              experiment={experiment}
              state={state}
              values={calcValues}
              onChange={(id, value) =>
                setCalcValues((prev) => ({ ...prev, [id]: value }))
              }
            />
          ) : (
            immersiveLab ? (
              <LabCalculate
                experiment={experiment}
                state={state}
                theme={theme}
                values={calcValues}
                onChange={(id, value) =>
                  setCalcValues((prev) => ({ ...prev, [id]: value }))
                }
              />
            ) : (
              <StageCalculate
                results={calculationResults}
                inputs={calculationInputs}
              />
            )
          ))}

        {stage === "interpret" &&
          (titration ? (
            <TitrationInterpret result={titrationResult} />
          ) : immersiveLab ? (
            <LabInterpret experiment={experiment} theme={theme} />
          ) : (
            <StageInterpret />
          ))}

        {stage === "result" &&
          (titration ? (
            <TitrationResult
              experiment={experiment}
              state={state}
              result={titrationResult}
              onStartViva={() => {
              setStage("viva");
              const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches;
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            }}
            />
          ) : immersiveLab ? (
            <LabResult
              experiment={experiment}
              state={state}
              theme={theme}
              calculated={labCalculated}
              onStartViva={() => {
              setStage("viva");
              const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches;
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            }}
            />
          ) : (
            <StageResult experiment={experiment} state={state} />
          ))}
        {stage === "assessment" && (
          <StageAssessment assessment={experiment.assessment} />
        )}
      </div>
      </>
      )}

      {state.feedback && (
        <FeedbackPill
          message={state.feedback.message}
          kind={state.feedback.kind}
          seq={state.feedback.seq}
        />
      )}
    </>
  );
}
