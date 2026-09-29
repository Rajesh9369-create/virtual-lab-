type StatusTagProps = {
  label: string;
  className?: string;
};

/** Honest status chip — same visual language as the Phase 1 domain tags. */
export default function StatusTag({ label, className = "" }: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-clay bg-bone px-2.5 py-1 ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-ember/80" aria-hidden="true" />
      <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.18em] text-smoke">
        {label}
      </span>
    </span>
  );
}
