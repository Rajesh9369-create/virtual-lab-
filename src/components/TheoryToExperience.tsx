import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";

const MOVES = [
  "Theory",
  "Preparation",
  "Interaction",
  "Observation",
  "Calculation",
  "Interpretation",
  "Result",
  "Viva",
];

const LAST = MOVES.length - 1;

export default function TheoryToExperience() {
  return (
    <section
      aria-labelledby="theory-heading"
      className="border-t border-clay/70"
    >
      <div className="container py-20 lg:py-28">
        <SectionHeader
          id="theory-heading"
          index="03"
          eyebrow="From Theory to Experience"
          title="Designed around doing."
          copy="Reading is where learning starts — not where it ends. You don't truly know a process until you have run it, and every topic in the lab moves through the same eight movements."
        />

        <Reveal className="mt-14">
          <ol
            className="flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-4 sm:gap-x-5 sm:gap-y-5"
            aria-label="The eight movements, from theory to viva"
          >
            {MOVES.map((move, i) => (
              <li key={move} className="flex items-center gap-4 sm:gap-5">
                <span
                  className={`text-xl font-semibold tracking-[-0.02em] sm:text-2xl lg:text-[28px] ${
                    i === 0
                      ? "text-smoke"
                      : i === LAST
                        ? "text-ember-deep"
                        : "text-ink"
                  }`}
                >
                  {move}
                </span>
                {i < LAST && (
                  <span
                    className="text-base text-ember sm:text-lg"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-12">
          <p className="max-w-xl text-sm leading-relaxed text-smoke">
            Preparation becomes interaction. Interaction becomes observation.
            And understanding is{" "}
            <span className="font-medium text-ink">demonstrated</span> — never
            assumed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
