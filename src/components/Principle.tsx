import Reveal from "./Reveal";

export default function Principle() {
  return (
    <section
      aria-labelledby="principle-heading"
      className="relative overflow-hidden border-t border-clay/70"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(45% 38% at 50% 42%, rgba(242,106,33,0.06), transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative py-24 text-center lg:py-36">
        <Reveal>
          <p className="flex items-center justify-center gap-3">
            <span
              className="h-1.5 w-1.5 rounded-full bg-ember"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
              Scientific Learning Principle
            </span>
          </p>

          <h2
            id="principle-heading"
            className="mt-9 [text-wrap:balance]"
          >
            <span className="block text-[30px] font-semibold leading-[1.16] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[56px]">
              Learn by doing<span className="text-ember">.</span>
            </span>
            <span className="mt-2 block text-[30px] font-semibold leading-[1.16] tracking-[-0.03em] text-ink sm:mt-3 sm:text-5xl lg:text-[56px]">
              Understand by observing<span className="text-ember">.</span>
            </span>
            <span className="mt-2 block text-[30px] font-semibold leading-[1.16] tracking-[-0.03em] text-ink sm:mt-3 sm:text-5xl lg:text-[56px]">
              Master by explaining<span className="text-ember">.</span>
            </span>
          </h2>

          <p className="mx-auto mt-9 max-w-md text-sm leading-relaxed text-smoke sm:text-base">
            The principle behind everything being built into Pharma Virtual
            Lab — a way of learning, not a claim of science.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
