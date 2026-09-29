import StatusTag from "./StatusTag";

type IndexListProps = {
  items: string[];
  tag: string;
  label: string;
  numbered?: boolean;
};

/**
 * An editorial index of planned items — a rail of dots with hairline rows.
 * No invented detail, just labels and an honest status tag per row.
 */
export default function IndexList({
  items,
  tag,
  label,
  numbered = true,
}: IndexListProps) {
  return (
    <ol className="relative" aria-label={label}>
      <span
        aria-hidden="true"
        className="absolute bottom-[10px] left-[5px] top-[10px] w-px bg-clay"
      />
      {items.map((item, i) => (
        <li
          key={item}
          className="group relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-clay/70 py-7 pl-10 transition-colors duration-300 last:border-b-0 hover:bg-white/60 sm:py-8 lg:pl-12"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border border-clay bg-white transition-colors duration-300 group-hover:border-ink/35"
          />
          <span className="flex items-baseline gap-5 sm:gap-8">
            {numbered && (
              <span className="font-mono text-[11px] tracking-[0.22em] text-smoke/70">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <span className="text-xl font-semibold tracking-[-0.01em] text-ink sm:text-2xl">
              {item}
            </span>
          </span>
          <StatusTag label={tag} />
        </li>
      ))}
    </ol>
  );
}
