import type { BenchItem, TitrationModel } from "../../../engine/types";
import type { ExperimentTheme } from "../../../engine/theme";
import type { TitrationView } from "../../../engine/titration";
import { PHASE_LABEL } from "../../../engine/titration";
import { GlassObject } from "./LabScene";
import { anim } from "./anim";

/** Design canvas for the assembled apparatus. */
export const ASSEMBLY_DESIGN = { width: 470, height: 740 };

type Props = {
  theme: ExperimentTheme;
  model: TitrationModel;
  view: TitrationView;
  scale: number;
  buretteFilled: boolean;
  flow: "none" | "drops" | "stream";
  targetId: string | null;
  items: BenchItem[];
  onSelectObject: (item: BenchItem) => void;
  actionFor: (item: BenchItem) => string;
  /** Extra per-object highlight colours — used by the viva to reveal answers. */
  highlights?: Record<string, string>;
};

/** Keeps a readout's text readable inside the scaled canvas. */
function CounterScale({
  scale,
  origin = "left center",
  children,
}: {
  scale: number;
  origin?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        transform: `scale(${1 / Math.max(0.26, scale)})`,
        transformOrigin: origin,
        display: "block",
      }}
    >
      {children}
    </span>
  );
}

export default function TitrationAssembly({
  theme,
  model,
  view,
  scale,
  buretteFilled,
  flow,
  targetId,
  items,
  onSelectObject,
  actionFor,
  highlights,
}: Props) {
  const t = theme;
  const burette = items.find((i) => i.id === "app-burette");
  const flask = items.find((i) => i.id === "app-flask");
  const stand = items.find((i) => i.id === "app-stand");

  const buretteFill = buretteFilled
    ? Math.max(0, (view.buretteRemaining / model.buretteCapacity) * 100)
    : 0;
  const flaskFill =
    view.flaskVolume > 0 ? Math.min(76, 14 + view.flaskVolume * 1.7) : 0;

  const recede = (id: string) =>
    targetId && targetId !== id ? "opacity-40 saturate-[0.55]" : "";

  const glow = (id: string) => highlights?.[id];

  const focus = (colour?: string) => (
    <span
      aria-hidden="true"
      className={`absolute -inset-5 rounded-[30px] ${anim.focusTarget} motion-reduce:animate-none`}
      style={{
        background: `radial-gradient(50% 50% at 50% 55%, ${
          colour ?? t.accentGlow
        }, transparent 72%)`,
      }}
    />
  );

  const phaseColour =
    view.phase === "endpoint"
      ? t.status.endpoint
      : view.phase === "overshot"
        ? t.status.bad
        : view.phase === "slight-excess"
          ? t.status.warn
          : t.panel.muted;

  return (
    <div
      className="pointer-events-none absolute bottom-[20%] left-1/2"
      style={{
        width: ASSEMBLY_DESIGN.width,
        height: ASSEMBLY_DESIGN.height,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "bottom center",
      }}
    >
      {/* ---------------- stand ---------------- */}
      {stand && (
        <button
          type="button"
          onClick={() => onSelectObject(stand)}
          aria-label={`Burette stand — holds the burette vertical. ${actionFor(stand)}`}
          className={`pointer-events-auto absolute bottom-0 left-1/2 h-[600px] w-[300px] -translate-x-1/2 cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 transition-[filter,opacity] duration-500 ${
            targetId === stand.id
              ? "brightness-125"
              : "hover:brightness-110 opacity-90"
          } ${recede(stand.id)}`}
          style={anim.objectLift(300)}
        >
          {(targetId === stand.id || glow(stand.id)) &&
            focus(glow(stand.id))}
          <span
            aria-hidden="true"
            className="absolute bottom-[10px] left-1/2 h-[16px] w-[290px] -translate-x-1/2 rounded-[4px]"
            style={{
              background: "linear-gradient(180deg,#8B9AA6,#2C343C)",
              boxShadow: "0 12px 26px rgba(0,0,0,0.6)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-[24px] left-1/2 top-[60px] w-[9px] -translate-x-[102px] rounded-full"
            style={{ background: t.apparatus.metal }}
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[66px] h-[32px] w-[30px] -translate-x-[96px] rounded-[7px]"
            style={{
              background: "linear-gradient(180deg,#98A7B2,#465059)",
              boxShadow: "0 5px 11px rgba(0,0,0,0.5)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[80px] h-[10px] w-[52px] -translate-x-[80px] rounded-[4px]"
            style={{ background: "linear-gradient(180deg,#98A7B2,#465059)" }}
          />
        </button>
      )}

      {/* ---------------- burette ---------------- */}
      {burette && (
        <button
          type="button"
          onClick={() => onSelectObject(burette)}
          aria-label={`Burette — graduated glass column that delivers the titrant. ${actionFor(
            burette
          )}`}
          className={`pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 cursor-pointer rounded-xl p-1 focus:outline-none focus-visible:ring-2 transition-[filter,opacity,transform] duration-500 ${
            targetId === burette.id
              ? "scale-[1.03] brightness-125"
              : "hover:scale-[1.01] hover:brightness-110 opacity-90"
          } ${recede(burette.id)}`}
          style={anim.objectLift(300)}
        >
          {(targetId === burette.id || glow(burette.id)) &&
            focus(glow(burette.id))}
          <GlassObject shape="burette" fill={buretteFill} theme={t} />
        </button>
      )}

      {/* ---------------- stopcock + tip ---------------- */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 378 }}
        aria-hidden="true"
      >
        <span
          className="relative block h-[22px] w-[36px] rounded-[5px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.48), rgba(255,255,255,0.14))",
            boxShadow: "inset 0 0 0 1px rgba(220,238,255,0.4)",
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 h-[11px] w-[48px] rounded-[5px]"
            style={{
              ...anim.objectRotate(flow === "none" ? -58 : 0, 540),
              background: "linear-gradient(180deg,#F58B4D,#C94B12)",
              boxShadow: "0 4px 11px rgba(0,0,0,0.6)",
              translate: "-50% -50%",
            }}
          />
        </span>
        <span
          className="mx-auto block h-[34px] w-[13px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.52) 45%, rgba(255,255,255,0.16))",
            clipPath: "polygon(15% 0, 85% 0, 66% 100%, 34% 100%)",
          }}
        />
      </div>

      {/* ---------------- liquid delivery ---------------- */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 432, height: 78 }}
        aria-hidden="true"
      >
        {flow === "drops" &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              className={`absolute left-1/2 top-0 h-[12px] w-[9px] -translate-x-1/2 rounded-[50%] ${anim.dropFlow} motion-reduce:animate-none`}
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF, #C4DCE2)",
                animationDelay: `${i * 0.24}s`,
                ["--drop-dist" as string]: "72px",
              }}
            />
          ))}
        {flow === "stream" && (
          <span
            className={`absolute left-1/2 top-0 h-[76px] w-[6px] -translate-x-1/2 origin-top rounded-full ${anim.stream} motion-reduce:animate-none`}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(196,220,226,0.55))",
              boxShadow: "0 0 8px rgba(210,235,255,0.5)",
            }}
          />
        )}
      </div>

      {/* ---------------- flask ---------------- */}
      {flask && (
        <button
          type="button"
          onClick={() => onSelectObject(flask)}
          aria-label={`Conical flask — the titration vessel. ${actionFor(flask)}`}
          className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 cursor-pointer rounded-xl p-1 focus:outline-none focus-visible:ring-2 transition-[filter,opacity,transform] duration-500 ${
            targetId === flask.id
              ? "scale-[1.03] brightness-125"
              : "hover:scale-[1.01] hover:brightness-110 opacity-90"
          } ${recede(flask.id)}`}
          style={{ ...anim.objectLift(300), top: 496 }}
        >
          {(targetId === flask.id || glow(flask.id)) &&
            focus(glow(flask.id))}
          <GlassObject
            shape="flask"
            fill={flaskFill}
            colour={view.phase === "empty" ? undefined : view.colour}
            theme={t}
          />
          {(view.phase === "endpoint" || view.phase === "slight-excess") && (
            <span
              aria-hidden="true"
              className="absolute -inset-8 rounded-full"
              style={{
                ...anim.colourShift(900),
                boxShadow: `0 0 58px 14px ${t.status.endpoint}33`,
              }}
            />
          )}
        </button>
      )}

      {/* ---------------- magnified burette reading ---------------- */}
      <span className="absolute top-[104px] left-[calc(50%+108px)]">
        <CounterScale scale={scale}>
          <div
            className="rounded-2xl border px-3.5 py-2.5 backdrop-blur-md"
            style={{
              background: t.panel.background,
              borderColor: t.panel.border,
              boxShadow: t.panel.shadow,
            }}
          >
            <p
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{ color: t.panel.dim }}
            >
              Burette
            </p>
            <p
              className="mt-0.5 font-mono text-[26px] font-semibold leading-none tabular-nums"
              style={{ color: t.panel.text }}
            >
              {view.buretteReading.toFixed(2)}
              <span className="ml-1 text-[11px]" style={{ color: t.panel.dim }}>
                mL
              </span>
            </p>
            {/* mini scale showing the meniscus position */}
            <span className="relative mt-2 block h-[6px] w-[104px] overflow-hidden rounded-full"
                  style={{ background: "rgba(190,220,255,0.12)" }}>
              <span
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, (view.delivered / 25) * 100)}%`,
                  background: t.accent,
                }}
              />
            </span>
            <p
              className="mt-1.5 font-mono text-[9px] tabular-nums"
              style={{ color: t.panel.muted }}
            >
              delivered {view.delivered.toFixed(2)} mL
            </p>
          </div>
        </CounterScale>
      </span>

      {/* ---------------- flask state ---------------- */}
      <span className="absolute top-[566px] left-[calc(50%-330px)]">
        <CounterScale scale={scale} origin="right center">
          <div
            className="rounded-2xl border px-3.5 py-2.5 text-right backdrop-blur-md"
            style={{
              background: t.panel.background,
              borderColor: t.panel.border,
              boxShadow: t.panel.shadow,
            }}
          >
            <p
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{ color: t.panel.dim }}
            >
              Flask
            </p>
            <p
              className="mt-0.5 text-[13px] font-semibold leading-none"
              style={{ color: phaseColour }}
            >
              {PHASE_LABEL[view.phase]}
            </p>
            <p
              className="mt-1.5 font-mono text-[9px] tabular-nums"
              style={{ color: t.panel.muted }}
            >
              {view.flaskVolume > 0
                ? `${view.flaskVolume.toFixed(2)} mL`
                : "empty"}
            </p>
            <span
              className="mt-2 block h-4 w-full rounded"
              style={{
                background: view.phase === "empty" ? "rgba(190,220,255,0.1)" : view.colour,
                border: `1px solid ${t.panel.border}`,
              }}
            />
          </div>
        </CounterScale>
      </span>

      {view.atEndpoint && (
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-[600px] h-16 w-16 -translate-x-1/2 rounded-full border-2 ${anim.stepComplete}`}
          style={{ borderColor: t.status.endpoint }}
        />
      )}
    </div>
  );
}
