import { useRef, useState } from "react";
import {
  CURRICULUM,
  SOURCE_STATUS_INFO,
  type SourceStatus,
} from "../data/curriculum";
import YearSelector from "../components/curriculum/YearSelector";
import YearPanel from "../components/curriculum/YearPanel";
import SectionHeader from "../components/SectionHeader";
import EvidencePanel from "../components/evidence/EvidencePanel";
import { curriculumReferences } from "../data/references";

export default function Curriculum() {
  const [activeYear, setActiveYear] = useState(1);
  const panelTopRef = useRef<HTMLDivElement | null>(null);
  const year =
    CURRICULUM.years.find((y) => y.number === activeYear) ??
    CURRICULUM.years[0];

  const selectYear = (n: number) => {
    setActiveYear(n);
    /* If the panel top has scrolled out of view, bring it back. */
    requestAnimationFrame(() => {
      const el = panelTopRef.current;
      if (el && el.getBoundingClientRect().top < 120) {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        el.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  };

  return (
    <>
      {/* Curriculum hero */}
      <header className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 70% 10%, rgba(242,106,33,0.07), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative pb-14 pt-14 lg:pb-16 lg:pt-24">
          <p className="flex items-center gap-3">
            <span
              className="h-1.5 w-1.5 rounded-full bg-ember"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Curriculum Explorer
            </span>
          </p>
          <h1 className="mt-6 max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink [text-wrap:balance] sm:text-6xl">
            Six Years. One Pharm.D Journey
            <span className="text-ember">.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-smoke">
            The complete Pharm.D programme — organised into an interactive
            digital environment where six years of subjects, practicals and
            clinical learning are mapped source by source, with verification
            status shown throughout.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-clay pt-6">
            {["06 Years", "Source mapping in progress", "Status shown throughout"].map(
              (item, i) => (
                <span key={item} className="flex items-center gap-6">
                  {i > 0 && (
                    <span
                      className="hidden h-3 w-px bg-clay sm:block"
                      aria-hidden="true"
                    />
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">
                    {item}
                  </span>
                </span>
              )
            )}
          </div>
        </div>
      </header>

      {/* Year navigation */}
      <YearSelector
        years={CURRICULUM.years}
        active={activeYear}
        onSelect={selectYear}
      />

      {/* Year panel */}
      <div ref={panelTopRef} className="scroll-mt-[150px]">
        <div
          id="year-panel"
          role="tabpanel"
          aria-label={`${year.label} curriculum`}
          className="container pb-20 lg:pb-28"
        >
          <YearPanel key={year.number} year={year} />
          <span className="sr-only" role="status">
            {year.label} selected
          </span>
        </div>
      </div>

      {/* Methodology & sources */}
      <section
        aria-labelledby="methodology-heading"
        className="border-t border-clay/70 bg-sand/40"
      >
        <div className="container py-20 lg:py-24">
          <SectionHeader
            id="methodology-heading"
            eyebrow="Methodology & Sources"
            title="How curriculum records are sourced."
            copy="Curriculum information is being mapped from authoritative Pharm.D regulatory and academic sources. Individual learning content and experiment references are verified separately — nothing is presented as official until its source is verified."
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <EvidencePanel
              references={curriculumReferences()}
              contextLabel="Pharm.D curriculum"
            />
          </div>

          <dl className="mt-14 border-t border-clay">
            {(Object.keys(SOURCE_STATUS_INFO) as SourceStatus[]).map(
              (status) => (
                <div
                  key={status}
                  className="grid gap-1.5 border-b border-clay/70 py-4 sm:grid-cols-[220px_1fr] sm:gap-8"
                >
                  <dt className="font-mono text-[10px] tracking-[0.22em] text-smoke">
                    {status}
                  </dt>
                  <dd className="text-sm leading-relaxed text-smoke">
                    {SOURCE_STATUS_INFO[status]}
                  </dd>
                </div>
              )
            )}
          </dl>

          <p className="mt-10 flex max-w-xl items-start gap-3 border-l-2 border-clay pl-5 text-xs leading-relaxed text-smoke">
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
              Current status
            </span>
            <span>
              Year structures and subject records are marked "source
              verification required" until each is verified against the
              official regulations.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
