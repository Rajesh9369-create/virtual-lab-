import type { CurriculumYear } from "../../data/curriculum";
import { GRID_STYLE } from "../HeroVisual";
import SubjectRow from "./SubjectRow";
import SourceBadge from "./SourceBadge";

/** Year 06 — the internship year. Special treatment, verified information only. */
function InternshipPanel() {
  return (
    <div className="relative mt-12 overflow-hidden rounded-[28px] border border-clay bg-gradient-to-b from-white to-sand shadow-[0_24px_60px_-36px_rgba(29,27,26,0.35)]">
      <div className="absolute inset-0" style={GRID_STYLE} aria-hidden="true" />
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

      <div className="relative p-8 sm:p-12 lg:p-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.26em] text-smoke">
              FINAL YEAR — INTERNSHIP
            </span>
          </span>
          <span className="font-mono text-[10px] tracking-[0.26em] text-smoke/70">
            STRUCTURE PENDING
          </span>
        </div>

        <h3 className="mt-9 max-w-lg text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink [text-wrap:balance] sm:text-4xl">
          A full year in practice
          <span className="text-ember">.</span>
        </h3>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-smoke">
          The sixth year of the Pharm.D programme is devoted to internship —
          structured practical training where learning moves entirely into the
          practice environment.
        </p>

        <dl className="mt-10 border-t border-clay/80">
          {[
            {
              label: "Rotation structure",
              state: "Source verification required.",
            },
            {
              label: "Posting details",
              state: "Being mapped from verified sources only.",
            },
            {
              label: "Departments & duration",
              state: "Nothing is listed until verified.",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/60 py-4"
            >
              <dt className="text-sm font-medium text-ink">{row.label}</dt>
              <dd className="text-xs leading-relaxed text-smoke">
                {row.state}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <SourceBadge status="VERIFICATION_REQUIRED" />
        </div>
      </div>
    </div>
  );
}

export default function YearPanel({ year }: { year: CurriculumYear }) {
  return (
    <div className="animate-swap">
      {/* Year header */}
      <div className="flex flex-wrap items-end justify-between gap-6 pt-14 lg:pt-16">
        <div>
          <p className="flex items-center gap-3">
            <span
              className="h-1.5 w-1.5 rounded-full bg-ember"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              {year.focus}
            </span>
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
            {year.label}
          </h2>
        </div>
        <SourceBadge status="VERIFICATION_REQUIRED" />
      </div>

      {year.isInternshipYear ? (
        <InternshipPanel />
      ) : (
        <>
          {/* Subjects */}
          <div className="mt-14 flex items-center justify-between border-t border-clay pt-5">
            <h3 className="text-sm font-medium text-ink">Subjects</h3>
            <span
              className="font-mono text-[10px] tracking-[0.26em] text-smoke/70"
              aria-hidden="true"
            >
              {String(year.subjects.length).padStart(2, "0")} SUBJECTS
            </span>
          </div>
          <ul className="mt-2">
            {year.subjects.map((subject, i) => (
              <SubjectRow
                key={subject.id}
                year={year}
                subject={subject}
                index={i}
              />
            ))}
          </ul>

          {/* Beyond the subjects */}
          {year.experiences.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between border-t border-clay pt-5">
                <h3 className="text-sm font-medium text-ink">
                  Beyond the subjects
                </h3>
                <span
                  className="font-mono text-[10px] tracking-[0.26em] text-smoke/70"
                  aria-hidden="true"
                >
                  {String(year.experiences.length).padStart(2, "0")} AREAS
                </span>
              </div>
              <dl className="mt-1">
                {year.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-4"
                  >
                    <dt className="text-sm font-medium text-ink">
                      {exp.label}
                    </dt>
                    <dd className="text-xs leading-relaxed text-smoke">
                      {exp.state}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
}
