import { useEffect } from "react";
import type { ExperimentTheme } from "../../engine/theme";
import type { Reference } from "../../data/references";
import {
  RELATIONSHIP_LABEL,
  RELATIONSHIP_NOTE,
  SOURCE_HIERARCHY,
  SOURCE_TYPE_LABEL,
  conflictsForReferences,
  type SourceConflict,
} from "../../data/references";
import { recordEvent } from "../../progress/store";

/* ------------------------------------------------------------- Styling */

type Tone = "light" | "dark";

interface Palette {
  bg: string;
  border: string;
  text: string;
  muted: string;
  dim: string;
}

function paletteFor(theme: ExperimentTheme | undefined): Palette {
  if (!theme) {
    return {
      bg: "#FFFFFF",
      border: "#DDD1C8",
      text: "#1D1B1A",
      muted: "#6F6964",
      dim: "#8C8580",
    };
  }
  return {
    bg: theme.panel.background,
    border: theme.panel.border,
    text: theme.panel.text,
    muted: theme.panel.muted,
    dim: theme.panel.dim,
  };
}

const STATUS_VERDICT: Record<
  string,
  { label: string; colour: string; strong: boolean }
> = {
  IP_OFFICIAL: { label: "Official source", colour: "#17B47C", strong: true },
  OFFICIAL_GOVERNMENT: { label: "Official source", colour: "#17B47C", strong: true },
  OFFICIAL_REGULATORY: { label: "Official source", colour: "#17B47C", strong: true },
  IP_RELATED: { label: "Related official source", colour: "#17B47C", strong: true },
  PEER_REVIEWED: { label: "Peer-reviewed source", colour: "#0369A1", strong: true },
  ACADEMIC_REFERENCE: { label: "Academic reference", colour: "#0369A1", strong: true },
  NON_IP_EDUCATIONAL: { label: "Educational source", colour: "#F0B24A", strong: false },
  HISTORICAL_IP: { label: "Historical source", colour: "#8C8580", strong: false },
  EDUCATIONAL_SIMULATION: {
    label: "Simulated educational model",
    colour: "#C94B12",
    strong: false,
  },
  VERIFICATION_REQUIRED: {
    label: "Source verification required",
    colour: "#C94B12",
    strong: false,
  },
};

function verdict(status: string) {
  return STATUS_VERDICT[status] ?? STATUS_VERDICT.VERIFICATION_REQUIRED;
}

/* --------------------------------------------------------- Status chip */

export function EvidenceChip({
  status,
  theme,
}: {
  status: string;
  theme?: ExperimentTheme;
}) {
  const v = verdict(status);
  const dark = Boolean(theme);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{
        borderColor: `${v.colour}66`,
        background: dark ? `${v.colour}1F` : `${v.colour}12`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: v.colour }}
        aria-hidden="true"
      />
      <span
        className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: v.colour }}
      >
        {v.label}
      </span>
    </span>
  );
}

/* --------------------------------------------------- Source hierarchy bar */

function HierarchyBar({
  sourceType,
  p,
}: {
  sourceType: Reference["sourceType"];
  p: Palette;
}) {
  const index = SOURCE_HIERARCHY.indexOf(sourceType);
  return (
    <div>
      <p
        className="font-mono text-[8px] uppercase tracking-[0.2em]"
        style={{ color: p.dim }}
      >
        Source hierarchy
      </p>
      <ol className="mt-2 flex flex-wrap gap-1.5">
        {SOURCE_HIERARCHY.map((t, i) => {
          const active = i === index;
          return (
            <li
              key={t}
              className="rounded-full border px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.12em]"
              style={{
                borderColor: active ? "#F26A21" : p.border,
                background: active ? "#F26A2114" : "transparent",
                color: active ? "#F26A21" : p.dim,
                fontWeight: active ? 600 : 400,
              }}
            >
              {SOURCE_TYPE_LABEL[t].replace(" source", "")}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --------------------------------------------------- Source conflicts */

/**
 * Sources that disagree are shown side by side and left marked for review.
 * Nothing is reconciled on the student's behalf.
 */
function ConflictCard({
  conflict,
  references,
  p,
}: {
  conflict: SourceConflict;
  references: Reference[];
  p: Palette;
}) {
  const sides = conflict.referenceIds
    .map((id) => references.find((r) => r.id === id))
    .filter((r): r is Reference => Boolean(r));

  return (
    <div
      className="rounded-[18px] border p-4"
      style={{ borderColor: "#C94B1266", background: "#C94B120D" }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
          style={{ color: "#C94B12" }}
        >
          Sources disagree
        </p>
        <span
          className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ borderColor: "#C94B1266", color: "#C94B12" }}
        >
          Review required
        </span>
      </div>

      <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: p.muted }}>
        {conflict.description}
      </p>

      {sides.map((side, i) => (
        <div key={side.id} className="mt-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: p.dim }}>
            Source {String.fromCharCode(65 + i)}
          </p>
          <p className="mt-0.5 text-[12px] font-medium leading-snug" style={{ color: p.text }}>
            {side.title}
          </p>
        </div>
      ))}

      <p
        className="mt-3 border-t pt-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em]"
        style={{ borderColor: p.border, color: "#C94B12" }}
      >
        Status: review required — no reconciliation is asserted
      </p>
    </div>
  );
}

/* ------------------------------------------------------- One reference */

function ReferenceCard({
  reference,
  p,
  onOpen,
}: {
  reference: Reference;
  p: Palette;
  onOpen: (r: Reference) => void;
}) {
  const v = verdict(reference.status);

  return (
    <div
      className="rounded-[18px] border p-4"
      style={{ borderColor: p.border, background: "transparent" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-mono text-[8px] uppercase tracking-[0.2em]"
            style={{ color: p.dim }}
          >
            {SOURCE_TYPE_LABEL[reference.sourceType]}
          </p>
          <p
            className="mt-1.5 text-[14.5px] font-semibold leading-snug"
            style={{ color: p.text }}
          >
            {reference.title}
          </p>
          {(reference.publisher || reference.edition || reference.year) && (
            <p
              className="mt-1 font-mono text-[10px] tabular-nums"
              style={{ color: p.muted }}
            >
              {[reference.publisher, reference.edition, reference.year]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <EvidenceChip status={reference.status} />
      </div>

      <p
        className="mt-3 text-[12.5px] leading-relaxed"
        style={{ color: p.muted }}
      >
        {reference.description}
      </p>

      {/* the relationship — critical for pharmacopoeial honesty */}
      <div
        className="mt-3 rounded-xl border-l-2 pl-3"
        style={{ borderColor: v.strong ? v.colour : "#C94B12" }}
      >
        <p
          className="font-mono text-[8.5px] uppercase tracking-[0.16em]"
          style={{ color: v.strong ? v.colour : "#C94B12" }}
        >
          {RELATIONSHIP_LABEL[reference.relationship]}
        </p>
        <p
          className="mt-1 text-[11px] leading-relaxed"
          style={{ color: p.muted }}
        >
          {RELATIONSHIP_NOTE[reference.relationship]}
        </p>
      </div>

      <div className="mt-3">
        <HierarchyBar sourceType={reference.sourceType} p={p} />
      </div>

      {reference.url ? (
        <a
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpen(reference)}
          className="mt-3.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
          style={{ background: "#F26A21" }}
        >
          View source
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <p
          className="mt-3.5 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em]"
          style={{ borderColor: p.border, color: p.dim }}
        >
          Source verification required
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------- The control */

export default function EvidencePanel({
  references,
  theme,
  contextLabel,
  label = "Source",
}: {
  references: Reference[];
  theme?: ExperimentTheme;
  /** What the evidence belongs to, e.g. "Acid–Base Titration". */
  contextLabel?: string;
  label?: string;
}) {
  const p = paletteFor(theme);
  const tone: Tone = theme ? "dark" : "light";

  if (references.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em]"
        style={{ borderColor: p.border, color: p.dim }}
      >
        Source verification required
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        data-evidence-open
        onClick={(e) => {
          const el = (e.currentTarget as HTMLElement)
            .nextElementSibling as HTMLElement | null;
          el?.removeAttribute("hidden");
          el?.focus();
          recordEvent({
            type: "resourceViewed",
            label: `Opened evidence — ${contextLabel ?? references[0].title}`,
          });
        }}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] transition-colors duration-300"
        style={{ borderColor: p.border, color: p.muted }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "#F26A21" }}
          aria-hidden="true"
        />
        {label}
      </button>

      {/* the drawer */}
      <div
        data-evidence-drawer
        hidden
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Evidence for ${contextLabel ?? "this content"}`}
        className="fixed inset-0 z-[70] flex items-end justify-center p-3 outline-none sm:items-center sm:justify-end sm:p-5"
        style={{ background: "rgba(10,10,10,0.55)", backdropFilter: "blur(4px)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            (e.currentTarget as HTMLElement).setAttribute("hidden", "");
          }
        }}
      >
        <button
          type="button"
          aria-label="Close evidence"
          onClick={(e) => {
            const drawer = (e.currentTarget as HTMLElement)
              .parentElement as HTMLElement;
            drawer.setAttribute("hidden", "");
          }}
          className="absolute inset-0 cursor-default"
        />

        <div
          className={`scroll-thin relative max-h-[86vh] w-full overflow-y-auto rounded-[24px] border p-5 sm:max-w-[400px] ${
            tone === "dark" ? "" : ""
          }`}
          style={{
            background: p.bg,
            borderColor: p.border,
            boxShadow: "0 30px 70px -30px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="font-mono text-[9px] uppercase tracking-[0.24em]"
                style={{ color: "#F26A21" }}
              >
                Evidence
              </p>
              {contextLabel && (
                <p
                  className="mt-1 truncate text-[13.5px] font-semibold"
                  style={{ color: p.text }}
                >
                  {contextLabel}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                const drawer = (e.currentTarget as HTMLElement)
                  .closest("[data-evidence-drawer]") as HTMLElement;
                drawer.setAttribute("hidden", "");
              }}
              className="shrink-0 cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ borderColor: p.border, color: p.muted }}
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {references.map((r) => (
              <ReferenceCard
                key={r.id}
                reference={r}
                p={p}
                onOpen={(ref) =>
                  recordEvent({
                    type: "resourceViewed",
                    label: `Viewed source — ${ref.title}`,
                  })
                }
              />
            ))}
            {/* Sources that disagree are surfaced, never silently resolved */}
            {conflictsForReferences(references.map((r) => r.id)).map((c) => (
              <ConflictCard
                key={c.id}
                conflict={c}
                references={references}
                p={p}
              />
            ))}
          </div>

          <p
            className="mt-4 text-[10px] leading-relaxed"
            style={{ color: p.dim }}
          >
            No copyrighted monograph or textbook text is reproduced. Where a
            source cannot be verified it is stated rather than guessed.
          </p>
        </div>
      </div>
    </>
  );
}

/** Close any open evidence drawer — used when leaving a context. */
export function closeEvidenceDrawers() {
  document
    .querySelectorAll("[data-evidence-drawer]")
    .forEach((el) => el.setAttribute("hidden", ""));
}

/** Keep the drawer from lingering when the route changes. */
export function useEvidenceCleanup() {
  useEffect(() => {
    return () => closeEvidenceDrawers();
  }, []);
}
