import { useMemo } from "react";
import type {
  Experiment,
  PharmacokineticModel,
  TitrationModel,
} from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import type { SimulationState } from "../../engine/simulation";
import { deriveTitration } from "../../engine/titration";
import { derivePK, pkParamsFrom } from "../../engine/pharmacokinetics";
import { GlassObject, LabEnvironment } from "../experiment/lab/LabScene";
import TitrationAssembly from "../experiment/lab/TitrationAssembly";
import { anim, useFitScale } from "../experiment/lab/anim";

type SceneProps = {
  experiment: Experiment;
  theme: ExperimentTheme;
  /** Simulation state, so the scene matches what the student actually did. */
  state: SimulationState;
  /** Per-object reveal colours, applied after an answer. */
  highlights: Record<string, string>;
  /** Called when the learner clicks an object to identify it. */
  onIdentify: (objectId: string) => void;
  /** Visual state the question depends on, if any. */
  sceneState?: "endpoint" | "overshot" | "start";
};

/** mL of titrant that reaches equivalence for the model's parameters. */
function view_endpointVolume(model: TitrationModel): number {
  const molesAnalyte =
    (model.aliquotVolume * model.analyte.concentration) / 1000;
  return model.titrant.concentration > 0
    ? (molesAnalyte * 1000) / model.titrant.concentration
    : 0;
}

/** The bench objects for non-titration apparatus questions. */
function BenchObjects({
  experiment,
  theme,
  highlights,
  onIdentify,
  scale,
}: {
  experiment: Experiment;
  theme: ExperimentTheme;
  highlights: Record<string, string>;
  onIdentify: (objectId: string) => void;
  scale: number;
}) {
  const items = useMemo(
    () => [...experiment.apparatus, ...experiment.materials],
    [experiment]
  );

  return (
    <div className="absolute inset-x-0 bottom-[16%] flex items-end justify-center gap-6 px-[6%] sm:gap-10">
      {items.map((item) => {
        const colour = highlights[item.id];
        return (
          <span
            key={item.id}
            className="group relative flex shrink-0 flex-col items-center"
            style={{ width: Math.round(150 * scale), height: Math.round(230 * scale) }}
          >
            {colour && (
              <span
                aria-hidden="true"
                className={`absolute -inset-4 rounded-[26px] ${anim.focusTarget} motion-reduce:animate-none`}
                style={{
                  background: `radial-gradient(50% 50% at 50% 60%, ${colour}, transparent 72%)`,
                }}
              />
            )}
            <button
              type="button"
              onClick={() => onIdentify(item.id)}
              aria-label={`Identify the ${item.name}`}
              className={`absolute bottom-0 left-1/2 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                colour ? "brightness-125" : "hover:brightness-110"
              }`}
              style={{
                width: 150,
                height: 230,
                transform: `translateX(-50%) scale(${scale})`,
                transformOrigin: "bottom center",
              }}
            >
              <GlassObject
                shape={item.shape}
                fill={item.fill ?? 40}
                theme={theme}
              />
            </button>
            <span
              className="pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 backdrop-blur-md"
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
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** A static pharmacokinetic curve, for viva questions about the model. */
function PKCurve({
  theme,
  model,
}: {
  theme: ExperimentTheme;
  model: PharmacokineticModel;
}) {
  const params = useMemo(
    () => pkParamsFrom(model, {}),
    [model]
  );
  const derived = useMemo(() => derivePK(model, params), [model, params]);

  const W = 640;
  const H = 380;
  const PAD = { top: 24, right: 20, bottom: 32, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const yMax = Math.max(derived.cMax * 1.15, params.reference * 1.4, 1);
  const x = (t: number) => PAD.left + (t / model.timeMax) * plotW;
  const y = (c: number) => PAD.top + (1 - c / yMax) * plotH;

  const path = derived.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.c).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 h-full w-full p-6 pt-24"
      role="img"
      aria-label="Concentration against time for the one-compartment model"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + f * plotH}
          y2={PAD.top + f * plotH}
          stroke="rgba(180,170,255,0.10)"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => (model.timeMax * i) / 6).map((t) => (
        <line
          key={t}
          y1={PAD.top}
          y2={H - PAD.bottom}
          x1={x(t)}
          x2={x(t)}
          stroke="rgba(180,170,255,0.07)"
        />
      ))}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={y(params.reference)}
        y2={y(params.reference)}
        stroke={theme.status.warn}
        strokeDasharray="6 5"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d={path}
        fill="none"
        stroke={theme.accent}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 12px ${theme.accent}66)` }}
      />
      <circle cx={x(0)} cy={y(derived.c0)} r="5.5" fill={theme.accent} />
      <text
        x={x(0) + 10}
        y={y(derived.c0) - 10}
        fontSize="11"
        fill={theme.accent}
        fontFamily="monospace"
      >
        C₀
      </text>
      <text
        x={W - PAD.right}
        y={H - 10}
        textAnchor="end"
        fontSize="10"
        fill={theme.panel.dim}
        fontFamily="monospace"
      >
        {model.timeMax} {model.units.time}
      </text>
      <text
        x={PAD.left - 8}
        y={PAD.top + 3}
        textAnchor="end"
        fontSize="10"
        fill={theme.panel.dim}
        fontFamily="monospace"
      >
        {yMax.toFixed(1)}
      </text>
    </svg>
  );
}

/**
 * The experiment's own laboratory, reused as the viva visual. Objects stay
 * clickable so identification questions can be answered by pointing at them.
 */
export default function VivaScene({
  experiment,
  theme,
  state,
  highlights,
  onIdentify,
  sceneState,
}: SceneProps) {
  const { ref, scale } = useFitScale(
    { width: 900, height: 700 },
    { width: 440, height: 700 },
    0.8,
    0.7
  );

  const kind = experiment.simulation.kind;

  return (
    <LabEnvironment
      theme={theme}
      className="relative min-h-[280px] overflow-hidden"
      label="The laboratory you just worked in"
    >
      <div ref={ref} className="absolute inset-0">
        {kind === "titration" ? (
          (() => {
            const model = experiment.simulation.model as TitrationModel;
            /* Show the state the question is asking about, not whatever the
               learner happened to finish on. */
            const probe =
              sceneState && sceneState !== "start"
                ? {
                    ...state,
                    values: {
                      ...state.values,
                      delivered:
                        sceneState === "overshot"
                          ? view_endpointVolume(model) * 1.2
                          : view_endpointVolume(model),
                    },
                    flags: {
                      ...state.flags,
                      "titration-aliquot-added": true,
                      "titration-indicator-added": true,
                    },
                  }
                : state;
            const view = deriveTitration(model, probe);
            const items = [...experiment.apparatus, ...experiment.materials];
            return (
              <>
                <TitrationAssembly
                  theme={theme}
                  model={model}
                  view={view}
                  scale={scale}
                  buretteFilled={true}
                  flow="none"
                  targetId={null}
                  items={items}
                  highlights={highlights}
                  onSelectObject={(item) => onIdentify(item.id)}
                  actionFor={() => "Click to identify"}
                />
              </>
            );
          })()
        ) : kind === "pharmacokinetics" ? (
          <PKCurve
            theme={theme}
            model={experiment.simulation.model as PharmacokineticModel}
          />
        ) : (
          <BenchObjects
            experiment={experiment}
            theme={theme}
            highlights={highlights}
            onIdentify={onIdentify}
            scale={Math.max(0.45, scale)}
          />
        )}
      </div>
    </LabEnvironment>
  );
}
