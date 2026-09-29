import { LIBRARY, experimentPath } from "../data/experiments";
import { FORMULAARY_PLACEHOLDER, HOSPITAL_ACTIVITIES } from "../data/clinicalActivities";
import Reveal from "../components/Reveal";

const ENTRIES = LIBRARY.filter((e) =>
  HOSPITAL_ACTIVITIES.some((a) => a.id === e.experiment?.id)
);

const AREAS = [
  { name: "Inpatient pharmacy", note: "Order review and dispensing" },
  { name: "Medication storage", note: "Stock and expiry management" },
  { name: "Drug information", note: "Responding to medicines questions" },
];

export default function Hospital() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-clay/70">
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(50% 42% at 70% 8%, rgba(201,75,18,0.10), transparent 70%)"
        }} aria-hidden="true" />
        <div className="container relative pb-10 pt-12 lg:pt-16">
          <p className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Hospital Pharmacy
            </span>
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            The pharmacy department<span className="text-ember">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">
            A simulated hospital pharmacy for inventory, dispensing workflow and
            medication-safety practice.
          </p>
          <p className="mt-4 max-w-lg font-mono text-[10px] uppercase tracking-[0.18em] text-smoke/70">
            Simulated inventory and workflow — not a real hospital system
          </p>
        </div>
      </header>

      <section aria-labelledby="hospital-areas" className="border-b border-clay/70">
        <div className="container py-12">
          <h2 id="hospital-areas" className="text-sm font-medium text-ink">
            Areas of the department
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-clay bg-clay/70 sm:grid-cols-3">
            {AREAS.map((a) => (
              <div key={a.name} className="bg-bone p-6">
                <p className="text-[15px] font-semibold text-ink">{a.name}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-smoke">{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="hospital-activities" className="border-b border-clay/70 bg-sand/40">
        <div className="container py-12">
          <h2 id="hospital-activities" className="text-sm font-medium text-ink">
            Pharmacy activities
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENTRIES.map((entry, i) => {
              const activity = HOSPITAL_ACTIVITIES.find((a) => a.id === entry.experiment!.id)!;
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
        </div>
      </section>

      {/* Demonstration formulary */}
      <section aria-labelledby="formulary-heading">
        <div className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="formulary-heading" className="text-sm font-medium text-ink">
              Demonstration formulary
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke/70">
              Browse only — no policy asserted
            </span>
          </div>
          <ul className="mt-6 border-t border-clay">
            {FORMULAARY_PLACEHOLDER.map((f) => (
              <li key={f.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-4">
                <span className="text-[14.5px] font-medium text-ink">{f.name}</span>
                <span className="flex items-baseline gap-5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-smoke">{f.form}</span>
                  <span className={`font-mono text-[9.5px] uppercase tracking-[0.16em] ${f.status.startsWith("Restricted") ? "text-ember-deep" : "text-smoke"}`}>
                    {f.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-xl text-xs leading-relaxed text-smoke">
            A demonstration list only. No hospital formulary policy, restriction
            criterion or medicine recommendation is implied.
          </p>
        </div>
      </section>
    </>
  );
}
