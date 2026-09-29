import ExperimentShell from "../components/experiment/ExperimentShell";
import { findExperiment } from "../data/experiments";

/** /lab/experiment/[experimentId] — rendered entirely by the reusable engine. */
export default function Experiment({ slug }: { slug: string }) {
  const experiment = findExperiment(slug);

  if (!experiment) {
    return (
      <section
        className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center"
        aria-labelledby="exp-missing"
      >
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
          Experiment not found
        </p>
        <h1
          id="exp-missing"
          className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl"
        >
          This experiment doesn't exist
          <span className="text-ember">.</span>
        </h1>
        <a
          href="#/lab"
          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-sm font-semibold text-bone transition-colors duration-300 hover:bg-ember-deep"
        >
          Back to the Lab
        </a>
      </section>
    );
  }

  /* Keyed by id so switching experiments rebuilds fresh simulation state. */
  return <ExperimentShell key={experiment.id} experiment={experiment} />;
}
