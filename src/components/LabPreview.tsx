import SectionHeader from "./SectionHeader";
import RouteLink from "./RouteLink";
import Reveal from "./Reveal";
import { GRID_STYLE } from "./HeroVisual";

const CAPABILITIES = [
  { verb: "Prepare", line: "Set up apparatus, reagents and conditions." },
  { verb: "Perform", line: "Run the procedure, step by step." },
  { verb: "Observe", line: "Watch reactions and changes unfold." },
  { verb: "Calculate", line: "Work through the mathematics of the result." },
  { verb: "Interpret", line: "Read the data and draw conclusions." },
  { verb: "Receive feedback", line: "Guided correction at every step." },
  { verb: "Demonstrate", line: "Show and defend your understanding." },
];

export default function LabPreview() {
  return (
    <section
      aria-labelledby="lab-preview-heading"
      className="border-t border-clay/70 bg-sand/40"
    >
      <div className="container py-20 lg:py-28">
        <SectionHeader
          id="lab-preview-heading"
          index="05"
          eyebrow="Virtual Lab Preview"
          title="Inside the future lab."
          copy="Interactive laboratory experiences are being developed across the Pharm.D curriculum. This is the shape of what students will be able to do."
        />

        <div className="mt-16 grid items-stretch gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Capability list */}
          <Reveal>
            <ol
              className="border-t border-clay/70"
              aria-label="What students will be able to do"
            >
              {CAPABILITIES.map((cap, i) => (
                <li
                  key={cap.verb}
                  className="grid gap-1 border-b border-clay/70 py-4 sm:grid-cols-[150px_1fr] sm:gap-6 sm:py-5"
                >
                  <span className="flex items-baseline gap-4 sm:block">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-smoke/70 sm:mb-1.5 sm:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-semibold text-ink sm:text-lg">
                      {cap.verb}
                    </span>
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed text-smoke sm:pt-1">
                    {cap.line}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* Status panel */}
          <Reveal delay={120}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-clay bg-gradient-to-b from-white to-sand shadow-[0_24px_60px_-36px_rgba(29,27,26,0.35)]">
              <div
                className="absolute inset-0"
                style={GRID_STYLE}
                aria-hidden="true"
              />
              <span
                aria-hidden="true"
                className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-ink/25"
              />
              <span
                aria-hidden="true"
                className="absolute right-5 top-5 h-3.5 w-3.5 border-r border-t border-ink/25"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-5 left-5 h-3.5 w-3.5 border-b border-l border-ink/25"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-ink/25"
              />

              <div className="relative flex h-full flex-col p-8 lg:p-10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <span
                      className="relative flex h-1.5 w-1.5"
                      aria-hidden="true"
                    >
                      <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.26em] text-smoke">
                      MODULE STATUS
                    </span>
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.26em] text-smoke/70">
                    PREVIEW
                  </span>
                </div>

                <div className="mt-10 flex flex-1 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold leading-snug tracking-[-0.02em] text-ink [text-wrap:balance]">
                      The lab bench, in your browser
                      <span className="text-ember">.</span>
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-smoke">
                      Interactive laboratory experiences are being developed
                      across the Pharm.D curriculum — none are live yet. The
                      first practicals arrive in later phases.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-clay/70">
                    <div className="h-full w-[14%] rounded-full bg-gradient-to-r from-ember-deep to-ember" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-[0.22em] text-smoke">
                      IN PREPARATION
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.22em] text-smoke/70">
                      NOT YET LIVE
                    </span>
                  </div>
                  <div className="mt-8">
                    <RouteLink to="/lab" variant="outline" size="sm">
                      Enter the Lab
                    </RouteLink>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
