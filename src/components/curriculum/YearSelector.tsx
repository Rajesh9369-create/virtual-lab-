import { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { CurriculumYear } from "../../data/curriculum";

type YearSelectorProps = {
  years: CurriculumYear[];
  active: number;
  onSelect: (yearNumber: number) => void;
};

/**
 * Elegant year selector — a rail of six nodes, tabs semantics,
 * full keyboard support (arrows, Home, End).
 */
export default function YearSelector({
  years,
  active,
  onSelect,
}: YearSelectorProps) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % years.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + years.length) % years.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = years.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onSelect(years[next].number);
      btnRefs.current[next]?.focus();
    }
  };

  return (
    <div className="sticky top-[75px] z-40 border-y border-clay/70 bg-bone/85 backdrop-blur-xl">
      <div className="container">
        <div
          role="tablist"
          aria-label="Curriculum years"
          className="relative grid grid-cols-6"
        >
          <span
            aria-hidden="true"
            className="absolute left-[8.333%] right-[8.333%] top-[16px] h-px bg-clay"
          />
          {years.map((y, i) => {
            const isActive = y.number === active;
            return (
              <button
                key={y.number}
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="year-panel"
                onClick={() => onSelect(y.number)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="group relative flex cursor-pointer flex-col items-center gap-2 pb-3.5 pt-[11px]"
              >
                <span
                  aria-hidden="true"
                  className={`h-[11px] w-[11px] rounded-full border transition-all duration-300 ${
                    isActive
                      ? "border-ember bg-ember"
                      : "border-clay bg-white group-hover:border-ink/35"
                  }`}
                />
                <span
                  className={`font-mono text-[11px] tracking-[0.18em] transition-colors duration-300 ${
                    isActive
                      ? "font-semibold text-ink"
                      : "text-smoke group-hover:text-ink"
                  }`}
                >
                  {String(y.number).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
