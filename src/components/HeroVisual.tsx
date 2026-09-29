import type { CSSProperties } from "react";

/* Precision grid — fine lines every 24px, stronger lines every 120px */
export const GRID_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(29,27,26,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,27,26,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(29,27,26,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,27,26,0.07) 1px, transparent 1px)",
  backgroundSize:
    "24px 24px, 24px 24px, 120px 120px, 120px 120px",
};

/* Hexagonal molecular geometry, computed in plain JS */
const R = 88;
const ATOMS = Array.from({ length: 6 }, (_, k) => {
  const a = ((-90 + k * 60) * Math.PI) / 180;
  return { k, x: R * Math.cos(a), y: R * Math.sin(a) };
});
const BONDS = Array.from({ length: 6 }, (_, k) => {
  const a = ((-60 + k * 60) * Math.PI) / 180;
  const d = R * Math.cos(Math.PI / 6);
  return { k, x: d * Math.cos(a), y: d * Math.sin(a), rot: 30 + k * 60 };
});

/**
 * A premium laboratory instrument panel rendered purely with HTML/CSS.
 * Decorative — hidden from assistive technology.
 */
export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      {/* stacked depth layers */}
      <div className="absolute -inset-3 -rotate-[1.8deg] rounded-[40px] bg-clay/50" />
      <div className="absolute -inset-1.5 rotate-[1.2deg] rounded-[38px] bg-sand" />

      <div className="relative flex h-[460px] flex-col overflow-hidden rounded-[32px] border border-clay bg-gradient-to-b from-white via-white to-sand shadow-[0_32px_70px_-32px_rgba(29,27,26,0.38)] sm:h-[520px] lg:h-[560px]">
        {/* measurement grid */}
        <div className="absolute inset-0" style={GRID_STYLE} />
        {/* top light */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/80 via-white/30 to-transparent" />

        {/* corner registration ticks */}
        <span className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-ink/25" />
        <span className="absolute right-5 top-5 h-3.5 w-3.5 border-r border-t border-ink/25" />
        <span className="absolute bottom-5 left-5 h-3.5 w-3.5 border-b border-l border-ink/25" />
        <span className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-ink/25" />

        {/* instrument meta */}
        <div className="relative flex items-center justify-between px-8 pt-7">
          <span className="font-mono text-[10px] tracking-[0.26em] text-smoke">
            SPECIMEN 04—A
          </span>
          <span className="font-mono text-[10px] tracking-[0.26em] text-smoke">
            λ 420 NM
          </span>
        </div>

        {/* molecule stage */}
        <div className="relative flex-1">
          {/* restrained orange signal glow */}
          <div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(242,106,33,0.13), transparent 65%)",
            }}
          />

          {/* measurement ruler */}
          <div className="absolute bottom-10 left-7 top-10 hidden flex-col justify-between sm:flex">
            {[100, 75, 50, 25, 0].map((v) => (
              <span key={v} className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-smoke/70">{v}</span>
                <span className="h-px w-2.5 bg-ink/20" />
              </span>
            ))}
          </div>

          {/* molecular geometry */}
          <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none">
            {BONDS.map((b) => (
              <span
                key={`bond-${b.k}`}
                className="absolute h-[1.5px] bg-ink/25"
                style={{
                  left: `calc(50% + ${b.x}px)`,
                  top: `calc(50% + ${b.y}px)`,
                  width: R,
                  transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
                }}
              />
            ))}
            {ATOMS.map((a) => (
              <span
                key={`atom-${a.k}`}
                className={`absolute flex h-4 w-4 items-center justify-center rounded-full border shadow-sm ${
                  a.k === 1
                    ? "border-ember-deep bg-ember"
                    : "border-ink/15 bg-white"
                }`}
                style={{
                  left: `calc(50% + ${a.x}px)`,
                  top: `calc(50% + ${a.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {a.k === 1 && (
                  <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember/50 motion-reduce:animate-none" />
                )}
              </span>
            ))}
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/70" />
          </div>

          {/* measurement caption */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <span className="font-mono text-[9px] tracking-[0.22em] text-smoke/80">
              BOND LENGTH 1.39 Å
            </span>
          </div>
        </div>

        {/* frosted readout */}
        <div className="relative mx-6 mb-6 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-md sm:mx-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.26em] text-smoke">
              SPECTRAL RESPONSE
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-smoke">
              0.62 A
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-clay/70">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-ember-deep to-ember" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute h-full w-full animate-pulse-soft rounded-full bg-ember/60 motion-reduce:animate-none" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <span className="font-mono text-[9px] tracking-[0.22em] text-smoke">
                LAB MODULE — IN PREPARATION
              </span>
            </span>
            <span className="font-mono text-[9px] tracking-[0.22em] text-smoke/70">
              PHASE 01
            </span>
          </div>
        </div>
      </div>

      {/* floating instrument tags */}
      <div className="absolute -left-3 top-24 hidden rounded-xl border border-clay bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm sm:block">
        <span className="font-mono text-[9px] tracking-[0.2em] text-smoke">
          pH 7.40
        </span>
      </div>
      <div className="absolute -right-3 bottom-28 hidden rounded-xl border border-clay bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm sm:block">
        <span className="font-mono text-[9px] tracking-[0.2em] text-smoke">
          25.0 °C
        </span>
      </div>
    </div>
  );
}
