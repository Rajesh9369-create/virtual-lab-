import { useMemo, useState } from "react";
import { useProgress, resetProgress } from "../progress/store";
import {
  continueTarget,
  experimentProgress,
  historyGroups,
  masteryViews,
  overallMastery,
  subjectProgress,
  summarise,
} from "../progress/derive";
import {
  EXPERIMENT_STATUS_COLOUR,
  EXPERIMENT_STATUS_LABEL,
} from "../progress/types";
import { MASTERY_COLOUR } from "../engine/viva";
import { LIBRARY } from "../data/experiments";
import { DOMAIN_VISUALS } from "../data/visuals";

/* ------------------------------------------------------------- Primitives */

function Ring({
  ratio,
  colour,
  label,
  value,
  sub,
}: {
  ratio: number;
  colour: string;
  label: string;
  value: string;
  sub: string;
}) {
  const circumference = 2 * Math.PI * 30;
  const dash = circumference * Math.min(1, Math.max(0, ratio));
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 72 72" className="h-[68px] w-[68px] shrink-0" aria-hidden="true">
        <circle cx="36" cy="36" r="30" fill="none" stroke="#DDD1C8" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke={colour}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke/70">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 text-[11.5px] leading-snug text-smoke">{sub}</p>
      </div>
    </div>
  );
}

function Bar({ ratio, colour }: { ratio: number; colour: string }) {
  return (
    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-clay/70">
      <span
        className="block h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, ratio * 100))}%`,
          background: colour,
          transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------- Page */

export default function Progress() {
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const summary = useMemo(() => summarise(progress), [progress]);
  const target = useMemo(() => continueTarget(progress), [progress]);
  const mastery = useMemo(() => masteryViews(progress), [progress]);
  const band = useMemo(() => overallMastery(progress), [progress]);
  const subjects = useMemo(() => subjectProgress(progress), [progress]);
  const history = useMemo(() => historyGroups(progress), [progress]);

  /* Only experiments with real activity are listed. */
  const trackedExperiments = useMemo(
    () =>
      LIBRARY.filter((e) => e.experiment)
        .map((e) => ({
          entry: e,
          view: experimentProgress(progress, e.experiment!.id),
        }))
        .filter(
          (r): r is { entry: (typeof LIBRARY)[number]; view: NonNullable<typeof r.view> } =>
            Boolean(r.view) && r.view!.status !== "NOT_STARTED"
        ),
    [progress]
  );

  const activeSubjects = subjects.filter((s) => s.hasActivity);
  const visual = (domain: string) =>
    DOMAIN_VISUALS[domain] ?? DOMAIN_VISUALS["Pharmaceutical Analysis"];

  /* ------------------------------- empty state ------------------------------- */
  if (!summary.hasActivity) {
    return (
      <section
        className="relative flex min-h-[72vh] items-center overflow-hidden"
        aria-labelledby="progress-empty"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(48% 40% at 50% 32%, rgba(242,106,33,0.07), transparent 72%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative py-20 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-clay bg-white/70"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute h-full w-full animate-pulse-soft rounded-full bg-ember" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-ember" />
            </span>
          </span>

          <p className="mt-9 font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
            Progress
          </p>
          <h1
            id="progress-empty"
            className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink [text-wrap:balance] sm:text-5xl"
          >
            Your lab journey starts here
            <span className="text-ember">.</span>
          </h1>

          <div className="mx-auto mt-9 grid max-w-2xl gap-px overflow-hidden rounded-2xl border border-clay bg-clay/70 sm:grid-cols-2">
            {[
              { n: "01", t: "Explore a subject" },
              { n: "02", t: "Enter an experiment" },
              { n: "03", t: "Perform the procedure" },
              { n: "04", t: "Test your understanding" },
            ].map((s) => (
              <div key={s.n} className="bg-bone p-5 text-left">
                <span className="font-mono text-[10px] tracking-[0.22em] text-smoke/60">
                  {s.n}
                </span>
                <p className="mt-2 text-[15px] font-medium text-ink">{s.t}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#/lab"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-semibold text-bone transition-all duration-300 hover:bg-ember-deep active:scale-[0.98]"
            >
              Explore experiments
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </a>
            <a
              href="#/curriculum"
              className="inline-flex items-center gap-3 rounded-full border border-ink/20 bg-white/50 px-8 py-4 text-sm font-semibold text-ink transition-all duration-300 hover:border-ink/45 hover:bg-white"
            >
              Browse the curriculum
            </a>
          </div>

          <p className="mx-auto mt-10 max-w-md text-xs leading-relaxed text-smoke">
            Your learning activity is kept on this device only — no account is
            created and nothing is sent anywhere.
          </p>
        </div>
      </section>
    );
  }

  /* --------------------------------- active --------------------------------- */
  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-clay/70">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(50% 42% at 72% 8%, rgba(242,106,33,0.07), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative pb-10 pt-12 lg:pt-16">
          <p className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Progress
            </span>
          </p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
              Your learning journey
              <span className="text-ember">.</span>
            </h1>
            {band && (
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke/70">
                  Current learning mastery
                </p>
                <p
                  className="mt-1 font-mono text-lg font-semibold uppercase tracking-[0.05em]"
                  style={{ color: MASTERY_COLOUR[band] }}
                >
                  {band}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overview rings */}
      <section aria-label="Learning overview" className="border-b border-clay/70">
        <div className="container py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Ring
              ratio={
                summary.experimentsAvailable > 0
                  ? summary.experimentsCompleted / summary.experimentsAvailable
                  : 0
              }
              colour="#F26A21"
              label="Experiments"
              value={`${summary.experimentsCompleted}`}
              sub={`of ${summary.experimentsAvailable} available · ${summary.experimentsInProgress} in progress`}
            />
            <Ring
              ratio={Math.min(1, summary.topicsExplored / 8)}
              colour="#1D1B1A"
              label="Curriculum"
              value={`${summary.topicsExplored}`}
              sub={`topics explored across ${summary.subjectsExplored} subject${
                summary.subjectsExplored === 1 ? "" : "s"
              }`}
            />
            <Ring
              ratio={Math.min(1, summary.vivasCompleted / 3)}
              colour="#C94B12"
              label="Viva"
              value={`${summary.vivasCompleted}`}
              sub="assessments completed"
            />
            <Ring
              ratio={
                summary.conceptsSeen > 0
                  ? summary.conceptsMastered / summary.conceptsSeen
                  : 0
              }
              colour="#17B47C"
              label="Mastery"
              value={`${summary.conceptsMastered}`}
              sub={`of ${summary.conceptsSeen} concepts seen`}
            />
          </div>
        </div>
      </section>

      {/* Continue learning */}
      {target && (
        <section aria-labelledby="continue-heading" className="border-b border-clay/70 bg-sand/40">
          <div className="container py-10">
            <h2
              id="continue-heading"
              className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke"
            >
              Continue learning
            </h2>
            <a
              href={target.href}
              className="group mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-[22px] border border-clay bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_26px_54px_-40px_rgba(29,27,26,0.5)] sm:p-6"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ember-deep">
                    {target.kind === "review"
                      ? "Review"
                      : target.kind === "viva"
                        ? "Viva"
                        : "Experiment"}
                  </span>
                </span>
                <span className="mt-2 block text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
                  {target.title}
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-smoke">
                  {target.detail}
                </span>
              </span>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-bone transition-all duration-300 group-hover:bg-ember-deep"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>
        </section>
      )}

      {/* Experiments */}
      <section aria-labelledby="experiments-heading" className="border-b border-clay/70">
        <div className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2
              id="experiments-heading"
              className="text-sm font-medium text-ink"
            >
              Your experiments
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke/70">
              {String(trackedExperiments.length).padStart(2, "0")} TRACKED
            </span>
          </div>

          {trackedExperiments.length === 0 ? (
            <p className="mt-6 max-w-md text-sm leading-relaxed text-smoke">
              No experiments started yet —{" "}
              <a href="#/lab" className="text-ember-deep underline decoration-clay underline-offset-4">
                explore the library
              </a>{" "}
              to begin.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {trackedExperiments.map(({ entry, view }) => {
                const v = visual(entry.domain);
                return (
                  <li key={view.experimentId}>
                    <a
                      href={`#/lab/experiment/${entry.slug}`}
                      className="group flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[20px] border border-clay bg-white/70 p-4 transition-all duration-300 hover:border-ink/25 hover:bg-white"
                    >
                      <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={v.src}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-ember-deep">
                          {entry.domain}
                        </span>
                        <span className="mt-1 block text-[15px] font-semibold leading-snug text-ink">
                          {view.title}
                        </span>
                        <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          {view.stages.map((st) => (
                            <span
                              key={st.id}
                              className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em]"
                              style={{ color: st.reached ? "#1D1B1A" : "#B4ACA5" }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: st.reached ? "#F26A21" : "#DDD1C8" }}
                                aria-hidden="true"
                              />
                              {st.label}
                            </span>
                          ))}
                        </span>
                      </span>

                      <span className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className="rounded-full border px-2.5 py-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.16em]"
                          style={{
                            borderColor: `${EXPERIMENT_STATUS_COLOUR[view.status]}66`,
                            color: EXPERIMENT_STATUS_COLOUR[view.status],
                          }}
                        >
                          {EXPERIMENT_STATUS_LABEL[view.status]}
                        </span>
                        {view.vivaAccuracy !== null && (
                          <span className="font-mono text-[10px] tabular-nums text-smoke">
                            viva {view.vivaAccuracy.toFixed(0)}%
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Mastery */}
      {mastery.length > 0 && (
        <section aria-labelledby="mastery-heading" className="border-b border-clay/70 bg-sand/40">
          <div className="container py-12">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 id="mastery-heading" className="text-sm font-medium text-ink">
                  Current learning mastery
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-smoke">
                  Concept by concept, from your viva answers in this session and
                  on this device.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke/70">
                {String(mastery.length).padStart(2, "0")} CONCEPTS
              </span>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mastery.map((m) => (
                <li
                  key={m.conceptId}
                  className="rounded-[18px] border border-clay bg-white/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-medium leading-snug text-ink">
                      {m.conceptId}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        background: `${MASTERY_COLOUR[m.status]}1A`,
                        color: MASTERY_COLOUR[m.status],
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Bar
                      ratio={m.attempts > 0 ? m.correctAnswers / m.attempts : 0}
                      colour={MASTERY_COLOUR[m.status]}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[9.5px] tabular-nums text-smoke/80">
                    {m.correctAnswers}/{m.attempts} correct
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Subject progress */}
      {activeSubjects.length > 0 && (
        <section aria-labelledby="subjects-heading" className="border-b border-clay/70">
          <div className="container py-12">
            <h2 id="subjects-heading" className="text-sm font-medium text-ink">
              Across the curriculum
            </h2>

            {Object.entries(
              activeSubjects.reduce<Record<string, typeof activeSubjects>>(
                (acc, s) => {
                  (acc[s.yearLabel] ??= []).push(s);
                  return acc;
                },
                {}
              )
            ).map(([yearLabel, rows]) => (
              <div key={yearLabel} className="mt-8">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-smoke/70">
                  {yearLabel}
                </p>
                <ul className="mt-3 border-t border-clay">
                  {rows.map((s) => (
                    <li
                      key={s.subjectId}
                      className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-clay/70 py-4"
                    >
                      <a
                        href={`#/curriculum/${String(s.yearNumber).padStart(2, "0")}/${s.subjectId.replace(
                          /^y\d+-/,
                          ""
                        )}`}
                        className="min-w-0 flex-1 text-[14.5px] font-medium text-ink transition-colors duration-300 hover:text-ember-deep"
                      >
                        {s.subjectName}
                      </a>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-smoke">
                          {s.experimentsCompleted}/{s.experimentsTotal} experiments
                        </span>
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-smoke">
                          {s.topicsExplored} topics
                        </span>
                        {s.vivaAverage !== null && (
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember-deep">
                            viva {s.vivaAverage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      <section aria-labelledby="history-heading" className="bg-sand/40">
        <div className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="history-heading" className="text-sm font-medium text-ink">
              Learning history
            </h2>
            {confirmReset ? (
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                  className="cursor-pointer rounded-full border border-ember/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ember-deep"
                >
                  Clear everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.14em] text-smoke"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.16em] text-smoke/70 transition-colors duration-300 hover:text-ink"
              >
                Clear local progress
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="mt-6 text-sm text-smoke">
              Your learning activity will appear here.
            </p>
          ) : (
            <div className="mt-6 space-y-8">
              {history.map((group) => (
                <div key={group.key}>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-smoke/70">
                    {group.label}
                  </p>
                  <ol className="mt-3 border-t border-clay">
                    {group.events.slice(0, 12).map((event) => (
                      <li
                        key={event.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-3"
                      >
                        <span className="flex min-w-0 items-baseline gap-3.5">
                          <span
                            className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full"
                            style={{
                              background:
                                event.type === "experimentCompleted"
                                  ? "#17B47C"
                                  : event.type === "vivaCompleted"
                                    ? "#C94B12"
                                    : event.type === "conceptReviewed"
                                      ? "#F26A21"
                                      : "#B4ACA5",
                            }}
                            aria-hidden="true"
                          />
                          <span className="text-[13.5px] text-ink">
                            {event.label}
                          </span>
                        </span>
                        <span className="font-mono text-[9.5px] tabular-nums text-smoke/70">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          <p className="mt-8 max-w-md text-xs leading-relaxed text-smoke">
            Progress is stored in this browser only. No account is created, and
            no personal information is collected.
          </p>
        </div>
      </section>
    </>
  );
}
