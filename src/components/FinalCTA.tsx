import type { CSSProperties } from "react";
import RouteLink from "./RouteLink";
import Reveal from "./Reveal";

const DARK_GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(244,240,236,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,240,236,0.05) 1px, transparent 1px)",
  backgroundSize: "24px 24px, 24px 24px",
};

export default function FinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="border-t border-clay/70"
    >
      <div className="container py-20 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-center sm:px-12 sm:py-16 lg:px-20 lg:py-24">
            <div
              className="absolute inset-0"
              style={DARK_GRID}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(50% 42% at 50% 0%, rgba(242,106,33,0.16), transparent 72%)",
              }}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-bone/25"
            />
            <span
              aria-hidden="true"
              className="absolute right-5 top-5 h-3.5 w-3.5 border-r border-t border-bone/25"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-5 h-3.5 w-3.5 border-b border-l border-bone/25"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-bone/25"
            />

            <div className="relative">
              <p className="flex items-center justify-center gap-3">
                <span
                  className="relative flex h-1.5 w-1.5"
                  aria-hidden="true"
                >
                  <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
                </span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-bone/60">
                  Now Building
                </span>
              </p>

              <h2
                id="final-cta-heading"
                className="mx-auto mt-8 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-bone [text-wrap:balance] sm:text-5xl"
              >
                Your Pharm.D laboratory is being rebuilt for the digital age
                <span className="text-ember">.</span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bone/60">
                Pharma Virtual Lab is being developed progressively — year by
                year, practical by practical — across the complete Pharm.D
                learning journey.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <RouteLink to="/curriculum" onDark>
                  Explore Curriculum
                </RouteLink>
                <RouteLink to="/lab" variant="outline" onDark>
                  Enter the Lab
                </RouteLink>
              </div>

              <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60">
                Interactive experiences in development — nothing is live yet
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
