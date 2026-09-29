import { useMemo } from "react";
import type { TitrationModel } from "../../../engine/types";
import type { ExperimentTheme } from "../../../engine/theme";
import type { TitrationView, TitrationPoint } from "../../../engine/titration";
import { titrationCurve } from "../../../engine/titration";

type Props = {
  theme: ExperimentTheme;
  model: TitrationModel;
  view: TitrationView;
  maxVolume: number;
};

const W = 300;
const H = 168;
const PAD = { top: 10, right: 10, bottom: 22, left: 26 };

/**
 * The pH–volume curve. The theoretical curve is drawn faintly; the portion the
 * student has actually travelled is drawn brightly, so the sharp jump at the
 * equivalence point becomes visible the moment they approach it.
 */
export default function TitrationCurve({ theme, model, view, maxVolume }: Props) {
  const curve = useMemo(
    () => titrationCurve(model, maxVolume, 200),
    [model, maxVolume]
  );

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (v: number) => PAD.left + (v / maxVolume) * plotW;
  const y = (pH: number) => PAD.top + (1 - Math.max(0, Math.min(14, pH)) / 14) * plotH;

  const toPath = (pts: TitrationPoint[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.volume).toFixed(1)},${y(p.pH).toFixed(1)}`)
      .join(" ");

  /* Only the part of the curve the learner has actually produced. */
  const travelled = curve.filter((p) => p.volume <= view.delivered);
  const current = {
    volume: view.delivered,
    pH: view.pH ?? pHOf(model, view.delivered),
  };

  const eq = view.endpointVolume;
  const nearEndpoint = Math.abs(view.delivered - eq) <= 1.2;
  const dotColour = view.atEndpoint
    ? theme.status.endpoint
    : view.phase === "overshot"
      ? theme.status.bad
      : nearEndpoint
        ? theme.status.warn
        : theme.accent;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`pH against volume of titrant delivered. Currently ${view.delivered.toFixed(
          2
        )} millilitres delivered, pH ${
          view.pH === null ? "not measured" : view.pH.toFixed(2)
        }. Equivalence point at ${eq.toFixed(2)} millilitres, pH 7.`}
      >
        {/* grid */}
        {[0, 7, 14].map((pH) => (
          <line
            key={pH}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(pH)}
            y2={y(pH)}
            stroke="rgba(190,220,255,0.10)"
            strokeWidth="1"
          />
        ))}
        {[0, 5, 10, 15, 20, 25]
          .filter((v) => v <= maxVolume)
          .map((v) => (
            <line
              key={v}
              y1={PAD.top}
              y2={H - PAD.bottom}
              x1={x(v)}
              x2={x(v)}
              stroke="rgba(190,220,255,0.07)"
              strokeWidth="1"
            />
          ))}

        {/* pH 7 guide + equivalence marker */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(7)}
          y2={y(7)}
          stroke={theme.status.ok}
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.5"
        />
        <line
          x1={x(eq)}
          x2={x(eq)}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke={theme.status.ok}
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.55"
        />

        {/* theoretical curve */}
        <path
          d={toPath(curve)}
          fill="none"
          stroke="rgba(190,220,255,0.30)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* travelled portion */}
        {travelled.length > 1 && (
          <path
            d={toPath(travelled)}
            fill="none"
            stroke={theme.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* equivalence point */}
        <circle cx={x(eq)} cy={y(7)} r="3.5" fill={theme.status.ok} />

        {/* current point */}
        {view.delivered > 0 && (
          <circle
            cx={x(current.volume)}
            cy={y(current.pH)}
            r="5"
            fill={dotColour}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
          />
        )}

        {/* axis labels */}
        <text
          x={PAD.left - 6}
          y={y(14) + 3}
          textAnchor="end"
          fontSize="7"
          fill={theme.panel.dim}
          fontFamily="monospace"
        >
          14
        </text>
        <text
          x={PAD.left - 6}
          y={y(7) + 3}
          textAnchor="end"
          fontSize="7"
          fill={theme.status.ok}
          fontFamily="monospace"
        >
          7
        </text>
        <text
          x={PAD.left - 6}
          y={y(0) + 3}
          textAnchor="end"
          fontSize="7"
          fill={theme.panel.dim}
          fontFamily="monospace"
        >
          0
        </text>
        <text
          x={PAD.left}
          y={H - 8}
          fontSize="7"
          fill={theme.panel.dim}
          fontFamily="monospace"
        >
          0
        </text>
        <text
          x={W - PAD.right}
          y={H - 8}
          textAnchor="end"
          fontSize="7"
          fill={theme.panel.dim}
          fontFamily="monospace"
        >
          {maxVolume} mL
        </text>
        <text
          x={W - PAD.right}
          y={PAD.top + 7}
          textAnchor="end"
          fontSize="7"
          fill={theme.panel.muted}
          fontFamily="monospace"
          letterSpacing="0.12em"
        >
          pH
        </text>
      </svg>
    </div>
  );
}

function pHOf(model: TitrationModel, volume: number): number {
  const molesA = (model.aliquotVolume * model.analyte.concentration) / 1000;
  const molesB = (volume * model.titrant.concentration) / 1000;
  const total = (model.aliquotVolume + volume) / 1000;
  if (total <= 0) return 7;
  if (molesB < molesA) return -Math.log10((molesA - molesB) / total);
  if (molesB > molesA) return 14 + Math.log10((molesB - molesA) / total);
  return 7;
}
