/**
 * TITRATION SIMULATION MODEL
 * --------------------------
 * Pure, UI-free chemistry. Nothing here renders anything — it only derives
 * the physical state of the experiment from the simulation state.
 *
 * The underlying relation is standard analytical chemistry: for a 1:1
 * acid–base reaction the equivalence point is reached when the moles of
 * titrant equal the moles of analyte. Every quantity below is an educational
 * simulation parameter, not an official value.
 */
import type { SimulationState } from "./simulation";
import type { TitrationModel } from "./types";

export type TitrationPhase =
  | "empty"
  | "acidic"
  | "endpoint"
  | "slight-excess"
  | "overshot";

export interface TitrationView {
  /** mL of liquid currently in the flask. */
  flaskVolume: number;
  /** mL remaining in the burette. */
  buretteRemaining: number;
  /** mL delivered so far. */
  delivered: number;
  /** Burette scale reading at the meniscus, mL. */
  buretteReading: number;
  /** moles titrant / moles analyte. */
  fraction: number;
  /** mL of titrant needed to reach equivalence. */
  endpointVolume: number;
  /** mol of analyte originally in the flask. */
  molesAnalyte: number;
  /** mol of titrant delivered so far. */
  molesTitrant: number;
  /** Which reagent is in excess. */
  excess: "analyte" | "titrant" | "none";
  /** pH from the standard strong acid / strong base treatment. */
  pH: number | null;
  /** Liquid colour of the flask contents. */
  colour: string;
  phase: TitrationPhase;
  atEndpoint: boolean;
  /** True once the endpoint has been reached or passed. */
  finished: boolean;
  /** mL of titrant used, once both readings are taken. */
  volumeUsed: number | null;
}

/** Flag/value keys used by the titration steps. */
export const TITRATION_KEYS = {
  buretteFilled: "titration-burette-filled",
  aliquotAdded: "titration-aliquot-added",
  indicatorAdded: "titration-indicator-added",
  initialRead: "titration-initial-read",
  finalRead: "titration-final-read",
  delivered: "titration-delivered",
} as const;

function alphaToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Colourless liquid with a faint glass tint. */
const CLEAR = "rgba(228, 236, 238, 0.45)";

/**
 * Derive the full visual + chemical state of the titration.
 * Everything is computed, never stored — so it can never drift out of sync.
 */
export function deriveTitration(
  model: TitrationModel,
  state: SimulationState
): TitrationView {
  const delivered = state.values[TITRATION_KEYS.delivered] ?? 0;
  const aliquotAdded = state.flags[TITRATION_KEYS.aliquotAdded] ?? false;
  const indicatorAdded = state.flags[TITRATION_KEYS.indicatorAdded] ?? false;

  /* Stoichiometry: mol/L × mL / 1000 = mol */
  const molesAnalyte =
    (model.aliquotVolume * model.analyte.concentration) / 1000;
  const molesTitrant = (delivered * model.titrant.concentration) / 1000;

  const fraction = molesAnalyte > 0 ? molesTitrant / molesAnalyte : 0;
  const endpointVolume =
    model.titrant.concentration > 0
      ? (molesAnalyte * 1000) / model.titrant.concentration
      : 0;

  const flaskVolume =
    model.flaskStartVolume + (aliquotAdded ? model.aliquotVolume : 0) + delivered;

  /* Standard strong acid / strong base pH treatment. Concentrations are the
     declared simulation parameters; the relations themselves are textbook. */
  const totalVolumeL = flaskVolume / 1000;
  let excess: "analyte" | "titrant" | "none" = "none";
  let pH: number | null = null;
  if (aliquotAdded && totalVolumeL > 0) {
    if (molesTitrant < molesAnalyte) {
      excess = "analyte";
      const h = (molesAnalyte - molesTitrant) / totalVolumeL;
      pH = h > 0 ? -Math.log10(h) : null;
    } else if (molesTitrant > molesAnalyte) {
      excess = "titrant";
      const oh = (molesTitrant - molesAnalyte) / totalVolumeL;
      pH = oh > 0 ? 14 + Math.log10(oh) : null;
    } else {
      pH = 7;
    }
  }

  const buretteRemaining = Math.max(0, model.buretteCapacity - delivered);

  /* Colour is meaningless before the indicator is added. */
  let phase: TitrationPhase = "empty";
  let colour = CLEAR;

  if (aliquotAdded && indicatorAdded) {
    if (fraction < 1 - 0.005) {
      phase = "acidic";
      colour = CLEAR;
    } else if (delivered <= endpointVolume + model.endpointWindow) {
      phase = "endpoint";
      colour = alphaToRgba(model.indicator.basicColour, 0.22);
    } else if (fraction <= 1.08) {
      phase = "slight-excess";
      colour = alphaToRgba(model.indicator.basicColour, 0.38);
    } else {
      phase = "overshot";
      colour = alphaToRgba(model.indicator.basicColour, 0.62);
    }
  } else if (aliquotAdded) {
    phase = "acidic";
    colour = CLEAR;
  }

  const atEndpoint = phase === "endpoint";
  const finished = phase === "endpoint" || phase === "slight-excess" || phase === "overshot";

  const initialRead = state.flags[TITRATION_KEYS.initialRead] ?? false;
  const finalRead = state.flags[TITRATION_KEYS.finalRead] ?? false;
  const volumeUsed = initialRead && finalRead ? delivered : null;

  return {
    flaskVolume,
    buretteRemaining,
    delivered,
    buretteReading: delivered,
    fraction,
    endpointVolume,
    molesAnalyte,
    molesTitrant,
    excess,
    pH,
    colour,
    phase,
    atEndpoint,
    finished,
    volumeUsed,
  };
}

/* -------------------------------------------------- Interaction handling */

import type { Interaction } from "./types";
import type { SimulationAction } from "./simulation";

const OBS = {
  initial: "obs-initial-reading",
  aliquot: "obs-aliquot",
  final: "obs-final-reading",
  used: "obs-volume-used",
  colour: "obs-colour",
} as const;

const round2 = (n: number) => Number(n.toFixed(2));

/**
 * Translate an interaction into a list of simulation actions. Pure logic —
 * the UI dispatches the result and never decides chemistry itself.
 */
export function titrationActions(
  interaction: Interaction,
  value: number | undefined,
  state: SimulationState,
  model: TitrationModel
): SimulationAction[] {
  const actions: SimulationAction[] = [];
  const already = state.completedActions.includes(interaction.id);

  /* Selecting apparatus in the PREPARE stage. */
  if (interaction.type === "select") {
    actions.push({ type: "SELECT_OBJECT", id: interaction.targetId });
    if (!already) {
      actions.push({
        type: "COMPLETE_ACTION",
        interactionId: interaction.id,
        feedback: { kind: "success", message: "Selected" },
      });
    }
    return actions;
  }

  if (interaction.id === "tit-titrate") {
    const delivered = Math.max(0, value ?? 0);
    actions.push({ type: "SET_VALUE", key: TITRATION_KEYS.delivered, value: delivered });
    actions.push({
      type: "ADJUST_FILL",
      itemId: "app-burette",
      fill: ((model.buretteCapacity - delivered) / model.buretteCapacity) * 100,
    });

    /* The step only completes once the endpoint is reached or passed. */
    const preview = deriveTitration(model, {
      ...state,
      values: { ...state.values, [TITRATION_KEYS.delivered]: delivered },
    });

    if (preview.finished) {
      /* Recorded every time so a repeated titration updates the reading. */
      actions.push({
        type: "RECORD_OBSERVATION",
        record: {
          id: OBS.colour,
          label: "Colour at endpoint",
          value: PHASE_LABEL[preview.phase],
          kind: "qualitative",
          origin: "simulation",
        },
      });

      if (!already) {
        actions.push({
          type: "COMPLETE_ACTION",
          interactionId: interaction.id,
          feedback:
            preview.phase === "overshot"
              ? {
                  kind: "attention",
                  message: "Endpoint passed — the colour is deep pink",
                }
              : { kind: "success", message: "Endpoint reached" },
        });
      }
    }
    return actions;
  }

  if (!already) {
    actions.push({
      type: "COMPLETE_ACTION",
      interactionId: interaction.id,
      feedback: { kind: "success", message: "Done" },
    });
  }

  switch (interaction.id) {
    case "tit-fill-burette":
      actions.push({ type: "SET_FLAG", key: TITRATION_KEYS.buretteFilled, value: true });
      actions.push({ type: "ADJUST_FILL", itemId: "app-burette", fill: 100 });
      break;

    case "tit-record-initial":
      actions.push({ type: "SET_FLAG", key: TITRATION_KEYS.initialRead, value: true });
      actions.push({
        type: "RECORD_OBSERVATION",
        record: {
          id: OBS.initial,
          label: "Initial burette reading",
          value: 0,
          unit: "mL",
          kind: "quantitative",
          origin: "simulation",
        },
      });
      break;

    case "tit-aliquot":
      actions.push({ type: "SET_FLAG", key: TITRATION_KEYS.aliquotAdded, value: true });
      actions.push({
        type: "RECORD_OBSERVATION",
        record: {
          id: OBS.aliquot,
          label: "Volume of acid aliquot",
          value: round2(model.aliquotVolume),
          unit: "mL",
          kind: "quantitative",
          origin: "simulation",
        },
      });
      break;

    case "tit-indicator":
      actions.push({ type: "SET_FLAG", key: TITRATION_KEYS.indicatorAdded, value: true });
      break;

    case "tit-record-final": {
      const view = deriveTitration(model, state);
      actions.push({ type: "SET_FLAG", key: TITRATION_KEYS.finalRead, value: true });
      actions.push({
        type: "RECORD_OBSERVATION",
        record: {
          id: OBS.final,
          label: "Final burette reading",
          value: round2(view.delivered),
          unit: "mL",
          kind: "quantitative",
          origin: "simulation",
        },
      });
      actions.push({
        type: "RECORD_OBSERVATION",
        record: {
          id: OBS.used,
          label: "Volume of titrant used",
          value: round2(view.delivered),
          unit: "mL",
          kind: "quantitative",
          origin: "simulation",
        },
      });
      break;
    }
    default:
      break;
  }

  return actions;
}

/** Repeat the titration: empty the burette delivery and clear the readings. */
export function repeatTitrationActions(): SimulationAction[] {
  return [
    { type: "SET_VALUE", key: TITRATION_KEYS.delivered, value: 0 },
    { type: "ADJUST_FILL", itemId: "app-burette", fill: 100 },
    { type: "SET_FLAG", key: TITRATION_KEYS.finalRead, value: false },
    { type: "RECORD_OBSERVATION", record: { id: OBS.final, label: "Final burette reading", value: null, unit: "mL", kind: "quantitative", origin: "pending" } },
    { type: "RECORD_OBSERVATION", record: { id: OBS.used, label: "Volume of titrant used", value: null, unit: "mL", kind: "quantitative", origin: "pending" } },
    { type: "RECORD_OBSERVATION", record: { id: OBS.colour, label: "Colour at endpoint", value: null, kind: "qualitative", origin: "pending" } },
  ];
}

/* ------------------------------------------------------------ Titration curve */

export interface TitrationPoint {
  /** mL of titrant delivered. */
  volume: number;
  /** pH at that volume. */
  pH: number;
}

/** pH at an arbitrary delivered volume, for plotting the theoretical curve. */
export function pHAtVolume(
  model: TitrationModel,
  volume: number
): number {
  const molesAnalyte = (model.aliquotVolume * model.analyte.concentration) / 1000;
  const molesTitrant = (volume * model.titrant.concentration) / 1000;
  const totalL = (model.aliquotVolume + volume) / 1000;
  if (totalL <= 0) return 7;
  if (molesTitrant < molesAnalyte) {
    const h = (molesAnalyte - molesTitrant) / totalL;
    return h > 0 ? -Math.log10(h) : 7;
  }
  if (molesTitrant > molesAnalyte) {
    const oh = (molesTitrant - molesAnalyte) / totalL;
    return oh > 0 ? 14 + Math.log10(oh) : 7;
  }
  return 7;
}

/** The full theoretical curve, sampled so it can be drawn smoothly. */
export function titrationCurve(
  model: TitrationModel,
  maxVolume: number,
  samples = 160
): TitrationPoint[] {
  const points: TitrationPoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const volume = (maxVolume * i) / samples;
    points.push({ volume, pH: pHAtVolume(model, volume) });
  }
  return points;
}

/** Human labels for each phase — used for text as well as visuals. */
export const PHASE_LABEL: Record<TitrationPhase, string> = {
  empty: "Flask empty",
  acidic: "Acidic — colourless",
  endpoint: "Endpoint reached",
  "slight-excess": "Slight excess",
  overshot: "Endpoint passed",
};
