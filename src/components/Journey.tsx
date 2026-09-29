import SectionHeader from "./SectionHeader";
import RouteLink from "./RouteLink";
import Reveal from "./Reveal";

const YEARS = ["01", "02", "03", "04", "05", "06"];

export default function Journey() {
  return (
    <section
      aria-labelledby="journey-heading"
      className="border-t border-clay/70"
    >
      <div className="container py-20 lg:py-28">
        <SectionHeader
          id="journey-heading"
          index="04"
          eyebrow="The Pharm.D Journey"
          title="Six years, one continuous lab."
          copy="From foundational science to advanced clinical practice — the complete Pharm.D programme will unfold as a single interactive journey."
        />

        <Reveal className="mt-16">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-clay bg-clay/70 sm:grid-cols-3">
            {YEARS.map((year) => (
              <article
                key={year}
                className="group bg-bone p-6 transition-colors duration-300 hover:bg-white sm:p-8"
              >
                <p className="font-mono text-[10px] tracking-[0.26em] text-smoke/70">
                  YEAR
                </p>
                <p className="mt-4 text-5xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
                  {year}
                </p>
                <p className="mt-6 text-xs leading-relaxed text-smoke">
                  Detailed curriculum in development
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
            <RouteLink to="/curriculum" variant="solid" className="shrink-0">
              Explore the Curriculum
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </RouteLink>
            <p className="max-w-md text-xs leading-relaxed text-smoke">
              The curriculum explorer will present the detailed, verified
              curriculum — subject by subject, year by year.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
