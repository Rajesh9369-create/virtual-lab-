import SectionHeader from "./SectionHeader";
import StatusTag from "./StatusTag";
import Reveal from "./Reveal";
import { DOMAIN_VISUALS } from "../data/visuals";

const DOMAINS: { name: string; line: string }[] = [
  {
    name: "Pharmaceutical Analysis",
    line: "Assay, measure and interpret.",
  },
  { name: "Pharmaceutics", line: "Formulate and evaluate dosage forms." },
  {
    name: "Pharmacognosy",
    line: "Examine natural medicines.",
  },
  { name: "Microbiology", line: "Culture, stain and identify." },
  { name: "Pharmacology", line: "Watch mechanisms unfold." },
  {
    name: "Biopharmaceutics & Pharmacokinetics",
    line: "Model what the body does to a drug.",
  },
  {
    name: "Clinical Pharmacy",
    line: "Reason through therapeutic decisions.",
  },
  { name: "Hospital Pharmacy", line: "Run the workflow, ward to dispensary." },
  { name: "Clinical Research", line: "Design studies and read the data." },
];

export default function Domains() {
  return (
    <section
      id="domains"
      aria-labelledby="domains-heading"
      className="scroll-mt-24 border-t border-clay/70 bg-sand/40"
    >
      <div className="container py-20 lg:py-28">
        <SectionHeader
          id="domains-heading"
          index="02"
          eyebrow="Learning Domains"
          title="What students can explore."
          copy="Nine disciplines will live inside Pharma Virtual Lab — not as chapters to read, but as practicals to perform, simulations to run and cases to reason through."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((domain, i) => {
            const visual = DOMAIN_VISUALS[domain.name];
            return (
              <Reveal key={domain.name} delay={(i % 3) * 80}>
                <article className="group overflow-hidden rounded-[24px] border border-clay bg-bone transition-colors duration-300 hover:border-ink/20">
                  <span className="relative block aspect-[4/5] overflow-hidden">
                    <img
                      src={visual.src}
                      alt={visual.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-bone via-bone/25 to-transparent"
                    />
                    <span className="absolute inset-x-5 bottom-5">
                      <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ember-deep">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-2 block text-xl font-semibold leading-tight tracking-[-0.02em] text-ink">
                        {domain.name}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-snug text-smoke">
                        {domain.line}
                      </span>
                    </span>
                    <span className="absolute right-4 top-4">
                      <StatusTag label="In development" />
                    </span>
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10">
          <p className="flex max-w-xl items-start gap-3 text-xs leading-relaxed text-smoke">
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
              Status
            </span>
            <span>
              All nine domains are planned — interactive experiences are in
              development across every one, none are live yet.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
