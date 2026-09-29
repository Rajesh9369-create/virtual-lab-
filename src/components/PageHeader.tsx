type PageHeaderProps = {
  eyebrow: string;
  title: string;
  copy: string;
};

/** Shared editorial page header — same voice as the homepage hero. */
export default function PageHeader({ eyebrow, title, copy }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(55% 45% at 70% 10%, rgba(242,106,33,0.07), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="container relative pb-16 pt-14 lg:pb-20 lg:pt-24">
        <p className="flex items-center gap-3">
          <span
            className="h-1.5 w-1.5 rounded-full bg-ember"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
            {eyebrow}
          </span>
        </p>
        <h1 className="mt-6 text-[38px] font-semibold leading-[1.03] tracking-[-0.035em] text-ink [text-wrap:balance] sm:text-6xl">
          {title}
          <span className="text-ember">.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-smoke">
          {copy}
        </p>
      </div>
    </header>
  );
}
