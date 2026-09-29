/**
 * EXPERIMENT ENGINE — Type definitions
 * ------------------------------------
 * One reusable architecture powers every virtual experiment. Data is
 * declarative and completely separate from the simulation logic and the UI.
 *
 * EXPERIMENT
 *   ├── metadata      → id, title, domain, subject, status, source
 *   ├── objective     → one concise line
 *   ├── concept       → one concise line
 *   ├── visuals       → visual asset references
 *   ├── apparatus     → bench objects
 *   ├── materials     → bench objects
 *   ├── steps         → progressive procedure
 *   ├── simulation    → objects + interactions
 *   ├── observations  → what gets recorded
 *   ├── calculations  → formulas & inputs
 *   ├── result        → outcome summary
 *   ├── references    → verified sources
 *   └── assessment    → checks & viva (viva expands in a later phase)
 */
import type { DevelopmentStatus, SourceMeta, SourceStatus } from "../data/curriculum";

/* ---------------------------------------------------------------- Stage */

export type ExperimentStageId =
  | "introduction"
  | "prepare"
  | "perform"
  | "observe"
  | "calculate"
  | "interpret"
  | "result"
  | "viva"
  | "assessment";

export const EXPERIMENT_STAGES: {
  id: ExperimentStageId;
  label: string;
  short: string;
}[] = [
  { id: "introduction", label: "Introduction", short: "Intro" },
  { id: "prepare", label: "Prepare", short: "Prepare" },
  { id: "perform", label: "Perform", short: "Perform" },
  { id: "observe", label: "Observe", short: "Observe" },
  { id: "calculate", label: "Calculate", short: "Calc" },
  { id: "interpret", label: "Interpret", short: "Interpret" },
  { id: "result", label: "Result", short: "Result" },
  { id: "viva", label: "Viva", short: "Viva" },
  { id: "assessment", label: "Summary", short: "Summary" },
];

/* --------------------------------------------------------------- Visual */

export type VisualRole =
  | "image"
  | "thumbnail"
  | "heroVisual"
  | "diagram"
  | "simulationVisual"
  | "animation";

export interface VisualRef {
  id: string;
  role: VisualRole;
  /** Resolved asset URL — see src/data/visuals.ts */
  src?: string;
  alt: string;
  caption?: string;
}

/* ---------------------------------------------------------- Bench items */

export type BenchItemKind = "apparatus" | "instrument" | "material" | "sample";

/** Visual form used to render the object with pure CSS. */
export type BenchShape =
  | "burette"
  | "flask"
  | "beaker"
  | "bottle"
  | "vial"
  | "stand"
  | "tray"
  | "loop"
  | "pipette";

export interface BenchItem {
  id: string;
  name: string;
  kind: BenchItemKind;
  /** One-line contextual label shown on hover and selection. */
  note: string;
  shape: BenchShape;
  /** Initial liquid level, 0–100. */
  fill?: number;
  required?: boolean;
}

/* --------------------------------------------------------- Interaction */

export type InteractionType =
  | "select"
  | "adjust"
  | "press"
  | "add"
  | "toggle"
  | "start"
  | "stop";

export interface Interaction {
  id: string;
  type: InteractionType;
  /** Target bench item id. */
  targetId: string;
  /** Short imperative instruction — one line only. */
  label: string;
  hint?: string;
  /** Present on "adjust" interactions. */
  range?: {
    min: number;
    max: number;
    step: number;
    initial: number;
    unit: string;
  };
}

/* ---------------------------------------------------------------- Steps */

export type StepPhase = "prepare" | "perform";

export interface ExperimentStep {
  id: string;
  index: number;
  phase: StepPhase;
  /** Short step title. */
  title: string;
  /** One concise instruction. */
  instruction: string;
  /** Optional, concise rationale revealed only when the learner asks "Why?". */
  why?: string;
  interactions: Interaction[];
  status: DevelopmentStatus;
  source?: SourceMeta;
}

/* ---------------------------------------------------- Observations etc. */

export type ObservationKind =
  | "quantitative"
  | "qualitative"
  | "instrument"
  | "visual";

export interface ObservationDef {
  id: string;
  label: string;
  kind: ObservationKind;
  unit?: string;
  status: DevelopmentStatus;
  note?: string;
}

/** One declarative input field for a calculation. */
export interface CalculationInputDef {
  id: string;
  label: string;
  unit: string;
  /** Observation that feeds this input, if any. */
  fromObservationId?: string;
  defaultValue?: number;
  required?: boolean;
}

export interface CalculationDef {
  id: string;
  label: string;
  /** Maps to a verified implementation in src/engine/calculations.ts */
  formulaKey?: string;
  /** Display form of the formula — never a claim of official status. */
  expression?: string;
  unit?: string;
  inputs: CalculationInputDef[];
  output: { label: string; unit: string; figures?: number };
  status: DevelopmentStatus;
  source?: SourceMeta;
  note?: string;
}

export interface ResultDef {
  id: string;
  status: DevelopmentStatus;
  note?: string;
}

export type ReferenceCategory =
  | "PCI_REGULATORY"
  | "PHARMACOPOEIAL"
  | "ACADEMIC"
  | "PEER_REVIEWED";

export interface ReferenceDef {
  id: string;
  category: ReferenceCategory;
  /** Source status — never presented as verified unless it is. */
  status: SourceStatus;
  note?: string;
}

export type AssessmentType = "multiple-choice" | "short-answer" | "numeric";

export interface AssessmentItem {
  id: string;
  type: AssessmentType;
  /** Question prompt — only from verified content. */
  prompt?: string;
  options?: string[];
  status: DevelopmentStatus;
}

export interface AssessmentDef {
  id: string;
  items: AssessmentItem[];
  status: DevelopmentStatus;
  note?: string;
}

/* ------------------------------------------------------------ Experiment */

/* ----------------------------------------------------- Experiment types */

/** Interaction models the reusable engine can host. */
export type ExperimentType =
  | "TITRATION"
  | "INSTRUMENT_SIMULATION"
  | "MICROSCOPY"
  | "SPECIMEN_IDENTIFICATION"
  | "FORMULATION_WORKFLOW"
  | "DOSAGE_FORM_MANUFACTURING"
  | "BIOLOGICAL_RESPONSE"
  | "PHARMACOKINETIC_SIMULATION"
  | "CLINICAL_CASE"
  | "HOSPITAL_WORKFLOW";

export const EXPERIMENT_TYPE_LABEL: Record<ExperimentType, string> = {
  TITRATION: "Titration",
  INSTRUMENT_SIMULATION: "Instrument simulation",
  MICROSCOPY: "Microscopy",
  SPECIMEN_IDENTIFICATION: "Specimen identification",
  FORMULATION_WORKFLOW: "Formulation workflow",
  DOSAGE_FORM_MANUFACTURING: "Dosage form manufacture",
  BIOLOGICAL_RESPONSE: "Biological response",
  PHARMACOKINETIC_SIMULATION: "Pharmacokinetic simulation",
  CLINICAL_CASE: "Clinical case",
  HOSPITAL_WORKFLOW: "Hospital workflow",
};

/* ------------------------------------------------------- Simulation model */

/** A solution used by a titration, described as a simulation parameter. */
export interface SolutionRole {
  name: string;
  /** mol/L — an educational simulation parameter, never an official value. */
  concentration: number;
  concentrationUnit: string;
  /** Always true until the value is verified against an authoritative source. */
  isSimulationParameter: boolean;
}

/**
 * Acid–base titration model. All quantities are declared as educational
 * simulation parameters; the underlying relation (1:1 stoichiometry at the
 * equivalence point) is standard analytical chemistry.
 */
export interface TitrationModel {
  analyte: SolutionRole;
  titrant: SolutionRole;
  /** mL of analyte transferred into the flask. */
  aliquotVolume: number;
  /** mL already in the flask before the aliquot. */
  flaskStartVolume: number;
  buretteCapacity: number;
  indicator: {
    name: string;
    acidicColour: string;
    basicColour: string;
    note: string;
  };
  /** mL either side of equivalence still counted as the endpoint. */
  endpointWindow: number;
  /** mL delivered by a single drop. */
  dropVolume: number;
}

/**
 * One-compartment pharmacokinetics. The relations are standard textbook
 * pharmacokinetics: C(t) = (Dose/V)e^(-kt) with k = CL/V, t(1/2) = 0.693/k
 * and AUC = Dose/CL. All parameter ranges are educational simulation ranges.
 */
export interface PharmacokineticModel {
  dose: NumericRange;
  volumeOfDistribution: NumericRange;
  clearance: NumericRange;
  referenceConcentration: NumericRange;
  /** Hours to plot. */
  timeMax: number;
  units: {
    dose: string;
    volume: string;
    clearance: string;
    concentration: string;
    time: string;
  };
}

/** A reusable numeric range for a learner-adjustable parameter. */
export interface NumericRange {
  min: number;
  max: number;
  step: number;
  initial: number;
  unit: string;
  label: string;
}

/**
 * Preparing a solution by dilution. The governing relation is the
 * conservation of solute, C1V1 = C2V2.
 */
export interface DilutionModel {
  stockConcentration: number;
  stockConcentrationUnit: string;
  targetConcentration: NumericRange;
  targetVolume: NumericRange;
  /** Graduated volume of the volumetric flask, mL. */
  flaskVolume: number;
}

export type SimulationModel =
  | { kind: "framework" }
  | { kind: "titration"; model: TitrationModel }
  | { kind: "pharmacokinetics"; model: PharmacokineticModel }
  | { kind: "dilution"; model: DilutionModel }
  | { kind: "doseResponse" }
  | { kind: "pkDynamics" }
  | { kind: "clinicalCase" }
  | { kind: "clinicalActivity" };

/* -------------------------------------------------------------- Experiment */

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  domain: string;
  subjectId: string;
  yearNumber: number;
  objective: string;
  concept: string;
  status: DevelopmentStatus;
  apparatus: BenchItem[];
  materials: BenchItem[];
  steps: ExperimentStep[];
  observations: ObservationDef[];
  calculations: CalculationDef[];
  result: ResultDef;
  references: ReferenceDef[];
  assessment: AssessmentDef;
  visuals: VisualRef[];
  /** Which simulation model drives this experiment. */
  simulation: SimulationModel;
  /** Which laboratory theme this experiment is staged in. */
  themeId?: string;
  /** Which interaction model this experiment uses. */
  type: ExperimentType;
  /** Whether this is a bench experiment or an advanced simulation. */
  category: "EXPERIMENT" | "SIMULATION";
  /** One-line description used on library cards. */
  shortDescription: string;
  /** How the learner interacts, in three words or fewer. */
  interactionLabel: string;
  source: SourceMeta;
}
