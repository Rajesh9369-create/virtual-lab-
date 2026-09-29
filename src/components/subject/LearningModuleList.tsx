import type { LearningModule } from "../../data/curriculum";

/** Compact grid of a topic's learning modules and their build status. */
export default function LearningModuleList({
  modules,
}: {
  modules: LearningModule[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h4 className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke">
          Learning modules
        </h4>
        <span className="font-mono text-[9.5px] tracking-[0.2em] text-smoke/70">
          {String(modules.length).padStart(2, "0")} TYPES
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-px sm:grid-cols-3">
        {modules.map((module) => (
          <li
            key={module.id}
            className="flex items-center justify-between gap-3 border-b border-clay/60 py-2.5 sm:border-b-0 sm:py-0"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-1 w-1 shrink-0 rounded-full bg-ember/70"
                aria-hidden="true"
              />
              <span className="truncate font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink">
                {module.type}
              </span>
            </span>
            <span className="shrink-0 text-[10px] text-smoke">
              In development
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-smoke">
        Interactive experience being developed — modules become usable as the
        subject environment is built.
      </p>
    </div>
  );
}
