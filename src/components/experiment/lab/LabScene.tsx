import type { CSSProperties, ReactNode } from "react";
import type { BenchItem, BenchShape } from "../../../engine/types";
import type { ExperimentTheme } from "../../../engine/theme";
import { anim } from "./anim";

/* ============================================================== Apparatus */

const GRADUATE_FINE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0 1px, transparent 1px 13px)",
};

const GRADUATE_MAJOR: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.58) 0 1.5px, transparent 1.5px 65px)",
};

function Meniscus() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[8px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0))",
        borderRadius: "50% 50% 0 0 / 9px 9px 0 0",
      }}
    />
  );
}

type ShapeProps = {
  shape: BenchShape;
  fill: number;
  colour?: string;
  theme: ExperimentTheme;
};

/**
 * Laboratory objects rendered as dimensional glass with reflections —
 * not icons and not flat line drawings.
 */
export function GlassObject({ shape, fill, colour, theme }: ShapeProps) {
  const t = theme.apparatus;
  const liquid = colour ?? t.liquid;
  const glass = t.glass;
  const edge = t.glassEdge;

  switch (shape) {
    case "burette":
      return (
        <span className="relative block h-[380px] w-[44px]">
          <span
            className="absolute inset-0 overflow-hidden rounded-t-[8px] rounded-b-[2px]"
            style={{
              background: glass,
              boxShadow: `${edge}, inset 0 0 16px rgba(255,255,255,0.09)`,
            }}
          >
            <span
              className="absolute bottom-[12px] right-[6px] top-[12px] w-[12px]"
              style={GRADUATE_FINE}
            />
            <span
              className="absolute bottom-[12px] right-[6px] top-[12px] w-[22px]"
              style={GRADUATE_MAJOR}
            />
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-[4px] bottom-[11px]"
                style={{ ...anim.liquidFill(600), height: `${fill}%`, background: liquid }}
              >
                <Meniscus />
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="absolute -top-[5px] left-1/2 h-[5px] w-[54px] -translate-x-1/2 rounded-full"
            style={{ background: glass, boxShadow: edge }}
          />
        </span>
      );

    case "pipette":
      return (
        <span className="relative block h-[250px] w-[30px]">
          <span
            className="absolute left-1/2 top-0 h-[76px] w-[7px] -translate-x-1/2"
            style={{ background: glass, boxShadow: edge }}
          />
          <span
            className="absolute left-1/2 top-[70px] h-[40px] w-[26px] -translate-x-1/2 rounded-full"
            style={{ background: glass, boxShadow: `${edge}, inset 0 0 12px rgba(255,255,255,0.16)` }}
          />
          <span
            className="absolute bottom-[8px] left-1/2 top-[108px] w-[7px] -translate-x-1/2 overflow-hidden"
            style={{ background: glass, boxShadow: edge }}
          >
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0"
                style={{ ...anim.liquidFill(500), height: `${fill}%`, background: liquid }}
              >
                <Meniscus />
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[9px] w-[4px] -translate-x-1/2 rounded-b-full"
            style={{ background: "rgba(255,255,255,0.42)" }}
          />
        </span>
      );

    case "flask":
      return (
        <span className="relative block h-[200px] w-[230px]">
          <span
            className="absolute left-1/2 top-0 h-[46px] w-[54px] -translate-x-1/2 rounded-t-[7px]"
            style={{ background: glass, boxShadow: `${edge}, inset 0 0 12px rgba(255,255,255,0.11)` }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-[5px] left-1/2 h-[5px] w-[64px] -translate-x-1/2 rounded-full"
            style={{ background: glass, boxShadow: edge }}
          />
          <span
            className="absolute inset-x-0 bottom-0 top-[42px] overflow-hidden"
            style={{
              clipPath: "polygon(35% 0, 65% 0, 100% 60%, 90% 100%, 10% 100%, 0 60%)",
              background: glass,
              filter: t.glassDrop,
            }}
          >
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0"
                style={{
                  ...anim.liquidFill(700),
                  ...anim.colourShift(800),
                  height: `${Math.min(100, fill)}%`,
                  background: colour ?? t.liquid,
                  boxShadow: "inset 0 10px 18px -10px rgba(255,255,255,0.75)",
                }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-[15px]"
                  style={{
                    background: colour ?? "rgba(230,244,248,0.92)",
                    borderRadius: "48% 48% 0 0 / 16px 16px 0 0",
                    filter: "brightness(1.3)",
                  }}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className="absolute bottom-[7%] left-[17%] top-[22%] w-[9px] rounded-full"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05))" }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-[15%] right-[24%] top-[34%] w-[5px] rounded-full"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.03))" }}
            />
          </span>
        </span>
      );

    case "bottle":
      return (
        <span className="relative block h-[128px] w-[92px]">
          <span
            className="absolute inset-x-0 bottom-0 top-[20px] overflow-hidden rounded-[12px]"
            style={{ background: glass, boxShadow: `${edge}, inset 0 0 18px rgba(255,255,255,0.08)` }}
          >
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-[4px] bottom-[4px]"
                style={{ ...anim.liquidFill(600), height: `${fill}%`, background: liquid, borderRadius: "0 0 9px 9px" }}
              >
                <Meniscus />
              </span>
            )}
            <span
              aria-hidden="true"
              className="absolute bottom-[9%] left-[19%] top-[9%] w-[7px] rounded-full"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.44), transparent)" }}
            />
          </span>
          <span
            className="absolute left-1/2 top-[5px] h-[19px] w-[40px] -translate-x-1/2 rounded-[5px]"
            style={{
              background: "linear-gradient(180deg,#9AA5AB,#4A5358)",
              boxShadow: "0 3px 6px rgba(0,0,0,0.42)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[22px] h-[7px] w-[50px] -translate-x-1/2 rounded-[4px]"
            style={{ background: glass, boxShadow: edge }}
          />
        </span>
      );

    case "vial":
      return (
        <span className="relative block h-[74px] w-[36px]">
          <span
            className="absolute inset-x-0 bottom-0 top-[9px] overflow-hidden rounded-[5px]"
            style={{ background: glass, boxShadow: edge }}
          >
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-[3px] bottom-[3px]"
                style={{ ...anim.liquidFill(500), height: `${fill}%`, background: liquid }}
              >
                <Meniscus />
              </span>
            )}
          </span>
          <span
            className="absolute inset-x-[6px] top-0 h-[10px] rounded-[4px]"
            style={{ background: "linear-gradient(180deg,#9AA5AB,#59636A)" }}
          />
        </span>
      );

    default:
      return (
        <span className="relative block h-[46px] w-[150px]">
          <span
            className="absolute inset-0 rounded-[5px]"
            style={{ background: "linear-gradient(180deg,#77828A,#3A4247)" }}
          />
        </span>
      );
  }
}

/* ============================================================ Environment */

/**
 * The laboratory interior — themed per subject, with depth, overhead light, a
 * lit bench and a vignette. Children are the interactive apparatus.
 */
export function LabEnvironment({
  theme,
  children,
  label,
  className = "",
}: {
  theme: ExperimentTheme;
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: "#191D1F",
        backgroundImage: `${theme.environment.light}, ${theme.environment.background}`,
      }}
    >
      {/* bench surface */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[22%]"
        style={{ backgroundImage: theme.bench.surface, boxShadow: theme.bench.edge }}
      />
      {/* light pooling on the bench under the apparatus */}
      <span
        aria-hidden="true"
        className="absolute bottom-[13%] left-1/2 h-[90px] w-[78%] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(230,242,248,0.14), transparent 72%)",
        }}
      />
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: theme.environment.vignette }}
      />
    </div>
  );
}

/* ============================================================== Guidance */

/**
 * The floating NEXT ACTION card, anchored beside the object the student must
 * use, with a short connector pointing at it.
 */
export function GuidanceCard({
  theme,
  action,
  why,
  showWhy,
  onToggleWhy,
  anchorX,
}: {
  theme: ExperimentTheme;
  action: string;
  why?: string;
  showWhy: boolean;
  onToggleWhy: () => void;
  /** Horizontal position of the target, as a percentage of the scene. */
  anchorX: number;
}) {
  /* Sit opposite the target so the connector points toward it. */
  const onRight = anchorX < 50;

  return (
    <div
      className={`pointer-events-auto absolute top-[16%] z-40 w-[210px] sm:w-[236px] ${
        onRight ? "right-[4%] sm:right-[6%]" : "left-[4%] sm:left-[6%]"
      }`}
    >
      <div
        className="rounded-2xl border p-4 backdrop-blur-md"
        style={{
          background: theme.panel.background,
          borderColor: theme.panel.border,
          boxShadow: "0 18px 40px -18px rgba(0,0,0,0.7)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.24em]"
            style={{ color: theme.accent }}
          >
            Next action
          </span>
          <span
            aria-hidden="true"
            className="relative flex h-1.5 w-1.5"
          >
            <span
              className="absolute h-full w-full animate-pulse-soft rounded-full motion-reduce:animate-none"
              style={{ background: theme.accent }}
            />
            <span
              className="relative h-1.5 w-1.5 rounded-full"
              style={{ background: theme.accent }}
            />
          </span>
        </div>

        <p
          className="mt-2.5 text-[15px] font-medium leading-snug"
          style={{ color: theme.panel.text }}
        >
          {action}
        </p>

        {why && (
          <button
            type="button"
            onClick={onToggleWhy}
            aria-expanded={showWhy}
            className="mt-3 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] transition-colors duration-300"
            style={{
              borderColor: theme.panel.border,
              color: theme.panel.muted,
            }}
          >
            {showWhy ? "Hide why" : "Why?"}
          </button>
        )}

        {showWhy && why && (
          <p
            className="mt-3 border-t pt-3 text-[12px] leading-relaxed"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            {why}
          </p>
        )}
      </div>

      {/* connector toward the target */}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 hidden h-px w-[8%] lg:block ${
          onRight ? "-left-[8%]" : "-right-[8%]"
        }`}
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accent})`,
        }}
      />
    </div>
  );
}

/* ========================================================= Scene objects */

/** Natural (unscaled) bounding box of each rendered object. */
const NATURAL: Partial<Record<BenchShape, { width: number; height: number }>> = {
  burette: { width: 54, height: 385 },
  pipette: { width: 30, height: 250 },
  flask: { width: 230, height: 200 },
  bottle: { width: 92, height: 128 },
  vial: { width: 36, height: 74 },
  beaker: { width: 86, height: 92 },
  stand: { width: 150, height: 46 },
  tray: { width: 150, height: 46 },
  loop: { width: 40, height: 64 },
};

/**
 * One interactive object on the bench. The glass scales to the viewport while
 * its label stays at a readable size, so it never becomes unreadable on a
 * small screen.
 */
export function SceneObject({
  item,
  fill,
  colour,
  theme,
  isTarget,
  isDone,
  isWrong,
  onSelect,
  action,
  objectScale = 1,
}: {
  item: BenchItem;
  fill: number;
  colour?: string;
  theme: ExperimentTheme;
  isTarget: boolean;
  isDone: boolean;
  isWrong: boolean;
  onSelect: (item: BenchItem) => void;
  action: string;
  /** Scale applied to the glass only — labels are never scaled. */
  objectScale?: number;
}) {
  const t = theme;
  const natural = NATURAL[item.shape] ?? { width: 120, height: 80 };
  const w = Math.round(natural.width * objectScale);
  const h = Math.round(natural.height * objectScale);

  const boxClass = [
    "absolute bottom-0 left-1/2 cursor-pointer rounded-lg",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    isWrong ? anim.shakeSoft : "",
    isTarget
      ? "brightness-110"
      : "opacity-85 transition-[filter,opacity] duration-300 hover:opacity-100 hover:brightness-110",
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    "pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap",
    "rounded-full border px-2.5 py-1 text-center backdrop-blur-md transition-all duration-300",
    isTarget ? anim.hintBob : "",
    isTarget
      ? "opacity-100"
      : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className="group relative flex shrink-0 flex-col items-center"
      style={{ width: w, height: h }}
    >
      {isTarget && (
        <span
          aria-hidden="true"
          className={`absolute -inset-4 rounded-[26px] ${anim.focusTarget} motion-reduce:animate-none`}
          style={{
            background:
              `radial-gradient(50% 50% at 50% 60%, ${t.accentGlow}, transparent 72%)`,
          }}
        />
      )}

      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-label={`${item.name} — ${item.note}. ${action}`}
        className={boxClass}
        style={{
          width: natural.width,
          height: natural.height,
          transform: `translateX(-50%) scale(${objectScale})`,
          transformOrigin: "bottom center",
        }}
      >
        <GlassObject shape={item.shape} fill={fill} colour={colour} theme={t} />
      </button>

      <span
        className={labelClass}
        style={{ background: t.panel.background, borderColor: t.panel.border }}
      >
        <span
          className="block text-[10.5px] font-medium"
          style={{ color: t.panel.text }}
        >
          {item.name}
        </span>
        <span
          className="mt-0.5 block text-[8.5px]"
          style={{ color: t.panel.muted }}
        >
          {isTarget ? action : item.note}
        </span>
      </span>

      {isDone && !isTarget && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 z-30 flex h-[17px] w-[17px] items-center justify-center rounded-full text-[8.5px] font-bold text-white"
          style={{ background: t.accent }}
        >
          ✓
        </span>
      )}
    </span>
  );
}
