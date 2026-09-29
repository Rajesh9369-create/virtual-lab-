import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";

const STAGES = [
  { name: "Discover", line: "Context before content." },
  { name: "Predict", line: "Commit to a hypothesis." },
  { name: "Interact", line: "Hands on the apparatus." },
  { name: "Observe", line: "Record what changes." },
  { name: "Explain", line: "In your own words." },
  { name: "Apply", line: "Unfamiliar, clinical problems." },
  { name: "Master", line: "Demonstrate and defend." },
];

const LAST = STAGES.length - 1;

export default function LearningLoop() {
  return (
    <section
      aria-labelledby="loop-heading"
      className="border-t border-clay/70"
    >
      <div className="container py-20 lg:py-28">
        <SectionHeader
          id="loop-heading"
          index="01"
          eyebrow="Learning Experience"
          title="A loop, not a lecture."
          copy="Every topic moves through the same disciplined cycle — the way science is actually practiced. Seven stages, repeated from first curiosity to defended mastery."
        />

        {/* Horizontal sequence — desktop */}
        <Reveal className="mt-16">
          <ol
            className="relative hidden gap-5 lg:grid lg:grid-cols-7"
            aria-label="The seven-stage learning loop"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-[5px] h-px bg-clay"
            />
            {STAGES.map((stage, i) => (
              <li key={stage.name} className="relative pt-8">
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-[11px] w-[11px] rounded-full border ${
                    i === LAST
                      ? "border-ember bg-ember"
                      : "border-clay bg-white"
                  }`}
                />
                <span className="font-mono text-[10px] tracking-[0.2em] text-smoke/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className={`mt-2 text-[11px] font-semibold tracking-[0.14em] ${
                    i === LAST ? "text-ember-deep" : "text-ink"
                  }`}
                >
                  {stage.name.toUpperCase()}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-smoke">
                  {stage.line}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Vertical sequence — mobile & tablet */}
        <Reveal className="mt-12">
          <ol
            className="relative lg:hidden"
            aria-label="The seven-stage learning loop"
          >
            <span
              aria-hidden="true"
              className="absolute bottom-[14px] left-[5px] top-[14px] w-px bg-clay"
            />
            {STAGES.map((stage, i) => (
              <li
                key={stage.name}
                className="relative flex gap-4 border-b border-clay/60 py-5 pl-10 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[26px] h-[11px] w-[11px] -translate-y-1/2 rounded-full border ${
                    i === LAST
                      ? "border-ember bg-ember"
                      : "border-clay bg-white"
                  }`}
                />
                <span className="pt-0.5 font-mono text-[10px] tracking-[0.2em] text-smoke/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span
                    className={`block text-sm font-semibold tracking-[0.12em] ${
                      i === LAST ? "text-ember-deep" : "text-ink"
                    }`}
                  >
                    {stage.name.toUpperCase()}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-smoke">
                    {stage.line}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-12">
          <p className="flex max-w-xl items-start gap-3 border-l-2 border-clay pl-5 text-xs leading-relaxed text-smoke">
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
              Note
            </span>
            <span>
              The loop is the design methodology of the platform — interactive
              stages become available as the lab develops.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
