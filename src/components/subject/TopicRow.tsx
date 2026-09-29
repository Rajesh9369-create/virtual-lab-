import { useState } from "react";
import type { Topic } from "../../data/curriculum";
import SourceBadge from "../curriculum/SourceBadge";
import LearningModuleList from "./LearningModuleList";
import { recordEvent } from "../../progress/store";
import EvidencePanel from "../evidence/EvidencePanel";
import { referencesForTopic } from "../../data/references";

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planned",
  IN_DEVELOPMENT: "In development",
  AVAILABLE: "Available",
  VERIFIED: "Verified",
};

/** Expandable topic row — progressive disclosure, one level at a time. */
export default function TopicRow({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const panelId = `${topic.id}-panel`;

  /* Expanding a topic records it as explored. */
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      recordEvent({
        type: "topicViewed",
        subjectId: topic.id.split("-topic-")[0],
        topicId: topic.id,
        label: `Explored ${topic.title}`,
      });
    }
  };

  return (
    <li className="border-b border-clay/70 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full cursor-pointer items-center justify-between gap-5 py-5 text-left transition-colors duration-300 hover:bg-white/60"
      >
        <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
          <span className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-smoke/70">
            {String(topic.index).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-medium text-ink sm:text-lg">
              {topic.title}
            </span>
            <span className="mt-1 block max-w-lg text-sm leading-relaxed text-smoke">
              {topic.description}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-smoke/70 sm:inline">
            {STATUS_LABEL[topic.status]}
          </span>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border border-clay bg-white/60 transition-colors duration-300 group-hover:border-ink/30 group-hover:bg-white"
            aria-hidden="true"
          >
            <span className="relative block h-3 w-3">
              <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-ink" />
              <span
                className={`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-ink transition-transform duration-300 ${
                  open ? "rotate-90" : ""
                }`}
              />
            </span>
          </span>
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-6 pb-8 pl-9 sm:pl-11">
            <div className="flex flex-wrap items-center gap-3">
              <SourceBadge status={topic.source?.status ?? "VERIFICATION_REQUIRED"} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-smoke/70">
                {STATUS_LABEL[topic.status]}
              </span>
              <EvidencePanel
                references={referencesForTopic(topic.id)}
                contextLabel={topic.title}
              />
            </div>

            <p className="max-w-lg text-xs leading-relaxed text-smoke">
              Topic outline, practical connections and experiment references
              populate here as each is mapped and verified.
            </p>

            <div className="max-w-2xl border-t border-clay/70 pt-5">
              <LearningModuleList modules={topic.modules} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
