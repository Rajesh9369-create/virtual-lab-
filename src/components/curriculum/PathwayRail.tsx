/**
 * The learning structure every subject will follow — the architecture
 * for Phase 5 (Subject Learning Environment) and beyond.
 * SUBJECT → TOPICS → PRACTICALS → LEARNING MODULES → EXPERIMENTS
 */
const STAGES = [
  { label: "Subject", state: "Selected" },
  { label: "Topics", state: "Being mapped" },
  { label: "Practicals", state: "Being digitized" },
  { label: "Learning modules", state: "In development" },
  { label: "Experiments", state: "Planned" },
];

export default function PathwayRail() {
  return (
    <>
      {/* Horizontal — sm and up */}
      <ol
        className="relative hidden gap-4 sm:grid sm:grid-cols-5"
        aria-label="Subject learning structure pathway"
      >
        <span
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-[3px] h-px bg-clay"
        />
        {STAGES.map((stage, i) => (
          <li key={stage.label} className="relative pt-4">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-[7px] w-[7px] rounded-full border ${
                i === 0 ? "border-ember bg-ember" : "border-clay bg-white"
              }`}
            />
            <p
              className={`font-mono text-[9px] font-medium uppercase tracking-[0.16em] ${
                i === 0 ? "text-ink" : "text-smoke"
              }`}
            >
              {stage.label}
            </p>
            <p className="mt-1 text-[9px] leading-snug text-smoke/80">
              {stage.state}
            </p>
          </li>
        ))}
      </ol>

      {/* Vertical — mobile */}
      <ol
        className="relative sm:hidden"
        aria-label="Subject learning structure pathway"
      >
        <span
          aria-hidden="true"
          className="absolute bottom-[8px] left-[3px] top-[8px] w-px bg-clay"
        />
        {STAGES.map((stage, i) => (
          <li
            key={stage.label}
            className="relative flex items-baseline justify-between gap-4 py-1.5 pl-6"
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full border ${
                i === 0 ? "border-ember bg-ember" : "border-clay bg-white"
              }`}
            />
            <span
              className={`font-mono text-[9px] font-medium uppercase tracking-[0.16em] ${
                i === 0 ? "text-ink" : "text-smoke"
              }`}
            >
              {stage.label}
            </span>
            <span className="text-[9px] text-smoke/80">{stage.state}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
