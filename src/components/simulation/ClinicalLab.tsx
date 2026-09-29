import { useMemo, useReducer, useState } from "react";
import type { Experiment } from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import {
  clinicalConceptResults,
  clinicalReducer,
  createClinicalState,
  type ClinicalInfo,
} from "../../engine/clinical";
import { CLINICAL_CASE } from "../../data/simulations";
import { recordEvent, recordViva } from "../../progress/store";
import EvidencePanel from "../evidence/EvidencePanel";
import { referencesForExperiment } from "../../data/references";
import { anim } from "../experiment/lab/anim";

type Props = {
  experiment: Experiment;
  theme: ExperimentTheme;
  onRestart: () => void;
  onContinue: () => void;
  onComplete: (concepts: Record<string, boolean>) => void;
};

const TONE_COLOUR: Record<string, string> = {
  normal: "#0F9D76",
  attention: "#C2410C",
  recent: "#0369A1",
};

function InfoChip({
  info,
  theme,
  isNew,
}: {
  info: ClinicalInfo;
  theme: ExperimentTheme;
  isNew: boolean;
}) {
  const colour = info.tone ? TONE_COLOUR[info.tone] : theme.panel.muted;
  return (
    <div
      className={`rounded-[16px] border bg-white p-3.5 ${isNew ? anim.riseIn : ""}`}
      style={{
        borderColor: info.tone ? `${colour}44` : theme.panel.border,
        boxShadow: "0 1px 3px rgba(90,115,135,0.10)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13.5px] font-semibold leading-snug" style={{ color: theme.panel.text }}>
          {info.label}
        </p>
        {info.tone && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ background: `${colour}14`, color: colour }}
          >
            {info.tone}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: theme.panel.muted }}>
        {info.value}
      </p>
      {info.note && (
        <p className="mt-2 font-mono text-[9px] leading-snug" style={{ color: theme.panel.dim }}>
          {info.note}
        </p>
      )}
    </div>
  );
}

export default function ClinicalLab({
  experiment,
  theme,
  onRestart,
  onContinue,
  onComplete,
}: Props) {
  const references = useMemo(
    () => referencesForExperiment(experiment.id),
    [experiment.id]
  );

  const [clinical, dispatch] = useReducer(
    (s, a) => clinicalReducer(s, a, CLINICAL_CASE),
    undefined,
    createClinicalState
  );
  const [notified, setNotified] = useState(false);

  const stage = CLINICAL_CASE.stages[clinical.currentIndex];
  const isLast = clinical.currentIndex >= CLINICAL_CASE.stages.length - 1;

  const grouped = useMemo(() => {
    const byKind = new Map<string, ClinicalInfo[]>();
    for (const info of clinical.revealed) {
      const list = byKind.get(info.kind) ?? [];
      list.push(info);
      byKind.set(info.kind, list);
    }
    return byKind;
  }, [clinical.revealed]);

  /* Which information was revealed by the current stage (for animation). */
  const newRevealIds = useMemo(() => {
    const seen = new Set<string>();
    for (let i = 0; i < clinical.currentIndex; i++) {
      for (const info of CLINICAL_CASE.stages[i]?.reveals ?? []) seen.add(info.label);
    }
    return seen;
  }, [clinical.currentIndex]);

  const finish = () => {
    const results = clinicalConceptResults(CLINICAL_CASE, clinical.chosen);
    const concepts: Record<string, boolean> = {};
    for (const r of results) concepts[r.concept] = r.correct;
    const correct = results.filter((r) => r.correct).length;
    if (!notified) {
      onComplete(concepts);
      recordViva({
        experimentId: experiment.id,
        mastery: correct === results.length ? "MASTERED" : correct > 0 ? "UNDERSTOOD" : "NEEDS REVIEW",
        accuracy: results.length > 0 ? (correct / results.length) * 100 : 0,
        correct,
        total: results.length,
        concepts,
      });
      recordEvent({
        type: "simulationCompleted",
        experimentId: experiment.id,
        subjectId: experiment.subjectId,
        label: `Completed ${experiment.title}`,
      });
      setNotified(true);
    }
    onContinue();
  };

  /* ------------------------------- complete ------------------------------- */
  if (clinical.status === "complete") {
    const results = clinicalConceptResults(CLINICAL_CASE, clinical.chosen);
    const correct = results.filter((r) => r.correct).length;
    return (
      <div className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden"
        style={{ backgroundImage: `${theme.environment.light}, ${theme.environment.background}` }}>
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 sm:px-6"
          style={{ background: theme.panel.background, borderColor: theme.panel.border }}>
          <p className="text-[13px] font-semibold" style={{ color: theme.panel.text }}>
            {experiment.title} — complete
          </p>
          <button type="button" onClick={onRestart} className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>
            ↻ Back to the lab
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mx-auto max-w-2xl rounded-[26px] border bg-white p-6 sm:p-10"
            style={{ borderColor: theme.panel.border, boxShadow: theme.panel.shadow }}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: theme.status.ok }}>✓</span>
              <div>
                <p className="text-lg font-semibold" style={{ color: theme.panel.text }}>Case complete</p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
                  Simulated educational outcome
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-y py-7" style={{ borderColor: theme.panel.border }}>
              {[
                { label: "Decisions", value: String(results.length) },
                { label: "Appropriate", value: String(correct) },
                { label: "Accuracy", value: `${results.length ? Math.round((correct / results.length) * 100) : 0}%` },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>{s.label}</p>
                  <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums sm:text-4xl" style={{ color: theme.panel.text }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>Decisions made</p>
              <ul className="mt-3 space-y-3">
                {results.map((r) => (
                  <li key={r.concept} className="flex items-start justify-between gap-4">
                    <span className="text-[13px]" style={{ color: theme.panel.text }}>{r.concept}</span>
                    <span className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em]"
                      style={{ background: r.correct ? `${theme.status.ok}14` : `${theme.status.bad}14`, color: r.correct ? theme.status.ok : theme.status.bad }}>
                      {r.correct ? "Appropriate" : "Review"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => dispatch({ type: "RESTART" })}
                className="cursor-pointer rounded-full px-5 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ background: theme.accent }}>
                ↻ Work through the case again
              </button>
              <button type="button" onClick={onRestart}
                className="cursor-pointer rounded-full border px-5 py-2.5 text-[12.5px] font-semibold"
                style={{ borderColor: theme.panel.border, color: theme.panel.text }}>
                Back to the lab
              </button>
            </div>

            <p className="mt-6 text-[10.5px] leading-relaxed" style={{ color: theme.panel.dim }}>
              Simulated educational outcome. This case is not a real patient and
              provides no individualised treatment advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- active -------------------------------- */
  const feedbackColour = clinical.feedback?.correct ? theme.status.ok : theme.status.bad;

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[540px] w-full flex-col overflow-hidden">
      {/* top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-5"
        style={{ background: theme.panel.background, borderColor: theme.panel.border, boxShadow: "0 1px 3px rgba(90,115,135,0.12)" }}>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold sm:text-[13.5px]" style={{ color: theme.panel.text }}>
            {experiment.title}
          </p>
          <p className="mt-0.5 hidden font-mono text-[8.5px] uppercase tracking-[0.2em] sm:block" style={{ color: theme.panel.dim }}>
            {experiment.domain} · Simulated educational case
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums" style={{ color: theme.panel.dim }}>
            <span style={{ color: theme.accent }}>{String(clinical.currentIndex + 1).padStart(2, "0")}</span>
            /{String(CLINICAL_CASE.stages.length).padStart(2, "0")}
          </span>
          <span className="hidden items-center gap-1 md:flex" aria-hidden="true">
            {CLINICAL_CASE.stages.map((st, i) => {
              const answered = Boolean(clinical.chosen[st.id]);
              return (
                <span key={st.id} className="h-1 w-3.5 rounded-full transition-colors duration-500"
                  style={{ background: i === clinical.currentIndex ? theme.accent : answered ? theme.status.ok : "rgba(120,150,170,0.24)" }} />
              );
            })}
          </span>
          <button type="button" onClick={onRestart} className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>↻</button>
          <EvidencePanel
              references={references}
              theme={theme}
              contextLabel={experiment.title}
              data-clinical-evidence
            />
            <a href="#/lab" className="rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}>Exit</a>
        </div>
      </div>

      {/* workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]"
        style={{ backgroundImage: `${theme.environment.light}, ${theme.environment.background}` }}>
        {/* ---------------- clinical record ---------------- */}
        <div className="scroll-thin min-h-0 overflow-y-auto p-3 sm:p-4">
          {/* patient banner */}
          <div className="rounded-[22px] border bg-white p-4 sm:p-5" style={{ borderColor: theme.panel.border, boxShadow: "0 1px 3px rgba(90,115,135,0.10)" }}>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, #0B5A54)` }}>
                SP
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold" style={{ color: theme.panel.text }}>Simulated patient</p>
                <p className="mt-0.5 text-[12.5px]" style={{ color: theme.panel.muted }}>
                  Attending a pharmacy medication review
                </p>
                <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.status.warn }}>
                  Educational case — not a real patient
                </p>
              </div>
            </div>
          </div>

          {/* revealed information, grouped by kind */}
          {grouped.size === 0 ? (
            <div className="mt-3 rounded-[22px] border border-dashed p-8 text-center" style={{ borderColor: theme.panel.border }}>
              <p className="text-[13px] leading-relaxed" style={{ color: theme.panel.muted }}>
                The clinical record will fill in as you work through the case.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {[...grouped.entries()].map(([kind, infos]) => (
                <div key={kind} className="rounded-[22px] border bg-white/70 p-3.5 sm:p-4" style={{ borderColor: theme.panel.border }}>
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
                    {kind === "notes" ? "Clinical notes" : kind}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {infos.map((info) => (
                      <InfoChip key={info.label} info={info} theme={theme} isNew={!newRevealIds.has(info.label)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- decision panel ---------------- */}
        <aside className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{ background: theme.panel.background, borderColor: theme.panel.border }}
          aria-label="Case decision">
          <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.accent, background: `${theme.accent}0D` }}>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              {stage?.choice ? "Decision required" : "Next action"}
            </span>
            <p className="mt-2 text-[15px] font-semibold leading-snug" style={{ color: theme.panel.text }}>
              {stage?.instruction}
            </p>
            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em]" style={{ color: theme.panel.dim }}>
              {stage?.title}
            </p>
          </div>

          {/* reveal / decision */}
          {stage && !stage.choice && (
            <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
              <p className="text-[12px] leading-relaxed" style={{ color: theme.panel.muted }}>
                {stage.reveals.length > 0
                  ? "New information has been added to the clinical record."
                  : "Continue to the next part of the case."}
              </p>
              <button type="button" onClick={() => dispatch({ type: "CONTINUE" })}
                className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 active:scale-[0.99]"
                style={{ background: theme.accent }}>
                {isLast ? "Continue" : "Continue →"}
              </button>
            </div>
          )}

          {stage?.choice && clinical.status !== "feedback" && (
            <div className="rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
              <p className="text-[12.5px] font-medium leading-snug" style={{ color: theme.panel.text }}>
                {stage.choice.prompt}
              </p>
              <div className="mt-3 space-y-2">
                {stage.choice.options.map((option) => (
                  <button key={option.id} type="button"
                    onClick={() => dispatch({ type: "CHOOSE", optionId: option.id })}
                    className="w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] leading-snug transition-all duration-200"
                    style={{ borderColor: theme.panel.border, color: theme.panel.text }}>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* consequence */}
          {clinical.status === "feedback" && clinical.feedback && (
            <div key={`fb-${clinical.round}`} className={`rounded-2xl border p-3.5 ${anim.riseIn}`}
              style={{ borderColor: `${feedbackColour}66`, background: `${feedbackColour}0D` }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: feedbackColour }}>
                {clinical.feedback.correct ? "✓ Appropriate" : "Consider again"}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: theme.panel.text }}>
                {clinical.feedback.feedback}
              </p>
              <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: theme.panel.dim }}>
                Simulated educational outcome
              </p>

              {!clinical.feedback.correct && (
                <button type="button" onClick={() => dispatch({ type: "RETRY" })}
                  className="mt-3 w-full cursor-pointer rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold"
                  style={{ borderColor: `${theme.status.bad}88`, color: theme.status.bad }}>
                  Try again
                </button>
              )}

              <button type="button"
                onClick={() => {
                  if (isLast) { finish(); return; }
                  dispatch({ type: "NEXT" });
                }}
                className="mt-2.5 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 active:scale-[0.99]"
                style={{ background: theme.accent }}>
                {isLast ? "See the outcome →" : "Continue →"}
              </button>
            </div>
          )}

          <div className="mt-auto rounded-2xl border p-3.5" style={{ borderColor: theme.panel.border }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.panel.dim }}>
              Case concept
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: theme.panel.muted }}>
              {CLINICAL_CASE.scientificConcept}
            </p>
            <p className="mt-3 font-mono text-[9px] leading-snug" style={{ color: theme.panel.dim }}>
              Source verification required — no reference range or dosing
              instruction is given.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
