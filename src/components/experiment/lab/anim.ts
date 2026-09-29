import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/* ==================================================== Animation tokens */

/** Reusable animation primitives, shared by every experiment. */
export const anim = {
  /** Liquid rising or falling inside a vessel. */
  liquidFill: (ms = 550): CSSProperties => ({
    transitionProperty: "height",
    transitionDuration: `${ms}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  }),
  /** Solution changing colour — endpoint, indicator, reaction. */
  colourShift: (ms = 750): CSSProperties => ({
    transitionProperty: "background-color, box-shadow, filter",
    transitionDuration: `${ms}ms`,
    transitionTimingFunction: "ease-out",
  }),
  /** A control physically moving — stopcock, lever, valve. */
  objectRotate: (deg: number, ms = 520): CSSProperties => ({
    transform: `rotate(${deg}deg)`,
    transitionProperty: "transform",
    transitionDuration: `${ms}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  }),
  /** An object being lifted, placed or selected. */
  objectLift: (ms = 320): CSSProperties => ({
    transitionProperty: "transform, filter, opacity",
    transitionDuration: `${ms}ms`,
    transitionTimingFunction: "ease-out",
  }),
  /** Attention on the object this step needs. */
  focusTarget: "animate-target-pulse",
  /** A floating label nudging toward the target. */
  hintBob: "animate-hint-bob",
  /** Discrete droplets leaving a tip. */
  dropFlow: "animate-drop-fall",
  /** A continuous column of liquid when the flow is fast. */
  stream: "animate-flow-stream",
  /** Liquid surface movement — mixing, swirling. */
  mixing: "animate-surface",
  /** Confirmation ripple when an action lands. */
  stepComplete: "animate-step-complete",
  /** A reading ticking over to a new value. */
  valueTick: "animate-value-tick",
  /** Panels and guidance appearing. */
  riseIn: "animate-rise-in",
  /** Soft, non-punitive refusal. */
  shakeSoft: "animate-shake-soft",
} as const;

/* ==================================================== Fit-to-viewport */

export interface DesignSize {
  width: number;
  height: number;
}

/**
 * Scales a laboratory composition to fill the space available, and reports the
 * container's orientation so the scene can be rearranged rather than shrunk.
 */
export function useFitScale(
  landscape: DesignSize,
  portrait: DesignSize,
  landscapeUsage = 0.94,
  portraitUsage = 0.8
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;
      const isPortrait = height / width > 1.05;
      setIsPortrait(isPortrait);
      const design = isPortrait ? portrait : landscape;
      const usage = isPortrait ? portraitUsage : landscapeUsage;
      const next =
        Math.min(width / design.width, (height * usage) / design.height) * 0.96;
      setScale(Math.max(0.26, Math.min(1.5, next)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, [landscape, portrait, landscapeUsage, portraitUsage]);

  return { ref, scale, portrait: isPortrait };
}
