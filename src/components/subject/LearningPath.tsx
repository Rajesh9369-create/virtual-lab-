const STAGES = [
  "Discover",
  "Understand",
  "Practice",
  "Experiment",
  "Analyze",
  "Apply",
  "Master",
];

/**
 * The subject learning path — a conceptual model of how the platform
 * teaches. Deliberately shows no completion state: it is not a record
 * of any student's progress.
 */
export default function LearningPath() {
  return (
    <div>
      {/* Horizontal — sm and up */}
      <ol
        className="relative hidden gap-5 md:grid md:grid-cols-7"
        aria-label="Subject learning path"
      >
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-[5px] h-px bg-clay"
        />
        {STAGES.map((stage) => (
          <li key={stage} className="relative pt-8">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-[11px] w-[11px] rounded-full border border-clay bg-white"
            />
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
              {stage}
            </p>
          </li>
        ))}
      </ol>

      {/* Wrapped — mobile */}
      <ol
        className="relative flex flex-wrap gap-x-5 gap-y-3 md:hidden"
        aria-label="Subject learning path"
      >
        {STAGES.map((stage) => (
          <li key={stage} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-[9px] w-[9px] rounded-full border border-clay bg-white"
            />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
              {stage}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-xs leading-relaxed text-smoke">
        Conceptual learning model — it describes how the platform is designed
        to teach, not a record of your progress.
      </p>
    </div>
  );
}
