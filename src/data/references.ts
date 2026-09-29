/**
 * EVIDENCE & REFERENCE LAYER
 * --------------------------
 * A single registry of sources, kept entirely separate from UI and from
 * educational content. Adding, correcting or retiring a source changes nothing
 * but this file.
 *
 * ACCURACY RULE — nothing here is invented. Only the Indian Pharmacopoeia
 * Commission URL below is treated as verified, because it was supplied as
 * official. Every other entry carries a real, named source *type* but no
 * fabricated edition, page, year, DOI or URL, and is marked
 * VERIFICATION_REQUIRED until it can be checked.
 */
import type { SourceStatus } from "./curriculum";

export type ReferenceType =
  | "PHARMACOPOEIA"
  | "OFFICIAL_GOVERNMENT"
  | "OFFICIAL_REGULATORY"
  | "PEER_REVIEWED"
  | "ACADEMIC_TEXTBOOK"
  | "EDUCATIONAL_RESOURCE"
  | "EDUCATIONAL_SIMULATION";

/** How the application's content relates to the source. */
export type ReferenceRelationship =
  | "BASED_ON_OFFICIAL_METHOD"
  | "RELATED_TO_PRINCIPLES"
  | "EDUCATIONAL_SUMMARY"
  | "SIMPLIFIED_MODEL"
  | "SIMULATED_CASE";

export const RELATIONSHIP_LABEL: Record<ReferenceRelationship, string> = {
  BASED_ON_OFFICIAL_METHOD: "Based on an official pharmacopoeial method",
  RELATED_TO_PRINCIPLES: "Related to pharmacopoeial principles",
  EDUCATIONAL_SUMMARY: "Educational summary of standard material",
  SIMPLIFIED_MODEL: "Simplified educational model",
  SIMULATED_CASE: "Simulated educational case",
};

export const RELATIONSHIP_NOTE: Record<ReferenceRelationship, string> = {
  BASED_ON_OFFICIAL_METHOD:
    "This content has been verified against an official pharmacopoeial method.",
  RELATED_TO_PRINCIPLES:
    "This content is educationally related to pharmacopoeial principles. It is not based on an official pharmacopoeial method.",
  EDUCATIONAL_SUMMARY:
    "A concise educational summary. No copyrighted text is reproduced.",
  SIMPLIFIED_MODEL:
    "A deliberately simplified educational model of a standard relationship. It is not a substitute for the primary source.",
  SIMULATED_CASE:
    "A fictional educational case. It is not a real patient, pharmacy or record.",
};

/**
 * Source hierarchy, strongest first. Displayed so a student can see at a glance
 * where a source sits — and so the categories are never treated as equivalent.
 */
export const SOURCE_HIERARCHY: ReferenceType[] = [
  "PHARMACOPOEIA",
  "OFFICIAL_GOVERNMENT",
  "OFFICIAL_REGULATORY",
  "PEER_REVIEWED",
  "ACADEMIC_TEXTBOOK",
  "EDUCATIONAL_RESOURCE",
  "EDUCATIONAL_SIMULATION",
];

export const SOURCE_TYPE_LABEL: Record<ReferenceType, string> = {
  PHARMACOPOEIA: "Pharmacopoeia",
  OFFICIAL_GOVERNMENT: "Official government source",
  OFFICIAL_REGULATORY: "Official regulatory source",
  PEER_REVIEWED: "Peer-reviewed literature",
  ACADEMIC_TEXTBOOK: "Academic textbook",
  EDUCATIONAL_RESOURCE: "Educational resource",
  EDUCATIONAL_SIMULATION: "Educational simulation",
};

/**
 * A recorded disagreement between two sources. Conflicts are never silently
 * resolved — they are surfaced and left marked for review. An empty registry
 * simply means no conflict has been recorded yet.
 */
export interface SourceConflict {
  id: string;
  /** What the sources disagree about, in one line. */
  description: string;
  status: "REVIEW_REQUIRED";
  /** Reference ids that disagree. */
  referenceIds: string[];
}

export interface Reference {
  id: string;
  title: string;
  sourceType: ReferenceType;
  publisher?: string;
  edition?: string;
  year?: number;
  /** Only ever a verified URL. Never constructed from memory. */
  url?: string;
  description: string;
  status: SourceStatus;
  verified: boolean;
  relationship: ReferenceRelationship;
  relatedExperiments?: string[];
  relatedSubjects?: string[];
  relatedTopics?: string[];
  relatedSimulations?: string[];
  relatedCurriculum?: boolean;
}

/* ================================================================== *
 * The registry
 * ================================================================== */

export const REFERENCES: Reference[] = [
  {
    id: "ref-ip-2026",
    title: "Indian Pharmacopoeia 2026",
    sourceType: "PHARMACOPOEIA",
    publisher: "Indian Pharmacopoeia Commission",
    edition: "10th edition",
    year: 2026,
    url: "https://ipc.gov.in/mandates/indian-pharmacopoeia/indian-pharmacopoeia-ip-2026.html",
    description:
      "The current official Indian Pharmacopoeia, published by the Indian Pharmacopoeia Commission. Used here only as an attributed source relationship — no monograph text is reproduced.",
    status: "IP_OFFICIAL",
    verified: true,
    relationship: "RELATED_TO_PRINCIPLES",
    relatedExperiments: ["exp-acid-base-titration", "exp-solution-preparation-by-dilution"],
    relatedSubjects: ["y02-pharmaceutical-analysis-i", "y03-pharmaceutical-analysis-ii"],
    relatedTopics: ["y02-pharmaceutical-analysis-i-topic-01"],
    relatedCurriculum: true,
  },
  {
    id: "ref-pci-pharmd",
    title: "Pharmacy Council of India — Pharm.D regulations",
    sourceType: "OFFICIAL_REGULATORY",
    publisher: "Pharmacy Council of India",
    description:
      "The regulatory basis for the Pharm.D programme structure. Subject names, marks, credits and practical lists are not reproduced here because they have not been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedCurriculum: true,
  },
  {
    id: "ref-titration-relation",
    title: "Acid–base equivalence relation",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "The 1:1 stoichiometric equivalence relation used by the titration experiment is standard analytical chemistry. The specific textbook, edition and page have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["exp-acid-base-titration"],
  },
  {
    id: "ref-dilution-relation",
    title: "Conservation of solute on dilution",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "C₁V₁ = C₂V₂ follows from conservation of solute and is standard pharmaceutical calculation material. The specific textbook and edition have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["exp-solution-preparation-by-dilution"],
  },
  {
    id: "ref-pk-one-compartment",
    title: "One-compartment pharmacokinetics",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "C(t), k = CL/V, t½ = 0.693/k and AUC = Dose/CL are standard one-compartment relations. The specific textbook, edition and page have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "SIMPLIFIED_MODEL",
    relatedExperiments: ["exp-one-compartment-pk", "sim-pk-dynamics"],
    relatedSubjects: ["y04-biopharmaceutics-and-pharmacokinetics"],
    relatedTopics: ["y04-biopharmaceutics-and-pharmacokinetics-topic-01"],
  },
  {
    id: "ref-emax-model",
    title: "Emax (Hill) dose–response model",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "E = Emax·C^h/(EC50^h + C^h) and the competitive-antagonist EC50 shift are standard pharmacology. The specific textbook, edition and page have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "SIMPLIFIED_MODEL",
    relatedExperiments: ["sim-dose-response"],
    relatedSubjects: ["y03-pharmacology-i"],
  },
  {
    id: "ref-warfarin-interaction",
    title: "Warfarin–co-trimoxazole interaction",
    sourceType: "PEER_REVIEWED",
    description:
      "The interaction used in the medication-review case is a long-established teaching point in pharmaceutical care. The specific publication, authors and year have not yet been verified, so none are quoted.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["act-medication-review", "sim-clinical-medication-review"],
  },
  {
    id: "ref-pharmaceutical-care",
    title: "Pharmaceutical care and medication review",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "The structure of the medication-review and counselling activities reflects standard pharmaceutical care practice. The specific textbook and edition have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["act-medication-review", "act-counselling"],
    relatedSubjects: ["y04-clinical-pharmacy"],
  },
  {
    id: "ref-drug-information",
    title: "Drug information practice",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "The question → need → source → evaluation → response workflow is standard medicines information practice. The specific textbook and edition have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["act-drug-information"],
  },
  {
    id: "ref-medication-safety",
    title: "Medication safety and duplicate therapy",
    sourceType: "ACADEMIC_TEXTBOOK",
    description:
      "Recognition and prevention of duplicate therapy is standard medication-safety education. The specific textbook and edition have not yet been verified.",
    status: "VERIFICATION_REQUIRED",
    verified: false,
    relationship: "EDUCATIONAL_SUMMARY",
    relatedExperiments: ["act-medication-error"],
  },
  {
    id: "ref-sim-pk",
    title: "Pharmacokinetic simulation model",
    sourceType: "EDUCATIONAL_SIMULATION",
    description:
      "The parameter ranges, the fixed bioavailability of 1 and all displayed values are educational simulation parameters chosen for teaching, not clinical values.",
    status: "EDUCATIONAL_SIMULATION",
    verified: true,
    relationship: "SIMPLIFIED_MODEL",
    relatedExperiments: ["exp-one-compartment-pk", "sim-pk-dynamics"],
  },
  {
    id: "ref-sim-dose-response",
    title: "Dose–response simulation model",
    sourceType: "EDUCATIONAL_SIMULATION",
    description:
      "Parameter ranges are educational simulation values. The receptor display is a conceptual model of occupancy, not a molecular structure.",
    status: "EDUCATIONAL_SIMULATION",
    verified: true,
    relationship: "SIMPLIFIED_MODEL",
    relatedExperiments: ["sim-dose-response"],
  },
  {
    id: "ref-sim-clinical",
    title: "Simulated clinical case",
    sourceType: "EDUCATIONAL_SIMULATION",
    description:
      "The patient, medication chart, laboratory record and outcomes are fictional educational constructs. No real patient data is used and no individualised treatment advice is given.",
    status: "EDUCATIONAL_SIMULATION",
    verified: true,
    relationship: "SIMULATED_CASE",
    relatedExperiments: [
      "act-medication-review",
      "act-counselling",
      "act-drug-information",
      "sim-clinical-medication-review",
    ],
  },
  {
    id: "ref-sim-hospital",
    title: "Simulated hospital pharmacy",
    sourceType: "EDUCATIONAL_SIMULATION",
    description:
      "The inventory, workflow and formulary are fictional educational constructs and do not represent any real hospital system or policy.",
    status: "EDUCATIONAL_SIMULATION",
    verified: true,
    relationship: "SIMULATED_CASE",
    relatedExperiments: ["act-inventory", "act-dispensing", "act-medication-error"],
  },
];

/**
 * CONFLICT REGISTRY
 * Empty by design: no conflict has been verified, so none is manufactured.
 * When a real disagreement is identified it is recorded here and the Evidence
 * Panel renders both sides with a REVIEW_REQUIRED status.
 */
export const SOURCE_CONFLICTS: SourceConflict[] = [];

/** Conflicts that involve a given reference. */
export function conflictsForReference(referenceId: string): SourceConflict[] {
  return SOURCE_CONFLICTS.filter((c) => c.referenceIds.includes(referenceId));
}

/** Conflicts that involve any of the given references. */
export function conflictsForReferences(
  referenceIds: string[]
): SourceConflict[] {
  if (referenceIds.length === 0) return [];
  const set = new Set(referenceIds);
  return SOURCE_CONFLICTS.filter((c) =>
    c.referenceIds.some((id) => set.has(id))
  );
}

/* ------------------------------------------------------------- Lookups */

export function referencesForExperiment(experimentId: string): Reference[] {
  return REFERENCES.filter(
    (r) =>
      r.relatedExperiments?.includes(experimentId) ||
      r.relatedSimulations?.includes(experimentId)
  );
}

export function referencesForSubject(subjectId: string): Reference[] {
  return REFERENCES.filter((r) => r.relatedSubjects?.includes(subjectId));
}

export function curriculumReferences(): Reference[] {
  return REFERENCES.filter((r) => r.relatedCurriculum);
}

export function referencesForTopic(topicId: string): Reference[] {
  return REFERENCES.filter((r) => r.relatedTopics?.includes(topicId));
}

export function referencesForIds(ids: string[]): Reference[] {
  if (ids.length === 0) return [];
  return ids
    .map((id) => REFERENCES.find((r) => r.id === id))
    .filter((r): r is Reference => Boolean(r));
}

export function findReference(id: string): Reference | undefined {
  return REFERENCES.find((r) => r.id === id);
}

/** Filter groups for the Evidence Explorer. */
export const EVIDENCE_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "OFFICIAL", label: "Official" },
  { id: "PHARMACOPOEIA", label: "Pharmacopoeia" },
  { id: "REGULATORY", label: "Regulatory" },
  { id: "PEER_REVIEWED", label: "Peer-reviewed" },
  { id: "ACADEMIC", label: "Academic" },
] as const;

export type EvidenceFilterId = (typeof EVIDENCE_FILTERS)[number]["id"];

export function matchesFilter(ref: Reference, filter: EvidenceFilterId): boolean {
  switch (filter) {
    case "ALL":
      return true;
    case "OFFICIAL":
      return (
        ref.sourceType === "PHARMACOPOEIA" ||
        ref.sourceType === "OFFICIAL_GOVERNMENT" ||
        ref.sourceType === "OFFICIAL_REGULATORY"
      );
    case "PHARMACOPOEIA":
      return ref.sourceType === "PHARMACOPOEIA";
    case "REGULATORY":
      return (
        ref.sourceType === "OFFICIAL_REGULATORY" ||
        ref.sourceType === "OFFICIAL_GOVERNMENT"
      );
    case "PEER_REVIEWED":
      return ref.sourceType === "PEER_REVIEWED";
    case "ACADEMIC":
      return (
        ref.sourceType === "ACADEMIC_TEXTBOOK" ||
        ref.sourceType === "EDUCATIONAL_RESOURCE" ||
        ref.sourceType === "EDUCATIONAL_SIMULATION"
      );
    default:
      return true;
  }
}
