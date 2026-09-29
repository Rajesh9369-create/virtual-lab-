/**
 * EXPERIMENT REGISTRY
 * -------------------
 * Every virtual experiment is declared here as data and rendered by the one
 * reusable engine. Adding an experiment never requires new UI.
 *
 * ACID–BASE TITRATION is the first complete experiment. The underlying
 * chemistry is standard: for a 1:1 acid–base reaction the moles of titrant
 * equal the moles of analyte at the equivalence point. All concentrations,
 * volumes and apparatus specifics are declared as EDUCATIONAL SIMULATION
 * PARAMETERS — they are not claimed as an official procedure, and no
 * pharmacopoeial status is asserted.
 */
import type { DevelopmentStatus, SourceMeta } from "./curriculum";
import type { ExperimentType } from "../engine/types";
import type { VisualAsset } from "./visuals";
import { DOMAIN_VISUALS } from "./visuals";
import {
  CLINICAL_SIMULATION,
  DOSE_RESPONSE_SIMULATION,
  PK_DYNAMICS_SIMULATION,
} from "./simulations";
import {
  COUNSELLING_EXPERIMENT,
  DISPENSING_EXPERIMENT,
  DRUG_INFORMATION_EXPERIMENT,
  INVENTORY_EXPERIMENT,
  MEDICATION_ERROR_EXPERIMENT,
  MEDICATION_REVIEW_EXPERIMENT,
} from "./clinicalActivities";
import type { Experiment } from "../engine/types";

const vReq = (note?: string): SourceMeta => ({
  status: "VERIFICATION_REQUIRED",
  note: note ?? "Pending verification against an authoritative source.",
});

const analysisVisual = DOMAIN_VISUALS["Pharmaceutical Analysis"];

/** Concentrations and volumes below are simulation parameters, not official. */
const SIM_PARAM_NOTE =
  "Educational simulation parameter — not an official or pharmacopoeial value.";

export const TITRATION_EXPERIMENT: Experiment = {
  id: "exp-acid-base-titration",
  slug: "acid-base-titration",
  title: "Acid–Base Titration",
  domain: "Pharmaceutical Analysis",
  subjectId: "y02-pharmaceutical-analysis-i",
  yearNumber: 2,
  objective:
    "Find the concentration of the acid in the flask by titrating it against a base of known concentration.",
  concept:
    "For a 1:1 acid–base reaction, the moles of titrant equal the moles of analyte at the equivalence point.",
  status: "AVAILABLE",
  source: {
    status: "VERIFICATION_REQUIRED",
    note: "Standard educational acid–base titration. Procedure specifics, concentrations and apparatus details are educational simulation parameters pending verification. No pharmacopoeial status is claimed.",
  },

  themeId: "analytical-lab",
  type: "TITRATION",
  category: "EXPERIMENT",
  shortDescription:
    "Deliver base from a burette into an acid aliquot and find the equivalence point.",
  interactionLabel: "Glassware",
  simulation: {
    kind: "titration",
    model: {
      analyte: {
        name: "Acid solution",
        concentration: 0.1,
        concentrationUnit: "mol/L",
        isSimulationParameter: true,
      },
      titrant: {
        name: "Base solution",
        concentration: 0.1,
        concentrationUnit: "mol/L",
        isSimulationParameter: true,
      },
      aliquotVolume: 10,
      flaskStartVolume: 0,
      buretteCapacity: 50,
      indicator: {
        name: "Phenolphthalein",
        acidicColour: "#E4ECEE",
        basicColour: "#D96BA0",
        note: "Colourless in acidic solution, pink in basic solution.",
      },
      endpointWindow: 0.1,
      dropVolume: 0.05,
    },
  },

  apparatus: [
    {
      id: "app-burette",
      name: "Burette",
      kind: "apparatus",
      note: "50 mL, graduated",
      shape: "burette",
      fill: 0,
      required: true,
    },
    {
      id: "app-stand",
      name: "Burette stand",
      kind: "apparatus",
      note: "Holds the burette vertically",
      shape: "stand",
      required: true,
    },
    {
      id: "app-flask",
      name: "Conical flask",
      kind: "apparatus",
      note: "Titration vessel",
      shape: "flask",
      fill: 0,
      required: true,
    },
    {
      id: "app-pipette",
      name: "Pipette",
      kind: "apparatus",
      note: "Measures the acid aliquot",
      shape: "pipette",
      required: true,
    },
  ],
  materials: [
    {
      id: "mat-base",
      name: "Base solution",
      kind: "material",
      note: "Titrant — known concentration",
      shape: "bottle",
      fill: 70,
      required: true,
    },
    {
      id: "mat-acid",
      name: "Acid solution",
      kind: "sample",
      note: "Analyte — concentration unknown",
      shape: "vial",
      fill: 50,
      required: true,
    },
    {
      id: "mat-indicator",
      name: "Phenolphthalein",
      kind: "material",
      note: "Acid–base indicator",
      shape: "vial",
      fill: 30,
      required: true,
    },
    {
      id: "mat-water",
      name: "Distilled water",
      kind: "material",
      note: "Rinsing",
      shape: "bottle",
      fill: 60,
    },
  ],

  steps: [
    /* ---------------- PREPARE ---------------- */
    {
      id: "tit-step-01",
      index: 0,
      phase: "prepare",
      title: "Set out the apparatus",
      instruction: "Pick up the burette, stand, conical flask and pipette from the bench.",
      why: "Each piece does one job: the burette measures delivered volume, the flask holds the reaction, the pipette measures the aliquot.",
      interactions: [
        { id: "tit-sel-burette", type: "select", targetId: "app-burette", label: "Select the burette" },
        { id: "tit-sel-stand", type: "select", targetId: "app-stand", label: "Select the stand" },
        { id: "tit-sel-flask", type: "select", targetId: "app-flask", label: "Select the conical flask" },
        { id: "tit-sel-pipette", type: "select", targetId: "app-pipette", label: "Select the pipette" },
      ],
      status: "AVAILABLE",
      source: vReq(),
    },
    {
      id: "tit-step-02",
      index: 1,
      phase: "prepare",
      title: "Check the reagents",
      instruction: "Confirm the base solution, the acid solution and the indicator.",
      why: "The titrant concentration is known; the analyte concentration is what you are finding. The indicator only signals when the reaction is complete.",
      interactions: [
        { id: "tit-sel-base", type: "select", targetId: "mat-base", label: "Confirm the base solution" },
        { id: "tit-sel-acid", type: "select", targetId: "mat-acid", label: "Confirm the acid solution" },
        { id: "tit-sel-indicator", type: "select", targetId: "mat-indicator", label: "Confirm the indicator" },
      ],
      status: "AVAILABLE",
      source: vReq(),
    },

    /* ---------------- PERFORM ---------------- */
    {
      id: "tit-step-03",
      index: 2,
      phase: "perform",
      title: "Fill the burette",
      instruction: "Fill the burette with the base solution up to the 0.00 mL mark.",
      why: "A burette is read downwards from the zero mark, so it is filled to zero before any liquid is delivered.",
      interactions: [
        { id: "tit-fill-burette", type: "press", targetId: "app-burette", label: "Fill the burette to 0.00 mL" },
      ],
      status: "AVAILABLE",
      source: vReq(SIM_PARAM_NOTE),
    },
    {
      id: "tit-step-04",
      index: 3,
      phase: "perform",
      title: "Record the initial reading",
      instruction: "Read the burette at the meniscus, then write the initial reading into the data sheet.",
      why: "Every delivered volume is a difference between two readings — without the first one there is nothing to subtract from.",
      interactions: [
        { id: "tit-record-initial", type: "press", targetId: "app-burette", label: "Record the initial reading", hint: "Tap the burette, or use the Record button in the Next action panel." },
      ],
      status: "AVAILABLE",
      source: vReq(),
    },
    {
      id: "tit-step-05",
      index: 4,
      phase: "perform",
      title: "Add the acid aliquot",
      instruction: "Pipette the acid solution into the conical flask.",
      why: "A fixed, measured portion is what makes the concentration calculable afterwards.",
      interactions: [
        { id: "tit-aliquot", type: "press", targetId: "app-pipette", label: "Pipette 10.00 mL of acid into the flask" },
      ],
      status: "AVAILABLE",
      source: vReq(SIM_PARAM_NOTE),
    },
    {
      id: "tit-step-06",
      index: 5,
      phase: "perform",
      title: "Add the indicator",
      instruction: "Add a few drops of phenolphthalein to the flask.",
      why: "The indicator changes colour at the equivalence point, which is the only visible sign that the reaction is complete.",
      interactions: [
        { id: "tit-indicator", type: "add", targetId: "mat-indicator", label: "Add indicator" },
      ],
      status: "AVAILABLE",
      source: vReq(),
    },
    {
      id: "tit-step-07",
      index: 6,
      phase: "perform",
      title: "Titrate to the endpoint",
      instruction:
        "Run the base into the flask and stop at the first permanent pink colour.",
      why: "Near the equivalence point a single drop changes the colour, so the addition is slowed to avoid passing the endpoint.",
      interactions: [
        {
          id: "tit-titrate",
          type: "adjust",
          targetId: "app-burette",
          label: "Volume of base delivered",
          range: { min: 0, max: 25, step: 0.05, initial: 0, unit: "mL" },
        },
      ],
      status: "AVAILABLE",
      source: vReq(SIM_PARAM_NOTE),
    },
    {
      id: "tit-step-08",
      index: 7,
      phase: "perform",
      title: "Record the final reading",
      instruction: "Read the burette at the meniscus, then write the final reading into the data sheet.",
      why: "The final reading completes the delivered volume, which is the value the calculation depends on.",
      interactions: [
        { id: "tit-record-final", type: "press", targetId: "app-burette", label: "Record the final reading", hint: "Tap the burette, or use the Record button in the Next action panel." },
      ],
      status: "AVAILABLE",
      source: vReq(),
    },
  ],

  observations: [
    { id: "obs-initial-reading", label: "Initial burette reading", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-aliquot", label: "Volume of acid aliquot", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-final-reading", label: "Final burette reading", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-volume-used", label: "Volume of titrant used", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-colour", label: "Colour at endpoint", kind: "qualitative", status: "AVAILABLE" },
  ],

  calculations: [
    {
      id: "calc-acid-molarity",
      label: "Concentration of the acid solution",
      formulaKey: "titration-analyte-molarity",
      expression: "M(acid) = M(base) × V(base) ÷ V(acid)",
      inputs: [
        {
          id: "in-titrant-concentration",
          label: "Base concentration",
          unit: "mol/L",
          defaultValue: 0.1,
          required: true,
        },
        {
          id: "in-titrant-volume",
          label: "Volume of base used",
          unit: "mL",
          fromObservationId: "obs-volume-used",
          required: true,
        },
        {
          id: "in-analyte-volume",
          label: "Volume of acid aliquot",
          unit: "mL",
          fromObservationId: "obs-aliquot",
          required: true,
        },
      ],
      output: { label: "Acid concentration", unit: "mol/L", figures: 4 },
      status: "AVAILABLE",
      source: {
        status: "NON_IP_EDUCATIONAL",
        note: "Standard stoichiometric equivalence relation for a 1:1 acid–base reaction.",
      },
    },
  ],

  result: { id: "res-titration", status: "AVAILABLE" },

  references: [
    { id: "ref-pci", category: "PCI_REGULATORY", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
    { id: "ref-pharmacopoeial", category: "PHARMACOPOEIAL", status: "VERIFICATION_REQUIRED", note: "No monograph is cited until verified." },
    { id: "ref-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
    { id: "ref-peer", category: "PEER_REVIEWED", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],

  assessment: {
    id: "assess-titration",
    items: [
      { id: "assess-1", type: "multiple-choice", status: "PLANNED" },
      { id: "assess-2", type: "numeric", status: "PLANNED" },
      { id: "assess-3", type: "short-answer", status: "PLANNED" },
    ],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },

  visuals: [
    {
      id: "vis-titration-hero",
      role: "heroVisual",
      src: analysisVisual.src,
      alt: analysisVisual.alt,
      caption: analysisVisual.caption,
    },
    {
      id: "vis-titration-bench",
      role: "simulationVisual",
      alt: "Interactive titration bench with a burette above a conical flask",
      caption: "Titration bench",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Phase 6 engine demonstration — retained to prove the framework.
 * ------------------------------------------------------------------ */

const ENGINE_DEMO_STATUS: DevelopmentStatus = "IN_DEVELOPMENT";

export const FRAMEWORK_EXPERIMENT: Experiment = {
  id: "exp-framework-preview",
  slug: "framework-preview",
  title: "Experiment Framework",
  domain: "Pharmaceutical Analysis",
  subjectId: "y02-pharmaceutical-analysis-i",
  yearNumber: 2,
  objective:
    "See how a virtual experiment is structured — the eight stages every experiment follows.",
  concept:
    "One reusable engine, applied to any practical across the Pharm.D curriculum.",
  status: ENGINE_DEMO_STATUS,
  type: "INSTRUMENT_SIMULATION",
  category: "EXPERIMENT",
  shortDescription:
    "The reusable engine demonstration — how every experiment is structured.",
  interactionLabel: "Engine demo",
  simulation: { kind: "framework" },
  source: {
    status: "VERIFICATION_REQUIRED",
    note: "Engine demonstration. Not a scientific experiment and not verified content.",
  },

  apparatus: [
    { id: "app-burette", name: "Burette", kind: "apparatus", note: "Graduated glass column", shape: "burette", fill: 88, required: true },
    { id: "app-flask", name: "Conical flask", kind: "apparatus", note: "Reaction vessel", shape: "flask", fill: 12, required: true },
    { id: "app-stand", name: "Burette stand", kind: "apparatus", note: "Supports the burette", shape: "stand", required: true },
    { id: "app-tray", name: "Bench tray", kind: "apparatus", note: "Holds small items", shape: "tray" },
  ],
  materials: [
    { id: "mat-reagent", name: "Reagent", kind: "material", note: "Identity pending verification", shape: "vial", fill: 60, required: true },
    { id: "mat-sample", name: "Sample", kind: "sample", note: "Identity pending verification", shape: "vial", fill: 40, required: true },
  ],

  steps: [
    {
      id: "step-01", index: 0, phase: "prepare",
      title: "Interaction — Select",
      instruction: "Select each object on the bench.",
      interactions: [
        { id: "int-select-burette", type: "select", targetId: "app-burette", label: "Select the burette" },
        { id: "int-select-flask", type: "select", targetId: "app-flask", label: "Select the conical flask" },
        { id: "int-select-stand", type: "select", targetId: "app-stand", label: "Select the stand" },
      ],
      status: ENGINE_DEMO_STATUS, source: vReq(),
    },
    {
      id: "step-02", index: 1, phase: "prepare",
      title: "Interaction — Confirm",
      instruction: "Confirm the materials you will work with.",
      interactions: [
        { id: "int-select-reagent", type: "select", targetId: "mat-reagent", label: "Confirm the reagent", hint: "Identity is not shown until verified." },
        { id: "int-select-sample", type: "select", targetId: "mat-sample", label: "Confirm the sample" },
      ],
      status: ENGINE_DEMO_STATUS, source: vReq(),
    },
    {
      id: "step-03", index: 2, phase: "perform",
      title: "Interaction — Adjust",
      instruction: "Adjust the parameter and watch the visual respond.",
      interactions: [
        { id: "int-adjust-level", type: "adjust", targetId: "app-burette", label: "Adjust delivery level", range: { min: 0, max: 100, step: 1, initial: 88, unit: "%" } },
      ],
      status: ENGINE_DEMO_STATUS, source: vReq(),
    },
    {
      id: "step-04", index: 3, phase: "perform",
      title: "Interaction — Add",
      instruction: "Add the simulated reagent to the flask.",
      interactions: [{ id: "int-add-reagent", type: "add", targetId: "mat-reagent", label: "Add reagent" }],
      status: ENGINE_DEMO_STATUS, source: vReq(),
    },
    {
      id: "step-05", index: 4, phase: "perform",
      title: "Interaction — Start",
      instruction: "Start the action and observe the visual response.",
      interactions: [{ id: "int-start-action", type: "start", targetId: "app-flask", label: "Start action" }],
      status: ENGINE_DEMO_STATUS, source: vReq(),
    },
  ],

  observations: [
    { id: "obs-level", label: "Delivery level", kind: "quantitative", unit: "%", status: ENGINE_DEMO_STATUS },
    { id: "obs-appearance", label: "Appearance", kind: "qualitative", status: "PLANNED" },
    { id: "obs-instrument", label: "Instrument output", kind: "instrument", status: "PLANNED" },
  ],
  calculations: [
    { id: "calc-primary", label: "Primary calculation", inputs: [], output: { label: "Result", unit: "" }, status: "PLANNED" },
    { id: "calc-secondary", label: "Derived value", inputs: [], output: { label: "Result", unit: "" }, status: "PLANNED" },
  ],
  result: { id: "res-framework", status: "PLANNED" },
  references: [
    { id: "ref-pci", category: "PCI_REGULATORY", status: "VERIFICATION_REQUIRED" },
    { id: "ref-pharmacopoeial", category: "PHARMACOPOEIAL", status: "VERIFICATION_REQUIRED" },
    { id: "ref-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED" },
    { id: "ref-peer", category: "PEER_REVIEWED", status: "VERIFICATION_REQUIRED" },
  ],
  assessment: {
    id: "assess-framework",
    items: [
      { id: "assess-1", type: "multiple-choice", status: "PLANNED" },
      { id: "assess-2", type: "numeric", status: "PLANNED" },
      { id: "assess-3", type: "short-answer", status: "PLANNED" },
    ],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },
  visuals: [
    { id: "vis-analysis", role: "heroVisual", src: analysisVisual.src, alt: analysisVisual.alt, caption: analysisVisual.caption },
    { id: "vis-bench", role: "simulationVisual", alt: "Interactive virtual laboratory bench", caption: "Interactive bench" },
  ],
};


/* ================================================================== *
 * PHARMACOKINETIC SIMULATION
 * Standard one-compartment, first-order elimination after an IV bolus.
 * ================================================================== */

export const PK_EXPERIMENT: Experiment = {
  id: "exp-one-compartment-pk",
  slug: "one-compartment-pharmacokinetics",
  title: "One-Compartment Pharmacokinetics",
  domain: "Biopharmaceutics & Pharmacokinetics",
  subjectId: "y04-biopharmaceutics-and-pharmacokinetics",
  yearNumber: 4,
  type: "PHARMACOKINETIC_SIMULATION",
  category: "EXPERIMENT",
  shortDescription:
    "Move dose, volume and clearance and watch the concentration-time curve reshape.",
  interactionLabel: "Parameters + graph",
  objective:
    "See how dose, volume of distribution and clearance shape the plasma concentration-time profile.",
  concept:
    "After an intravenous bolus, concentration falls exponentially: C(t) = (Dose/V)·e^(−kt), where k = CL/V.",
  status: "AVAILABLE",
  themeId: "kinetics-lab",
  source: {
    status: "NON_IP_EDUCATIONAL",
    note: "Standard one-compartment pharmacokinetics. Parameter ranges are educational simulation ranges and carry no clinical meaning.",
  },

  simulation: {
    kind: "pharmacokinetics",
    model: {
      dose: { min: 50, max: 1000, step: 10, initial: 250, unit: "mg", label: "Dose" },
      volumeOfDistribution: { min: 5, max: 100, step: 1, initial: 25, unit: "L", label: "Volume of distribution" },
      clearance: { min: 1, max: 30, step: 0.5, initial: 6, unit: "L/h", label: "Clearance" },
      referenceConcentration: { min: 0.5, max: 20, step: 0.5, initial: 4, unit: "mg/L", label: "Reference concentration" },
      timeMax: 24,
      units: {
        dose: "mg",
        volume: "L",
        clearance: "L/h",
        concentration: "mg/L",
        time: "h",
      },
    },
  },

  apparatus: [],
  materials: [],

  steps: [
    {
      id: "pk-step-01", index: 0, phase: "prepare",
      title: "Set the dose",
      instruction: "Adjust the dose, then confirm it.",
      why: "Dose sets the starting concentration directly — double the dose, double C0.",
      interactions: [{ id: "pk-confirm-dose", type: "press", targetId: "pk-dose", label: "Confirm the dose" }],
      status: "AVAILABLE",
    },
    {
      id: "pk-step-02", index: 1, phase: "prepare",
      title: "Set the volume of distribution",
      instruction: "Adjust the volume of distribution, then confirm it.",
      why: "A larger volume dilutes the same dose into more space, lowering every concentration.",
      interactions: [{ id: "pk-confirm-volume", type: "press", targetId: "pk-volume", label: "Confirm the volume" }],
      status: "AVAILABLE",
    },
    {
      id: "pk-step-03", index: 2, phase: "prepare",
      title: "Set the clearance",
      instruction: "Adjust the clearance, then confirm it.",
      why: "Clearance is how fast drug leaves the body — it sets both k and the half-life.",
      interactions: [{ id: "pk-confirm-clearance", type: "press", targetId: "pk-clearance", label: "Confirm the clearance" }],
      status: "AVAILABLE",
    },
    {
      id: "pk-step-04", index: 3, phase: "perform",
      title: "Read the initial concentration",
      instruction: "Read C0 from the curve, then record it.",
      why: "C0 = Dose / V is where the curve starts, before any elimination has happened.",
      interactions: [{ id: "pk-record-c0", type: "press", targetId: "pk-c0", label: "Record the initial concentration" }],
      status: "AVAILABLE",
    },
    {
      id: "pk-step-05", index: 4, phase: "perform",
      title: "Read the half-life",
      instruction: "Read the half-life, then record it.",
      why: "Each half-life halves the concentration — that is what makes the curve exponential.",
      interactions: [{ id: "pk-record-half-life", type: "press", targetId: "pk-half-life", label: "Record the half-life" }],
      status: "AVAILABLE",
    },
    {
      id: "pk-step-06", index: 5, phase: "perform",
      title: "Set a reference concentration",
      instruction: "Move the reference line to a concentration of your choosing.",
      why: "A reference line you choose shows how long the profile stays above it. It is not a therapeutic concentration.",
      interactions: [{ id: "pk-confirm-reference", type: "press", targetId: "pk-reference", label: "Confirm the reference line" }],
      status: "AVAILABLE",
    },
  ],

  observations: [
    { id: "obs-pk-dose", label: "Dose", kind: "quantitative", unit: "mg", status: "AVAILABLE" },
    { id: "obs-pk-volume", label: "Volume of distribution", kind: "quantitative", unit: "L", status: "AVAILABLE" },
    { id: "obs-pk-clearance", label: "Clearance", kind: "quantitative", unit: "L/h", status: "AVAILABLE" },
    { id: "obs-pk-c0", label: "Initial concentration", kind: "quantitative", unit: "mg/L", status: "AVAILABLE" },
    { id: "obs-pk-half-life", label: "Half-life", kind: "quantitative", unit: "h", status: "AVAILABLE" },
    { id: "obs-pk-reference", label: "Reference concentration", kind: "quantitative", unit: "mg/L", status: "AVAILABLE" },
  ],

  calculations: [
    {
      id: "calc-pk-auc",
      label: "Area under the curve",
      formulaKey: "pk-auc",
      expression: "AUC = Dose ÷ CL",
      inputs: [
        { id: "in-pk-dose", label: "Dose", unit: "mg", fromObservationId: "obs-pk-dose", required: true },
        { id: "in-pk-clearance", label: "Clearance", unit: "L/h", fromObservationId: "obs-pk-clearance", required: true },
      ],
      output: { label: "AUC", unit: "mg·h/L", figures: 4 },
      status: "AVAILABLE",
      source: { status: "NON_IP_EDUCATIONAL", note: "Standard one-compartment pharmacokinetics." },
    },
    {
      id: "calc-pk-half-life",
      label: "Half-life",
      formulaKey: "pk-half-life",
      expression: "t½ = 0.693 × V ÷ CL",
      inputs: [
        { id: "in-pk-volume", label: "Volume of distribution", unit: "L", fromObservationId: "obs-pk-volume", required: true },
        { id: "in-pk-clearance", label: "Clearance", unit: "L/h", fromObservationId: "obs-pk-clearance", required: true },
      ],
      output: { label: "Half-life", unit: "h", figures: 4 },
      status: "AVAILABLE",
      source: { status: "NON_IP_EDUCATIONAL", note: "Standard one-compartment pharmacokinetics." },
    },
  ],

  result: { id: "res-pk", status: "AVAILABLE" },

  references: [
    { id: "ref-pk-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
    { id: "ref-pk-peer", category: "PEER_REVIEWED", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],

  assessment: {
    id: "assess-pk",
    items: [
      { id: "assess-pk-1", type: "multiple-choice", status: "PLANNED" },
      { id: "assess-pk-2", type: "numeric", status: "PLANNED" },
    ],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },

  visuals: [
    {
      id: "vis-pk-hero",
      role: "heroVisual",
      src: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].src,
      alt: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].alt,
      caption: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].caption,
    },
  ],
};

/* ================================================================== *
 * FORMULATION WORKFLOW — preparing a solution by dilution.
 * ================================================================== */

export const DILUTION_EXPERIMENT: Experiment = {
  id: "exp-solution-preparation-dilution",
  slug: "solution-preparation-by-dilution",
  title: "Preparing a Solution by Dilution",
  domain: "Pharmaceutics",
  subjectId: "y01-pharmaceutics",
  yearNumber: 1,
  type: "FORMULATION_WORKFLOW",
  category: "EXPERIMENT",
  shortDescription:
    "Work out how much stock to transfer, then prepare the final volume.",
  interactionLabel: "Sequential workflow",
  objective:
    "Prepare a required volume of a required concentration from a more concentrated stock solution.",
  concept:
    "Dilution moves solute but never changes it, so the amount in the stock aliquot equals the amount in the final solution: C1V1 = C2V2.",
  status: "AVAILABLE",
  themeId: "formulation-lab",
  source: {
    status: "NON_IP_EDUCATIONAL",
    note: "The dilution relation is standard. Concentrations and volumes are educational simulation parameters.",
  },

  simulation: {
    kind: "dilution",
    model: {
      stockConcentration: 1,
      stockConcentrationUnit: "mol/L",
      targetConcentration: { min: 0.05, max: 0.5, step: 0.01, initial: 0.1, unit: "mol/L", label: "Target concentration" },
      targetVolume: { min: 50, max: 250, step: 5, initial: 100, unit: "mL", label: "Final volume" },
      flaskVolume: 250,
    },
  },

  apparatus: [
    { id: "app-stock", name: "Stock solution", kind: "material", note: "1 mol/L — simulation parameter", shape: "bottle", fill: 100, required: true },
    { id: "app-pipette", name: "Pipette", kind: "apparatus", note: "Measures the stock aliquot", shape: "pipette", required: true },
    { id: "app-flask", name: "Volumetric flask", kind: "apparatus", note: "Final volume is made up to the mark", shape: "flask", fill: 0, required: true },
    { id: "app-solvent", name: "Diluent", kind: "material", note: "Used to make up to volume", shape: "bottle", fill: 80 },
  ],
  materials: [],

  steps: [
    {
      id: "dil-step-01", index: 0, phase: "prepare",
      title: "Set out the apparatus",
      instruction: "Pick up the stock solution, the pipette and the volumetric flask.",
      why: "Each piece fixes one quantity: the stock concentration, the aliquot and the final volume.",
      interactions: [
        { id: "dil-sel-stock", type: "select", targetId: "app-stock", label: "Select the stock solution" },
        { id: "dil-sel-pipette", type: "select", targetId: "app-pipette", label: "Select the pipette" },
        { id: "dil-sel-flask", type: "select", targetId: "app-flask", label: "Select the volumetric flask" },
      ],
      status: "AVAILABLE",
    },
    {
      id: "dil-step-02", index: 1, phase: "prepare",
      title: "Set the target",
      instruction: "Choose the concentration and the final volume you need to prepare.",
      why: "The target fixes what you are aiming at before any calculation.",
      interactions: [{ id: "dil-confirm-target", type: "press", targetId: "app-flask", label: "Confirm the target" }],
      status: "AVAILABLE",
    },
    {
      id: "dil-step-03", index: 2, phase: "perform",
      title: "Calculate the aliquot",
      instruction: "Work out the volume of stock to transfer, C2V2 ÷ C1, and enter it.",
      why: "Because solute is conserved, the required aliquot follows directly from the three known quantities.",
      interactions: [{ id: "dil-set-aliquot", type: "adjust", targetId: "app-pipette", label: "Set the aliquot volume", range: { min: 1, max: 50, step: 0.5, initial: 5, unit: "mL" } }],
      status: "AVAILABLE",
    },
    {
      id: "dil-step-04", index: 3, phase: "perform",
      title: "Transfer the aliquot",
      instruction: "Pipette the stock into the volumetric flask.",
      why: "This is the step that carries the solute from the stock into the final solution.",
      interactions: [{ id: "dil-transfer", type: "press", targetId: "app-pipette", label: "Transfer the aliquot" }],
      status: "AVAILABLE",
    },
    {
      id: "dil-step-05", index: 4, phase: "perform",
      title: "Make up to volume",
      instruction: "Add diluent up to the graduation mark on the flask.",
      why: "The final volume is what turns the amount of solute into a concentration.",
      interactions: [{ id: "dil-make-up", type: "press", targetId: "app-flask", label: "Make up to the mark" }],
      status: "AVAILABLE",
    },
    {
      id: "dil-step-06", index: 5, phase: "perform",
      title: "Record the concentration",
      instruction: "Record the concentration you actually achieved.",
      why: "Comparing the achieved concentration with the target shows whether the aliquot was right.",
      interactions: [{ id: "dil-record", type: "press", targetId: "app-flask", label: "Record the achieved concentration" }],
      status: "AVAILABLE",
    },
  ],

  observations: [
    { id: "obs-dil-target", label: "Target concentration", kind: "quantitative", unit: "mol/L", status: "AVAILABLE" },
    { id: "obs-dil-volume", label: "Final volume", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-dil-aliquot", label: "Stock aliquot transferred", kind: "quantitative", unit: "mL", status: "AVAILABLE" },
    { id: "obs-dil-achieved", label: "Concentration achieved", kind: "quantitative", unit: "mol/L", status: "AVAILABLE" },
  ],

  calculations: [
    {
      id: "calc-dil-achieved",
      label: "Concentration achieved",
      formulaKey: "dilution-achieved-concentration",
      expression: "C2 = C1 × V1 ÷ V2",
      inputs: [
        { id: "in-dilution-stock", label: "Stock concentration", unit: "mol/L", defaultValue: 1, required: true },
        { id: "in-dilution-transferred", label: "Aliquot transferred", unit: "mL", fromObservationId: "obs-dil-aliquot", required: true },
        { id: "in-dilution-final", label: "Final volume", unit: "mL", fromObservationId: "obs-dil-volume", required: true },
      ],
      output: { label: "Concentration achieved", unit: "mol/L", figures: 4 },
      status: "AVAILABLE",
      source: { status: "NON_IP_EDUCATIONAL", note: "Conservation of solute on dilution." },
    },
  ],

  result: { id: "res-dil", status: "AVAILABLE" },

  references: [
    { id: "ref-dil-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],

  assessment: {
    id: "assess-dil",
    items: [{ id: "assess-dil-1", type: "numeric", status: "PLANNED" }],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },

  visuals: [
    {
      id: "vis-dil-hero",
      role: "heroVisual",
      src: DOMAIN_VISUALS["Pharmaceutics"].src,
      alt: DOMAIN_VISUALS["Pharmaceutics"].alt,
      caption: DOMAIN_VISUALS["Pharmaceutics"].caption,
    },
  ],
};

/* ================================================================== *
 * PLANNED ENTRIES
 * Declared so the library is discoverable, but honestly labelled —
 * no interactive content is claimed until it is genuinely implemented.
 * ================================================================== */

interface PlannedEntry {
  slug: string;
  title: string;
  domain: string;
  type: ExperimentType;
  shortDescription: string;
  interactionLabel: string;
  status: DevelopmentStatus;
  note: string;
}

const PLANNED: PlannedEntry[] = [
  {
    slug: "microscopy-magnification-and-field-of-view",
    title: "Microscope Magnification & Field of View",
    domain: "Microbiology",
    type: "MICROSCOPY",
    shortDescription: "Change objective, watch magnification and field of view trade off.",
    interactionLabel: "Focus + optics",
    status: "PLANNED",
    note: "Specimen visualisation pending verified source material.",
  },
  {
    slug: "identification-of-crude-drug-powders",
    title: "Identification of Crude Drug Powders",
    domain: "Pharmacognosy",
    type: "SPECIMEN_IDENTIFICATION",
    shortDescription: "Examine powdered plant material and identify diagnostic features.",
    interactionLabel: "Specimen study",
    status: "PLANNED",
    note: "Specimen content pending verification — no monograph is reproduced.",
  },
  {
    slug: "dose-response-relationship",
    title: "Dose–Response Relationship",
    domain: "Pharmacology",
    type: "BIOLOGICAL_RESPONSE",
    shortDescription: "Explore how response changes with dose and receptor occupancy.",
    interactionLabel: "Response curves",
    status: "PLANNED",
    note: "Model parameters pending verification.",
  },
  {
    slug: "clinical-case-medication-review",
    title: "Medication Review — Clinical Case",
    domain: "Clinical Pharmacy",
    type: "CLINICAL_CASE",
    shortDescription: "Work through a patient case and review the medication list.",
    interactionLabel: "Case reasoning",
    status: "PLANNED",
    note: "Case content pending verification. No patient data is invented.",
  },
  {
    slug: "hospital-pharmacy-dispensing-workflow",
    title: "Dispensing Workflow",
    domain: "Hospital Pharmacy",
    type: "HOSPITAL_WORKFLOW",
    shortDescription: "Follow a prescription through receipt, check and dispensing.",
    interactionLabel: "Workflow",
    status: "PLANNED",
    note: "Workflow steps pending verification.",
  },
  {
    slug: "study-design-and-data-interpretation",
    title: "Study Design & Data Interpretation",
    domain: "Clinical Research",
    type: "INSTRUMENT_SIMULATION",
    shortDescription: "Assemble a study design and read the resulting data.",
    interactionLabel: "Data + design",
    status: "PLANNED",
    note: "Study content pending verification.",
  },
];

export interface LibraryEntry {
  slug: string;
  title: string;
  domain: string;
  type: ExperimentType;
  shortDescription: string;
  interactionLabel: string;
  status: DevelopmentStatus;
  note?: string;
  /** Present only when the experiment is genuinely implemented. */
  experiment?: Experiment;
  visual: VisualAsset;
}


/** The library: implemented experiments first, then declared future entries. */
export const LIBRARY: LibraryEntry[] = [
  {
    slug: TITRATION_EXPERIMENT.slug,
    title: TITRATION_EXPERIMENT.title,
    domain: TITRATION_EXPERIMENT.domain,
    type: TITRATION_EXPERIMENT.type,
    shortDescription: TITRATION_EXPERIMENT.shortDescription,
    interactionLabel: TITRATION_EXPERIMENT.interactionLabel,
    status: TITRATION_EXPERIMENT.status,
    experiment: TITRATION_EXPERIMENT,
    visual: DOMAIN_VISUALS["Pharmaceutical Analysis"],
  },
  {
    slug: PK_EXPERIMENT.slug,
    title: PK_EXPERIMENT.title,
    domain: PK_EXPERIMENT.domain,
    type: PK_EXPERIMENT.type,
    shortDescription: PK_EXPERIMENT.shortDescription,
    interactionLabel: PK_EXPERIMENT.interactionLabel,
    status: PK_EXPERIMENT.status,
    experiment: PK_EXPERIMENT,
    visual: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"],
  },
  {
    slug: DILUTION_EXPERIMENT.slug,
    title: DILUTION_EXPERIMENT.title,
    domain: DILUTION_EXPERIMENT.domain,
    type: DILUTION_EXPERIMENT.type,
    shortDescription: DILUTION_EXPERIMENT.shortDescription,
    interactionLabel: DILUTION_EXPERIMENT.interactionLabel,
    status: DILUTION_EXPERIMENT.status,
    experiment: DILUTION_EXPERIMENT,
    visual: DOMAIN_VISUALS["Pharmaceutics"],
  },
  {
    slug: DOSE_RESPONSE_SIMULATION.slug,
    title: DOSE_RESPONSE_SIMULATION.title,
    domain: DOSE_RESPONSE_SIMULATION.domain,
    type: DOSE_RESPONSE_SIMULATION.type,
    shortDescription: DOSE_RESPONSE_SIMULATION.shortDescription,
    interactionLabel: DOSE_RESPONSE_SIMULATION.interactionLabel,
    status: DOSE_RESPONSE_SIMULATION.status,
    experiment: DOSE_RESPONSE_SIMULATION,
    visual: DOMAIN_VISUALS["Pharmacology"],
  },
  {
    slug: PK_DYNAMICS_SIMULATION.slug,
    title: PK_DYNAMICS_SIMULATION.title,
    domain: PK_DYNAMICS_SIMULATION.domain,
    type: PK_DYNAMICS_SIMULATION.type,
    shortDescription: PK_DYNAMICS_SIMULATION.shortDescription,
    interactionLabel: PK_DYNAMICS_SIMULATION.interactionLabel,
    status: PK_DYNAMICS_SIMULATION.status,
    experiment: PK_DYNAMICS_SIMULATION,
    visual: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"],
  },
  {
    slug: CLINICAL_SIMULATION.slug,
    title: CLINICAL_SIMULATION.title,
    domain: CLINICAL_SIMULATION.domain,
    type: CLINICAL_SIMULATION.type,
    shortDescription: CLINICAL_SIMULATION.shortDescription,
    interactionLabel: CLINICAL_SIMULATION.interactionLabel,
    status: CLINICAL_SIMULATION.status,
    experiment: CLINICAL_SIMULATION,
    visual: DOMAIN_VISUALS["Clinical Pharmacy"],
  },
  {
    slug: MEDICATION_REVIEW_EXPERIMENT.slug,
    title: MEDICATION_REVIEW_EXPERIMENT.title,
    domain: MEDICATION_REVIEW_EXPERIMENT.domain,
    type: MEDICATION_REVIEW_EXPERIMENT.type,
    shortDescription: MEDICATION_REVIEW_EXPERIMENT.shortDescription,
    interactionLabel: MEDICATION_REVIEW_EXPERIMENT.interactionLabel,
    status: MEDICATION_REVIEW_EXPERIMENT.status,
    experiment: MEDICATION_REVIEW_EXPERIMENT,
    visual: DOMAIN_VISUALS["Clinical Pharmacy"],
  },
  {
    slug: COUNSELLING_EXPERIMENT.slug,
    title: COUNSELLING_EXPERIMENT.title,
    domain: COUNSELLING_EXPERIMENT.domain,
    type: COUNSELLING_EXPERIMENT.type,
    shortDescription: COUNSELLING_EXPERIMENT.shortDescription,
    interactionLabel: COUNSELLING_EXPERIMENT.interactionLabel,
    status: COUNSELLING_EXPERIMENT.status,
    experiment: COUNSELLING_EXPERIMENT,
    visual: DOMAIN_VISUALS["Clinical Pharmacy"],
  },
  {
    slug: DRUG_INFORMATION_EXPERIMENT.slug,
    title: DRUG_INFORMATION_EXPERIMENT.title,
    domain: DRUG_INFORMATION_EXPERIMENT.domain,
    type: DRUG_INFORMATION_EXPERIMENT.type,
    shortDescription: DRUG_INFORMATION_EXPERIMENT.shortDescription,
    interactionLabel: DRUG_INFORMATION_EXPERIMENT.interactionLabel,
    status: DRUG_INFORMATION_EXPERIMENT.status,
    experiment: DRUG_INFORMATION_EXPERIMENT,
    visual: DOMAIN_VISUALS["Clinical Pharmacy"],
  },
  {
    slug: INVENTORY_EXPERIMENT.slug,
    title: INVENTORY_EXPERIMENT.title,
    domain: INVENTORY_EXPERIMENT.domain,
    type: INVENTORY_EXPERIMENT.type,
    shortDescription: INVENTORY_EXPERIMENT.shortDescription,
    interactionLabel: INVENTORY_EXPERIMENT.interactionLabel,
    status: INVENTORY_EXPERIMENT.status,
    experiment: INVENTORY_EXPERIMENT,
    visual: DOMAIN_VISUALS["Hospital Pharmacy"],
  },
  {
    slug: DISPENSING_EXPERIMENT.slug,
    title: DISPENSING_EXPERIMENT.title,
    domain: DISPENSING_EXPERIMENT.domain,
    type: DISPENSING_EXPERIMENT.type,
    shortDescription: DISPENSING_EXPERIMENT.shortDescription,
    interactionLabel: DISPENSING_EXPERIMENT.interactionLabel,
    status: DISPENSING_EXPERIMENT.status,
    experiment: DISPENSING_EXPERIMENT,
    visual: DOMAIN_VISUALS["Hospital Pharmacy"],
  },
  {
    slug: MEDICATION_ERROR_EXPERIMENT.slug,
    title: MEDICATION_ERROR_EXPERIMENT.title,
    domain: MEDICATION_ERROR_EXPERIMENT.domain,
    type: MEDICATION_ERROR_EXPERIMENT.type,
    shortDescription: MEDICATION_ERROR_EXPERIMENT.shortDescription,
    interactionLabel: MEDICATION_ERROR_EXPERIMENT.interactionLabel,
    status: MEDICATION_ERROR_EXPERIMENT.status,
    experiment: MEDICATION_ERROR_EXPERIMENT,
    visual: DOMAIN_VISUALS["Hospital Pharmacy"],
  },
  {
    slug: FRAMEWORK_EXPERIMENT.slug,
    title: FRAMEWORK_EXPERIMENT.title,
    domain: FRAMEWORK_EXPERIMENT.domain,
    type: FRAMEWORK_EXPERIMENT.type,
    shortDescription: FRAMEWORK_EXPERIMENT.shortDescription,
    interactionLabel: FRAMEWORK_EXPERIMENT.interactionLabel,
    status: FRAMEWORK_EXPERIMENT.status,
    experiment: FRAMEWORK_EXPERIMENT,
    visual: DOMAIN_VISUALS["Pharmaceutical Analysis"],
  },
  ...PLANNED.map((entry) => ({
    ...entry,
    visual: DOMAIN_VISUALS[entry.domain] ?? DOMAIN_VISUALS["Pharmaceutical Analysis"],
  })),
];

/** Domains that actually have entries, for the filter bar. */
export const LIBRARY_DOMAINS: string[] = [
  ...new Set(LIBRARY.map((e) => e.domain)),
];

export function findLibraryEntry(slug: string): LibraryEntry | undefined {
  return LIBRARY.find((e) => e.slug === slug);
}

/** Bench experiments and advanced simulations, all rendered by one engine. */
export const EXPERIMENTS: Experiment[] = [
  TITRATION_EXPERIMENT,
  PK_EXPERIMENT,
  DILUTION_EXPERIMENT,
  FRAMEWORK_EXPERIMENT,
  DOSE_RESPONSE_SIMULATION,
  PK_DYNAMICS_SIMULATION,
  CLINICAL_SIMULATION,
  MEDICATION_REVIEW_EXPERIMENT,
  COUNSELLING_EXPERIMENT,
  DRUG_INFORMATION_EXPERIMENT,
  INVENTORY_EXPERIMENT,
  DISPENSING_EXPERIMENT,
  MEDICATION_ERROR_EXPERIMENT,
];

export function findExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}

export function experimentPath(experiment: Experiment): string {
  return `/lab/experiment/${experiment.slug}`;
}
