import { LIBRARY, experimentPath } from "../data/experiments";
import { CLINICAL_ACTIVITIES } from "../data/clinicalActivities";
import Reveal from "../components/Reveal";

const ENTRIES = LIBRARY.filter((e) =>
  CLINICAL_ACTIVITIES.some((a) => a.id === e.experiment?.id)
);

export default function Clinical() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-clay/70">
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(50% 42% at 70% 8%, rgba(15,118,110,0.10), transparent 70%)"
        }} aria-hidden="true" />
        <div className="container relative pb-10 pt-12 lg:pt-16">
          <p className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Clinical Pharmacy
            </span>
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            The clinical floor<span className="text-ember">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">
            A simulated ward environment for medication review, patient
            counselling and drug-information practice.
          </p>
          <p className="mt-4 max-w-lg font-mono text-[10px] uppercase tracking-[0.18em] text-smoke/70">
            Simulated educational patients — not real people
          </p>
        </div>
      </header>

      <section aria-labelledby="clinical-activities" className="border-b border-clay/70">
        <div className="container py-12">
          <h2 id="clinical-activities" className="text-sm font-medium text-ink">
            Clinical activities
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENTRIES.map((entry, i) => {
              const activity = CLINICAL_ACTIVITIES.find((a) => a.id === entry.experiment!.id)!;
              return (
                <Reveal key={entry.slug} delay={(i % 3) * 80}>
                  <a href={`#${experimentPath(entry.experiment!)}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-clay bg-bone transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_30px_60px_-40px_rgba(29,27,26,0.5)]">
                    <span className="relative block aspect-[16/10] overflow-hidden">
                      <img src={entry.visual.src} alt={entry.visual.alt} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]" />
                      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bone via-bone/25 to-transparent" />
                      <span className="absolute inset-x-5 bottom-4">
                        <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-ember-deep">
                          {entry.domain}
                        </span>
                        <span className="mt-1.5 block text-xl font-semibold leading-tight tracking-[-0.02em] text-ink">
                          {entry.title}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-1 flex-col p-6">
                      <span className="block text-[13.5px] leading-relaxed text-smoke">
                        {entry.shortDescription}
                      </span>
                      <span className="mt-4 flex flex-wrap gap-2">
                        {activity.skills.map((s) => (
                          <span key={s} className="rounded-full border border-clay bg-white/70 px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-smoke">
                            {s}
                          </span>
                        ))}
                      </span>
                      <span className="mt-auto pt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ember-deep">
                        Enter
                        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                      </span>
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-10 flex max-w-xl items-start gap-3 text-xs leading-relaxed text-smoke">
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">Note</span>
            <span>
              Every case here is a fictional educational scenario. No
              individualised diagnosis or treatment is provided, and no
              reference range or dosing instruction is asserted.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
