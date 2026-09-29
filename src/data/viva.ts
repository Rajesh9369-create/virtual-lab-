/**
 * EXPERIMENT-SPECIFIC VIVA QUESTION BANKS
 * ---------------------------------------
 * Every question is drawn from content that already exists inside the
 * application — the experiment's own concept, apparatus, observations and
 * calculations. Nothing here invents a procedure, concentration, limit or
 * reference. Where a value appears in a calculation question it is one of the
 * experiment's own declared simulation parameters.
 */
import type { VivaBank, VivaQuestion } from "../engine/viva";
import {
  TITRATION_EXPERIMENT,
  PK_EXPERIMENT,
  DILUTION_EXPERIMENT,
} from "./experiments";
import {
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

type VivaQuestionInput = Omit<VivaQuestion, "status" | "sourceStatus">;

const q = (question: VivaQuestionInput): VivaQuestion => ({
  ...question,
  status: "AVAILABLE",
  sourceStatus: "NON_IP_EDUCATIONAL",
});

/* ------------------------------------------------------------------ *
 * ACID–BASE TITRATION
 * ------------------------------------------------------------------ */

const TITRATION: VivaQuestion[] = [
  q({
    id: "viv-tit-01",
    type: "APPARATUS_IDENTIFICATION",
    difficulty: "FOUNDATION",
    prompt: "Which component controls the delivery of the titrant?",
    concept: "Burette",
    explanation:
      "The burette is the graduated column that delivers the titrant, and the stopcock on it controls the flow.",
    visual: "apparatus",
    targetObjectId: "app-burette",
    options: [
      { id: "o1", text: "Conical flask" },
      { id: "o2", text: "Burette stand" },
      { id: "o3", text: "Pipette" },
      { id: "o4", text: "Burette", correct: true },
    ],
  }),
  q({
    id: "viv-tit-02",
    type: "APPARATUS_IDENTIFICATION",
    difficulty: "FOUNDATION",
    prompt: "Which piece of apparatus measures the fixed volume of acid placed in the flask?",
    concept: "Pipette",
    explanation:
      "The pipette transfers one measured aliquot. The burette measures what is delivered, not what is placed in the flask.",
    visual: "apparatus",
    targetObjectId: "app-pipette",
    options: [
      { id: "o1", text: "Burette" },
      { id: "o2", text: "Conical flask" },
      { id: "o3", text: "Pipette", correct: true },
      { id: "o4", text: "Burette stand" },
    ],
  }),
  q({
    id: "viv-tit-03",
    type: "OBSERVATION_INTERPRETATION",
    difficulty: "UNDERSTANDING",
    prompt: "The flask has just held its first permanent pink. What does this tell you?",
    concept: "Endpoint detection",
    explanation:
      "The first permanent pink is the endpoint: the moles of base delivered now equal the moles of acid that were in the flask.",
    visual: "state",
    sceneState: "endpoint",
    options: [
      { id: "o1", text: "The acid is still in excess" },
      { id: "o2", text: "The equivalence point has been reached", correct: true },
      { id: "o3", text: "The indicator has failed" },
      { id: "o4", text: "The flask was not rinsed" },
    ],
  }),
  q({
    id: "viv-tit-04",
    type: "WHY",
    difficulty: "UNDERSTANDING",
    prompt: "Why is the titrant added slowly as you approach the endpoint?",
    concept: "Endpoint detection",
    explanation:
      "Near the equivalence point a single drop changes the colour, so a fast addition can carry you straight past it.",
    visual: "state",
    sceneState: "endpoint",
    options: [
      { id: "o1", text: "To cool the solution down" },
      { id: "o2", text: "Because the reaction is slow" },
      { id: "o3", text: "Because one drop can change the colour at the equivalence point", correct: true },
      { id: "o4", text: "To protect the burette" },
    ],
  }),
  q({
    id: "viv-tit-05",
    referenceIds: ["ref-titration-relation"],
    type: "CALCULATION",
    difficulty: "APPLICATION",
    prompt:
      "25.00 mL of 0.1000 mol/L base neutralised a 10.00 mL aliquot of acid. What is the acid concentration?",
    concept: "Titration calculation",
    explanation:
      "M(acid) = M(base) × V(base) ÷ V(acid) = 0.1000 × 25.00 ÷ 10.00 = 0.2500 mol/L.",
    visual: "none",
    options: [
      { id: "o1", text: "0.0400 mol/L" },
      { id: "o2", text: "0.1000 mol/L" },
      { id: "o3", text: "0.2500 mol/L", correct: true },
      { id: "o4", text: "0.0250 mol/L" },
    ],
  }),
  q({
    id: "viv-tit-06",
    type: "ERROR_DETECTION",
    difficulty: "ANALYSIS",
    prompt: "The flask has finished a deep pink rather than a faint pink. What happened?",
    concept: "Endpoint detection",
    explanation:
      "A deep pink means base is now in excess — the endpoint was passed, so the recorded volume is larger than the equivalence volume.",
    visual: "state",
    sceneState: "overshot",
    options: [
      { id: "o1", text: "The endpoint was passed — more base was added than needed", correct: true },
      { id: "o2", text: "The endpoint was reached exactly" },
      { id: "o3", text: "The acid was too concentrated" },
      { id: "o4", text: "No indicator was added" },
    ],
  }),
  q({
    id: "viv-tit-07",
    type: "PROCEDURE_SEQUENCING",
    difficulty: "APPLICATION",
    prompt: "Put the titration steps in the order they are performed.",
    concept: "Titration procedure",
    explanation:
      "The burette is filled and read first, the aliquot is pipetted in, the titration is run to the endpoint, and only then is the final reading taken.",
    visual: "none",
    sequence: [
      "Fill the burette",
      "Record the initial reading",
      "Pipette the acid into the flask",
      "Titrate to the endpoint",
      "Record the final reading",
    ],
  }),
];

/* ------------------------------------------------------------------ *
 * ONE-COMPARTMENT PHARMACOKINETICS
 * ------------------------------------------------------------------ */

const PK: VivaQuestion[] = [
  q({
    id: "viv-pk-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "FOUNDATION",
    prompt: "In this model, what does clearance represent?",
    concept: "Clearance",
    explanation:
      "Clearance is the volume of plasma cleared of drug per unit time — here it sets k together with the volume of distribution.",
    visual: "graph",
    options: [
      { id: "o1", text: "The volume of plasma cleared of drug per unit time", correct: true },
      { id: "o2", text: "The amount of drug given" },
      { id: "o3", text: "The size of the compartment" },
      { id: "o4", text: "The dose divided by time" },
    ],
  }),
  q({
    id: "viv-pk-02",
    type: "WHAT_HAPPENS_NEXT",
    difficulty: "UNDERSTANDING",
    prompt: "Clearance increases while dose and volume stay the same. What happens to the half-life?",
    concept: "Half-life",
    explanation:
      "t½ = 0.693 × V ÷ CL, so a larger clearance with the same volume gives a shorter half-life — the curve falls faster.",
    visual: "graph",
    options: [
      { id: "o1", text: "It gets shorter", correct: true },
      { id: "o2", text: "It gets longer" },
      { id: "o3", text: "It stays the same" },
      { id: "o4", text: "It becomes infinite" },
    ],
  }),
  q({
    id: "viv-pk-03",
    referenceIds: ["ref-pk-one-compartment"],
    type: "CALCULATION",
    difficulty: "APPLICATION",
    prompt: "A 250 mg dose is given and clearance is 5 L/h. What is the AUC?",
    concept: "AUC",
    explanation: "AUC = Dose ÷ CL = 250 ÷ 5 = 50 mg·h/L.",
    visual: "graph",
    options: [
      { id: "o1", text: "1250 mg·h/L" },
      { id: "o2", text: "50 mg·h/L", correct: true },
      { id: "o3", text: "0.02 mg·h/L" },
      { id: "o4", text: "5 mg·h/L" },
    ],
  }),
  q({
    id: "viv-pk-04",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Volume of distribution increases while dose and clearance stay the same. Why does C₀ fall?",
    concept: "Volume of distribution",
    explanation:
      "C₀ = Dose ÷ V. The same dose spread through a larger volume gives a lower concentration at every time point.",
    visual: "graph",
    options: [
      { id: "o1", text: "Because the same dose is diluted into a larger volume", correct: true },
      { id: "o2", text: "Because less drug was given" },
      { id: "o3", text: "Because elimination sped up" },
      { id: "o4", text: "Because the model stops applying" },
    ],
  }),
];

/* ------------------------------------------------------------------ *
 * PREPARING A SOLUTION BY DILUTION
 * ------------------------------------------------------------------ */

const DILUTION: VivaQuestion[] = [
  q({
    id: "viv-dil-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "FOUNDATION",
    prompt: "When a solution is diluted, what stays the same?",
    concept: "Dilution principle",
    explanation:
      "Dilution adds solvent, not solute. The amount of solute is unchanged — which is exactly why C₁V₁ = C₂V₂ holds.",
    visual: "apparatus",
    options: [
      { id: "o1", text: "The amount of solute", correct: true },
      { id: "o2", text: "The concentration" },
      { id: "o3", text: "The final volume" },
      { id: "o4", text: "The stock concentration" },
    ],
  }),
  q({
    id: "viv-dil-02",
    type: "CALCULATION",
    difficulty: "APPLICATION",
    prompt:
      "10 mL of a 1 mol/L stock is transferred and made up to 100 mL. What is the final concentration?",
    concept: "Dilution calculation",
    explanation: "C₂ = C₁ × V₁ ÷ V₂ = 1 × 10 ÷ 100 = 0.1 mol/L.",
    visual: "apparatus",
    options: [
      { id: "o1", text: "1.0 mol/L" },
      { id: "o2", text: "0.1 mol/L", correct: true },
      { id: "o3", text: "0.01 mol/L" },
      { id: "o4", text: "10 mol/L" },
    ],
  }),
  q({
    id: "viv-dil-03",
    type: "WHY",
    difficulty: "UNDERSTANDING",
    prompt: "Why is the final volume made up to the graduation mark on the flask?",
    concept: "Volumetric flask",
    explanation:
      "The concentration depends on the final volume, and the volumetric flask is calibrated to deliver exactly that volume at its mark.",
    visual: "apparatus",
    options: [
      { id: "o1", text: "Because the flask is calibrated to that exact volume", correct: true },
      { id: "o2", text: "To save time" },
      { id: "o3", text: "Because the pipette is inaccurate" },
      { id: "o4", text: "To warm the solution" },
    ],
  }),
  q({
    id: "viv-dil-04",
    type: "ERROR_DETECTION",
    difficulty: "ANALYSIS",
    prompt:
      "5 mL of stock was transferred instead of the required 10 mL, then made up to 100 mL. What is the result?",
    concept: "Dilution calculation",
    explanation:
      "C₂ = 1 × 5 ÷ 100 = 0.05 mol/L — half the required concentration, because half the solute was transferred.",
    visual: "apparatus",
    options: [
      { id: "o1", text: "The concentration is half what was required", correct: true },
      { id: "o2", text: "The concentration is correct" },
      { id: "o3", text: "The concentration is double" },
      { id: "o4", text: "No solution is formed" },
    ],
  }),
];


/* ------------------------------------------------------------------ *
 * DOSE–RESPONSE SIMULATION
 * ------------------------------------------------------------------ */

const DOSE_RESPONSE: VivaQuestion[] = [
  q({
    id: "viv-dr-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "FOUNDATION",
    prompt: "What does EC50 represent in the Emax model?",
    concept: "EC50",
    explanation:
      "EC50 is the concentration that produces half the maximum effect. A lower EC50 means greater potency.",
    visual: "graph",
    options: [
      { id: "o1", text: "The concentration producing half the maximum effect", correct: true },
      { id: "o2", text: "The maximum effect a drug can produce" },
      { id: "o3", text: "The dose that is toxic" },
      { id: "o4", text: "The volume of distribution" },
    ],
  }),
  q({
    id: "viv-dr-02",
    referenceIds: ["ref-emax-model"],
    type: "WHAT_HAPPENS_NEXT",
    difficulty: "UNDERSTANDING",
    prompt: "A competitive antagonist is added. What happens to the dose–response curve?",
    concept: "Competitive antagonism",
    explanation:
      "A competitive antagonist shifts the curve to the right: the same maximum effect is still reachable, but a higher concentration is needed.",
    visual: "graph",
    options: [
      { id: "o1", text: "It shifts to the right — the maximum is still reachable", correct: true },
      { id: "o2", text: "The maximum effect is permanently reduced" },
      { id: "o3", text: "The curve becomes vertical" },
      { id: "o4", text: "Nothing changes" },
    ],
  }),
  q({
    id: "viv-dr-03",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Why does the response plateau as concentration keeps rising?",
    concept: "Emax",
    explanation:
      "The Emax equation approaches Emax asymptotically — once receptors are effectively saturated, more concentration adds little effect.",
    visual: "graph",
    options: [
      { id: "o1", text: "Because the effect approaches Emax asymptotically", correct: true },
      { id: "o2", text: "Because the drug is destroyed" },
      { id: "o3", text: "Because concentration stops increasing" },
      { id: "o4", text: "Because the antagonist takes over" },
    ],
  }),
];

/* ------------------------------------------------------------------ *
 * PHARMACOKINETICS OVER TIME
 * ------------------------------------------------------------------ */

const PK_DYNAMICS: VivaQuestion[] = [
  q({
    id: "viv-pkd-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "FOUNDATION",
    prompt: "In this model, why does concentration fall after the peak?",
    concept: "Elimination",
    explanation:
      "Once the absorption site is largely emptied, elimination dominates and concentration declines exponentially.",
    visual: "graph",
    options: [
      { id: "o1", text: "Because elimination now dominates over absorption", correct: true },
      { id: "o2", text: "Because the dose was too small" },
      { id: "o3", text: "Because the volume of distribution falls" },
      { id: "o4", text: "Because absorption speeds up" },
    ],
  }),
  q({
    id: "viv-pkd-02",
    type: "WHAT_HAPPENS_NEXT",
    difficulty: "UNDERSTANDING",
    prompt: "Absorption becomes faster while elimination is unchanged. What happens to Tmax?",
    concept: "Tmax",
    explanation:
      "Tmax depends on the balance of ka and ke. A faster ka means the peak arrives sooner.",
    visual: "graph",
    options: [
      { id: "o1", text: "Tmax occurs earlier", correct: true },
      { id: "o2", text: "Tmax occurs later" },
      { id: "o3", text: "Tmax is unchanged" },
      { id: "o4", text: "There is no peak at all" },
    ],
  }),
  q({
    id: "viv-pkd-03",
    type: "CALCULATION",
    difficulty: "APPLICATION",
    prompt: "The elimination rate constant is 0.15 per hour. What is the half-life?",
    concept: "Half-life",
    explanation: "t½ = 0.693 / ke = 0.693 / 0.15 = 4.62 hours.",
    visual: "graph",
    options: [
      { id: "o1", text: "4.62 hours", correct: true },
      { id: "o2", text: "0.15 hours" },
      { id: "o3", text: "15 hours" },
      { id: "o4", text: "6.93 hours" },
    ],
  }),
  q({
    id: "viv-pkd-04",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Why is ka not used for the intravenous bolus model?",
    concept: "Route of administration",
    explanation:
      "An intravenous bolus enters the central compartment directly, so there is no absorption phase to model.",
    visual: "graph",
    options: [
      { id: "o1", text: "Because the dose enters the compartment directly, with no absorption phase", correct: true },
      { id: "o2", text: "Because ka is always zero" },
      { id: "o3", text: "Because the oral model is wrong" },
      { id: "o4", text: "Because ka equals ke" },
    ],
  }),
];


/* ------------------------------------------------------------------ *
 * CLINICAL & HOSPITAL PHARMACY ACTIVITIES
 * ------------------------------------------------------------------ */

const MED_REVIEW_VIVA: VivaQuestion[] = [
  q({
    id: "viv-mr-01",
    type: "WHY",
    difficulty: "UNDERSTANDING",
    prompt: "Why is the timing of a new symptom important in a medication review?",
    concept: "Medication-related problem",
    explanation:
      "A symptom appearing shortly after a new medicine is started is precisely when a medication-related cause should be considered.",
    visual: "none",
    options: [
      { id: "o1", text: "Because it suggests the new medicine may be contributing", correct: true },
      { id: "o2", text: "Because timing is never relevant" },
      { id: "o3", text: "Because it proves the medicine caused it" },
      { id: "o4", text: "Because it rules out all other causes" },
    ],
  }),
  q({
    id: "viv-mr-02",
    type: "MULTIPLE_CHOICE",
    difficulty: "APPLICATION",
    prompt: "What is the pharmacist's role when a medication-related problem is identified?",
    concept: "Pharmaceutical care action",
    explanation:
      "The pharmacist identifies the problem, communicates it and recommends clinical review and monitoring. The prescriber makes any therapy decision.",
    visual: "none",
    options: [
      { id: "o1", text: "Identify it, communicate it and recommend clinical review and monitoring", correct: true },
      { id: "o2", text: "Change the dose independently" },
      { id: "o3", text: "Tell the patient to stop all medicines" },
      { id: "o4", text: "Document it and take no further action" },
    ],
  }),
];

const COUNSELLING_VIVA: VivaQuestion[] = [
  q({
    id: "viv-c-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "UNDERSTANDING",
    prompt: "How should a counselling interaction be closed?",
    concept: "Counselling structure",
    explanation:
      "Checking what the patient has understood and inviting further questions makes counselling a conversation rather than a lecture.",
    visual: "none",
    options: [
      { id: "o1", text: "By checking understanding and inviting further questions", correct: true },
      { id: "o2", text: "By handing over the medicines and ending" },
      { id: "o3", text: "By asking the patient to sign a form" },
      { id: "o4", text: "By reading the leaflet aloud" },
    ],
  }),
  q({
    id: "viv-c-02",
    type: "ERROR_DETECTION",
    difficulty: "ANALYSIS",
    prompt: "Which counselling point is never appropriate for an anticoagulant?",
    concept: "Patient safety",
    explanation:
      "Patients should never be told to adjust an anticoagulant themselves — any change belongs to the prescriber.",
    visual: "none",
    options: [
      { id: "o1", text: "To adjust the dose themselves if they feel unwell", correct: true },
      { id: "o2", text: "To report unusual bruising or bleeding" },
      { id: "o3", text: "To keep monitoring appointments" },
      { id: "o4", text: "To tell the care team about new medicines" },
    ],
  }),
];

const DRUG_INFO_VIVA: VivaQuestion[] = [
  q({
    id: "viv-di-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "FOUNDATION",
    prompt: "What is the first step in answering a drug-information request?",
    concept: "Defining the need",
    explanation:
      "The actual information need — which medicine, which patient, for what purpose — must be defined before anything else.",
    visual: "none",
    options: [
      { id: "o1", text: "Define exactly what information is needed", correct: true },
      { id: "o2", text: "Search the internet" },
      { id: "o3", text: "Give a general answer" },
      { id: "o4", text: "Ask a colleague from memory" },
    ],
  }),
  q({
    id: "viv-di-02",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Why is a colleague's recollection not an acceptable source?",
    concept: "Source hierarchy",
    explanation:
      "Recollection cannot be verified, however experienced the colleague. Authoritative, current, relevant sources can be.",
    visual: "none",
    options: [
      { id: "o1", text: "Because it cannot be verified or referenced", correct: true },
      { id: "o2", text: "Because colleagues are usually wrong" },
      { id: "o3", text: "Because it takes too long to ask" },
      { id: "o4", text: "Because it is always out of date" },
    ],
  }),
];

const INVENTORY_VIVA: VivaQuestion[] = [
  q({
    id: "viv-iv-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "APPLICATION",
    prompt: "Two items are low and one expires soonest. How is priority decided?",
    concept: "Prioritisation",
    explanation:
      "Clinical importance combined with stock level decides urgency — a medicine that must not run out comes first.",
    visual: "none",
    options: [
      { id: "o1", text: "By clinical importance combined with stock level", correct: true },
      { id: "o2", text: "By alphabetical order" },
      { id: "o3", text: "By whichever is cheapest" },
      { id: "o4", text: "By whichever is nearest the door" },
    ],
  }),
  q({
    id: "viv-iv-02",
    type: "WHY",
    difficulty: "UNDERSTANDING",
    prompt: "Why is expiry review done ahead of the expiry date?",
    concept: "Expiry management",
    explanation:
      "Reviewing ahead of the date gives time to use, return or replace stock before it becomes unusable.",
    visual: "none",
    options: [
      { id: "o1", text: "So there is time to act before the stock becomes unusable", correct: true },
      { id: "o2", text: "Because expired stock is dangerous to count" },
      { id: "o3", text: "Because it is a legal requirement to count weekly" },
      { id: "o4", text: "Because it saves money on shelves" },
    ],
  }),
];

const DISPENSING_VIVA: VivaQuestion[] = [
  q({
    id: "viv-dw-01",
    type: "MULTIPLE_CHOICE",
    difficulty: "UNDERSTANDING",
    prompt: "What is the purpose of the final check before dispensing?",
    concept: "Dispensing check",
    explanation:
      "The final check is the last opportunity to catch a discrepancy before the medicine reaches the ward.",
    visual: "none",
    options: [
      { id: "o1", text: "An independent verification of medicine, form and patient before it leaves the pharmacy", correct: true },
      { id: "o2", text: "A repeat of the pharmacy review" },
      { id: "o3", text: "A check that the paperwork is filed" },
      { id: "o4", text: "An optional extra step" },
    ],
  }),
  q({
    id: "viv-dw-02",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Why does the workflow not end at delivery to the ward?",
    concept: "Pharmaceutical care",
    explanation:
      "Delivery ends the dispensing task, not the pharmaceutical care — receipt and monitoring still need confirming.",
    visual: "none",
    options: [
      { id: "o1", text: "Because receipt and any monitoring still need confirming", correct: true },
      { id: "o2", text: "Because the pharmacy must be paid" },
      { id: "o3", text: "Because the ward always loses medicines" },
      { id: "o4", text: "Because the order must be re-written" },
    ],
  }),
];

const MED_ERROR_VIVA: VivaQuestion[] = [
  q({
    id: "viv-me-01",
    type: "OBSERVATION_INTERPRETATION",
    difficulty: "FOUNDATION",
    prompt: "Two medicines from the same class appear on one chart. What is this?",
    concept: "Duplicate therapy",
    explanation:
      "Two medicines from the same class with the same effect constitute duplicate therapy, increasing the risk of the same adverse effects.",
    visual: "none",
    options: [
      { id: "o1", text: "Duplicate therapy", correct: true },
      { id: "o2", text: "Appropriate combination therapy" },
      { id: "o3", text: "A documentation error" },
      { id: "o4", text: "A storage error" },
    ],
  }),
  q({
    id: "viv-me-02",
    type: "WHY",
    difficulty: "ANALYSIS",
    prompt: "Why is a system that flags duplication better than asking for more care?",
    concept: "Error prevention",
    explanation:
      "A system control makes the error visible at the point of prescribing and at pharmacy review, so it does not depend on memory.",
    visual: "none",
    options: [
      { id: "o1", text: "Because it does not rely on individual memory or vigilance", correct: true },
      { id: "o2", text: "Because it is cheaper than training" },
      { id: "o3", text: "Because prescribers are not careful" },
      { id: "o4", text: "Because it removes the need for review" },
    ],
  }),
];

export const VIVA_BANKS: Record<string, VivaBank> = {
  [TITRATION_EXPERIMENT.id]: {
    experimentId: TITRATION_EXPERIMENT.id,
    questions: TITRATION,
  },
  [PK_EXPERIMENT.id]: {
    experimentId: PK_EXPERIMENT.id,
    questions: PK,
  },
  [DILUTION_EXPERIMENT.id]: {
    experimentId: DILUTION_EXPERIMENT.id,
    questions: DILUTION,
  },
  [DOSE_RESPONSE_SIMULATION.id]: {
    experimentId: DOSE_RESPONSE_SIMULATION.id,
    questions: DOSE_RESPONSE,
  },
  [PK_DYNAMICS_SIMULATION.id]: {
    experimentId: PK_DYNAMICS_SIMULATION.id,
    questions: PK_DYNAMICS,
  },
  [MEDICATION_REVIEW_EXPERIMENT.id]: {
    experimentId: MEDICATION_REVIEW_EXPERIMENT.id,
    questions: MED_REVIEW_VIVA,
  },
  [COUNSELLING_EXPERIMENT.id]: {
    experimentId: COUNSELLING_EXPERIMENT.id,
    questions: COUNSELLING_VIVA,
  },
  [DRUG_INFORMATION_EXPERIMENT.id]: {
    experimentId: DRUG_INFORMATION_EXPERIMENT.id,
    questions: DRUG_INFO_VIVA,
  },
  [INVENTORY_EXPERIMENT.id]: {
    experimentId: INVENTORY_EXPERIMENT.id,
    questions: INVENTORY_VIVA,
  },
  [DISPENSING_EXPERIMENT.id]: {
    experimentId: DISPENSING_EXPERIMENT.id,
    questions: DISPENSING_VIVA,
  },
  [MEDICATION_ERROR_EXPERIMENT.id]: {
    experimentId: MEDICATION_ERROR_EXPERIMENT.id,
    questions: MED_ERROR_VIVA,
  },
};

export function vivaBankFor(experimentId: string): VivaBank | undefined {
  return VIVA_BANKS[experimentId];
}

/** Where a concept is reviewed, per experiment. */
export const CONCEPT_REVIEW: Record<string, string> = {
  Burette: "Fill the burette",
  Pipette: "Add the acid aliquot",
  "Endpoint detection": "Titrate to the endpoint",
  "Titration calculation": "Calculate the acid concentration",
  "Titration procedure": "The procedure, step by step",
  Clearance: "Set the clearance",
  "Half-life": "Read the half-life",
  AUC: "Calculate the area under the curve",
  "Volume of distribution": "Set the volume of distribution",
  "Dilution principle": "Why C₁V₁ = C₂V₂",
  "Dilution calculation": "Calculate the aliquot",
  "Volumetric flask": "Make up to volume",
  EC50: "Set EC50",
  "Competitive antagonism": "Add a competitive antagonist",
  Emax: "Set the maximum effect",
  Elimination: "Set the elimination rate",
  Tmax: "Choose the route",
  "Route of administration": "Choose the route",
  "Medication-related problem": "Identify the problem",
  "Pharmaceutical care action": "Choose the action",
  "Counselling structure": "Plan the counselling",
  "Patient safety": "Select the counselling points",
  "Defining the need": "Assess the request",
  "Source hierarchy": "Identify the source",
  "Prioritisation": "Prioritise the actions",
  "Expiry management": "Review the stock",
  "Dispensing check": "Complete the final check",
  "Duplicate therapy": "Identify the error",
  "Error prevention": "Choose the prevention",
};
