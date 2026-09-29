/**
 * PHARMA VIRTUAL LAB — Curriculum & learning data model
 * -----------------------------------------------------
 * Hierarchy
 *   Curriculum → Year → Subject → Topic → Practical → Learning Module
 *                                                     ↘ Experiment Reference
 *
 * SOURCE POLICY
 * Records reflect the publicly documented structure of the PCI Pharm.D
 * programme. Until each record has been checked against the official
 * PCI Pharm.D Regulations it carries sourceStatus "VERIFICATION_REQUIRED"
 * and must not be presented as official. Marks, credits, subject codes,
 * topic outlines, practical lists, examination structure and internship
 * requirements are NEVER fabricated — absent fields stay absent.
 *
 * Topics and modules below are STRUCTURAL SCAFFOLDING: they exist so the
 * learning environment can be built and navigated, and every one is
 * labelled as pending source verification. No educational content is
 * invented to fill the interface.
 */

export type SourceStatus =
  | "IP_OFFICIAL"
  | "IP_RELATED"
  | "HISTORICAL_IP"
  | "OFFICIAL_GOVERNMENT"
  | "OFFICIAL_REGULATORY"
  | "PEER_REVIEWED"
  | "ACADEMIC_REFERENCE"
  | "NON_IP_EDUCATIONAL"
  | "EDUCATIONAL_SIMULATION"
  | "VERIFICATION_REQUIRED";

export interface SourceMeta {
  status: SourceStatus;
  /** What the record was verified against — only set once actually verified. */
  verifiedAgainst?: string;
  verifiedAt?: string;
  note?: string;
}

/** Development state of a learning entity (build status, not scientific validity). */
export type DevelopmentStatus =
  | "PLANNED"
  | "IN_DEVELOPMENT"
  | "AVAILABLE"
  | "VERIFIED";

export const DEVELOPMENT_STATUS_INFO: Record<DevelopmentStatus, string> = {
  PLANNED: "Designed, but not yet built.",
  IN_DEVELOPMENT: "Being built right now.",
  AVAILABLE: "Usable inside the application today.",
  VERIFIED: "Content checked against an authoritative source.",
};

/** The nine reusable learning-module types every topic may expose. */
export const LEARNING_MODULE_TYPES = [
  "INTRODUCTION",
  "CONCEPT",
  "VISUALIZATION",
  "INTERACTION",
  "PRACTICAL",
  "OBSERVATION",
  "CALCULATION",
  "INTERPRETATION",
  "ASSESSMENT",
] as const;

export type LearningModuleType = (typeof LEARNING_MODULE_TYPES)[number];

/** What each module type is for — describes the UI, makes no scientific claim. */
export const MODULE_PURPOSE: Record<LearningModuleType, string> = {
  INTRODUCTION: "Orient the learner before the detail begins.",
  CONCEPT: "Establish the underlying principle.",
  VISUALIZATION: "See the structure, process or mechanism.",
  INTERACTION: "Act directly on the system being studied.",
  PRACTICAL: "Connect the concept to a bench procedure.",
  OBSERVATION: "Record exactly what changes, and when.",
  CALCULATION: "Work through the mathematics of the result.",
  INTERPRETATION: "Read the data and draw a conclusion.",
  ASSESSMENT: "Check that the understanding holds.",
};

export interface ExperimentReference {
  id: string;
  title: string;
  source?: SourceMeta;
}

export interface Practical {
  id: string;
  title: string;
  /** Topic this practical belongs to — set once topics are verified. */
  topicId?: string;
  status: DevelopmentStatus;
  experimentRefs: ExperimentReference[];
  source?: SourceMeta;
}

export interface LearningModule {
  id: string;
  type: LearningModuleType;
  title: string;
  topicId: string;
  /** Present when this module is attached to a practical. */
  practicalId?: string;
  /** Reserved for PHASE 6 — the reusable Experiment Engine. */
  experimentRefId?: string;
  status: DevelopmentStatus;
  /** Verified description only — never fabricated. */
  description?: string;
  source?: SourceMeta;
}

export interface Topic {
  id: string;
  index: number;
  title: string;
  description?: string;
  status: DevelopmentStatus;
  modules: LearningModule[];
  practicalIds: string[];
  source?: SourceMeta;
}

export interface Subject {
  id: string;
  name: string;
  /** Short, neutral description — pending source verification. */
  description?: string;
  status: DevelopmentStatus;
  topics: Topic[];
  /** Populated in a later phase — never fabricated. */
  practicals: Practical[];
  /** Only set when actually known — never fabricated. */
  topicCount?: number;
  source: SourceMeta;
}

export interface ExperienceRow {
  id: string;
  label: string;
  state: string;
}

export interface CurriculumYear {
  id: string;
  number: number;
  label: string;
  focus: string;
  subjects: Subject[];
  experiences: ExperienceRow[];
  isInternshipYear?: boolean;
}

export interface Curriculum {
  programme: string;
  sourceNote: string;
  years: CurriculumYear[];
}

/** Marker for records pending verification against the official regulations. */
const vReq = (): SourceMeta => ({
  status: "VERIFICATION_REQUIRED",
  note: "Pending verification against the official PCI Pharm.D Regulations.",
});

const MODULE_TITLE: Record<LearningModuleType, string> = {
  INTRODUCTION: "Introduction",
  CONCEPT: "Concept",
  VISUALIZATION: "Visualization",
  INTERACTION: "Interaction",
  PRACTICAL: "Practical",
  OBSERVATION: "Observation",
  CALCULATION: "Calculation",
  INTERPRETATION: "Interpretation",
  ASSESSMENT: "Assessment",
};

/**
 * Structural topic scaffolding. Titles are positional ("Topic 01") on
 * purpose — real outlines are only written once a source is verified.
 */
const scaffoldTopics = (subjectId: string, count = 4): Topic[] =>
  Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    const id = `${subjectId}-topic-${String(index).padStart(2, "0")}`;
    return {
      id,
      index,
      title: `Topic ${String(index).padStart(2, "0")}`,
      description: "Topic outline being mapped from verified sources.",
      status: "PLANNED",
      modules: LEARNING_MODULE_TYPES.map((type) => ({
        id: `${id}-${type.toLowerCase()}`,
        type,
        title: MODULE_TITLE[type],
        topicId: id,
        status: "IN_DEVELOPMENT" as DevelopmentStatus,
        source: vReq(),
      })),
      practicalIds: [],
      source: vReq(),
    };
  });

const subject = (id: string, name: string, description: string): Subject => ({
  id,
  name,
  description,
  status: "IN_DEVELOPMENT",
  topics: scaffoldTopics(id),
  practicals: [],
  source: vReq(),
});

export const SOURCE_STATUS_INFO: Record<SourceStatus, string> = {
  IP_OFFICIAL:
    "Current official compendial standard — e.g., the Indian Pharmacopoeia.",
  IP_RELATED:
    "Official compendial addenda, supplements and closely related references.",
  HISTORICAL_IP:
    "Historical editions of official compendial standards — archived reference.",
  NON_IP_EDUCATIONAL:
    "Reputable educational sources outside official compendia.",
  VERIFICATION_REQUIRED: "Recorded, but not yet verified against a source.",
  EDUCATIONAL_SIMULATION: "A simulated educational scenario, not a verified source.",
  OFFICIAL_GOVERNMENT: "An official government source.",
  OFFICIAL_REGULATORY: "An official regulatory source.",
  PEER_REVIEWED: "Peer-reviewed literature.",
  ACADEMIC_REFERENCE: "An academic reference work.",
};

/* ------------------------------------------------------------------ *
 * Routing helpers — /curriculum/[year]/[subject]
 * ------------------------------------------------------------------ */

export interface SubjectRouteMatch {
  year: CurriculumYear;
  subject: Subject;
}

/** "y01-human-anatomy-and-physiology" → "human-anatomy-and-physiology" */
export function subjectSlug(subject: Subject): string {
  return subject.id.replace(/^y\d+-/, "");
}

export function subjectPath(
  year: CurriculumYear,
  subject: Subject
): string {
  return `/curriculum/${String(year.number).padStart(2, "0")}/${subjectSlug(
    subject
  )}`;
}

/** Resolve a route path to a year + subject pair, or null when unknown. */
export function resolveSubject(path: string): SubjectRouteMatch | null {
  const [root, yearSegment, slug] = path.split("/").filter(Boolean);
  if (root !== "curriculum" || !yearSegment || !slug) return null;
  const yearNumber = Number.parseInt(yearSegment, 10);
  if (!Number.isInteger(yearNumber)) return null;
  const year = CURRICULUM.years.find((y) => y.number === yearNumber);
  if (!year) return null;
  const subject = year.subjects.find((s) => subjectSlug(s) === slug);
  return subject ? { year, subject } : null;
}

export const CURRICULUM: Curriculum = {
  programme: "Pharm.D",
  sourceNote:
    "Curriculum information is being mapped from authoritative Pharm.D regulatory and academic sources. Individual learning content and experiment references are verified separately.",
  years: [
    {
      id: "year-01",
      number: 1,
      label: "Year 01",
      focus: "Foundations of pharmaceutical science",
      subjects: [
        subject(
          "y01-human-anatomy-and-physiology",
          "Human Anatomy and Physiology",
          "The structure and function of the human body — the foundation for understanding drug action."
        ),
        subject(
          "y01-pharmaceutics",
          "Pharmaceutics",
          "The science of dosage form design and preparation."
        ),
        subject(
          "y01-medicinal-biochemistry",
          "Medicinal Biochemistry",
          "The biochemical basis of health and disease."
        ),
        subject(
          "y01-pharmaceutical-organic-chemistry",
          "Pharmaceutical Organic Chemistry",
          "Structure, nomenclature and reactions of medicinal organic compounds."
        ),
        subject(
          "y01-pharmaceutical-inorganic-chemistry",
          "Pharmaceutical Inorganic Chemistry",
          "Inorganic compounds of pharmaceutical significance."
        ),
        subject(
          "y01-remedial-mathematics-biology",
          "Remedial Mathematics / Biology",
          "Foundational mathematics and biology for pharmaceutical study."
        ),
        subject(
          "y01-communication-skills",
          "Communication Skills",
          "Professional and patient-facing communication."
        ),
      ],
      experiences: [
        {
          id: "y01-practicals",
          label: "Practical / experiential learning",
          state: "Practical experience being digitized.",
        },
      ],
    },
    {
      id: "year-02",
      number: 2,
      label: "Year 02",
      focus: "Core pharmacy science takes shape",
      subjects: [
        subject(
          "y02-pathophysiology",
          "Pathophysiology",
          "How disease alters normal body function."
        ),
        subject(
          "y02-pharmaceutical-microbiology",
          "Pharmaceutical Microbiology",
          "Microorganisms in disease, sterility and pharmaceutical manufacture."
        ),
        subject(
          "y02-pharmaceutical-engineering",
          "Pharmaceutical Engineering",
          "Engineering principles behind pharmaceutical processes."
        ),
        subject(
          "y02-physical-pharmacy",
          "Physical Pharmacy",
          "The physical principles that govern dosage form behaviour."
        ),
        subject(
          "y02-dispensing-pharmacy",
          "Dispensing Pharmacy",
          "The preparation and dispensing of medicines."
        ),
        subject(
          "y02-pharmaceutical-analysis-i",
          "Pharmaceutical Analysis I",
          "Classical and instrumental methods of pharmaceutical assay."
        ),
      ],
      experiences: [
        {
          id: "y02-practicals",
          label: "Practical / experiential learning",
          state: "Practical experience being digitized.",
        },
      ],
    },
    {
      id: "year-03",
      number: 3,
      label: "Year 03",
      focus: "From science to therapy",
      subjects: [
        subject(
          "y03-pharmacology-i",
          "Pharmacology I",
          "How drugs act on the body — foundations."
        ),
        subject(
          "y03-pharmacotherapeutics-i",
          "Pharmacotherapeutics I",
          "Drug therapy for specific disease states."
        ),
        subject(
          "y03-pharmaceutical-analysis-ii",
          "Pharmaceutical Analysis II",
          "Advanced instrumental analysis of pharmaceuticals."
        ),
        subject(
          "y03-pharmaceutics-ii",
          "Pharmaceutics II",
          "Dosage form design and formulation science."
        ),
        subject(
          "y03-community-pharmacy",
          "Community Pharmacy",
          "Pharmacy practice in the community setting."
        ),
      ],
      experiences: [
        {
          id: "y03-practicals",
          label: "Practical / experiential learning",
          state: "Practical experience being digitized.",
        },
      ],
    },
    {
      id: "year-04",
      number: 4,
      label: "Year 04",
      focus: "Clinical and hospital practice",
      subjects: [
        subject(
          "y04-pharmacology-ii",
          "Pharmacology II",
          "Drug action, interactions and adverse effects — advanced study."
        ),
        subject(
          "y04-pharmacotherapeutics-ii",
          "Pharmacotherapeutics II",
          "Evidence-based therapy across organ systems."
        ),
        subject(
          "y04-hospital-pharmacy",
          "Hospital Pharmacy",
          "Medicine management within the hospital."
        ),
        subject(
          "y04-clinical-pharmacy",
          "Clinical Pharmacy",
          "Pharmacist-led care at the patient's side."
        ),
        subject(
          "y04-pharmaceutical-jurisprudence",
          "Pharmaceutical Jurisprudence",
          "The laws and regulations governing pharmacy."
        ),
        subject(
          "y04-biostatistics-and-research-methodology",
          "Biostatistics and Research Methodology",
          "Statistics and method for pharmaceutical research."
        ),
        subject(
          "y04-biopharmaceutics-and-pharmacokinetics",
          "Biopharmaceutics and Pharmacokinetics",
          "What the body does to a drug — absorption, distribution, metabolism, excretion."
        ),
      ],
      experiences: [
        {
          id: "y04-practicals",
          label: "Practical / experiential learning",
          state: "Practical experience being digitized.",
        },
        {
          id: "y04-clinical-exposure",
          label: "Clinical exposure",
          state: "Clinical learning being structured.",
        },
      ],
    },
    {
      id: "year-05",
      number: 5,
      label: "Year 05",
      focus: "Advanced clinical study and research",
      subjects: [
        subject(
          "y05-pharmacotherapeutics-iii",
          "Pharmacotherapeutics III",
          "Therapy for complex and multisystem conditions."
        ),
        subject(
          "y05-clinical-research",
          "Clinical Research",
          "The design and conduct of clinical trials."
        ),
        subject(
          "y05-pharmacoepidemiology",
          "Pharmacoepidemiology",
          "Drug effects at the population level."
        ),
        subject(
          "y05-clinical-pharmacokinetics",
          "Clinical Pharmacokinetics",
          "Dosing guided by kinetic principles."
        ),
        subject(
          "y05-clerkship",
          "Clerkship",
          "Structured clinical rotations — learning by participation."
        ),
        subject(
          "y05-project-work",
          "Project Work",
          "A supervised research project."
        ),
      ],
      experiences: [
        {
          id: "y05-practicals",
          label: "Practical / experiential learning",
          state: "Practical experience being digitized.",
        },
        {
          id: "y05-clinical-exposure",
          label: "Clinical exposure",
          state: "Clinical learning being structured.",
        },
        {
          id: "y05-project",
          label: "Project / clerkship",
          state: "Project framework being mapped.",
        },
      ],
    },
    {
      id: "year-06",
      number: 6,
      label: "Year 06",
      focus: "Internship and residency",
      subjects: [],
      experiences: [],
      isInternshipYear: true,
    },
  ],
};
