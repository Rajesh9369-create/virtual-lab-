import { useEffect } from "react";
import {
  LEARNING_MODULE_TYPES,
  MODULE_PURPOSE,
  subjectPath,
  type CurriculumYear,
  type Subject,
} from "../data/curriculum";
import { EXPERIMENTS, experimentPath } from "../data/experiments";
import { visualForSubject } from "../data/visuals";
import { recordEvent } from "../progress/store";
import SubjectNav from "../components/subject/SubjectNav";
import TopicRow from "../components/subject/TopicRow";
import LearningPath from "../components/subject/LearningPath";
import SourceBadge from "../components/curriculum/SourceBadge";
import PathwayRail from "../components/curriculum/PathwayRail";

const RESOURCE_CATEGORIES = [
  {
    id: "pci-regulatory",
    label: "PCI / Regulatory",
    line: "Regulatory and programme documents.",
  },
  {
    id: "pharmacopoeial",
    label: "Pharmacopoeial",
    line: "Official compendial standards and monographs.",
  },
  {
    id: "academic-reference",
    label: "Academic Reference",
    line: "Established academic texts.",
  },
  {
    id: "peer-reviewed",
    label: "Peer-Reviewed Literature",
    line: "Journals and primary research.",
  },
];

const PRACTICAL_STRUCTURE = [
  { label: "Practical title", state: "Source verification required." },
  { label: "Associated topic", state: "Linked once topics are verified." },
  { label: "Learning status", state: "Shown as the module is built." },
  { label: "Interactive experience", state: "Being developed." },
];

export default function Subject({
  year,
  subject,
}: {
  year: CurriculumYear;
  subject: Subject;
}) {
  /* Opening a subject becomes part of the learning record. */
  useEffect(() => {
    recordEvent({
      type: "subjectViewed",
      subjectId: subject.id,
      label: `Opened ${subject.name}`,
    });
  }, [subject.id, subject.name]);

  return (
    <>
      {/* Subject header */}
      <header className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 72% 8%, rgba(242,106,33,0.06), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative pb-12 pt-12 lg:pb-14 lg:pt-20">
          <a
            href="#/curriculum"
            className="group inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke transition-colors duration-300 hover:text-ink"
          >
            <span
              className="transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            >
              ←
            </span>
            Curriculum
          </a>

          <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-ember-deep">
              {year.label}
            </span>
            <span
              className="h-3 w-px bg-clay"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-smoke">
              {year.focus}
            </span>
          </p>

          <h1 className="mt-6 max-w-3xl text-[34px] font-semibold leading-[1.06] tracking-[-0.035em] text-ink [text-wrap:balance] sm:text-5xl lg:text-[56px]">
            {subject.name}
            <span className="text-ember">.</span>
          </h1>

          {subject.description && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
              {subject.description}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-clay pt-6">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-ink px-3.5 py-1.5">
              <span
                className="relative flex h-1.5 w-1.5"
                aria-hidden="true"
              >
                <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-bone">
                Learning environment in development
              </span>
            </span>
            <SourceBadge status={subject.source.status} />
          </div>

          {/* Visual identity for the subject */}
          {(() => {
            const visual = visualForSubject(subject.name);
            return (
              <figure className="relative mt-10 overflow-hidden rounded-[24px] border border-clay bg-sand">
                <img
                  src={visual.src}
                  alt={visual.alt}
                  loading="lazy"
                  className="h-[180px] w-full object-cover object-center sm:h-[240px] lg:h-[280px]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-bone/80 via-bone/10 to-transparent"
                />
                <figcaption className="absolute bottom-4 left-5 right-5 flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-ember"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink">
                    {visual.caption}
                  </span>
                </figcaption>
              </figure>
            );
          })()}
        </div>
      </header>

      {/* Subject body */}
      <div className="border-t border-clay/70">
        <div className="container grid gap-10 pb-20 lg:grid-cols-[200px_1fr] lg:gap-16 lg:pb-28">
          {/* Mobile section nav */}
          <div className="lg:hidden">
            <SubjectNav />
          </div>

          {/* Desktop rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-[110px]">
              <SubjectNav />
            </div>
          </aside>

          <div>
            {/* Overview */}
            <section
              id="overview"
              aria-labelledby="overview-heading"
              className="scroll-mt-32 pt-12 lg:pt-14"
            >
              <h2
                id="overview-heading"
                className="text-sm font-medium text-ink"
              >
                Overview
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke">
                This subject is being prepared as a complete learning
                environment — topics, practicals and interactive modules,
                built in stages and verified source by source.
              </p>

              <div className="mt-12 max-w-2xl">
                <h3 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
                  Learning path
                </h3>
                <div className="mt-6">
                  <LearningPath />
                </div>
              </div>

              <div className="mt-14 max-w-2xl border-t border-clay/70 pt-8">
                <h3 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
                  Subject structure
                </h3>
                <div className="mt-6">
                  <PathwayRail />
                </div>
              </div>
            </section>

            {/* Topics */}
            <section
              id="topics"
              aria-labelledby="topics-heading"
              className="scroll-mt-32 border-t border-clay/70 pt-12 lg:pt-14"
            >
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2 id="topics-heading" className="text-sm font-medium text-ink">
                  Topics
                </h2>
                <span
                  className="font-mono text-[10px] tracking-[0.26em] text-smoke/70"
                  aria-hidden="true"
                >
                  {String(subject.topics.length).padStart(2, "0")} TOPICS
                </span>
              </div>

              <p className="mt-5 flex max-w-xl items-start gap-3 text-xs leading-relaxed text-smoke">
                <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
                  Note
                </span>
                <span>
                  Structural scaffolding. Topic titles and outlines appear only
                  once mapped from a verified source.
                </span>
              </p>

              <ul className="mt-6">
                {subject.topics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} />
                ))}
              </ul>
            </section>

            {/* Practicals */}
            <section
              id="practicals"
              aria-labelledby="practicals-heading"
              className="scroll-mt-32 border-t border-clay/70 pt-12 lg:pt-14"
            >
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2
                  id="practicals-heading"
                  className="text-sm font-medium text-ink"
                >
                  Practicals
                </h2>
                <span className="font-mono text-[10px] tracking-[0.26em] text-smoke/70">
                  NOT YET PUBLISHED
                </span>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke">
                No verified practical records are published for this subject
                yet. Practical listings, associated topics and experiment
                references will appear here once verified.
              </p>

              {/* Experiments registered against this subject */}
              {(() => {
                const linked = EXPERIMENTS.filter(
                  (e) => e.subjectId === subject.id
                );
                if (linked.length === 0) {
                  return (
                    <p className="mt-6 max-w-xl text-xs leading-relaxed text-smoke">
                      No experiment is connected to this subject yet.
                    </p>
                  );
                }
                return (
                  <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                    {linked.map((experiment) => {
                      const hero = experiment.visuals.find(
                        (v) => v.role === "heroVisual"
                      );
                      return (
                        <li key={experiment.id}>
                          <a
                            href={`#${experimentPath(experiment)}`}
                            className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-clay bg-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:bg-white hover:shadow-[0_26px_54px_-36px_rgba(29,27,26,0.45)]"
                          >
                            <span className="relative block aspect-[16/10] overflow-hidden">
                              <img
                                src={hero?.src}
                                alt={hero?.alt ?? experiment.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                              />
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t from-bone/55 to-transparent"
                              />
                            </span>
                            <span className="flex flex-1 flex-col p-5">
                              <span className="block text-base font-semibold leading-snug tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-ember-deep">
                                {experiment.title}
                              </span>
                              <span className="mt-1.5 block text-xs leading-relaxed text-smoke">
                                {experiment.objective}
                              </span>
                              <span className="mt-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-smoke/70">
                                Open experiment
                                <span
                                  className="transition-transform duration-300 group-hover:translate-x-1"
                                  aria-hidden="true"
                                >
                                  →
                                </span>
                              </span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}

              <dl className="mt-8 border-t border-clay">
                {PRACTICAL_STRUCTURE.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-1 border-b border-clay/70 py-4 sm:grid-cols-[200px_1fr] sm:gap-8"
                  >
                    <dt className="text-sm font-medium text-ink">
                      {row.label}
                    </dt>
                    <dd className="text-xs leading-relaxed text-smoke">
                      {row.state}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <SourceBadge status="VERIFICATION_REQUIRED" />
              </div>
            </section>

            {/* Learning modules */}
            <section
              id="modules"
              aria-labelledby="modules-heading"
              className="scroll-mt-32 border-t border-clay/70 pt-12 lg:pt-14"
            >
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2
                  id="modules-heading"
                  className="text-sm font-medium text-ink"
                >
                  Learning modules
                </h2>
                <span
                  className="font-mono text-[10px] tracking-[0.26em] text-smoke/70"
                  aria-hidden="true"
                >
                  {String(LEARNING_MODULE_TYPES.length).padStart(2, "0")} TYPES
                </span>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke">
                Every topic in this subject can expose the same nine module
                types — a reusable structure that keeps the learning
                experience consistent across the whole curriculum.
              </p>

              <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
                {LEARNING_MODULE_TYPES.map((type) => (
                  <li
                    key={type}
                    className="border-b border-clay/70 py-4 sm:border-b-0 sm:py-3.5"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-1 w-1 shrink-0 rounded-full bg-ember/70"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                        {type}
                      </span>
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-smoke">
                      {MODULE_PURPOSE[type]}
                    </span>
                    <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.18em] text-smoke/70">
                      Module in development
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Resources */}
            <section
              id="resources"
              aria-labelledby="resources-heading"
              className="scroll-mt-32 border-t border-clay/70 pt-12 lg:pt-14"
            >
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2
                  id="resources-heading"
                  className="text-sm font-medium text-ink"
                >
                  Resources
                </h2>
                <span className="font-mono text-[10px] tracking-[0.26em] text-smoke/70">
                  PENDING SOURCES
                </span>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke">
                Verified resources will be added during content development.
                Nothing is listed here until its source has been checked.
              </p>

              <ul className="mt-8 border-t border-clay">
                {RESOURCE_CATEGORIES.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-4"
                  >
                    <span className="text-sm font-medium text-ink">
                      {cat.label}
                    </span>
                    <span className="text-xs leading-relaxed text-smoke">
                      {cat.line} No verified references yet.
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 max-w-xl text-[11px] leading-relaxed text-smoke">
                Reference records will carry an explicit source status —
                official compendial, related official, historical, educational —
                before any citation is shown.
              </p>
            </section>

            {/* Next */}
            <div className="mt-14 border-t border-clay pt-8">
              <a
                href={`#${subjectPath(year, subject)}`}
                onClick={(e) => {
                  e.preventDefault();
                  const reduce = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
                  window.scrollTo({
                    top: 0,
                    behavior: reduce ? "auto" : "smooth",
                  });
                }}
                className="group inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke transition-colors duration-300 hover:text-ink"
              >
                <span
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                  aria-hidden="true"
                >
                  ↑
                </span>
                Back to top of {subject.name}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
