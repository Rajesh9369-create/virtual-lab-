import { useMemo, useReducer, useState } from "react";
import type { Experiment } from "../../engine/types";
import type { ExperimentTheme } from "../../engine/theme";
import type { SimulationState } from "../../engine/simulation";
import {
  MASTERY_COLOUR,
  VIVA_DIFFICULTY_LABEL,
  VIVA_TYPE_LABEL,
  createVivaState,
  scoreViva,
  vivaReducer,
  type VivaBank,
  type VivaQuestion,
} from "../../engine/viva";
import { CONCEPT_REVIEW } from "../../data/viva";
import VivaScene from "./VivaScene";
import EvidencePanel from "../evidence/EvidencePanel";
import {
  referencesForExperiment,
  referencesForIds,
} from "../../data/references";
import { anim } from "../experiment/lab/anim";

type Props = {
  experiment: Experiment;
  bank: VivaBank;
  state: SimulationState;
  theme: ExperimentTheme;
  onExit: () => void;
  /** Return to the experiment's own explanation of a concept. */
  onReview: (concept: string) => void;
  onComplete?: (result: {
    mastery: string;
    accuracy: number;
    correct: number;
    total: number;
    /** concept to whether the question testing it was answered correctly */
    concepts: Record<string, boolean>;
  }) => void;
};

export default function VivaEngine({
  experiment,
  bank,
  state,
  theme,
  onExit,
  onReview,
  onComplete,
}: Props) {
  const [viva, dispatch] = useReducer(
    (s, a) => vivaReducer(s, a, bank),
    bank,
    createVivaState
  );
  const [notified, setNotified] = useState(false);

  const question: VivaQuestion | undefined =
    bank.questions[viva.currentIndex] ?? bank.questions[0];

  /* Question-specific evidence where given, otherwise the experiment's. */
  const references = useMemo(
    () =>
      question?.referenceIds && question.referenceIds.length > 0
        ? referencesForIds(question.referenceIds)
        : referencesForExperiment(experiment.id),
    [question?.referenceIds, experiment.id]
  );

  const score = useMemo(() => scoreViva(bank, viva.answers), [bank, viva.answers]);

  const isIdentification = question?.type === "APPARATUS_IDENTIFICATION";
  const isSequencing = question?.type === "PROCEDURE_SEQUENCING";

  /* Per-object reveal colours once an answer has been given. */
  const highlights = useMemo(() => {
    if (!question || viva.status !== "feedback") return {};
    const map: Record<string, string> = {};
    if (question.targetObjectId) {
      map[question.targetObjectId] = `${theme.status.ok}66`;
    }
    if (!viva.lastCorrect && viva.identifiedObjectId) {
      map[viva.identifiedObjectId] = `${theme.status.bad}55`;
    }
    return map;
  }, [question, viva.status, viva.lastCorrect, viva.identifiedObjectId, theme]);

  /* Whether the learner has enough to submit. */
  const canSubmit = isSequencing
    ? viva.sequencePicks.length === (question?.sequence?.length ?? 0)
    : isIdentification
      ? Boolean(viva.identifiedObjectId || viva.selectedOptionId)
      : Boolean(viva.selectedOptionId);

  const submit = () => {
    if (!question) return;
    let correct = false;

    if (isIdentification) {
      const chosenObject = viva.identifiedObjectId;
      const chosenOption = viva.selectedOptionId;
      if (chosenObject) {
        correct = chosenObject === question.targetObjectId;
      } else if (chosenOption && question.options) {
        const option = question.options.find((o) => o.id === chosenOption);
        correct = Boolean(option?.correct);
      }
    } else if (isSequencing) {
      correct =
        question.sequence?.join("|") === viva.sequencePicks.join("|");
    } else if (viva.selectedOptionId && question.options) {
      const option = question.options.find((o) => o.id === viva.selectedOptionId);
      correct = Boolean(option?.correct);
    }

    dispatch({ type: "SUBMIT", correct });
  };

  const next = () => {
    if (viva.currentIndex + 1 >= bank.questions.length) {
      if (!notified && onComplete) {
        const concepts: Record<string, boolean> = {};
        for (const q of bank.questions) {
          const answer = viva.answers.find((a) => a.questionId === q.id);
          if (answer) concepts[q.concept] = answer.correct;
        }
        onComplete({
          mastery: score.mastery,
          accuracy: score.accuracy,
          correct: score.correct,
          total: score.total,
          concepts,
        });
        setNotified(true);
      }
    }
    dispatch({ type: "NEXT" });
  };

  /* ------------------------------- complete ------------------------------ */
  if (viva.status === "complete") {
    const masteryColour = MASTERY_COLOUR[score.mastery];
    return (
      <div
        className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden"
        style={{ background: theme.environment.background }}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 sm:px-6"
          style={{
            background: theme.panel.background,
            borderColor: theme.panel.border,
            backdropFilter: "blur(14px)",
          }}
        >
          <p className="text-[13px] font-semibold" style={{ color: theme.panel.text }}>
            Viva · {experiment.title}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            Back to experiment
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mx-auto max-w-2xl">
            <div
              className={`rounded-[26px] border p-6 sm:p-10 ${anim.riseIn}`}
              style={{
                background: theme.panel.background,
                borderColor: theme.panel.border,
                boxShadow: theme.panel.shadow,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: masteryColour }}
                >
                  ✓
                </span>
                <div>
                  <p
                    className="text-lg font-semibold tracking-[-0.015em]"
                    style={{ color: theme.panel.text }}
                  >
                    Viva complete
                  </p>
                  <p
                    className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
                    style={{ color: theme.panel.dim }}
                  >
                    Current session result
                  </p>
                </div>
              </div>

              <div
                className="mt-8 grid grid-cols-3 gap-4 border-y py-7"
                style={{ borderColor: theme.panel.border }}
              >
                {[
                  { label: "Questions", value: String(score.total) },
                  { label: "Correct", value: String(score.correct) },
                  { label: "Accuracy", value: `${score.accuracy.toFixed(0)}%` },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: theme.panel.dim }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="mt-1.5 font-mono text-3xl font-semibold tabular-nums sm:text-4xl"
                      style={{ color: theme.panel.text }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: theme.panel.dim }}
                >
                  Session mastery
                </p>
                <p
                  className="mt-1.5 font-mono text-2xl font-semibold uppercase tracking-[0.06em]"
                  style={{ color: masteryColour }}
                >
                  {score.mastery}
                </p>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: theme.status.ok }}
                  >
                    Concepts understood
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {score.mastered.length === 0 && (
                      <li className="text-[12px]" style={{ color: theme.panel.muted }}>
                        None yet.
                      </li>
                    )}
                    {score.mastered.map((c) => (
                      <li key={c} className="flex items-center justify-between gap-3">
                        <span className="text-[12.5px]" style={{ color: theme.panel.text }}>
                          {c}
                        </span>
                        <button
                          type="button"
                          onClick={() => onReview(c)}
                          className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.14em]"
                          style={{ color: theme.panel.dim }}
                        >
                          Review
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: theme.status.bad }}
                  >
                    Needs review
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {score.needsReview.length === 0 && (
                      <li className="text-[12px]" style={{ color: theme.panel.muted }}>
                        Nothing — well done.
                      </li>
                    )}
                    {score.needsReview.map((c) => (
                      <li key={c} className="flex items-center justify-between gap-3">
                        <span className="text-[12.5px]" style={{ color: theme.panel.text }}>
                          {c}
                        </span>
                        <button
                          type="button"
                          onClick={() => onReview(c)}
                          className="cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em]"
                          style={{
                            borderColor: `${theme.status.bad}66`,
                            color: theme.status.bad,
                          }}
                        >
                          Review this concept
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "RESTART" })}
                  className="cursor-pointer rounded-full px-5 py-2.5 text-[12.5px] font-semibold transition-all duration-300 active:scale-[0.98]"
                  style={{ background: theme.accent, color: "#fff" }}
                >
                  ↻ Take the viva again
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="cursor-pointer rounded-full border px-5 py-2.5 text-[12.5px] font-semibold"
                  style={{
                    borderColor: theme.panel.border,
                    color: theme.panel.text,
                  }}
                >
                  Back to the experiment
                </button>
              </div>

              <p
                className="mt-6 text-[10.5px] leading-relaxed"
                style={{ color: theme.panel.dim }}
              >
                This is a session result only — it is not saved and does not
                count towards any record.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- asking ------------------------------- */
  const feedbackColour = viva.lastCorrect ? theme.status.ok : theme.status.bad;

  return (
    <div className="flex h-[calc(100dvh-76px)] min-h-[520px] w-full flex-col overflow-hidden">
      {/* top bar */}
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-5"
        style={{
          background: theme.panel.background,
          borderColor: theme.panel.border,
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="min-w-0">
          <p
            className="truncate text-[12.5px] font-semibold sm:text-[13.5px]"
            style={{ color: theme.panel.text }}
          >
            Viva · {experiment.title}
          </p>
          <p
            className="mt-0.5 hidden font-mono text-[8.5px] uppercase tracking-[0.2em] sm:block"
            style={{ color: theme.panel.dim }}
          >
            {experiment.domain}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] tabular-nums"
            style={{ color: theme.panel.dim }}
          >
            <span style={{ color: theme.accent }}>
              {String(viva.currentIndex + 1).padStart(2, "0")}
            </span>
            /{String(bank.questions.length).padStart(2, "0")}
          </span>
          <span className="hidden items-center gap-1 md:flex" aria-hidden="true">
            {bank.questions.map((_, i) => {
              const answered = viva.answers.find(
                (a) => a.questionId === bank.questions[i].id
              );
              return (
                <span
                  key={i}
                  className="h-1 w-3.5 rounded-full transition-colors duration-500"
                  style={{
                    background: answered
                      ? answered.correct
                        ? theme.status.ok
                        : theme.status.bad
                      : i === viva.currentIndex
                        ? theme.accent
                        : "rgba(255,255,255,0.14)",
                  }}
                />
              );
            })}
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESTART" })}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            ↻
          </button>
          <button
            type="button"
            onClick={onExit}
            className="cursor-pointer rounded-full border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panel.border, color: theme.panel.muted }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <VivaScene
          experiment={experiment}
          theme={theme}
          state={state}
          highlights={highlights}
          sceneState={question?.sceneState}
          onIdentify={(objectId) => {
            if (viva.status !== "asking") return;
            dispatch({ type: "IDENTIFY_OBJECT", objectId });
          }}
        />

        <aside
          className="scroll-thin flex min-h-0 flex-col gap-3 overflow-y-auto border-l p-3 sm:p-4"
          style={{
            background: theme.panel.background,
            borderColor: theme.panel.border,
            backdropFilter: "blur(16px)",
          }}
          aria-label="Viva question"
        >
          {/* question */}
          <div
            key={`${question?.id}-${viva.round}`}
            className={`rounded-2xl border p-3.5 ${anim.riseIn}`}
            style={{
              borderColor:
                viva.status === "feedback"
                  ? `${feedbackColour}88`
                  : theme.panel.border,
              background:
                viva.status === "feedback"
                  ? `${feedbackColour}12`
                  : `${theme.accent}10`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
                style={{ color: viva.status === "feedback" ? feedbackColour : theme.accent }}
              >
                Question {String(viva.currentIndex + 1).padStart(2, "0")}
              </span>
              <span
                className="rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em]"
                style={{
                  borderColor: theme.panel.border,
                  color: theme.panel.dim,
                }}
              >
                {question ? VIVA_DIFFICULTY_LABEL[question.difficulty] : ""}
              </span>
            </div>

            <p
              className="mt-2.5 text-[15px] font-semibold leading-snug"
              style={{ color: theme.panel.text }}
            >
              {question?.prompt}
            </p>
            <p
              className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
              style={{ color: theme.panel.dim }}
            >
              {question ? VIVA_TYPE_LABEL[question.type] : ""}
            </p>
          </div>

          {/* interaction */}
          {viva.status === "asking" && question && (
            <div
              className="rounded-2xl border p-3.5"
              style={{ borderColor: theme.panel.border }}
            >
              {isSequencing ? (
                <div>
                  <p
                    className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
                    style={{ color: theme.panel.dim }}
                  >
                    Tap the steps in order
                  </p>
                  <ol className="mt-2.5 space-y-1.5">
                    {viva.sequencePicks.map((step, i) => (
                      <li
                        key={step}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px]"
                        style={{
                          background: `${theme.accent}16`,
                          color: theme.panel.text,
                        }}
                      >
                        <span
                          className="font-mono text-[10px] tabular-nums"
                          style={{ color: theme.accent }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...(question.sequence ?? [])]
                      .slice()
                      .sort(() => 0.5 - Math.random())
                      .map((step) => {
                        const used = viva.sequencePicks.includes(step);
                        return (
                          <button
                            key={step}
                            type="button"
                            disabled={used}
                            onClick={() => dispatch({ type: "PICK_STEP", step })}
                            className="cursor-pointer rounded-full border px-3 py-1.5 text-[11.5px] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30"
                            style={{
                              borderColor: theme.panel.border,
                              color: theme.panel.text,
                            }}
                          >
                            {step}
                          </button>
                        );
                      })}
                  </div>
                  {viva.sequencePicks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "RESET_SEQUENCE" })}
                      className="mt-3 cursor-pointer font-mono text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: theme.panel.dim }}
                    >
                      ↻ Start the order again
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {isIdentification && (
                    <p
                      className="mb-1 text-[10.5px] leading-snug"
                      style={{ color: theme.panel.muted }}
                    >
                      Click it in the laboratory, or choose below.
                    </p>
                  )}
                  {question.options?.map((option) => {
                    const selected = viva.selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          dispatch({ type: "SELECT_OPTION", optionId: option.id })
                        }
                        aria-pressed={selected}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-all duration-200"
                        style={{
                          borderColor: selected ? theme.accent : theme.panel.border,
                          background: selected ? `${theme.accent}18` : "transparent",
                          color: theme.panel.text,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            borderColor: selected ? theme.accent : theme.panel.border,
                            background: selected ? theme.accent : "transparent",
                          }}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="mt-4 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: canSubmit ? theme.accent : "transparent",
                  color: canSubmit ? "#fff" : theme.panel.dim,
                  border: `1px solid ${canSubmit ? theme.accent : theme.panel.border}`,
                }}
              >
                Submit answer
              </button>
            </div>
          )}

          {/* feedback */}
          {viva.status === "feedback" && question && (
            <div
              key={`fb-${question.id}-${viva.round}`}
              className={`rounded-2xl border p-3.5 ${anim.riseIn}`}
              style={{
                borderColor: `${feedbackColour}88`,
                background: `${feedbackColour}10`,
              }}
            >
              <p
                className="font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: feedbackColour }}
              >
                {viva.lastCorrect ? "✓ Correct" : "Not quite"}
              </p>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: theme.panel.text }}
              >
                {question.explanation}
              </p>

              {!viva.lastCorrect && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "RETRY" })}
                  className="mt-3 w-full cursor-pointer rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold"
                  style={{
                    borderColor: `${theme.status.bad}88`,
                    color: theme.status.bad,
                  }}
                >
                  Try again
                </button>
              )}

              <button
                type="button"
                onClick={next}
                className="mt-2.5 w-full cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.99]"
                style={{ background: theme.accent, color: "#fff" }}
              >
                {viva.currentIndex + 1 >= bank.questions.length
                  ? "See your result →"
                  : "Next question →"}
              </button>

              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                <EvidencePanel
                  references={references}
                  theme={theme}
                  contextLabel={`${experiment.title} — ${question.concept}`}
                  data-viva-evidence
                />
                <button
                  type="button"
                  onClick={() => onReview(question.concept)}
                  className="cursor-pointer font-mono text-[9.5px] uppercase tracking-[0.14em]"
                  style={{ color: theme.panel.dim }}
                >
                  Review this concept
                </button>
              </div>
            </div>
          )}

          {/* concept footer */}
          <div
            className="mt-auto rounded-2xl border p-3.5"
            style={{ borderColor: theme.panel.border }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
              style={{ color: theme.panel.dim }}
            >
              Concept being examined
            </p>
            <p
              className="mt-1 text-[12.5px] font-medium"
              style={{ color: theme.panel.text }}
            >
              {question?.concept}
            </p>
            <p
              className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ color: theme.panel.dim }}
            >
              {CONCEPT_REVIEW[question?.concept ?? ""] ?? "Experiment concept"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
