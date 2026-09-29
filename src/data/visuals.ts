/**
 * Visual asset registry
 * ---------------------
 * Images are first-class in Pharma Virtual Lab. Every subject, topic,
 * practical and experiment can reference a visual asset. Assets are
 * purpose-built scientific stills, kept stylistically uniform, and are
 * always paired with an accessible description.
 */
import analysis from "../assets/domains/analysis.jpg";
import pharmaceutics from "../assets/domains/pharmaceutics.jpg";
import pharmacognosy from "../assets/domains/pharmacognosy.jpg";
import microbiology from "../assets/domains/microbiology.jpg";
import pharmacology from "../assets/domains/pharmacology.jpg";
import pharmacokinetics from "../assets/domains/pharmacokinetics.jpg";
import clinicalPharmacy from "../assets/domains/clinical-pharmacy.jpg";
import hospitalPharmacy from "../assets/domains/hospital-pharmacy.jpg";
import clinicalResearch from "../assets/domains/clinical-research.jpg";

export type VisualRole =
  | "image"
  | "thumbnail"
  | "heroVisual"
  | "diagram"
  | "simulationVisual"
  | "animation";

export interface VisualAsset {
  id: string;
  role: VisualRole;
  src: string;
  /** Accessible description — never empty. */
  alt: string;
  caption?: string;
}

const asset = (
  id: string,
  src: string,
  alt: string,
  caption: string,
  role: VisualRole = "image"
): VisualAsset => ({ id, role, src, alt, caption });

/** Visual identity for each learning domain. */
export const DOMAIN_VISUALS: Record<string, VisualAsset> = {
  "Pharmaceutical Analysis": asset(
    "v-analysis",
    analysis,
    "Analytical glassware — a burette, conical flask, volumetric flask and pipette arranged on a pale laboratory bench.",
    "Analytical glassware"
  ),
  Pharmaceutics: asset(
    "v-pharmaceutics",
    pharmaceutics,
    "Formulation equipment — a mortar and pestle with tablets, a capsule and an ointment jar on a pale laboratory bench.",
    "Formulation"
  ),
  Pharmacognosy: asset(
    "v-pharmacognosy",
    pharmacognosy,
    "Botanical study material — dried medicinal leaves and seed pods with a mortar and a microscope slide.",
    "Botanical material"
  ),
  Microbiology: asset(
    "v-microbiology",
    microbiology,
    "Microbiology equipment — petri dishes with agar, an inoculation loop and a compound microscope.",
    "Cultures & microscopy"
  ),
  Pharmacology: asset(
    "v-pharmacology",
    pharmacology,
    "A glass molecular model with tablets and a beaker, representing drug action at the molecular level.",
    "Molecular action"
  ),
  "Biopharmaceutics & Pharmacokinetics": asset(
    "v-pharmacokinetics",
    pharmacokinetics,
    "A rack of test tubes holding a gradient of liquid levels, representing changing drug concentration.",
    "Concentration over time"
  ),
  "Clinical Pharmacy": asset(
    "v-clinical-pharmacy",
    clinicalPharmacy,
    "Clinical items — a stethoscope, medication blister sheet, medicine bottle and patient chart.",
    "Clinical practice"
  ),
  "Hospital Pharmacy": asset(
    "v-hospital-pharmacy",
    hospitalPharmacy,
    "A hospital medication tray holding neat rows of ampoules and vials with dispensing tweezers.",
    "Medication systems"
  ),
  "Clinical Research": asset(
    "v-clinical-research",
    clinicalResearch,
    "A rack of sample vials in two rows with a data collection folder and a pen.",
    "Study workflow"
  ),
};

/** Curriculum subjects resolve to a domain visual through keyword matching. */
const SUBJECT_MATCHERS: { keywords: string[]; visual: VisualAsset }[] = [
  { keywords: ["analysis"], visual: DOMAIN_VISUALS["Pharmaceutical Analysis"] },
  {
    keywords: ["pharmaceutics", "physical pharmacy", "dispensing"],
    visual: DOMAIN_VISUALS["Pharmaceutics"],
  },
  {
    keywords: ["pharmacognosy"],
    visual: DOMAIN_VISUALS["Pharmacognosy"],
  },
  {
    keywords: ["microbiology"],
    visual: DOMAIN_VISUALS["Microbiology"],
  },
  {
    keywords: ["pharmacology", "pharmacotherapeutics"],
    visual: DOMAIN_VISUALS["Pharmacology"],
  },
  {
    keywords: ["pharmacokinetics", "biopharmaceutics"],
    visual: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"],
  },
  {
    keywords: ["clinical pharmacy", "clerkship"],
    visual: DOMAIN_VISUALS["Clinical Pharmacy"],
  },
  {
    keywords: ["hospital pharmacy", "jurisprudence"],
    visual: DOMAIN_VISUALS["Hospital Pharmacy"],
  },
  {
    keywords: ["research", "pharmacoepidemiology", "biostatistics"],
    visual: DOMAIN_VISUALS["Clinical Research"],
  },
  {
    keywords: ["anatomy", "physiology", "pathophysiology"],
    visual: DOMAIN_VISUALS["Pharmacology"],
  },
  {
    keywords: ["biochemistry", "chemistry"],
    visual: DOMAIN_VISUALS["Pharmaceutical Analysis"],
  },
];

const FALLBACK_VISUAL = DOMAIN_VISUALS["Pharmaceutical Analysis"];

/** Resolve a visual for any curriculum subject name. */
export function visualForSubject(subjectName: string): VisualAsset {
  const name = subjectName.toLowerCase();
  for (const matcher of SUBJECT_MATCHERS) {
    if (matcher.keywords.some((k) => name.includes(k))) return matcher.visual;
  }
  return FALLBACK_VISUAL;
}
