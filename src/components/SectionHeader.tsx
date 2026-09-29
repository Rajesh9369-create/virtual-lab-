type SectionHeaderProps = {
  id?: string;
  index?: string;
  eyebrow: string;
  title: string;
  copy?: string;
};

export default function SectionHeader({
  id,
  index,
  eyebrow,
  title,
  copy,
}: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <p className="flex flex-wrap items-center gap-3">
        {index && (
          <span className="font-mono text-[10px] tracking-[0.26em] text-smoke/60">
            {index}
          </span>
        )}
        <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
          {eyebrow}
        </span>
      </p>
      <h2
        id={id}
        className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink [text-wrap:balance] sm:text-5xl"
      >
        {title}
      </h2>
      {copy && (
        <p className="mt-6 text-base leading-relaxed text-smoke sm:text-lg">
          {copy}
        </p>
      )}
    </div>
  );
}
