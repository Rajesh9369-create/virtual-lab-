/**
 * EXPERIMENT THEME SYSTEM
 * ----------------------
 * The website keeps the warm Pharma Virtual Lab identity; the laboratory is a
 * separate, subject-appropriate environment. Every visual property of the room
 * is expressed here so a future experiment can stage itself completely
 * differently without touching a component.
 */

export interface ExperimentTheme {
  id: string;
  label: string;
  /** The room: layered background, ambient light, vignette. */
  environment: { background: string; light: string; vignette: string };
  /** The bench the apparatus stands on. */
  bench: { surface: string; edge: string; pool: string };
  /** Material treatments for the apparatus. */
  apparatus: {
    glass: string;
    glassEdge: string;
    glassDrop: string;
    metal: string;
    liquid: string;
  };
  /** Guidance accent — where attention is drawn. */
  accent: string;
  accentGlow: string;
  /** Glass panels used for readouts and the console. */
  panel: {
    background: string;
    border: string;
    text: string;
    muted: string;
    dim: string;
    shadow: string;
  };
  /** Semantic status colours — clarity about what the state means. */
  status: {
    ok: string;
    endpoint: string;
    bad: string;
    warn: string;
    info: string;
  };
}

/** Pharmaceutical Analysis — a deep, glossy instrument room. */
const ANALYTICAL: ExperimentTheme = {
  id: "analytical-lab",
  label: "Analytical Laboratory",
  environment: {
    background:
      "linear-gradient(180deg, #0B1119 0%, #080C13 45%, #05080D 100%)",
    light:
      "radial-gradient(78% 50% at 46% 0%, rgba(120,170,235,0.16), transparent 70%), radial-gradient(52% 40% at 92% 6%, rgba(23,180,124,0.09), transparent 62%), radial-gradient(60% 46% at 8% 14%, rgba(242,106,33,0.08), transparent 64%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 38%, rgba(2,4,7,0.72) 100%)",
  },
  bench: {
    surface:
      "linear-gradient(180deg, #2C3A47 0%, #1C2732 8%, #0E151D 100%)",
    edge: "inset 0 1px 0 rgba(190,220,255,0.26), inset 0 3px 12px rgba(0,0,0,0.45)",
    pool:
      "radial-gradient(50% 50% at 50% 50%, rgba(180,215,255,0.13), transparent 70%)",
  },
  apparatus: {
    glass:
      "linear-gradient(90deg, rgba(255,255,255,0.19) 0%, rgba(255,255,255,0.40) 14%, rgba(200,225,245,0.07) 50%, rgba(255,255,255,0.34) 86%, rgba(255,255,255,0.13) 100%)",
    glassEdge: "inset 0 0 0 1px rgba(220,238,255,0.30)",
    glassDrop:
      "drop-shadow(0 0 0 rgba(255,255,255,0.26)) drop-shadow(0 14px 22px rgba(0,0,0,0.5))",
    metal: "linear-gradient(90deg,#5A6672,#C3D2DC 45%,#4C5761)",
    liquid:
      "linear-gradient(90deg, rgba(196,224,238,0.55), rgba(238,250,255,0.86) 42%, rgba(196,224,238,0.5))",
  },
  accent: "#F26A21",
  accentGlow: "rgba(242,106,33,0.40)",
  panel: {
    background: "rgba(10,16,24,0.72)",
    border: "rgba(190,220,255,0.16)",
    text: "#EAF2FA",
    muted: "rgba(214,232,246,0.66)",
    dim: "rgba(214,232,246,0.38)",
    shadow: "0 24px 56px -28px rgba(0,0,0,0.9)",
  },
  status: {
    ok: "#17B47C",
    endpoint: "#E879A6",
    bad: "#E05050",
    warn: "#F0B24A",
    info: "#8AB4F8",
  },
};

/* ------------------------------------------------- Additional subject worlds */

/** Biopharmaceutics & Pharmacokinetics — a dynamic data / molecular space. */
const KINETICS: ExperimentTheme = {
  ...ANALYTICAL,
  id: "kinetics-lab",
  label: "Pharmacokinetic Environment",
  environment: {
    background: "linear-gradient(180deg, #10132A 0%, #0B0E1E 45%, #070916 100%)",
    light:
      "radial-gradient(76% 50% at 50% 0%, rgba(150,130,255,0.20), transparent 70%), radial-gradient(54% 40% at 90% 10%, rgba(64,220,200,0.12), transparent 62%), radial-gradient(50% 40% at 6% 16%, rgba(255,140,90,0.08), transparent 62%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 38%, rgba(3,4,10,0.74) 100%)",
  },
  bench: {
    surface: "linear-gradient(180deg, #2A2C4E 0%, #1B1D38 8%, #0C0E1E 100%)",
    edge: "inset 0 1px 0 rgba(180,170,255,0.26), inset 0 3px 12px rgba(0,0,0,0.45)",
    pool: "radial-gradient(50% 50% at 50% 50%, rgba(170,160,255,0.15), transparent 70%)",
  },
  accent: "#9B8CFF",
  accentGlow: "rgba(155,140,255,0.42)",
  panel: {
    ...ANALYTICAL.panel,
    background: "rgba(12,14,32,0.74)",
    border: "rgba(180,170,255,0.18)",
  },
  status: {
    ok: "#3ED9B0",
    endpoint: "#C9A6FF",
    bad: "#FF6B81",
    warn: "#FFC46B",
    info: "#7FD8FF",
  },
};

/** Pharmaceutics — a warm formulation / manufacturing bench. */
const FORMULATION: ExperimentTheme = {
  ...ANALYTICAL,
  id: "formulation-lab",
  label: "Formulation Bench",
  environment: {
    background: "linear-gradient(180deg, #1E1610 0%, #16110C 45%, #0D0906 100%)",
    light:
      "radial-gradient(76% 50% at 50% 0%, rgba(255,214,150,0.17), transparent 70%), radial-gradient(52% 40% at 88% 8%, rgba(242,106,33,0.11), transparent 62%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 38%, rgba(8,5,3,0.74) 100%)",
  },
  bench: {
    surface: "linear-gradient(180deg, #4A3A28 0%, #33281B 8%, #1A130D 100%)",
    edge: "inset 0 1px 0 rgba(255,226,180,0.24), inset 0 3px 12px rgba(0,0,0,0.45)",
    pool: "radial-gradient(50% 50% at 50% 50%, rgba(255,214,150,0.15), transparent 70%)",
  },
  apparatus: {
    ...ANALYTICAL.apparatus,
    metal: "linear-gradient(90deg,#6B5A42,#D8C4A4 45%,#5C4C38)",
    liquid:
      "linear-gradient(90deg, rgba(240,214,170,0.55), rgba(255,240,214,0.86) 42%, rgba(240,214,170,0.5))",
  },
  accent: "#F2A03D",
  accentGlow: "rgba(242,160,61,0.42)",
  panel: {
    ...ANALYTICAL.panel,
    background: "rgba(24,17,11,0.76)",
    border: "rgba(255,214,160,0.16)",
    text: "#FBF2E6",
    muted: "rgba(248,232,210,0.66)",
    dim: "rgba(248,232,210,0.38)",
  },
  status: {
    ok: "#7BC96F",
    endpoint: "#F2A03D",
    bad: "#E0605A",
    warn: "#EFC15C",
    info: "#9FD3E8",
  },
};

/* ------------------------------------------------- Pharmacology & clinical */

/** Pharmacology — a biological / receptor environment. */
const PHARMACOLOGY: ExperimentTheme = {
  ...ANALYTICAL,
  id: "pharmacology-lab",
  label: "Biological Environment",
  environment: {
    background: "linear-gradient(180deg, #1C1020 0%, #150C19 45%, #0C0710 100%)",
    light:
      "radial-gradient(76% 50% at 50% 0%, rgba(255,140,190,0.16), transparent 70%), radial-gradient(52% 40% at 88% 8%, rgba(64,224,180,0.11), transparent 62%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 38%, rgba(8,4,10,0.74) 100%)",
  },
  bench: {
    surface: "linear-gradient(180deg, #3A2242 0%, #271630 8%, #140B18 100%)",
    edge: "inset 0 1px 0 rgba(255,200,230,0.22), inset 0 3px 12px rgba(0,0,0,0.45)",
    pool: "radial-gradient(50% 50% at 50% 50%, rgba(255,170,210,0.14), transparent 70%)",
  },
  accent: "#FF7BAF",
  accentGlow: "rgba(255,123,175,0.40)",
  panel: {
    ...ANALYTICAL.panel,
    background: "rgba(24,12,28,0.76)",
    border: "rgba(255,200,230,0.18)",
    text: "#FBEFF6",
    muted: "rgba(250,232,244,0.66)",
    dim: "rgba(250,232,244,0.38)",
  },
  status: {
    ok: "#3ED9B0",
    endpoint: "#FF9EC6",
    bad: "#FF6B81",
    warn: "#FFC46B",
    info: "#9FD8FF",
  },
};

/** Clinical — a calm, light clinical environment. */
const CLINICAL: ExperimentTheme = {
  ...ANALYTICAL,
  id: "clinical-lab",
  label: "Clinical Environment",
  environment: {
    background: "linear-gradient(180deg, #EEF3F6 0%, #E4EBF0 45%, #DCE4EA 100%)",
    light: "radial-gradient(76% 50% at 50% 0%, rgba(255,255,255,0.9), transparent 70%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 45%, rgba(160,180,195,0.22) 100%)",
  },
  bench: {
    surface: "linear-gradient(180deg, #FFFFFF 0%, #F4F8FA 8%, #E6EDF1 100%)",
    edge: "inset 0 1px 0 rgba(255,255,255,1), 0 1px 3px rgba(90,115,135,0.14)",
    pool: "radial-gradient(50% 50% at 50% 50%, rgba(120,170,190,0.12), transparent 70%)",
  },
  apparatus: {
    ...ANALYTICAL.apparatus,
    metal: "linear-gradient(90deg,#8FA3B0,#DDE7ED 45%,#7C8F9B)",
  },
  accent: "#0F766E",
  accentGlow: "rgba(15,118,110,0.22)",
  panel: {
    background: "rgba(255,255,255,0.92)",
    border: "rgba(120,150,170,0.24)",
    text: "#12242C",
    muted: "rgba(18,36,44,0.68)",
    dim: "rgba(18,36,44,0.42)",
    shadow: "0 20px 44px -30px rgba(40,70,90,0.55)",
  },
  status: {
    ok: "#0F9D76",
    endpoint: "#0F766E",
    bad: "#C2410C",
    warn: "#B45309",
    info: "#0369A1",
  },
};

/** Hospital pharmacy — an operational, graphite-and-amber workspace. */
const HOSPITAL: ExperimentTheme = {
  ...ANALYTICAL,
  id: "hospital-lab",
  label: "Hospital Pharmacy",
  environment: {
    background: "linear-gradient(180deg, #171B1E 0%, #12161A 45%, #0B0E11 100%)",
    light:
      "radial-gradient(74% 48% at 50% 0%, rgba(232,163,61,0.14), transparent 70%), radial-gradient(50% 38% at 88% 8%, rgba(140,190,200,0.08), transparent 62%)",
    vignette:
      "radial-gradient(130% 100% at 50% 44%, rgba(0,0,0,0) 38%, rgba(6,8,10,0.76) 100%)",
  },
  bench: {
    surface: "linear-gradient(180deg, #3A4147 0%, #272D32 8%, #14181B 100%)",
    edge: "inset 0 1px 0 rgba(240,200,150,0.22), inset 0 3px 12px rgba(0,0,0,0.45)",
    pool: "radial-gradient(50% 50% at 50% 50%, rgba(232,163,61,0.13), transparent 70%)",
  },
  apparatus: {
    ...ANALYTICAL.apparatus,
    metal: "linear-gradient(90deg,#7C858C,#DDE3E7 45%,#6B747A)",
  },
  accent: "#E8A33D",
  accentGlow: "rgba(232,163,61,0.40)",
  panel: {
    ...ANALYTICAL.panel,
    background: "rgba(20,24,27,0.78)",
    border: "rgba(240,200,150,0.18)",
    text: "#F7F1E8",
    muted: "rgba(244,236,226,0.66)",
    dim: "rgba(244,236,226,0.38)",
  },
  status: {
    ok: "#4FC38B",
    endpoint: "#E8A33D",
    bad: "#E0605A",
    warn: "#EFC15C",
    info: "#8FC9D8",
  },
};

export const THEMES: Record<string, ExperimentTheme> = {
  "analytical-lab": ANALYTICAL,
  "kinetics-lab": KINETICS,
  "formulation-lab": FORMULATION,
  "pharmacology-lab": PHARMACOLOGY,
  "clinical-lab": CLINICAL,
  "hospital-lab": HOSPITAL,
};

export const DEFAULT_THEME: ExperimentTheme = ANALYTICAL;

/** Resolve the theme an experiment should be staged in. */
export function themeFor(themeId?: string): ExperimentTheme {
  if (themeId && THEMES[themeId]) return THEMES[themeId];
  return DEFAULT_THEME;
}
