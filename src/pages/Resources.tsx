import { useMemo, useState } from "react";
import {
  EVIDENCE_FILTERS,
  REFERENCES,
  SOURCE_HIERARCHY,
  SOURCE_TYPE_LABEL,
  matchesFilter,
  type EvidenceFilterId,
  type Reference,
} from "../data/references";
import { recordEvent } from "../progress/store";
import Reveal from "../components/Reveal";

const STATUS_COLOUR: Record<string, string> = {
  IP_OFFICIAL: "#17B47C",
  OFFICIAL_GOVERNMENT: "#17B47C",
  OFFICIAL_REGULATORY: "#17B47C",
  IP_RELATED: "#17B47C",
  PEER_REVIEWED: "#0369A1",
  ACADEMIC_REFERENCE: "#0369A1",
  NON_IP_EDUCATIONAL: "#F0B24A",
  HISTORICAL_IP: "#8C8580",
  EDUCATIONAL_SIMULATION: "#C94B12",
  VERIFICATION_REQUIRED: "#C94B12",
};

const STATUS_LABEL: Record<string, string> = {
  IP_OFFICIAL: "Official source",
  OFFICIAL_GOVERNMENT: "Official source",
  OFFICIAL_REGULATORY: "Official source",
  IP_RELATED: "Related official source",
  PEER_REVIEWED: "Peer-reviewed source",
  ACADEMIC_REFERENCE: "Academic reference",
  NON_IP_EDUCATIONAL: "Educational source",
  HISTORICAL_IP: "Historical source",
  EDUCATIONAL_SIMULATION: "Simulated educational model",
  VERIFICATION_REQUIRED: "Source verification required",
};

function ReferenceCard({ reference }: { reference: Reference }) {
  const colour = STATUS_COLOUR[reference.status] ?? "#C94B12";
  const hierarchyIndex = SOURCE_HIERARCHY.indexOf(reference.sourceType);

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-clay bg-bone p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember-deep">
          {SOURCE_TYPE_LABEL[reference.sourceType]}
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
          style={{ borderColor: `${colour}66`, background: `${colour}12` }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: colour }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: colour }}
          >
            {STATUS_LABEL[reference.status] ?? "Source verification required"}
          </span>
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
        {reference.title}
      </h3>

      {(reference.publisher || reference.edition || reference.year) && (
        <p className="mt-1.5 font-mono text-[10.5px] tabular-nums text-smoke">
          {[reference.publisher, reference.edition, reference.year]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-smoke">
        {reference.description}
      </p>

      {/* hierarchy position */}
      <div className="mt-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-smoke/60">
          Hierarchy
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {SOURCE_HIERARCHY.map((t, i) => (
            <span
              key={t}
              title={SOURCE_TYPE_LABEL[t]}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  i === hierarchyIndex ? "#F26A21" : i < hierarchyIndex ? "#F26A2188" : "#DDD1C8",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-5">
        {reference.url ? (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              recordEvent({
                type: "resourceViewed",
                label: `Viewed source — ${reference.title}`,
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[12px] font-semibold text-bone transition-all duration-300 hover:bg-ember-deep active:scale-[0.98]"
          >
            View source
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-smoke/70">
            Source verification required
          </p>
        )}
      </div>
    </article>
  );
}

export default function Resources() {
  const [filter, setFilter] = useState<EvidenceFilterId>("ALL");

  const filtered = useMemo(
    () => REFERENCES.filter((r) => matchesFilter(r, filter)),
    [filter]
  );

  const verifiedCount = REFERENCES.filter((r) => r.verified).length;

  return (
    <>
      <header className="relative overflow-hidden border-b border-clay/70">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(50% 42% at 70% 8%, rgba(242,106,33,0.08), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative pb-10 pt-12 lg:pt-16">
          <p className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Evidence Explorer
            </span>
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            Sources &amp; evidence<span className="text-ember">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">
            Every source behind the curriculum, experiments, simulations and
            clinical cases — with its type, status and relationship stated
            plainly.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
            {String(REFERENCES.length).padStart(2, "0")} sources ·{" "}
            {String(verifiedCount).padStart(2, "0")} verified
          </p>
        </div>
      </header>

      {/* hierarchy explanation */}
      <section aria-labelledby="hierarchy-heading" className="border-b border-clay/70">
        <div className="container py-10">
          <h2 id="hierarchy-heading" className="text-sm font-medium text-ink">
            Source hierarchy
          </h2>
          <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2.5">
            {SOURCE_HIERARCHY.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="rounded-full border border-clay bg-white/70 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink">
                  {SOURCE_TYPE_LABEL[t]}
                </span>
                {i < SOURCE_HIERARCHY.length - 1 && (
                  <span className="text-sm text-ember" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-smoke">
            The categories are not interchangeable. A pharmacopoeia and an
            educational resource are shown differently precisely so that neither
            is mistaken for the other.
          </p>
        </div>
      </section>

      {/* explorer */}
      <section aria-labelledby="explorer-heading" className="bg-sand/40">
        <div className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 id="explorer-heading" className="text-sm font-medium text-ink">
              All sources
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
              {String(filtered.length).padStart(2, "0")} SHOWN
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-clay/70 pb-6">
            {EVIDENCE_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={active}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors duration-300 ${
                    active
                      ? "border-ink bg-ink text-bone"
                      : "border-clay bg-white/60 text-smoke hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-smoke">
              No sources in that category yet.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 70}>
                  <ReferenceCard reference={r} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-[24px] border border-clay bg-white/70 p-6">
            <h3 className="text-sm font-medium text-ink">
              How this layer treats accuracy
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                "No monograph number, edition, page, DOI, author or URL is ever invented.",
                "Only the Indian Pharmacopoeia Commission URL published as official is treated as verified.",
                "Content related to pharmacopoeial principles is labelled as related — never as based on an official method.",
                "Simulated models, patients and pharmacies are labelled as educational simulations.",
                "Where a source cannot be verified, that is stated rather than guessed.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                    aria-hidden="true"
                  />
                  <span className="text-[13px] leading-relaxed text-smoke">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 max-w-xl text-xs leading-relaxed text-smoke">
            No copyrighted pharmacopoeial monograph or textbook text is
            reproduced anywhere in this application. Sources are attributed and
            linked, not copied.
          </p>
        </div>
      </section>
    </>
  );
}
