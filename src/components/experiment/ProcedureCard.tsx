import type { ExperimentStep, Interaction } from "../../engine/types";

type ProcedureCardProps = {
  steps: ExperimentStep[];
  phase: "prepare" | "perform";
  currentStepIndex: number;
  completedActions: string[];
  parameterValues: Record<string, number>;
  onInteract: (interaction: Interaction, value?: number) => void;
  onStepChange: (index: number) => void;
};

/**
 * Progressive procedure disclosure — one step, one line, at a time.
 * Every control here is an accessible alternative to the visual bench.
 */
export default function ProcedureCard({
  steps,
  phase,
  currentStepIndex,
  completedActions,
  parameterValues,
  onInteract,
  onStepChange,
}: ProcedureCardProps) {
  const phaseSteps = steps.filter((s) => s.phase === phase);
  const step =
    phaseSteps.find((s) => s.index === currentStepIndex) ?? phaseSteps[0];

  if (!step) return null;

  const done = step.interactions.filter((i) =>
    completedActions.includes(i.id)
  );
  const stepComplete = done.length === step.interactions.length;
  const position = phaseSteps.findIndex((s) => s.id === step.id);
  const isLast = position === phaseSteps.length - 1;

  return (
    <div className="rounded-[22px] border border-clay bg-white/85 p-5 shadow-[0_18px_44px_-32px_rgba(29,27,26,0.4)] backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-smoke/80">
          Step {String(position + 1).padStart(2, "0")} /{" "}
          {String(phaseSteps.length).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {phaseSteps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 w-5 rounded-full transition-colors duration-500 ${
                i < position ? "bg-ember/70" : i === position ? "bg-ember" : "bg-clay"
              }`}
            />
          ))}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-ink">
        {step.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-smoke">
        {step.instruction}
      </p>

      <ul className="mt-5 space-y-2">
        {step.interactions.map((interaction) => {
          const complete = completedActions.includes(interaction.id);
          const range = interaction.range;

          return (
            <li key={interaction.id}>
              {interaction.type === "adjust" && range ? (
                <div
                  className={`rounded-xl border px-4 py-3 transition-colors duration-300 ${
                    complete
                      ? "border-ember/40 bg-ember/[0.05]"
                      : "border-clay bg-bone/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor={interaction.id}
                      className="text-[12.5px] font-medium text-ink"
                    >
                      {interaction.label}
                    </label>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] tabular-nums text-ember-deep">
                      {parameterValues[interaction.id] ?? range.initial}
                      {range.unit}
                    </span>
                  </div>
                  <input
                    id={interaction.id}
                    type="range"
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    value={parameterValues[interaction.id] ?? range.initial}
                    onChange={(e) =>
                      onInteract(interaction, Number(e.target.value))
                    }
                    onMouseUp={() => !complete && onInteract(interaction)}
                    onTouchEnd={() => !complete && onInteract(interaction)}
                    onKeyUp={(e) => {
                      if (
                        !complete &&
                        (e.key === "ArrowRight" || e.key === "ArrowLeft")
                      ) {
                        onInteract(interaction);
                      }
                    }}
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-clay accent-ember"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onInteract(interaction)}
                  aria-pressed={complete}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                    complete
                      ? "border-ember/40 bg-ember/[0.05]"
                      : "border-clay bg-bone/60 hover:border-ink/30 hover:bg-white"
                  }`}
                >
                  <span className="text-[12.5px] font-medium text-ink">
                    {interaction.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 ${
                      complete
                        ? "bg-ember text-white"
                        : "border border-clay bg-white text-smoke/50"
                    }`}
                  >
                    {complete ? "✓" : "→"}
                  </span>
                </button>
              )}
              {interaction.hint && (
                <p className="mt-1.5 pl-4 text-[10.5px] leading-snug text-smoke/80">
                  {interaction.hint}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-clay/70 pt-4">
        <button
          type="button"
          onClick={() =>
            onStepChange(phaseSteps[Math.max(0, position - 1)].index)
          }
          disabled={position === 0}
          className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke transition-colors duration-300 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        >
          ← Back
        </button>
        <span
          className={`font-mono text-[9.5px] uppercase tracking-[0.2em] transition-colors duration-300 ${
            stepComplete ? "text-ember-deep" : "text-smoke/60"
          }`}
        >
          {stepComplete
            ? "Step complete"
            : `${done.length}/${step.interactions.length} done`}
        </span>
        <button
          type="button"
          onClick={() =>
            onStepChange(
              phaseSteps[Math.min(phaseSteps.length - 1, position + 1)].index
            )
          }
          disabled={isLast}
          className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke transition-colors duration-300 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
