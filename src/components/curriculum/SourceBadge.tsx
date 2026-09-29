import type { SourceStatus } from "../../data/curriculum";

const LABELS: Record<SourceStatus, string> = {
  IP_OFFICIAL: "Official source",
  IP_RELATED: "Related official source",
  HISTORICAL_IP: "Historical source",
  NON_IP_EDUCATIONAL: "Educational source",
  VERIFICATION_REQUIRED: "Source verification required",
  EDUCATIONAL_SIMULATION: "Educational simulation",
  OFFICIAL_GOVERNMENT: "Official government source",
  OFFICIAL_REGULATORY: "Official regulatory source",
  PEER_REVIEWED: "Peer-reviewed source",
  ACADEMIC_REFERENCE: "Academic reference",
};

/** Subtle source/verification indicator — used where source status is relevant. */
export default function SourceBadge({
  status,
  className = "",
}: {
  status: SourceStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-clay bg-bone px-2.5 py-1 ${className}`}
    >
      <span
        className={`h-1 w-1 rounded-full ${
          status === "VERIFICATION_REQUIRED" ? "bg-ember/70" : "bg-ember"
        }`}
        aria-hidden="true"
      />
      <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.18em] text-smoke">
        {LABELS[status]}
      </span>
    </span>
  );
}
