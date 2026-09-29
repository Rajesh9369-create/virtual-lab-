import { useMemo, useReducer, useState } from "react";
import type { Experiment } from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import type {
  ActivityItem,
  ActivityPanel,
  ClinicalActivity,
  ActivityOption,
} from "../../engine/activityFlow";
import {
  activityConceptResults,
  activityReducer,
  activityScore,
  createActivityState,
} from "../../engine/activityFlow";
import { anim } from "../experiment/lab/anim";
import EvidencePanel from "../evidence/EvidencePanel";
import { referencesForExperiment } from "../../data/references";

type Props = {
  experiment: Experiment;
  activity: ClinicalActivity;
  theme: ExperimentTheme;
  onRestart: () => void;
  onContinue: () => void;
  onComplete: (concepts: Record<string, boolean>) => void;
};

const TONE_COLOUR: Record<string, string> = {
  normal: "normal",
  attention: "attention",
  recent: "recent",
  ok: "ok",
  warn: "warn",
  low: "low",
};

/* ------------------------------------------------------------- Panels */

function ItemCard({
  item,
  theme,
  isNew,
}: {
  item: ActivityItem;
  theme: ExperimentTheme;
  isNew: boolean;
}) {
  const tone = item.tone ? TONE_COLOUR[item.tone] : "normal";
  const colour =
    tone === "attention"
      ? theme.status.bad
      : tone === "recent"
        ? theme.status.info
        : tone === "ok"
          ? theme.status.ok
          : tone === "warn"
            ? theme.status.warn
            : tone === "low"
              ? theme.status.bad
              : theme.panel.muted;

  const lowStock = tone === "low";

  return (
    <div
      className={`rounded-[16px] border p-3 transition-all duration-300 ${isNew ? anim.riseIn : ""}`}
      style={{
        borderColor: item.tone ? `${colour}55` : theme.panel.border,
        background:
          tone === "low" || tone === "attention" ? `${colour}0D` : "transparent",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[13.5px] font-semibold leading-snug"
          style={{ color: theme.panel.text }}
        >
          {item.label}
        </p>
        {item.tone && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ background: `${colour}1A`, color: colour }}
          >
            {item.tone === "low" ? "low stock" : item.tone}
          </span>
        )}
      </div>

      <p
        className="mt-1.5 text-[12.5px] leading-relaxed"
        style={{ color: theme.panel.muted }}
      >
        {item.value}
      </p>

      {typeof item.stock === "number" && (
        <div className="mt-2.5">
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ background: `${theme.panel.border}` }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${Math.min(100, (item.stock / 450) * 100)}%`,
                background: lowStock ? theme.status.bad : theme.status.ok,
              }}
            />
          </div>
          <p
            className="mt-1 font-mono text-[9.5px] tabular-nums"
            style={{ color: theme.panel.muted }}
          >
            {item.stock} units
          </p>
        </div>
      )}

      {item.expiry && (
        <p
          className="mt-1.5 font-mono text-[9.5px] tabular-nums"
          style={{ color: item.tone === "warn" ? theme.status.warn : theme.panel.dim }}
        >
          expires {new Date(item.expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
        </p>
      )}

      {item.note && (
        <p
          className="mt-2 font-mono text-[9px] leading-snug"
          style={{ color: theme.panel.dim }}
        >
          {item.note}
        </p>
      )}
    </div>
  );
}

function WorkflowPanel({
  panel,
  theme,
}: {
  panel: ActivityPanel;
  theme: ExperimentTheme;
}) {
  return (
    <div className="rounded-[22px] border p-3.5 sm:p-4"
      style={{ borderColor: theme.panel.border, background: theme.panel.background }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
          {panel.title}
        </p>
        {panel.caption && (
          <p className="font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>
            {panel.caption}
          </p>
        )}
      </div>

      <ol className="mt-3.5 flex flex-wrap items-stretch gap-2">
        {panel.items.map((item, i) => {
          const done = item.value === "Complete" || item.value === "Delivered";
          const active = item.value === "In progress" || item.value === "Pending";
          const colour = done
            ? theme.status.ok
            : item.value === "Received"
              ? theme.status.ok
              : active
                ? theme.accent
                : theme.panel.dim;
          return (
            <li key={item.id} className="flex min-w-[120px] flex-1 items-center gap-2">
              <div
                className="flex-1 rounded-xl border px-3 py-2.5 transition-all duration-500"
                style={{
                  borderColor: done || item.value === "Received" ? `${theme.status.ok}55` : theme.panel.border,
                  background: done ? `${theme.status.ok}12` : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                    style={{
                      background: done || item.value === "Received" ? theme.status.ok : "transparent",
                      border: `1.5px solid ${colour}`,
                      color: "#fff",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <p className="text-[11.5px] font-medium leading-tight" style={{ color: theme.panel.text }}>
                    {item.label}
                  </p>
                </div>
                <p className="mt-1 pl-6 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colour }}>
                  {item.value}
                </p>
              </div>
              {i < panel.items.length - 1 && (
                <span aria-hidden="true" className="shrink-0 text-sm" style={{ color: theme.panel.dim }}>→</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Panel({
  panel,
  theme,
  newIds,
}: {
  panel: ActivityPanel;
  theme: ExperimentTheme;
  newIds: Set<string>;
}) {
  if (panel.kind === "workflow") {
    return <WorkflowPanel panel={panel} theme={theme} />;
  }

  const isPatient = panel.kind === "patient";
  const isCounselling = panel.kind === "counselling";

  return (
    <div className="rounded-[22px] border p-3.5 sm:p-4"
      style={{ borderColor: theme.panel.border, background: theme.panel.background }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
          {panel.title}
        </p>
        {panel.caption && (
          <p className="font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>
            {panel.caption}
          </p>
        )}
      </div>

      {isPatient && (
        <div className="mt-3.5 flex items-center gap-4">
          <span aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.status.info})` }}>
            SP
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: theme.panel.text }}>Simulated patient</p>
            <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.status.warn }}>
              {panel.caption ?? "Simulated educational patient"}
            </p>
          </div>
        </div>
      )}

      <div className={`mt-3.5 grid grid-cols-1 gap-2.5 ${isCounselling ? "" : "sm:grid-cols-2"}`}>
        {panel.items.map((item) => (
          <ItemCard key={item.id} item={item} theme={theme} isNew={!newIds.has(item.id)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Runner */

export default function ActivityRunner({
  experiment,
  activity,
  theme,
  onRestart,
  onContinue,
  onComplete,
}: Props) {
  const references = useMemo(
    () => referencesForExperiment(experiment.id),
    [experiment.id]
  );

  const [flow, dispatch] = useReducer(
    (s, a) => activityReducer(s, a, activity),
    undefined,
    createActivityState
  );
  const [notified, setNotified] = useState(false);

  const stage = activity.stages[flow.currentIndex];
  const isLast = flow.currentIndex >= activity.stages.length - 1;
  const score = activityScore(flow.answers);

  const newIds = useMemo(() => {
    const seen = new Set<string>();
    for (let i = 0; i < flow.currentIndex; i++) {
      for (const p of activity.stages[i]?.reveals ?? []) {
        for (const it of p.items) seen.add(it.id);
      }
    }
    return seen;
  }, [flow.currentIndex, activity.stages]);

  const finish = () => {
    if (!notified) {
      onComplete(activityConceptResults(activity, flow.answers));
      setNotified(true);
    }
    onContinue();
  };

  /* ------------------------------- complete ------------------------------ */
  if (flow.status === "complete") {
    return (
      <div className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden"
        style={{ backgroundImage: `${theme.environment.light}, ${theme.environment.background}` }}>
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 sm:px-6"
          style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
          <p className="text-[13px] font-semibold" style={{ color: theme.panel.text }}>
            {experiment.title} — complete
          </p>
          <button type="button" onClick={() => dispatch({ type: "RESTART" })}
            className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>
            ↻ Again
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mx-auto max-w-2xl rounded-[26px] border p-6 sm:p-10"
            style={{ background: theme.panel.background, borderColor: theme.panel.border, boxShadow: theme.panel.shadow }}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: theme.status.ok }}>✓</span>
              <div>
                <p className="text-lg font-semibold" style={{ color: theme.panel.text }}>Activity complete</p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
                  Simulated educational outcome
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-y py-7" style={{ borderColor: theme.panel.border }}>
              {[
                { label: "Decisions", value: String(score.decisions) },
                { label: "Appropriate", value: String(score.correct) },
                { label: "Accuracy", value: `${Math.round(score.accuracy)}%` },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>{s.label}</p>
                  <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums sm:text-4xl" style={{ color: theme.panel.text }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Skills practised</p>
                <ul className="mt-2.5 space-y-1.5">
                  {activity.skills.map((s) => (
                    <li key={s} className="text-[12.5px]" style={{ color: theme.panel.text }}>· {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Concepts</p>
                <ul className="mt-2.5 space-y-2">
                  {activity.concepts.map((c) => {
                    const ok = flow.answers.find((a) => a.concept === c)?.correct;
                    return (
                      <li key={c} className="flex items-center justify-between gap-3">
                        <span className="text-[12.5px]" style={{ color: theme.panel.text }}>{c}</span>
                        {ok !== undefined && (
                          <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.12em]"
                            style={{ background: ok ? `${theme.status.ok}14` : `${theme.status.bad}14`, color: ok ? theme.status.ok : theme.status.bad }}>
                            {ok ? "Appropriate" : "Review"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => dispatch({ type: "RESTART" })}
                className="cursor-pointer rounded-full px-5 py-2.5 text-[12.5px] font-semibold text-white"
                style={{ background: theme.accent }}>
                ↻ Work through it again
              </button>
              <button type="button" onClick={onRestart}
                className="cursor-pointer rounded-full border px-5 py-2.5 text-[12.5px] font-semibold"
                style={{ borderColor: theme.panel.border, color: theme.panel.text }}>
                Back to the floor
              </button>
            </div>

            <p className="mt-6 text-[10.5px] leading-relaxed" style={{ color: theme.panel.dim }}>
              {activity.sourceNote}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- active ------------------------------- */
  const feedbackColour = flow.feedback?.allCorrect ? theme.status.ok : theme.status.bad;
  const hasDecision = Boolean(stage?.choice || stage?.multi);

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[540px] w-full flex-col overflow-hidden">
      {/* top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-5"
        style={{ background: theme.panel.background, borderColor: theme.panel.border, backdropFilter: "blur(14px)" }}>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold sm:text-[13.5px]" style={{ color: theme.panel.text }}>
            {experiment.title}
          </p>
          <p className="mt-0.5 hidden font-mono text-[8.5px] uppercase tracking-[0.2em] sm:block" style={{ color: theme.panel.dim }}>
            {experiment.domain} · Simulated educational scenario
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums" style={{ color: theme.panel.dim }}>
            <span style={{ color: theme.accent }}>{String(flow.currentIndex + 1).padStart(2, "0")}</span>
            /{String(activity.stages.length).padStart(2, "0")}
          </span>
          <span className="hidden items-center gap-1 md:flex" aria-hidden="true">
            {activity.stages.map((st, i) => {
              const answered = Boolean(flow.chosen[st.id]) || flow.answers.some((a) => a.stageId === st.id);
              return (
                <span key={st.id} className="h-1 w-3.5 rounded-full transition-colors duration-500"
                  style={{ background: i === flow.currentIndex ? theme.accent : answered ? theme.status.ok : theme.panel.border }} />
              );
            })}
          </span>
          <button type="button" onClick={() => dispatch({ type: "RESTART" })}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>↻</button>
          <EvidencePanel
              references={references}
              theme={theme}
              contextLabel={experiment.title}
              data-activity-evidence
            />
            <a href={activity.environment === "clinical" ? "#/clinical" : "#/hospital"}
            className="rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>Exit</a>
        </div>
      </div>

      {/* workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]"
        style={{ backgroundImage: `${theme.environment.light}, ${theme.environment.background}` }}>
        {/* environment */}
        <div className="scroll-thin min-h-0 overflow-y-auto p-3 sm:p-4">
          {flow.revealed.length === 0 ? (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-[22px] border border-dashed p-8 text-center"
              style={{ borderColor: theme.panel.border }}>
              <p className="max-w-xs text-[13px] leading-relaxed" style={{ color: theme.panel.muted }}>
                {activity.environment === "clinical"
                  ? "The clinical record will fill in as you work through the case."
                  : "The pharmacy workspace will fill in as you work through the task."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flow.revealed.map((panel, i) => (
                <Panel key={`${panel.kind}-${i}`} panel={panel} theme={theme} newIds={newIds} />
              ))}
            </div>
          )}
        </div>

        {/* decision panel */}
        <aside className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{ background: theme.panel.background, borderColor: theme.panel.border }}
          aria-label="Current action">
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.accent, background: `${theme.accent}12` }}>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              {hasDecision ? "Decision required" : "Next action"}
            </span>
            <p className="mt-2 text-[15px] font-semibold leading-snug" style={{ color: theme.panel.text }}>
              {stage?.instruction}
            </p>
            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>
              {stage?.title}
            </p>
          </div>

          {!hasDecision && (
            <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
              <p className="text-[12px] leading-relaxed" style={{ color: theme.panel.muted }}>
                {stage && stage.reveals.length > 0
                  ? "New information has been added."
                  : "Continue to the next step."}
              </p>
              <button type="button" onClick={() => dispatch({ type: "CONTINUE" })}
                className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 active:scale-[0.99]"
                style={{ background: theme.accent }}>
                Continue →
              </button>
            </div>
          )}

          {stage?.choice && flow.status !== "feedback" && (
            <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
              <p className="text-[12.5px] font-medium leading-snug" style={{ color: theme.panel.text }}>
                {stage.choice.prompt}
              </p>
              <div className="mt-3 space-y-2">
                {stage.choice.options.map((o) => (
                  <button key={o.id} type="button" onClick={() => dispatch({ type: "CHOOSE", optionId: o.id })}
                    className="w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] leading-snug transition-all duration-200"
                    style={{ borderColor: theme.panel.border, color: theme.panel.text }}>
                    {o.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage?.multi && flow.status !== "feedback" && (
            <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
              <p className="text-[12.5px] font-medium leading-snug" style={{ color: theme.panel.text }}>
                {stage.multi.prompt}
              </p>
              <div className="mt-3 space-y-2">
                {stage.multi.options.map((o) => {
                  const picked = flow.multiPicks.includes(o.id);
                  return (
                    <button key={o.id} type="button" onClick={() => dispatch({ type: "TOGGLE_PICK", optionId: o.id })}
                      aria-pressed={picked}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] leading-snug transition-all duration-200"
                      style={{
                        borderColor: picked ? theme.accent : theme.panel.border,
                        background: picked ? `${theme.accent}14` : "transparent",
                        color: theme.panel.text,
                      }}>
                      <span aria-hidden="true"
                        className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                        style={{ borderColor: picked ? theme.accent : theme.panel.border, background: picked ? theme.accent : "transparent" }}>
                        {picked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      {o.text}
                    </button>
                  );
                })}
              </div>
              <button type="button" disabled={flow.multiPicks.length === 0}
                onClick={() => dispatch({ type: "SUBMIT_MULTI" })}
                className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: theme.accent, color: "#fff" }}>
                Submit
              </button>
            </div>
          )}

          {flow.status === "feedback" && flow.feedback && (
            <div key={`fb-${flow.round}`} className={`rounded-2xl border p-3.5 ${anim.riseIn}`}
              style={{ borderColor: `${feedbackColour}66`, background: `${feedbackColour}0D` }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: feedbackColour }}>
                {flow.feedback.allCorrect ? "✓ Appropriate" : "Review your reasoning"}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: theme.panel.text }}>
                {flow.feedback.option.feedback}
              </p>
              <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>
                Simulated educational outcome
              </p>

              {!flow.feedback.allCorrect && (
                <button type="button" onClick={() => dispatch({ type: "RETRY" })}
                  className="mt-3 w-full cursor-pointer rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold"
                  style={{ borderColor: `${theme.status.bad}88`, color: theme.status.bad }}>
                  Try again
                </button>
              )}

              <button type="button" onClick={() => (isLast ? finish() : dispatch({ type: "NEXT" }))}
                className="mt-2.5 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 active:scale-[0.99]"
                style={{ background: theme.accent }}>
                {isLast ? "See the outcome →" : "Continue →"}
              </button>
            </div>
          )}

          <div className="mt-auto rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Objective</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: theme.panel.muted }}>{activity.objective}</p>
            <p className="mt-3 font-mono text-[9px] leading-snug" style={{ color: theme.panel.dim }}>{activity.sourceNote}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export type { ActivityOption };
