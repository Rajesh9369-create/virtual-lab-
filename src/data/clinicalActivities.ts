/**
 * CLINICAL & HOSPITAL PHARMACY ACTIVITIES
 * ---------------------------------------
 * Six polished, reusable demonstrations. Every case is a fictional educational
 * scenario: no real patient data, no dosing instruction, no reference range,
 * no formulary policy and no treatment recommendation. Where content is not
 * verified the activity says so.
 */
import type { Experiment } from "../engine/types";
import type { ClinicalActivity } from "../engine/activityFlow";
import { DOMAIN_VISUALS } from "./visuals";

/* ================================================================ *
 * THE VIRTUAL PATIENT — shared by the clinical activities
 * ================================================================ */

export const PATIENT = {
  id: "patient-sim-01",
  initials: "SP",
  name: "Simulated patient",
  context: "Attending a pharmacy medication review",
  banner: "Simulated educational patient — not a real person",
  history: [
    "Atrial fibrillation — ongoing",
    "Hypertension — ongoing",
    "Type 2 diabetes — ongoing",
  ],
  allergies: ["No known allergies recorded on the simulated chart"],
  presenting:
    "Reports noticing increased bruising over the past week.",
  recentChange:
    "A new medicine was started about a week ago.",
};

/* ================================================================ *
 * 1. MEDICATION REVIEW  (clinical)
 * ================================================================ */

export const MEDICATION_REVIEW: ClinicalActivity = {
  id: "act-medication-review",
  kind: "MEDICATION_REVIEW",
  environment: "clinical",
  title: "Medication Review",
  objective:
    "Gather information, identify the medication-related problem and choose the pharmaceutical care action.",
  skills: ["Information gathering", "Problem identification", "Clinical reasoning"],
  concepts: ["Medication-related problem", "Pharmaceutical care action", "Counselling", "Monitoring"],
  sourceStatus: "NON_IP_EDUCATIONAL",
  sourceNote:
    "The interaction described is a long-established teaching point in pharmaceutical care. Source verification required.",
  stages: [
    {
      id: "mr-1",
      title: "Observe",
      instruction: "Read the simulated patient's context.",
      reveals: [
        {
          kind: "patient",
          title: "Patient",
          caption: PATIENT.banner,
          items: [
            { id: "p1", label: "Context", value: PATIENT.context },
            { id: "p2", label: "Presenting report", value: PATIENT.presenting, tone: "attention" },
            { id: "p3", label: "Recent change", value: PATIENT.recentChange, tone: "recent" },
          ],
        },
        {
          kind: "notes",
          title: "Medical history",
          items: PATIENT.history.map((h, i) => ({
            id: `h${i}`,
            label: h,
            value: "Ongoing",
          })),
        },
      ],
    },
    {
      id: "mr-2",
      title: "Assess",
      instruction: "Review the current medicines.",
      reveals: [
        {
          kind: "medications",
          title: "Current medicines",
          caption: "Simulated medication chart — dose detail not verified",
          items: [
            { id: "m1", label: "Warfarin", value: "Anticoagulant — ongoing", tone: "normal" },
            { id: "m2", label: "Co-trimoxazole", value: "Antibiotic — started last week", tone: "recent" },
            { id: "m3", label: "Amlodipine", value: "Antihypertensive — ongoing", tone: "normal" },
            { id: "m4", label: "Metformin", value: "Antidiabetic — ongoing", tone: "normal" },
          ],
        },
      ],
    },
    {
      id: "mr-3",
      title: "Assess",
      instruction: "Consider the laboratory information on the record.",
      reveals: [
        {
          kind: "labs",
          title: "Laboratory record",
          caption: "Simulated record — no numeric value or reference range is quoted",
          items: [
            {
              id: "l1",
              label: "INR",
              value: "Reported above the patient's usual target range",
              tone: "attention",
            },
          ],
        },
        {
          kind: "vitals",
          title: "Vitals",
          caption: "Simulated educational values — not real clinical monitoring",
          items: [
            { id: "v1", label: "Heart rate", value: "Recorded on the simulated chart" },
            { id: "v2", label: "Blood pressure", value: "Recorded on the simulated chart" },
          ],
        },
      ],
    },
    {
      id: "mr-4",
      title: "Identify",
      instruction: "Identify the medication-related problem.",
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
              "Correct. The antibiotic started last week can increase warfarin's effect, which fits the increased bruising and the INR being above the patient's usual range.",
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
              "It may turn out to be unrelated, but that cannot be concluded before assessment — the timing warrants review first.",
          },
        ],
      },
    },
    {
      id: "mr-5",
      title: "Plan",
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
              "Correct. The pharmacist identifies the problem, communicates it and recommends clinical review and monitoring. The prescriber makes any therapy decision.",
          },
          {
            id: "o2",
            text: "Advise the patient to stop all their medicines immediately.",
            correct: false,
            feedback:
              "Stopping all medicines abruptly is not a pharmacist's instruction to give and could itself cause harm. The action is to escalate for review.",
          },
          {
            id: "o3",
            text: "Note it in the record and take no further action.",
            correct: false,
            feedback:
              "Documenting is good practice but is not sufficient alone — a possible increase in anticoagulant effect needs active escalation.",
          },
          {
            id: "o4",
            text: "Tell the patient to take an extra dose of the anticoagulant.",
            correct: false,
            feedback:
              "That moves in the wrong direction and is a prescribing decision in any case. The pharmacist escalates rather than adjusting therapy.",
          },
        ],
      },
    },
    {
      id: "mr-6",
      title: "Act",
      instruction: "What monitoring is appropriate?",
      reveals: [],
      choice: {
        prompt: "Which monitoring is appropriate?",
        options: [
          {
            id: "o1",
            text: "INR monitoring as clinically directed, and review of whether the antibiotic is still needed.",
            correct: true,
            feedback:
              "Correct. Monitoring the anticoagulant effect and reviewing the indication for the new medicine address both the effect and its cause.",
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

/* ================================================================ *
 * 2. PATIENT COUNSELLING  (clinical)
 * ================================================================ */

export const COUNSELLING: ClinicalActivity = {
  id: "act-counselling",
  kind: "COUNSELLING",
  environment: "clinical",
  title: "Patient Counselling",
  objective:
    "Work out what a patient needs to know about their medicine, and cover it in a simulated conversation.",
  skills: ["Counselling structure", "Communication", "Safety-netting"],
  concepts: ["Administration", "Adherence", "Monitoring", "When to seek help"],
  sourceStatus: "VERIFICATION_REQUIRED",
  sourceNote:
    "Simulated educational interaction. The counselling categories are general educational points; specific medicine information is not provided here. Source verification required.",
  stages: [
    {
      id: "c-1",
      title: "Observe",
      instruction: "The simulated patient has a question.",
      reveals: [
        {
          kind: "counselling",
          title: "Patient question",
          caption: "Simulated educational patient",
          items: [
            {
              id: "q1",
              label: "The patient asks",
              value: "\u201cWhat should I know about taking this medicine?\u201d",
              tone: "attention",
            },
          ],
        },
      ],
    },
    {
      id: "c-2",
      title: "Plan",
      instruction: "Choose everything that should be covered in this counselling.",
      reveals: [
        {
          kind: "medications",
          title: "Medicine being discussed",
          caption: "Simulated chart — no dose or administration detail is given",
          items: [
            { id: "m1", label: "Warfarin", value: "Anticoagulant — the medicine under discussion" },
          ],
        },
      ],
      multi: {
        prompt: "Select every point that belongs in this counselling.",
        options: [
          {
            id: "o1",
            text: "How important it is to take it regularly, as directed.",
            correct: true,
            feedback:
              "Yes — adherence to an anticoagulant is central to its safe use.",
          },
          {
            id: "o2",
            text: "That monitoring appointments should be kept.",
            correct: true,
            feedback:
              "Yes — monitoring is how the effect of this medicine is kept safe.",
          },
          {
            id: "o3",
            text: "To tell every healthcare professional about this medicine before anything new is started.",
            correct: true,
            feedback:
              "Yes — this is what makes interactions less likely to be missed.",
          },
          {
            id: "o4",
            text: "To report unusual bruising or bleeding, and where to get help.",
            correct: true,
            feedback:
              "Yes — safety-netting is a core part of counselling for this medicine.",
          },
          {
            id: "o5",
            text: "That they should adjust the dose themselves if they feel unwell.",
            correct: false,
            feedback:
              "No. Patients should never be told to adjust this medicine themselves — any change belongs to the prescriber.",
          },
          {
            id: "o6",
            text: "That no follow-up is needed.",
            correct: false,
            feedback:
              "No. Follow-up is part of safe use, and the patient should know it is expected.",
          },
        ],
      },
    },
    {
      id: "c-3",
      title: "Act",
      instruction: "How should the counselling be closed?",
      reveals: [],
      choice: {
        prompt: "How should this counselling be finished?",
        options: [
          {
            id: "o1",
            text: "Check what the patient has understood, and invite further questions.",
            correct: true,
            feedback:
              "Correct. Closing a counselling interaction by checking understanding is what makes it a conversation rather than a lecture.",
          },
          {
            id: "o2",
            text: "Hand over the medicines and end the conversation.",
            correct: false,
            feedback:
              "That misses the chance to find out whether anything was unclear.",
          },
          {
            id: "o3",
            text: "Ask the patient to read the leaflet and sign a form.",
            correct: false,
            feedback:
              "Written information supports counselling but does not replace checking understanding.",
          },
        ],
      },
    },
  ],
};

/* ================================================================ *
 * 3. DRUG INFORMATION WORKFLOW  (clinical)
 * ================================================================ */

export const DRUG_INFORMATION: ClinicalActivity = {
  id: "act-drug-information",
  kind: "DRUG_INFORMATION",
  environment: "clinical",
  title: "Drug Information Request",
  objective:
    "Work a drug-information request through the steps a pharmacist follows, from question to response.",
  skills: ["Question clarification", "Source selection", "Response formulation"],
  concepts: ["Defining the need", "Source hierarchy", "Verifying information"],
  sourceStatus: "VERIFICATION_REQUIRED",
  sourceNote:
    "The workflow is the educational content. No specific medicine information is asserted and no reference is cited. Source verification required.",
  stages: [
    {
      id: "di-1",
      title: "Observe",
      instruction: "A request arrives at the medicines information desk.",
      reveals: [
        {
          kind: "notes",
          title: "The request",
          caption: "Simulated request",
          items: [
            {
              id: "r1",
              label: "A nurse asks",
              value:
                "\u201cCan this medicine be taken with food?\u201d",
              tone: "attention",
            },
            {
              id: "r2",
              label: "Context",
              value: "Asked for a specific patient on a specific ward",
            },
          ],
        },
      ],
    },
    {
      id: "di-2",
      title: "Assess",
      instruction: "What should be established first?",
      reveals: [],
      choice: {
        prompt: "What is the first thing to establish?",
        options: [
          {
            id: "o1",
            text: "Exactly which medicine, which patient and for what purpose — the actual information need.",
            correct: true,
            feedback:
              "Correct. A request stated in general terms cannot be answered reliably until the actual need is defined.",
          },
          {
            id: "o2",
            text: "Give a general answer about food and medicines.",
            correct: false,
            feedback:
              "A general answer may not apply to this medicine or this patient, and could be misleading.",
          },
          {
            id: "o3",
            text: "Ask the nurse to look it up herself.",
            correct: false,
            feedback:
              "Responding to medicines information requests is part of the pharmacist's role.",
          },
        ],
      },
    },
    {
      id: "di-3",
      title: "Identify",
      instruction: "Which source should be consulted first?",
      reveals: [],
      choice: {
        prompt: "Which is the most appropriate first source?",
        options: [
          {
            id: "o1",
            text: "The authoritative product information for that specific medicine.",
            correct: true,
            feedback:
              "Correct. Authoritative product information is the appropriate primary source for an administration question.",
          },
          {
            id: "o2",
            text: "A colleague's recollection.",
            correct: false,
            feedback:
              "Recollection is not a verifiable source, however experienced the colleague.",
          },
          {
            id: "o3",
            text: "An internet search returning the first result.",
            correct: false,
            feedback:
              "An unfiltered search result is not an authoritative source for clinical information.",
          },
        ],
      },
    },
    {
      id: "di-4",
      title: "Evaluate",
      instruction: "How should the information be judged?",
      reveals: [],
      choice: {
        prompt: "What makes the information acceptable to use?",
        options: [
          {
            id: "o1",
            text: "It comes from an authoritative source, is current, and actually answers the question asked.",
            correct: true,
            feedback:
              "Correct. Authority, currency and relevance together decide whether information is usable.",
          },
          {
            id: "o2",
            text: "It was easy to find.",
            correct: false,
            feedback:
              "Convenience says nothing about reliability.",
          },
          {
            id: "o3",
            text: "It agrees with what was already assumed.",
            correct: false,
            feedback:
              "Confirmation is not evidence — the source must support it, not the other way round.",
          },
        ],
      },
    },
    {
      id: "di-5",
      title: "Formulate",
      instruction: "How should the response be given?",
      reveals: [
        {
          kind: "notes",
          title: "Response",
          caption: "Source verification required for the specific content",
          items: [
            {
              id: "n1",
              label: "The specific answer",
              value: "Source verification required",
              tone: "warn",
              note:
                "The answer for any particular medicine must come from a verified source before it is given.",
            },
          ],
        },
      ],
      choice: {
        prompt: "How should the response be delivered?",
        options: [
          {
            id: "o1",
            text: "State the answer with its source, note any limitations, and document the enquiry.",
            correct: true,
            feedback:
              "Correct. A medicines information response carries its source, its limits and a record of what was asked and answered.",
          },
          {
            id: "o2",
            text: "Answer verbally and keep no record.",
            correct: false,
            feedback:
              "Documentation is part of the service — it allows the answer to be checked and reused.",
          },
          {
            id: "o3",
            text: "Send a link without checking whether it answers the question.",
            correct: false,
            feedback:
              "Passing on a source is not the same as answering the question that was asked.",
          },
        ],
      },
    },
  ],
};

/* ================================================================ *
 * 4. INVENTORY  (hospital)
 * ================================================================ */

export const INVENTORY: ClinicalActivity = {
  id: "act-inventory",
  kind: "INVENTORY",
  environment: "hospital",
  title: "Inventory Review",
  objective:
    "Inspect a simulated pharmacy store, find the items needing attention, and prioritise them.",
  skills: ["Stock inspection", "Expiry review", "Prioritisation"],
  concepts: ["Stock level", "Expiry management", "Prioritisation"],
  sourceStatus: "EDUCATIONAL_SIMULATION",
  sourceNote:
    "Simulated inventory — not a real hospital system. Item names are generic medicine names only.",
  stages: [
    {
      id: "iv-1",
      title: "Observe",
      instruction: "Inspect the simulated pharmacy store.",
      reveals: [
        {
          kind: "inventory",
          title: "Pharmacy store",
          caption: "Simulated inventory — not a real hospital system",
          items: [
            { id: "i1", label: "Paracetamol tablets", value: "Tablets", stock: 420, expiry: "2027-04-30" },
            { id: "i2", label: "Amoxicillin capsules", value: "Capsules", stock: 40, expiry: "2026-03-31", tone: "low" },
            { id: "i3", label: "Metformin tablets", value: "Tablets", stock: 260, expiry: "2026-02-28", tone: "warn" },
            { id: "i4", label: "Amlodipine tablets", value: "Tablets", stock: 180, expiry: "2027-09-30" },
            { id: "i5", label: "Salbutamol inhalers", value: "Inhalers", stock: 12, expiry: "2026-08-31", tone: "low" },
            { id: "i6", label: "Omeprazole capsules", value: "Capsules", stock: 95, expiry: "2026-01-31", tone: "warn" },
          ],
        },
        {
          kind: "notes",
          title: "Store policy",
          caption: "Demonstration thresholds",
          items: [
            { id: "p1", label: "Reorder level", value: "Below 50 units" },
            { id: "p2", label: "Expiry review", value: "Within 6 months" },
          ],
        },
      ],
    },
    {
      id: "iv-2",
      title: "Assess",
      instruction: "Which items are below the reorder level?",
      reveals: [],
      multi: {
        prompt: "Select every item that is below the reorder level.",
        options: [
          { id: "o1", text: "Paracetamol tablets", correct: false, feedback: "420 units is well above the reorder level." },
          { id: "o2", text: "Amoxicillin capsules", correct: true, feedback: "40 units is below the reorder level of 50." },
          { id: "o3", text: "Metformin tablets", correct: false, feedback: "260 units is comfortably above the reorder level." },
          { id: "o4", text: "Amlodipine tablets", correct: false, feedback: "180 units is above the reorder level." },
          { id: "o5", text: "Salbutamol inhalers", correct: true, feedback: "12 units is far below the reorder level of 50." },
          { id: "o6", text: "Omeprazole capsules", correct: false, feedback: "95 units is above the reorder level." },
        ],
      },
    },
    {
      id: "iv-3",
      title: "Assess",
      instruction: "Which item expires soonest and needs expiry review?",
      reveals: [],
      choice: {
        prompt: "Which item has the earliest expiry date?",
        options: [
          { id: "o1", text: "Omeprazole capsules — January 2026", correct: true, feedback: "Correct. That is the earliest date in the store, so it is the first to be reviewed." },
          { id: "o2", text: "Metformin tablets — February 2026", correct: false, feedback: "Close, but February 2026 is later than January 2026." },
          { id: "o3", text: "Amoxicillin capsules — March 2026", correct: false, feedback: "March 2026 is later than January 2026." },
          { id: "o4", text: "Paracetamol tablets — April 2027", correct: false, feedback: "That is the latest date in the store." },
        ],
      },
    },
    {
      id: "iv-4",
      title: "Prioritise",
      instruction: "Which action should come first?",
      reveals: [],
      choice: {
        prompt: "Which action takes priority?",
        options: [
          {
            id: "o1",
            text: "Reorder the salbutamol inhalers — lowest stock, and it is a medicine that must not run out.",
            correct: true,
            feedback:
              "Correct. Combining the lowest stock level with clinical importance makes this the first priority.",
          },
          {
            id: "o2",
            text: "Reorder paracetamol, because it is used most often.",
            correct: false,
            feedback:
              "Frequency of use matters, but paracetamol is well above the reorder level and is not urgent.",
          },
          {
            id: "o3",
            text: "Nothing needs action today.",
            correct: false,
            feedback:
              "Two items are below the reorder level and one expires soonest — all three need action.",
          },
        ],
      },
    },
  ],
};

/* ================================================================ *
 * 5. DISPENSING WORKFLOW  (hospital)
 * ================================================================ */

export const DISPENSING: ClinicalActivity = {
  id: "act-dispensing",
  kind: "DISPENSING_WORKFLOW",
  environment: "hospital",
  title: "Dispensing Workflow",
  objective:
    "Follow a medication order through pharmacy review and dispensing to the ward.",
  skills: ["Order review", "Workflow management", "Verification"],
  concepts: ["Pharmacy review", "Dispensing check", "Handover"],
  sourceStatus: "EDUCATIONAL_SIMULATION",
  sourceNote:
    "Demonstration workflow. No specific medicine, dose or patient is asserted.",
  stages: [
    {
      id: "dw-1",
      title: "Observe",
      instruction: "A medication order arrives in the pharmacy.",
      reveals: [
        {
          kind: "workflow",
          title: "Order status",
          caption: "Demonstration workflow",
          items: [
            { id: "w1", label: "Medication order", value: "Received", tone: "ok" },
            { id: "w2", label: "Pharmacy review", value: "Pending" },
            { id: "w3", label: "Dispensing", value: "Pending" },
            { id: "w4", label: "Final check", value: "Pending" },
            { id: "w5", label: "To the ward", value: "Pending" },
          ],
        },
      ],
    },
    {
      id: "dw-2",
      title: "Assess",
      instruction: "What does pharmacy review involve?",
      reveals: [],
      choice: {
        prompt: "What is being checked at the pharmacy review step?",
        options: [
          {
            id: "o1",
            text: "That the order is complete, appropriate for the patient, and free of duplication or interaction with the current medicines.",
            correct: true,
            feedback:
              "Correct. Review is a clinical and pharmaceutical check, not just a data-entry step.",
          },
          {
            id: "o2",
            text: "Only that the prescription is legible.",
            correct: false,
            feedback:
              "Legibility matters, but review is far broader than that.",
          },
          {
            id: "o3",
            text: "Whether the patient has insurance.",
            correct: false,
            feedback:
              "That is not a pharmacy review step in this workflow.",
          },
        ],
      },
    },
    {
      id: "dw-3",
      title: "Act",
      instruction: "Advance the order through dispensing.",
      reveals: [
        {
          kind: "workflow",
          title: "Order status",
          caption: "Demonstration workflow",
          items: [
            { id: "w1", label: "Medication order", value: "Complete", tone: "ok" },
            { id: "w2", label: "Pharmacy review", value: "Complete", tone: "ok" },
            { id: "w3", label: "Dispensing", value: "Complete", tone: "ok" },
            { id: "w4", label: "Final check", value: "In progress", tone: "attention" },
            { id: "w5", label: "To the ward", value: "Pending" },
          ],
        },
      ],
      choice: {
        prompt: "What is the final check before the medicine leaves the pharmacy?",
        options: [
          {
            id: "o1",
            text: "An independent check that the right medicine, in the right form, is labelled for the right patient.",
            correct: true,
            feedback:
              "Correct. The final check is the last opportunity to catch a discrepancy before the medicine reaches the ward.",
          },
          {
            id: "o2",
            text: "Nothing — dispensing has already been checked.",
            correct: false,
            feedback:
              "The final check is a distinct, independent step and is not optional.",
          },
          {
            id: "o3",
            text: "Only that the paperwork is filed.",
            correct: false,
            feedback:
              "Documentation matters, but the check is about the medicine itself.",
          },
        ],
      },
    },
    {
      id: "dw-4",
      title: "Reassess",
      instruction: "What should happen after the medicine reaches the ward?",
      reveals: [
        {
          kind: "workflow",
          title: "Order status",
          caption: "Demonstration workflow",
          items: [
            { id: "w1", label: "Medication order", value: "Complete", tone: "ok" },
            { id: "w2", label: "Pharmacy review", value: "Complete", tone: "ok" },
            { id: "w3", label: "Dispensing", value: "Complete", tone: "ok" },
            { id: "w4", label: "Final check", value: "Complete", tone: "ok" },
            { id: "w5", label: "To the ward", value: "Delivered", tone: "ok" },
          ],
        },
      ],
      choice: {
        prompt: "What closes the loop on this order?",
        options: [
          {
            id: "o1",
            text: "Confirming it was received, and that monitoring where indicated continues on the ward.",
            correct: true,
            feedback:
              "Correct. Closing the loop means knowing it arrived and that any follow-up is in hand.",
          },
          {
            id: "o2",
            text: "Nothing — delivery ends the process.",
            correct: false,
            feedback:
              "Delivery ends the dispensing task, not the pharmaceutical care.",
          },
          {
            id: "o3",
            text: "Filing the order without confirming receipt.",
            correct: false,
            feedback:
              "Without confirming receipt you cannot know the order was completed.",
          },
        ],
      },
    },
  ],
};

/* ================================================================ *
 * 6. MEDICATION ERROR RECOGNITION  (hospital)
 * ================================================================ */

export const MEDICATION_ERROR: ClinicalActivity = {
  id: "act-medication-error",
  kind: "MEDICATION_ERROR",
  environment: "hospital",
  title: "Medication Error Recognition",
  objective:
    "Recognise a medication error in a simulated order, analyse why it happened, and choose how to prevent it.",
  skills: ["Error recognition", "Root-cause thinking", "Prevention"],
  concepts: ["Duplicate therapy", "Error prevention", "System design"],
  sourceStatus: "EDUCATIONAL_SIMULATION",
  sourceNote:
    "Simulated educational scenario. The objective is recognition and prevention — no dosing information is given or implied.",
  stages: [
    {
      id: "me-1",
      title: "Observe",
      instruction: "Review this simulated medication order.",
      reveals: [
        {
          kind: "medications",
          title: "Medication order",
          caption: "Simulated order — no dose information is given",
          items: [
            { id: "m1", label: "Ibuprofen", value: "NSAID — on the existing chart", tone: "normal" },
            { id: "m2", label: "Diclofenac", value: "NSAID — newly prescribed", tone: "recent" },
            { id: "m3", label: "Paracetamol", value: "Analgesic — on the existing chart", tone: "normal" },
          ],
        },
      ],
    },
    {
      id: "me-2",
      title: "Identify",
      instruction: "What is the problem with this order?",
      reveals: [],
      choice: {
        prompt: "Which error is present?",
        options: [
          {
            id: "o1",
            text: "Duplicate therapy — two medicines from the same class with the same effect.",
            correct: true,
            feedback:
              "Correct. Two NSAIDs together duplicate therapy and increase the risk of the same adverse effects.",
          },
          {
            id: "o2",
            text: "There is no problem — both are common medicines.",
            correct: false,
            feedback:
              "Being individually common does not make them appropriate together. They belong to the same class.",
          },
          {
            id: "o3",
            text: "The paracetamol is the error.",
            correct: false,
            feedback:
              "Paracetamol is from a different class and is not the duplication here.",
          },
          {
            id: "o4",
            text: "The route of administration is wrong.",
            correct: false,
            feedback:
              "No route information is given in this scenario, so that cannot be the identified error.",
          },
        ],
      },
    },
    {
      id: "me-3",
      title: "Analyse",
      instruction: "Why did this error reach the pharmacy?",
      reveals: [],
      choice: {
        prompt: "What most likely allowed this to happen?",
        options: [
          {
            id: "o1",
            text: "The existing medication chart was not checked against the new order.",
            correct: true,
            feedback:
              "Correct. Comparing a new order against what is already prescribed is exactly what catches duplication.",
          },
          {
            id: "o2",
            text: "The medicines were stored in the wrong place.",
            correct: false,
            feedback:
              "Storage is not what determines whether two same-class medicines are co-prescribed.",
          },
          {
            id: "o3",
            text: "The pharmacist was too busy to be careful.",
            correct: false,
            feedback:
              "Individual blame is rarely the useful answer — the system should make duplication visible.",
          },
        ],
      },
    },
    {
      id: "me-4",
      title: "Prevent",
      instruction: "How could this be prevented in future?",
      reveals: [],
      choice: {
        prompt: "Which measure best prevents this specific error?",
        options: [
          {
            id: "o1",
            text: "A system that flags duplicate therapy at the point of prescribing and at pharmacy review.",
            correct: true,
            feedback:
              "Correct. Making duplication visible at both points catches it even if one is missed.",
          },
          {
            id: "o2",
            text: "Removing all NSAIDs from the formulary.",
            correct: false,
            feedback:
              "That would remove a needed class of medicines rather than address the duplication.",
          },
          {
            id: "o3",
            text: "Asking prescribers to be more careful.",
            correct: false,
            feedback:
              "Care is welcome, but reliance on memory alone is not a system control.",
          },
        ],
      },
    },
  ],
};

/** Demonstration formulary — browse only, no policy is asserted. */
export const FORMULAARY_PLACEHOLDER = [
  { name: "Paracetamol", form: "Tablets", status: "Listed" },
  { name: "Ibuprofen", form: "Tablets", status: "Listed" },
  { name: "Amoxicillin", form: "Capsules", status: "Listed" },
  { name: "Metformin", form: "Tablets", status: "Listed" },
  { name: "Amlodipine", form: "Tablets", status: "Listed" },
  { name: "Salbutamol", form: "Inhalers", status: "Listed" },
  { name: "Omeprazole", form: "Capsules", status: "Listed" },
  { name: "Warfarin", form: "Tablets", status: "Restricted — clinical review" },
];

/* ---------------------------------------------------------- Experiments */

/** Wrap an activity as an experiment so it runs through the existing engine. */
function asExperiment(
  activity: ClinicalActivity,
  slug: string,
  title: string,
  domain: string,
  subjectId: string,
  yearNumber: number,
  type: Experiment["type"],
  visualDomain: string,
  themeId: string
): Experiment {
  return {
    id: activity.id,
    slug,
    title,
    domain,
    subjectId,
    yearNumber,
    type,
    category: "SIMULATION",
    shortDescription: activity.objective,
    interactionLabel:
      activity.environment === "clinical" ? "Clinical reasoning" : "Pharmacy workflow",
    objective: activity.objective,
    concept: activity.objective,
    status: "AVAILABLE",
    themeId,
    source: { status: activity.sourceStatus, note: activity.sourceNote },
    simulation: { kind: "clinicalActivity" },
    apparatus: [],
    materials: [],
    steps: [],
    observations: [],
    calculations: [],
    result: { id: `res-${activity.id}`, status: "AVAILABLE" },
    references: [
      {
        id: `ref-${activity.id}`,
        category: "ACADEMIC",
        status: "VERIFICATION_REQUIRED",
        note: "Reference verification required.",
      },
    ],
    assessment: {
      id: `assess-${activity.id}`,
      items: [{ id: `a-${activity.id}`, type: "multiple-choice", status: "PLANNED" }],
      status: "PLANNED",
      note: "Assessment items appear once verified content is connected.",
    },
    visuals: [
      {
        id: `vis-${activity.id}`,
        role: "heroVisual",
        src: DOMAIN_VISUALS[visualDomain].src,
        alt: DOMAIN_VISUALS[visualDomain].alt,
        caption: DOMAIN_VISUALS[visualDomain].caption,
      },
    ],
  };
}

export const MEDICATION_REVIEW_EXPERIMENT = asExperiment(
  MEDICATION_REVIEW,
  "clinical-medication-review",
  "Medication Review",
  "Clinical Pharmacy",
  "y04-clinical-pharmacy",
  4,
  "CLINICAL_CASE",
  "Clinical Pharmacy",
  "clinical-lab"
);

export const COUNSELLING_EXPERIMENT = asExperiment(
  COUNSELLING,
  "patient-counselling",
  "Patient Counselling",
  "Clinical Pharmacy",
  "y04-clinical-pharmacy",
  4,
  "CLINICAL_CASE",
  "Clinical Pharmacy",
  "clinical-lab"
);

export const DRUG_INFORMATION_EXPERIMENT = asExperiment(
  DRUG_INFORMATION,
  "drug-information-request",
  "Drug Information Request",
  "Clinical Pharmacy",
  "y04-clinical-pharmacy",
  4,
  "CLINICAL_CASE",
  "Clinical Pharmacy",
  "clinical-lab"
);

export const INVENTORY_EXPERIMENT = asExperiment(
  INVENTORY,
  "pharmacy-inventory-review",
  "Inventory Review",
  "Hospital Pharmacy",
  "y04-hospital-pharmacy",
  4,
  "HOSPITAL_WORKFLOW",
  "Hospital Pharmacy",
  "hospital-lab"
);

export const DISPENSING_EXPERIMENT = asExperiment(
  DISPENSING,
  "dispensing-workflow",
  "Dispensing Workflow",
  "Hospital Pharmacy",
  "y04-hospital-pharmacy",
  4,
  "HOSPITAL_WORKFLOW",
  "Hospital Pharmacy",
  "hospital-lab"
);

export const MEDICATION_ERROR_EXPERIMENT = asExperiment(
  MEDICATION_ERROR,
  "medication-error-recognition",
  "Medication Error Recognition",
  "Hospital Pharmacy",
  "y04-hospital-pharmacy",
  4,
  "HOSPITAL_WORKFLOW",
  "Hospital Pharmacy",
  "hospital-lab"
);

export const CLINICAL_ACTIVITIES = [
  MEDICATION_REVIEW,
  COUNSELLING,
  DRUG_INFORMATION,
];
export const HOSPITAL_ACTIVITIES = [INVENTORY, DISPENSING, MEDICATION_ERROR];

export const ACTIVITY_BY_EXPERIMENT_ID: Record<string, ClinicalActivity> = {
  [MEDICATION_REVIEW_EXPERIMENT.id]: MEDICATION_REVIEW,
  [COUNSELLING_EXPERIMENT.id]: COUNSELLING,
  [DRUG_INFORMATION_EXPERIMENT.id]: DRUG_INFORMATION,
  [INVENTORY_EXPERIMENT.id]: INVENTORY,
  [DISPENSING_EXPERIMENT.id]: DISPENSING,
  [MEDICATION_ERROR_EXPERIMENT.id]: MEDICATION_ERROR,
};
