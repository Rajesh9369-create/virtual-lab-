import {
  subjectPath,
  type CurriculumYear,
  type Subject,
} from "../../data/curriculum";

type SubjectRowProps = {
  year: CurriculumYear;
  subject: Subject;
  index: number;
};

/** Curriculum row — selecting a subject enters its learning environment. */
export default function SubjectRow({
  year,
  subject,
  index,
}: SubjectRowProps) {
  return (
    <li className="border-b border-clay/70 last:border-b-0">
      <a
        href={`#${subjectPath(year, subject)}`}
        className="group flex items-start justify-between gap-5 py-5 transition-colors duration-300 hover:bg-white/60"
      >
        <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
          <span className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-smoke/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-medium text-ink transition-colors duration-300 group-hover:text-ember-deep sm:text-lg">
              {subject.name}
            </span>
            {subject.description && (
              <span className="mt-1 block max-w-xl text-sm leading-relaxed text-smoke">
                {subject.description}
              </span>
            )}
            <span className="mt-2.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-smoke/70">
              <span
                className="h-1 w-1 rounded-full bg-ember"
                aria-hidden="true"
              />
              Learning environment in development
            </span>
          </span>
        </span>

        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-clay bg-white/60 transition-all duration-300 group-hover:border-ink/30 group-hover:bg-white"
          aria-hidden="true"
        >
          <span className="text-sm text-ink transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </a>
    </li>
  );
}
