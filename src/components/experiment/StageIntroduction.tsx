import type { Experiment } from "../../engine/types";
import { EXPERIMENT_STAGES } from "../../engine/types";

type Props = {
  experiment: Experiment;
  heroSrc?: string;
  heroAlt: string;
  heroCaption?: string;
  onBegin: () => void;
};

/** INTRODUCTION — visual first, text concise. */
export default function StageIntroduction({
  experiment,
  heroSrc,
  heroAlt,
  heroCaption,
  onBegin,
}: Props) {
  const benchPreview = [...experiment.apparatus, ...experiment.materials];

  return (
    <div className="animate-swap">
      {heroSrc && (
        <figure className="relative overflow-hidden rounded-[26px] border border-clay bg-sand">
          <img
            src={heroSrc}
            alt={heroAlt}
            loading="lazy"
            className="h-[220px] w-full object-cover object-center sm:h-[300px] lg:h-[360px]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-bone/85 via-bone/10 to-transparent"
          />
          {heroCaption && (
            <figcaption className="absolute bottom-4 left-5 right-5 flex items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-ember"
                aria-hidden="true"
              />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink">
                {heroCaption}
              </span>
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div>
          <h2 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
            Objective
          </h2>
          <p className="mt-3 max-w-lg text-xl font-medium leading-snug tracking-[-0.01em] text-ink [text-wrap:balance] sm:text-2xl">
            {experiment.objective}
          </p>

          <h3 className="mt-10 font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
            Scientific concept
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-smoke">
            {experiment.concept}
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={onBegin}
              className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-semibold text-bone transition-all duration-300 hover:bg-ember-deep active:scale-[0.98]"
            >
              Begin Experiment
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
            Learning flow
          </h3>
          <ol className="mt-4 border-t border-clay">
            {EXPERIMENT_STAGES.map((stage, i) => (
              <li
                key={stage.id}
                className="flex items-center justify-between gap-4 border-b border-clay/70 py-2.5"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[9.5px] tracking-[0.2em] text-smoke/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] text-ink">{stage.label}</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-smoke/60">
                  Stage
                </span>
              </li>
            ))}
          </ol>

          <h3 className="mt-10 font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
            On the bench
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-smoke">
            {benchPreview.length} objects — {experiment.apparatus.length}{" "}
            apparatus, {experiment.materials.length} materials.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {benchPreview.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-clay bg-white/70 px-3 py-1.5 text-[11px] text-ink"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
