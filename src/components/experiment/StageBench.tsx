import type { Experiment, Interaction } from "../../engine/types";
import BenchStage from "./BenchStage";
import ProcedureCard from "./ProcedureCard";

type Props = {
  experiment: Experiment;
  phase: "prepare" | "perform";
  currentStepIndex: number;
  selectedObjectId: string | null;
  completedActions: string[];
  parameterValues: Record<string, number>;
  fillLevels: Record<string, number>;
  running: boolean;
  onSelectObject: (id: string) => void;
  onInteract: (interaction: Interaction, value?: number) => void;
  onStepChange: (index: number) => void;
};

/**
 * PREPARE / PERFORM — the immersive, visual-first bench. The simulation area
 * dominates; instruction stays compact and reveals one step at a time.
 */
export default function StageBench({
  experiment,
  phase,
  currentStepIndex,
  selectedObjectId,
  completedActions,
  parameterValues,
  fillLevels,
  running,
  onSelectObject,
  onInteract,
  onStepChange,
}: Props) {
  const phaseSteps = experiment.steps.filter((s) => s.phase === phase);
  const activeStep =
    phaseSteps.find((s) => s.index === currentStepIndex) ?? phaseSteps[0];
  const targetIds = activeStep
    ? activeStep.interactions.map((i) => i.targetId)
    : [];

  const items =
    phase === "prepare"
      ? [...experiment.apparatus, ...experiment.materials]
      : [...experiment.apparatus, ...experiment.materials];

  return (
    <div className="animate-swap">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-sm font-medium text-ink">
          {phase === "prepare" ? "Prepare the bench" : "Perform the experiment"}
        </h2>
        <span className="font-mono text-[10px] tracking-[0.24em] text-smoke/70">
          {phase === "prepare" ? "STAGE 02" : "STAGE 03"}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-8">
        <BenchStage
          items={items}
          fillLevels={fillLevels}
          selectedObjectId={selectedObjectId}
          targetIds={targetIds}
          completedIds={completedActions
            .map((id) => {
              const step = experiment.steps.find((s) =>
                s.interactions.some((i) => i.id === id)
              );
              const interaction = step?.interactions.find((i) => i.id === id);
              return interaction?.targetId;
            })
            .filter((x): x is string => Boolean(x))}
          onSelect={onSelectObject}
          running={running}
          label={
            phase === "prepare"
              ? "Laboratory bench with apparatus and materials"
              : "Laboratory bench during the experiment"
          }
        />

        <div className="lg:sticky lg:top-[150px]">
          <ProcedureCard
            steps={experiment.steps}
            phase={phase}
            currentStepIndex={currentStepIndex}
            completedActions={completedActions}
            parameterValues={parameterValues}
            onInteract={onInteract}
            onStepChange={onStepChange}
          />
        </div>
      </div>
    </div>
  );
}
