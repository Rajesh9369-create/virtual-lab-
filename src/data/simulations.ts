/**
 * ADVANCED SIMULATIONS
 * --------------------
 * Declared as data, rendered by the reusable engine. Each carries its own
 * scientific concept, verification status and educational parameter ranges.
 */
import type { Experiment } from "../engine/types";
import type { ClinicalCase } from "../engine/clinical";
import { DOMAIN_VISUALS } from "./visuals";

/* ================================================================== *
 * PHARMACOLOGY — dose–response (Emax model)
 * ================================================================== */

export const DOSE_RESPONSE_SIMULATION: Experiment = {
  id: "sim-dose-response",
  slug: "dose-response",
  title: "Dose–Response Relationship",
  domain: "Pharmacology",
  subjectId: "y03-pharmacology-i",
  yearNumber: 3,
  type: "BIOLOGICAL_RESPONSE",
  category: "SIMULATION",
  shortDescription:
    "Change concentration and watch receptor occupancy and response move together.",
  interactionLabel: "Receptors + curve",
  objective:
    "See how concentration, EC50 and receptor occupancy determine the size of a response.",
  concept:
    "Effect follows the Emax equation: E = Emax · C^h / (EC50^h + C^h), and a competitive antagonist shifts EC50 rightward.",
  status: "AVAILABLE",
  themeId: "pharmacology-lab",
  source: {
    status: "NON_IP_EDUCATIONAL",
    note: "The Emax (Hill) equation and the competitive-antagonist EC50 shift are standard pharmacology. Parameter ranges are educational simulation values, and the receptor visual is a conceptual model of occupancy, not a molecular structure.",
  },
  simulation: { kind: "doseResponse" },
  apparatus: [],
  materials: [],
  steps: [
    {
      id: "dr-step-01", index: 0, phase: "prepare",
      title: "Set the concentration",
      instruction: "Move the concentration and watch occupancy change.",
      why: "Occupancy rises with concentration — that is what drives the response.",
      interactions: [{ id: "dr-confirm-concentration", type: "press", targetId: "dr-concentration", label: "Confirm the concentration" }],
      status: "AVAILABLE",
    },
    {
      id: "dr-step-02", index: 1, phase: "prepare",
      title: "Set EC50",
      instruction: "Move EC50 and observe the curve slide along the concentration axis.",
      why: "EC50 is the concentration giving half the maximum effect. A lower EC50 means greater potency.",
      interactions: [{ id: "dr-confirm-ec50", type: "press", targetId: "dr-ec50", label: "Confirm EC50" }],
      status: "AVAILABLE",
    },
    {
      id: "dr-step-03", index: 2, phase: "perform",
      title: "Add a competitive antagonist",
      instruction: "Raise the antagonist concentration and compare the two curves.",
      why: "A competitive antagonist shifts the curve to the right — the same effect is still reachable, it just needs more agonist.",
      interactions: [{ id: "dr-confirm-antagonist", type: "press", targetId: "dr-antagonist", label: "Confirm the antagonist" }],
      status: "AVAILABLE",
    },
    {
      id: "dr-step-04", index: 3, phase: "perform",
      title: "Record the response",
      instruction: "Record the response at your current concentration.",
      why: "This is the operating point the curve predicts for the parameters you chose.",
      interactions: [{ id: "dr-record-response", type: "press", targetId: "dr-response", label: "Record the response" }],
      status: "AVAILABLE",
    },
  ],
  observations: [
    { id: "obs-dr-concentration", label: "Concentration (log)", kind: "quantitative", unit: "", status: "AVAILABLE" },
    { id: "obs-dr-ec50", label: "EC50", kind: "quantitative", unit: "units", status: "AVAILABLE" },
    { id: "obs-dr-antagonist", label: "Antagonist concentration", kind: "quantitative", unit: "units", status: "AVAILABLE" },
    { id: "obs-dr-response", label: "Response", kind: "quantitative", unit: "%", status: "AVAILABLE" },
    { id: "obs-dr-occupancy", label: "Receptor occupancy", kind: "quantitative", unit: "%", status: "AVAILABLE" },
  ],
  calculations: [
    {
      id: "calc-dr-response",
      label: "Response from the Emax equation",
      formulaKey: "dose-response-effect",
      expression: "E = Emax · C^h ÷ (EC50^h + C^h)",
      inputs: [
        { id: "in-dr-emax", label: "Emax", unit: "%", defaultValue: 100, required: true },
        { id: "in-dr-concentration", label: "Concentration", unit: "units", fromObservationId: "obs-dr-ec50", required: true },
        { id: "in-dr-ec50", label: "EC50", unit: "units", fromObservationId: "obs-dr-ec50", required: true },
      ],
      output: { label: "Predicted response", unit: "%", figures: 4 },
      status: "AVAILABLE",
      source: { status: "NON_IP_EDUCATIONAL", note: "Standard Emax (Hill) equation." },
    },
  ],
  result: { id: "res-dr", status: "AVAILABLE" },
  references: [
    { id: "ref-dr-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],
  assessment: {
    id: "assess-dr",
    items: [{ id: "assess-dr-1", type: "multiple-choice", status: "PLANNED" }],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },
  visuals: [
    {
      id: "vis-dr-hero",
      role: "heroVisual",
      src: DOMAIN_VISUALS["Pharmacology"].src,
      alt: DOMAIN_VISUALS["Pharmacology"].alt,
      caption: DOMAIN_VISUALS["Pharmacology"].caption,
    },
  ],
};

/* ================================================================== *
 * PHARMACOKINETICS — one compartment with absorption and time
 * ================================================================== */

export const PK_DYNAMICS_SIMULATION: Experiment = {
  id: "sim-pk-dynamics",
  slug: "pharmacokinetics-over-time",
  title: "Pharmacokinetics Over Time",
  domain: "Biopharmaceutics & Pharmacokinetics",
  subjectId: "y04-biopharmaceutics-and-pharmacokinetics",
  yearNumber: 4,
  type: "PHARMACOKINETIC_SIMULATION",
  category: "SIMULATION",
  shortDescription:
    "Run a dose through absorption, distribution and elimination and watch it happen.",
  interactionLabel: "Time + compartments",
  objective:
    "Follow a dose from absorption to elimination and see how the parameters shape the profile.",
  concept:
    "After an oral dose, concentration rises while absorption dominates and falls once elimination dominates: C(t) = (D·ka)/(V·(ka−ke))·(e^(−ke·t) − e^(−ka·t)).",
  status: "AVAILABLE",
  themeId: "kinetics-lab",
  source: {
    status: "NON_IP_EDUCATIONAL",
    note: "Standard one-compartment models with first-order absorption. Bioavailability is fixed at 1 as a stated modelling assumption, and all parameter ranges are educational simulation values.",
  },
  simulation: { kind: "pkDynamics" },
  apparatus: [],
  materials: [],
  steps: [
    {
      id: "pkd-step-01", index: 0, phase: "prepare",
      title: "Choose the route",
      instruction: "Switch between an intravenous bolus and an oral dose.",
      why: "An intravenous bolus enters the central compartment directly; an oral dose must first be absorbed.",
      interactions: [{ id: "pkd-confirm-route", type: "press", targetId: "pkd-route", label: "Confirm the route" }],
      status: "AVAILABLE",
    },
    {
      id: "pkd-step-02", index: 1, phase: "prepare",
      title: "Set the dose",
      instruction: "Adjust the dose, then confirm it.",
      why: "Dose scales the whole profile proportionally.",
      interactions: [{ id: "pkd-confirm-dose", type: "press", targetId: "pkd-dose", label: "Confirm the dose" }],
      status: "AVAILABLE",
    },
    {
      id: "pkd-step-03", index: 2, phase: "prepare",
      title: "Set the rate constants",
      instruction: "Adjust absorption and elimination, then confirm them.",
      why: "ka controls how fast drug appears; ke controls how fast it leaves. Their balance sets Tmax.",
      interactions: [{ id: "pkd-confirm-rates", type: "press", targetId: "pkd-ke", label: "Confirm the rate constants" }],
      status: "AVAILABLE",
    },
    {
      id: "pkd-step-04", index: 3, phase: "perform",
      title: "Run the simulation",
      instruction: "Play the simulation and watch the compartments empty and fill.",
      why: "Seeing absorption and elimination compete explains why concentration peaks and then falls.",
      interactions: [{ id: "pkd-run", type: "press", targetId: "pkd-time", label: "Run the simulation to the end" }],
      status: "AVAILABLE",
    },
    {
      id: "pkd-step-05", index: 4, phase: "perform",
      title: "Record the peak",
      instruction: "Record Cmax and the half-life.",
      why: "Cmax and Tmax describe the peak; the half-life describes the decline.",
      interactions: [{ id: "pkd-record", type: "press", targetId: "pkd-cmax", label: "Record Cmax and half-life" }],
      status: "AVAILABLE",
    },
  ],
  observations: [
    { id: "obs-pkd-dose", label: "Dose", kind: "quantitative", unit: "mg", status: "AVAILABLE" },
    { id: "obs-pkd-route", label: "Route", kind: "qualitative", status: "AVAILABLE" },
    { id: "obs-pkd-cmax", label: "Cmax", kind: "quantitative", unit: "mg/L", status: "AVAILABLE" },
    { id: "obs-pkd-half-life", label: "Half-life", kind: "quantitative", unit: "h", status: "AVAILABLE" },
  ],
  calculations: [
    {
      id: "calc-pkd-auc",
      label: "Area under the curve",
      formulaKey: "pk-auc-iv",
      expression: "AUC = Dose ÷ (V × ke)",
      inputs: [
        { id: "in-pkd-dose", label: "Dose", unit: "mg", fromObservationId: "obs-pkd-dose", required: true },
        { id: "in-pkd-volume", label: "Volume of distribution", unit: "L", defaultValue: 25, required: true },
        { id: "in-pkd-ke", label: "Elimination rate constant", unit: "1/h", defaultValue: 0.15, required: true },
      ],
      output: { label: "AUC", unit: "mg·h/L", figures: 4 },
      status: "AVAILABLE",
      source: { status: "NON_IP_EDUCATIONAL", note: "Standard one-compartment pharmacokinetics." },
    },
  ],
  result: { id: "res-pkd", status: "AVAILABLE" },
  references: [
    { id: "ref-pkd-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],
  assessment: {
    id: "assess-pkd",
    items: [{ id: "assess-pkd-1", type: "multiple-choice", status: "PLANNED" }],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },
  visuals: [
    {
      id: "vis-pkd-hero",
      role: "heroVisual",
      src: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].src,
      alt: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].alt,
      caption: DOMAIN_VISUALS["Biopharmaceutics & Pharmacokinetics"].caption,
    },
  ],
};

/* ================================================================== *
 * CLINICAL — medication review, educational case
 * ================================================================== */

export const CLINICAL_SIMULATION: Experiment = {
  id: "sim-clinical-medication-review",
  slug: "clinical-medication-review",
  title: "Medication Review",
  domain: "Clinical Pharmacy",
  subjectId: "y04-clinical-pharmacy",
  yearNumber: 4,
  type: "CLINICAL_CASE",
  category: "SIMULATION",
  shortDescription:
    "Review a simulated patient's medicines and identify the medication-related problem.",
  interactionLabel: "Case reasoning",
  objective:
    "Work through a medication review: gather information, identify the problem, and choose the pharmaceutical care action.",
  concept:
    "A medication review considers whether any medicine could be contributing to a new symptom, and what monitoring or counselling is appropriate.",
  status: "AVAILABLE",
  themeId: "clinical-lab",
  source: {
    status: "NON_IP_EDUCATIONAL",
    note: "Simulated educational case — not a real patient. The interaction described is a long-established teaching point in pharmaceutical care. No dosing instruction is given and no reference range is quoted.",
  },
  simulation: { kind: "clinicalCase" },
  apparatus: [],
  materials: [],
  steps: [],
  observations: [
    { id: "obs-clin-problem", label: "Problem identified", kind: "qualitative", status: "AVAILABLE" },
    { id: "obs-clin-action", label: "Action selected", kind: "qualitative", status: "AVAILABLE" },
    { id: "obs-clin-monitoring", label: "Monitoring identified", kind: "qualitative", status: "AVAILABLE" },
  ],
  calculations: [],
  result: { id: "res-clinical", status: "AVAILABLE" },
  references: [
    { id: "ref-clin-academic", category: "ACADEMIC", status: "VERIFICATION_REQUIRED", note: "Reference verification required." },
  ],
  assessment: {
    id: "assess-clin",
    items: [{ id: "assess-clin-1", type: "multiple-choice", status: "PLANNED" }],
    status: "PLANNED",
    note: "Assessment items appear once verified content is connected.",
  },
  visuals: [
    {
      id: "vis-clin-hero",
      role: "heroVisual",
      src: DOMAIN_VISUALS["Clinical Pharmacy"].src,
      alt: DOMAIN_VISUALS["Clinical Pharmacy"].alt,
      caption: DOMAIN_VISUALS["Clinical Pharmacy"].caption,
    },
  ],
};

/** The clinical case itself, kept separate from the experiment wrapper. */
export const CLINICAL_CASE: ClinicalCase = {
  id: "case-medication-review-01",
  title: "A possible medicine-related problem",
  domain: "Clinical Pharmacy",
  objective:
    "Identify the medication-related problem and choose the appropriate pharmaceutical care action.",
  scientificConcept:
    "New symptoms in a patient taking medicines should prompt consideration of whether a medicine could be contributing.",
  sourceStatus: "NON_IP_EDUCATIONAL",
  sourceNote:
    "Simulated educational case. The interaction described is a long-established teaching point.",
  stages: [
    {
      id: "clin-stage-01",
      title: "Patient context",
      instruction: "Read the simulated patient's context.",
      reveals: [
        {
          kind: "patient",
          label: "Simulated patient",
          value: "Attending a pharmacy medication review",
          note: "Educational case — not a real patient.",
        },
        {
          kind: "notes",
          label: "Presenting report",
          value: "Reports noticing increased bruising over the past week",
          tone: "attention",
        },
        {
          kind: "notes",
          label: "Recent change",
          value: "A new medicine was started about a week ago",
          tone: "recent",
        },
      ],
    },
    {
      id: "clin-stage-02",
      title: "Medication list",
      instruction: "Review the current medicines.",
      reveals: [
        { kind: "medications", label: "Warfarin", value: "Anticoagulant — ongoing", tone: "normal" },
        { kind: "medications", label: "Co-trimoxazole", value: "Antibiotic — started last week", tone: "recent" },
        { kind: "medications", label: "Amlodipine", value: "Antihypertensive — ongoing", tone: "normal" },
        { kind: "medications", label: "Metformin", value: "Antidiabetic — ongoing", tone: "normal" },
      ],
    },
    {
      id: "clin-stage-03",
      title: "Laboratory information",
      instruction: "Consider the laboratory information on the record.",
      reveals: [
        {
          kind: "labs",
          label: "INR",
          value: "Reported above the patient's usual target range",
          tone: "attention",
          note: "Simulated record — no numeric value or reference range is quoted.",
        },
      ],
    },
    {
      id: "clin-stage-04",
      title: "Identify the problem",
      instruction: "What is the most appropriate identification of the problem?",
      reveals: [],
      choice: {
        prompt: "Which statement best identifies the medication-related problem?",
        options: [
          {
            id: "o1",
            text: "There is no medication-related problem to consider.",
            correct: false,
            feedback:
              "A new symptom appearing shortly after a new medicine is started is exactly when a medication-related cause should be considered.",
          },
          {
            id: "o2",
            text: "A recently started medicine may be increasing the effect of the anticoagulant.",
            correct: true,
            feedback:
              "Correct. The antibiotic started last week can increase warfarin's effect, which is consistent with increased bruising and the INR being above the patient's usual range.",
          },
          {
            id: "o3",
            text: "The antihypertensive is the only possible cause.",
            correct: false,
            feedback:
              "Amlodipine was already ongoing, so a change this week is less easily explained by it. The timing points to the newly started medicine.",
          },
          {
            id: "o4",
            text: "The symptom is definitely unrelated to any medicine.",
            correct: false,
            feedback:
              "It may turn out to be unrelated, but 'definitely' cannot be concluded at this stage — the timing warrants assessment first.",
          },
        ],
      },
    },
    {
      id: "clin-stage-05",
      title: "Choose the action",
      instruction: "Select the appropriate pharmaceutical care action.",
      reveals: [],
      choice: {
        prompt: "What is the most appropriate action for the pharmacist to take?",
        options: [
          {
            id: "o1",
            text: "Recommend clinical review of the anticoagulant therapy and INR monitoring.",
            correct: true,
            feedback:
              "Correct. The pharmacist's role is to identify the problem, communicate it and recommend appropriate clinical review and monitoring. The prescriber makes any therapy decision.",
          },
          {
            id: "o2",
            text: "Advise the patient to stop all their medicines immediately.",
            correct: false,
            feedback:
              "Stopping all medicines abruptly is not a pharmacist's instruction to give and could itself cause harm. The action is to escalate for clinical review.",
          },
          {
            id: "o3",
            text: "Note it in the record and take no further action.",
            correct: false,
            feedback:
              "Documenting is good practice but not sufficient on its own — a possible increase in anticoagulant effect needs active escalation.",
          },
          {
            id: "o4",
            text: "Tell the patient to take an extra dose of the anticoagulant.",
            correct: false,
            feedback:
              "That would move in the wrong direction and is a prescribing decision in any case. The pharmacist escalates rather than adjusting therapy.",
          },
        ],
      },
    },
    {
      id: "clin-stage-06",
      title: "Counsel the patient",
      instruction: "What should the patient be counselled on?",
      reveals: [],
      choice: {
        prompt: "Which counselling is most appropriate?",
        options: [
          {
            id: "o1",
            text: "Signs of bleeding to watch for, when to seek help, and to keep taking medicines as directed until reviewed.",
            correct: true,
            feedback:
              "Correct. The patient should know what to look out for and where to get help, without changing their regimen before it is reviewed.",
          },
          {
            id: "o2",
            text: "That no follow-up is needed.",
            correct: false,
            feedback:
              "Follow-up is needed — the situation has been identified as needing clinical review and monitoring.",
          },
          {
            id: "o3",
            text: "To skip the next dose themselves.",
            correct: false,
            feedback:
              "Patients should not be advised to omit doses of an anticoagulant on their own initiative. That decision belongs to the prescriber.",
          },
        ],
      },
    },
    {
      id: "clin-stage-07",
      title: "Monitoring",
      instruction: "Identify the appropriate monitoring.",
      reveals: [],
      choice: {
        prompt: "What monitoring is appropriate?",
        options: [
          {
            id: "o1",
            text: "INR monitoring as clinically directed, and review of whether the antibiotic is still needed.",
            correct: true,
            feedback:
              "Correct. Monitoring the anticoagulant effect and reviewing the indication for the newly started medicine together address both the effect and its cause.",
          },
          {
            id: "o2",
            text: "No monitoring is necessary.",
            correct: false,
            feedback:
              "Monitoring is the core of safe practice here — the anticoagulant effect has been identified as potentially increased.",
          },
          {
            id: "o3",
            text: "Only kidney function tests.",
            correct: false,
            feedback:
              "Kidney function may be relevant to some medicines, but it does not address the anticoagulant effect that has been identified.",
          },
        ],
      },
    },
  ],
};
