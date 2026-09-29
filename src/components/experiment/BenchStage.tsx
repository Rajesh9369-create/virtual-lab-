import type { CSSProperties } from "react";
import type { BenchItem, BenchShape } from "../../engine/types";

/* ---------------------------------------------------------------- Shapes */

const TICKS: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(29,27,26,0.28) 0 1px, transparent 1px 12px)",
};

/** Liquid column shared by vessels. */
function Liquid({ fill, tone = "ember" }: { fill: number; tone?: "ember" | "clay" }) {
  const bg =
    tone === "ember"
      ? "linear-gradient(to top, rgba(201,75,18,0.85), rgba(242,106,33,0.55))"
      : "linear-gradient(to top, rgba(221,209,200,0.95), rgba(233,225,219,0.7))";
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 transition-[height] duration-700 ease-out"
      style={{ height: `${Math.max(0, Math.min(100, fill))}%`, backgroundImage: bg }}
    />
  );
}

function Shape({ shape, fill = 0 }: { shape: BenchShape; fill?: number }) {
  switch (shape) {
    case "burette":
      return (
        <span className="relative block h-44 w-8 sm:h-48">
          <span className="absolute inset-0 overflow-hidden rounded-t-[5px] border-x border-t border-ink/25 bg-white/70">
            <span className="absolute inset-x-1 top-1 bottom-2" style={TICKS} />
            <Liquid fill={fill} />
          </span>
          <span className="absolute -bottom-3 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-b-sm bg-ink/30" />
          <span className="absolute right-[-5px] top-[64%] h-3 w-2 rounded-r-sm bg-ink/35" />
        </span>
      );
    case "flask":
      return (
        <span className="relative block h-32 w-28 sm:h-36 sm:w-32">
          <span
            className="absolute inset-0 overflow-hidden bg-white/75 shadow-[inset_0_0_0_1px_rgba(29,27,26,0.22)]"
            style={{
              clipPath:
                "polygon(37% 0, 63% 0, 63% 24%, 100% 82%, 90% 100%, 10% 100%, 0 82%)",
            }}
          >
            <Liquid fill={fill} tone="clay" />
          </span>
        </span>
      );
    case "beaker":
      return (
        <span className="relative block h-24 w-24">
          <span className="absolute inset-0 overflow-hidden rounded-b-lg border-x border-b border-ink/25 bg-white/70">
            <span className="absolute inset-x-1.5 top-1.5 bottom-1.5" style={TICKS} />
            <Liquid fill={fill} />
          </span>
          <span className="absolute -top-1 left-0 h-1.5 w-3 rounded-tl-full bg-ink/20" />
        </span>
      );
    case "bottle":
      return (
        <span className="relative block h-20 w-16">
          <span className="absolute inset-x-0 bottom-0 top-2 overflow-hidden rounded-md border border-ink/25 bg-white/70">
            <Liquid fill={fill} />
          </span>
          <span className="absolute left-1/2 top-0 h-2.5 w-7 -translate-x-1/2 rounded-sm bg-ink/30" />
        </span>
      );
    case "vial":
      return (
        <span className="relative block h-14 w-7">
          <span className="absolute inset-x-0 bottom-0 top-1.5 overflow-hidden rounded-[3px] border border-ink/20 bg-white/70">
            <Liquid fill={fill} />
          </span>
          <span className="absolute inset-x-1 top-0 h-1.5 rounded-sm bg-ink/25" />
        </span>
      );
    case "stand":
      return (
        <span className="relative block h-44 w-24 sm:h-48">
          <span className="absolute bottom-0 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-ink/25" />
          <span className="absolute bottom-1 left-1/2 h-40 w-1 -translate-x-1/2 rounded-full bg-ink/25" />
          <span className="absolute left-1/2 top-[16%] h-1 w-10 -translate-x-1/2 rounded-full bg-ink/30" />
        </span>
      );
    case "tray":
      return (
        <span className="relative block h-3.5 w-36 rounded-sm bg-clay/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />
      );
    case "loop":
      return (
        <span className="relative block h-16 w-10">
          <span className="absolute bottom-0 left-1/2 h-14 w-[3px] -translate-x-1/2 rounded-full bg-ink/30" />
          <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-ink/35" />
        </span>
      );
    case "pipette":
      return (
        <span className="relative block h-40 w-6">
          <span className="absolute left-1/2 top-0 h-[54px] w-[5px] -translate-x-1/2 border-x border-ink/20 bg-white/70" />
          <span className="absolute left-1/2 top-[50px] h-8 w-[17px] -translate-x-1/2 rounded-full border border-ink/25 bg-white/75" />
          <span className="absolute bottom-[5px] left-1/2 top-[82px] w-[5px] -translate-x-1/2 border-x border-ink/20 bg-white/70" />
          <span className="absolute bottom-0 left-1/2 h-[5px] w-[3px] -translate-x-1/2 rounded-b-full bg-ink/25" />
        </span>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------ Bench item */

type BenchObjectProps = {
  item: BenchItem;
  fill: number;
  selected: boolean;
  highlighted: boolean;
  completed: boolean;
  onSelect: (id: string) => void;
};

/** One interactive object on the virtual bench. */
export function BenchObject({
  item,
  fill,
  selected,
  highlighted,
  completed,
  onSelect,
}: BenchObjectProps) {
  const isTarget = highlighted && !selected;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-pressed={selected}
      className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-2 pb-2 pt-3 transition-all duration-300 hover:bg-white/45"
    >
      <span className="relative flex items-end justify-center">
        {/* focus + state halo */}
        {selected && (
          <span
            aria-hidden="true"
            className="absolute -inset-3 rounded-3xl bg-ember/10"
          />
        )}
        <span
          className={`relative block transition-transform duration-300 ${
            selected
              ? "-translate-y-1.5 scale-[1.04]"
              : "group-hover:-translate-y-1"
          }`}
        >
          <Shape shape={item.shape} fill={fill} />
        </span>
        {isTarget && (
          <span
            aria-hidden="true"
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 animate-pulse-soft rounded-full bg-ember motion-reduce:animate-none"
          />
        )}
        {completed && !selected && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember text-[8px] font-bold text-white"
          >
            ✓
          </span>
        )}
      </span>

      <span className="text-center">
        <span
          className={`block text-[11px] font-medium transition-colors duration-300 ${
            selected ? "text-ember-deep" : "text-ink"
          }`}
        >
          {item.name}
        </span>
        <span className="mt-0.5 block text-[9.5px] leading-tight text-smoke/80">
          {item.note}
        </span>
      </span>
    </button>
  );
}

/* ----------------------------------------------------------- Bench stage */

const BENCH_GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(29,27,26,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,27,26,0.035) 1px, transparent 1px), linear-gradient(to right, rgba(29,27,26,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,27,26,0.06) 1px, transparent 1px)",
  backgroundSize: "22px 22px, 22px 22px, 110px 110px, 110px 110px",
};

type BenchStageProps = {
  items: BenchItem[];
  fillLevels: Record<string, number>;
  selectedObjectId: string | null;
  targetIds: string[];
  completedIds: string[];
  onSelect: (id: string) => void;
  running?: boolean;
  label: string;
};

/**
 * The immersive visual simulation area — visual-first, with a minimum of
 * surrounding UI. Objects are CSS-rendered so they stay interactive.
 */
export default function BenchStage({
  items,
  fillLevels,
  selectedObjectId,
  targetIds,
  completedIds,
  onSelect,
  running = false,
  label,
}: BenchStageProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative overflow-hidden rounded-[26px] border border-clay bg-gradient-to-b from-white via-white to-sand shadow-[0_28px_70px_-40px_rgba(29,27,26,0.4)]"
    >
      <div className="absolute inset-0" style={BENCH_GRID} aria-hidden="true" />
      <span aria-hidden="true" className="absolute left-4 top-4 h-3 w-3 border-l border-t border-ink/25" />
      <span aria-hidden="true" className="absolute right-4 top-4 h-3 w-3 border-r border-t border-ink/25" />
      <span aria-hidden="true" className="absolute bottom-4 left-4 h-3 w-3 border-b border-l border-ink/25" />
      <span aria-hidden="true" className="absolute bottom-4 right-4 h-3 w-3 border-b border-r border-ink/25" />

      {/* running indicator — also conveyed by text in the procedure card */}
      {running && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ember/12 px-3 py-1"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-pulse-soft rounded-full bg-ember motion-reduce:animate-none" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ember-deep">
              Running
            </span>
          </span>
        </span>
      )}

      {/* bench surface */}
      <div className="relative flex min-h-[300px] items-end justify-center overflow-x-auto px-6 pb-6 pt-16 sm:min-h-[340px] sm:px-10">
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-clay to-transparent sm:left-10 sm:right-10"
        />
        <div className="relative flex flex-wrap items-end justify-center gap-x-4 gap-y-8 sm:gap-x-8">
          {items.map((item) => (
            <BenchObject
              key={item.id}
              item={item}
              fill={fillLevels[item.id] ?? item.fill ?? 0}
              selected={selectedObjectId === item.id}
              highlighted={targetIds.includes(item.id)}
              completed={completedIds.includes(item.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
