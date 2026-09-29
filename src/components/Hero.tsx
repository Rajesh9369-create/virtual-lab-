import HeroVisual from "./HeroVisual";
import RouteLink from "./RouteLink";

export default function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* soft ambient wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 72% 18%, rgba(242,106,33,0.07), transparent 70%)",
        }}
      />

      <div className="container relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-28">
        <div className="max-w-xl">
          <p
            className="flex animate-rise items-center gap-3"
            style={{ animationDelay: "40ms" }}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Pharm.D&nbsp;•&nbsp;Interactive Learning
            </span>
          </p>

          <h1
            id="hero-heading"
            className="mt-7 animate-rise text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink [text-wrap:balance] sm:text-6xl lg:text-[68px]"
            style={{ animationDelay: "120ms" }}
          >
            Where Pharm.D becomes practice<span className="text-ember">.</span>
          </h1>

          <p
            className="mt-7 animate-rise text-lg leading-relaxed text-smoke"
            style={{ animationDelay: "200ms" }}
          >
            An interactive learning environment for Pharm.D — where realistic
            digital experimentation, calculation and clinical reasoning turn
            theory into understanding.
          </p>

          <div
            className="mt-10 flex animate-rise flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "280ms" }}
          >
            <RouteLink to="/curriculum" variant="solid">
              Explore the Curriculum
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </RouteLink>
            <RouteLink to="/lab" variant="outline" signal>
              Enter the Lab
            </RouteLink>
          </div>

          <p
            className="mt-9 flex animate-rise items-start gap-3 border-l-2 border-clay pl-4 text-xs leading-relaxed text-smoke"
            style={{ animationDelay: "360ms" }}
          >
            <span className="mt-px shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ember-deep">
              In development
            </span>
            <span>
              The detailed curriculum, interactive practicals and progress
              tracking are in active development.
            </span>
          </p>
        </div>

        <div className="animate-fade" style={{ animationDelay: "200ms" }}>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
