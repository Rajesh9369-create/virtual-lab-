import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getBackend } from "../backend";
import type {
  AdminOverview,
  AuditLogEntry,
  ContentStatus,
  ContentSummary,
  StudentSummary,
} from "../backend/types";

type Section =
  | "OVERVIEW"
  | "STUDENTS"
  | "CONTENT"
  | "EXPERIMENTS"
  | "VIVA"
  | "REFERENCES"
  | "ANALYTICS"
  | "AUDIT";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "STUDENTS", label: "Students" },
  { id: "CONTENT", label: "Content" },
  { id: "EXPERIMENTS", label: "Experiments" },
  { id: "VIVA", label: "Viva" },
  { id: "REFERENCES", label: "References" },
  { id: "ANALYTICS", label: "Analytics" },
  { id: "AUDIT", label: "Audit log" },
];

const STATUS_COLOUR: Record<ContentStatus, string> = {
  DRAFT: "#8C8580",
  IN_REVIEW: "#F0B24A",
  VERIFIED: "#0369A1",
  PUBLISHED: "#17B47C",
  ARCHIVED: "#B4ACA5",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-clay bg-white p-5">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-smoke/70">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-clay bg-white/50 px-6 py-12 text-center">
      <p className="text-sm leading-relaxed text-smoke">{message}</p>
    </div>
  );
}

export default function Admin() {
  const { userId, profile, isAdmin, loading, isRealDatabase, backendWarning } =
    useAuth();
  const [section, setSection] = useState<Section>("OVERVIEW");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [content, setContent] = useState<ContentSummary[] | null>(null);
  const [audit, setAudit] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isAdmin) return;
    let cancelled = false;

    (async () => {
      try {
        const backend = await getBackend();
        const [o, s, c, a] = await Promise.all([
          backend.getOverview(),
          backend.listStudents(),
          backend.listContent(),
          backend.listAuditLogs(50),
        ]);
        if (cancelled) return;
        setOverview(o);
        setStudents(s);
        setContent(c);
        setAudit(a);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isAdmin]);

  const contentByStatus = useMemo(() => {
    if (!content) return null;
    const groups = new Map<ContentStatus, ContentSummary[]>();
    for (const c of content) {
      const list = groups.get(c.contentStatus) ?? [];
      list.push(c);
      groups.set(c.contentStatus, list);
    }
    return groups;
  }, [content]);

  /* ------------------------------------------------ loading / denied */

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">
          Checking authorisation…
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
          Administrator access
        </p>
        <h1 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink [text-wrap:balance]">
          Sign in with an administrator account to continue
          <span className="text-ember">.</span>
        </h1>
        <a
          href="#/admin"
          className="mt-8 rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-bone"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ember-deep">
          Access denied
        </p>
        <h1 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink [text-wrap:balance]">
          This account does not have administrator access
          <span className="text-ember">.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
          Signed in as <span className="font-medium text-ink">{profile?.displayName}</span>.
          Administrator areas are restricted by a server-side role check, not
          just by hiding the link.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------- dashboard */

  return (
    <>
      <header className="border-b border-clay/70 bg-sand/40">
        <div className="container pb-8 pt-10">
          <p className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-smoke">
              Administration
            </span>
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
            Platform administration
            <span className="text-ember">.</span>
          </h1>
          <p className="mt-3 text-sm text-smoke">
            Signed in as {profile?.displayName} · Administrator
          </p>

          {/* backend status — always visible, never misleading */}
          <div
            className="mt-6 rounded-[18px] border p-4"
            style={{
              borderColor: isRealDatabase ? "#17B47C66" : "#C94B1266",
              background: isRealDatabase ? "#17B47C0D" : "#C94B120D",
            }}
          >
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
              style={{ color: isRealDatabase ? "#17B47C" : "#C94B12" }}
            >
              {isRealDatabase ? "Connected to Supabase PostgreSQL" : "Development mode — no database connected"}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-smoke">
              {backendWarning ??
                "Row Level Security is enforced by PostgreSQL. Only the public anon key is used in the browser."}
            </p>
          </div>
        </div>
      </header>

      {/* section nav */}
      <div className="sticky top-[75px] z-40 border-b border-clay/70 bg-bone/90 backdrop-blur-xl">
        <div className="container">
          <div className="scroll-thin flex gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s) => {
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-300 ${
                    active
                      ? "border-ink bg-ink text-bone"
                      : "border-clay bg-white/60 text-smoke hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-10">
        {error && (
          <div className="mb-8 rounded-[18px] border border-ember/50 bg-ember/5 p-4">
            <p className="text-[13px] text-ember-deep">{error}</p>
          </div>
        )}

        {/* ---------------------------------------------- OVERVIEW */}
        {section === "OVERVIEW" && (
          <div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <Stat label="Registered students" value={String(overview?.registeredStudents ?? 0)} />
              <Stat label="Active learners" value={String(overview?.activeLearners ?? 0)} />
              <Stat label="Experiments completed" value={String(overview?.experimentsCompleted ?? 0)} />
              <Stat label="Vivas completed" value={String(overview?.vivasCompleted ?? 0)} />
              <Stat label="Simulations completed" value={String(overview?.simulationsCompleted ?? 0)} />
              <Stat
                label="Content needing verification"
                value={String(overview?.contentRequiringVerification ?? 0)}
              />
            </div>

            {(overview?.registeredStudents ?? 0) === 0 && (
              <div className="mt-6">
                <EmptyState message="No students are registered yet. These figures are read directly from the database — nothing here is estimated or simulated." />
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------- STUDENTS */}
        {section === "STUDENTS" && (
          <div>
            {students && students.length > 0 ? (
              <div className="space-y-3">
                {students.map((s) => (
                  <div
                    key={s.profile.userId}
                    className="grid grid-cols-1 gap-4 rounded-[20px] border border-clay bg-white p-5 sm:grid-cols-[1.4fr_1fr_1fr_1fr]"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-ink">
                        {s.profile.displayName}
                      </p>
                      <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-smoke/70">
                        {s.profile.role}
                        {s.profile.pharmdYear ? ` · Year ${s.profile.pharmdYear}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-smoke/70">
                        Experiments
                      </p>
                      <p className="mt-1 font-mono text-[15px] tabular-nums text-ink">
                        {s.experimentsCompleted}/{s.experimentAttempts}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-smoke/70">
                        Vivas
                      </p>
                      <p className="mt-1 font-mono text-[15px] tabular-nums text-ink">
                        {s.vivasCompleted}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-smoke/70">
                        Credits
                      </p>
                      <p className="mt-1 font-mono text-[15px] tabular-nums text-ink">
                        {s.credits}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No student profiles exist yet. Passwords are never stored in this table and are never shown here." />
            )}
          </div>
        )}

        {/* ----------------------------------------------- CONTENT */}
        {section === "CONTENT" && (
          <div className="space-y-8">
            {(["DRAFT", "IN_REVIEW", "VERIFIED", "PUBLISHED", "ARCHIVED"] as ContentStatus[]).map(
              (status) => {
                const rows = contentByStatus?.get(status) ?? [];
                return (
                  <div key={status}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p
                        className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
                        style={{ color: STATUS_COLOUR[status] }}
                      >
                        {status.replace("_", " ")}
                      </p>
                      <span className="font-mono text-[9.5px] tabular-nums text-smoke/70">
                        {String(rows.length).padStart(2, "0")}
                      </span>
                    </div>
                    {rows.length === 0 ? (
                      <p className="mt-3 text-[12.5px] text-smoke/70">None.</p>
                    ) : (
                      <ul className="mt-3 border-t border-clay">
                        {rows.map((c) => (
                          <li
                            key={`${c.entityType}-${c.id}`}
                            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-3"
                          >
                            <span className="text-[14px] text-ink">{c.title}</span>
                            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-smoke/70">
                              {c.entityType.replace("_", " ")} · v{c.version}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* ------------------------------------------- EXPERIMENTS */}
        {section === "EXPERIMENTS" && (
          <EmptyState message="Experiment records are read from experiment_attempts, experiment_events and experiment_results. Completion counts appear in the Overview section." />
        )}

        {/* -------------------------------------------------- VIVA */}
        {section === "VIVA" && (
          <EmptyState message="Viva attempts and answers are stored per question and per attempt, with the assessment version retained so historical attempts are never rewritten." />
        )}

        {/* -------------------------------------------- REFERENCES */}
        {section === "REFERENCES" && (
          <EmptyState message="Reference verification status lives in the references table, with verified_at and verified_by retained. No source detail is ever invented." />
        )}

        {/* --------------------------------------------- ANALYTICS */}
        {section === "ANALYTICS" && (
          <EmptyState message="Analytics are computed from learning events, attempts, viva results and competency evidence. No engagement metric is derived from clicks or time spent alone." />
        )}

        {/* -------------------------------------------------- AUDIT */}
        {section === "AUDIT" && (
          <div>
            {audit && audit.length > 0 ? (
              <ul className="border-t border-clay">
                {audit.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-clay/70 py-3"
                  >
                    <span className="flex items-baseline gap-3.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                      <span className="font-mono text-[12px] text-ink">{a.action}</span>
                    </span>
                    <span className="font-mono text-[9.5px] tabular-nums text-smoke/70">
                      {a.entityType ?? "—"} · {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No administrative actions have been logged yet. Passwords and authentication credentials are never recorded here." />
            )}
          </div>
        )}
      </div>
    </>
  );
}
