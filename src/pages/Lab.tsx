import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import {
  LIBRARY,
  LIBRARY_DOMAINS,
  experimentPath,
  type LibraryEntry,
} from "../data/experiments";
import { EXPERIMENT_TYPE_LABEL } from "../engine/types";

const STATUS_STYLE: Record<string, { label: string; colour: string }> = {
  AVAILABLE: { label: "Available", colour: "#17B47C" },
  IN_DEVELOPMENT: { label: "In development", colour: "#F0B24A" },
  PLANNED: { label: "Planned", colour: "#8C8580" },
  VERIFIED: { label: "Verified", colour: "#17B47C" },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.PLANNED;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md"
      style={{ borderColor: `${s.colour}55`, background: "rgba(10,14,20,0.6)" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.colour }}
        aria-hidden="true"
      />
      <span
        className="font-mono text-[8.5px] font-medium uppercase tracking-[0.16em]"
        style={{ color: s.colour }}
      >
        {s.label}
      </span>
    </span>
  );
}

function ExperimentCard({ entry, index }: { entry: LibraryEntry; index: number }) {
  const isAvailable = entry.status === "AVAILABLE" && entry.experiment;
  const href = isAvailable ? `#${experimentPath(entry.experiment!)}` : undefined;

  const Wrapper = isAvailable ? "a" : "div";

  return (
    <Reveal delay={(index % 3) * 70}>
      <Wrapper
        {...(isAvailable ? { href } : {})}
        className={
          isAvailable
            ? "group flex h-full flex-col overflow-hidden rounded-[24px] border border-clay bg-bone transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_30px_60px_-40px_rgba(29,27,26,0.5)]"
            : "flex h-full flex-col overflow-hidden rounded-[24px] border border-clay/70 bg-bone/60"
        }
      >
        {/* VISUAL */}
        <span className="relative block aspect-[16/10] overflow-hidden">
          <img
            src={entry.visual.src}
            alt={entry.visual.alt}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-[900ms] ease-out ${
              isAvailable ? "group-hover:scale-[1.05]" : "opacity-70"
            }`}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-bone via-bone/25 to-transparent"
          />
          <span className="absolute left-4 top-4">
            <StatusChip status={entry.status} />
          </span>
          <span className="absolute inset-x-5 bottom-4">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember-deep">
                {entry.domain}
              </span>
              {(entry.experiment?.category ?? "EXPERIMENT") === "SIMULATION" && (
                <span className="rounded-full border border-ember/40 bg-ember/10 px-2 py-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em] text-ember-deep">
                  Simulation
                </span>
              )}
            </span>
            <span className="mt-1.5 block text-xl font-semibold leading-tight tracking-[-0.02em] text-ink">
              {entry.title}
            </span>
          </span>
        </span>

        {/* BODY */}
        <span className="flex flex-1 flex-col p-6">
          <span className="block text-[13.5px] leading-relaxed text-smoke">
            {entry.shortDescription}
          </span>

          <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink">
              {EXPERIMENT_TYPE_LABEL[entry.type]}
            </span>
            <span
              className="h-3 w-px bg-clay"
              aria-hidden="true"
            />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-smoke/70">
              {entry.interactionLabel}
            </span>
          </span>

          {entry.note && (
            <span className="mt-3 block text-[11px] leading-snug text-smoke/80">
              {entry.note}
            </span>
          )}

          <span className="mt-auto pt-6">
            {isAvailable ? (
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ember-deep">
                Enter the lab
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/60">
                Not yet interactive
              </span>
            )}
          </span>
        </span>
      </Wrapper>
    </Reveal>
  );
}

const CATEGORIES = ["All", "EXPERIMENT", "SIMULATION"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  All: "All",
  EXPERIMENT: "Experiments",
  SIMULATION: "Simulations",
};

export default function Lab() {
  const [category, setCategory] = useState<string>("All");
  const [domain, setDomain] = useState<string>("All");
  const [type, setType] = useState<string>("All");

  const types = useMemo(
    () => ["All", ...new Set(LIBRARY.map((e) => EXPERIMENT_TYPE_LABEL[e.type]))],
    []
  );

  const filtered = useMemo(
    () =>
      LIBRARY.filter(
        (e) =>
          (category === "All" ||
            (e.experiment?.category ?? "EXPERIMENT") === category) &&
          (domain === "All" || e.domain === domain) &&
          (type === "All" || EXPERIMENT_TYPE_LABEL[e.type] === type)
      ),
    [category, domain, type]
  );

  const availableCount = LIBRARY.filter((e) => e.status === "AVAILABLE").length;

  return (
    <>
      <PageHeader
        eyebrow="Experiment Library"
        title="The Virtual Lab"
        copy="A place where Pharm.D practical learning becomes interactive."
      />

      {/* Library */}
      <section
        aria-labelledby="library-heading"
        className="border-t border-clay/70"
      >
        <div className="container py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <h2 id="library-heading" className="text-sm font-medium text-ink">
              Experiments
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke/70">
              {String(availableCount).padStart(2, "0")} interactive ·{" "}
              {String(LIBRARY.length).padStart(2, "0")} total
            </p>
          </div>

          {/* filters */}
          <div className="mt-6 space-y-4 border-b border-clay/70 pb-6">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke/70">
                Category
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors duration-300 ${
                        active
                          ? "border-ink bg-ink text-bone"
                          : "border-clay bg-white/60 text-smoke hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {CATEGORY_LABEL[c]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke/70">
                Subject
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["All", ...LIBRARY_DOMAINS].map((d) => {
                  const active = domain === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDomain(d)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full border px-3.5 py-2 text-[12px] transition-colors duration-300 ${
                        active
                          ? "border-ink bg-ink text-bone"
                          : "border-clay bg-white/60 text-smoke hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-smoke/70">
                Experiment type
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {types.map((t) => {
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full border px-3.5 py-2 text-[12px] transition-colors duration-300 ${
                        active
                          ? "border-ember bg-ember text-white"
                          : "border-clay bg-white/60 text-smoke hover:border-ember/50 hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* cards */}
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-smoke">
              No experiments match that combination yet.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((entry, i) => (
                <ExperimentCard key={entry.slug} entry={entry} index={i} />
              ))}
            </div>
          )}

          <p className="mt-10 flex max-w-xl items-start gap-3 text-xs leading-relaxed text-smoke">
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
              Note
            </span>
            <span>
              Interactive laboratory experiences are being developed across the
              Pharm.D curriculum. Entries marked <em>Planned</em> are declared
              for discovery only — no interactive content is claimed until it is
              genuinely implemented and its content verified.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
