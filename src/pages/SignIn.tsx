import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function SignIn() {
  const { signIn, signUp, signOut, userId, profile, isRealDatabase, backendWarning } =
    useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container flex min-h-[76vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <p className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-smoke">
            Account
          </span>
        </p>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-ink">
          {userId ? "You are signed in" : mode === "signin" ? "Sign in" : "Create an account"}
          <span className="text-ember">.</span>
        </h1>

        {userId ? (
          <div className="mt-8 rounded-[22px] border border-clay bg-white p-6">
            <p className="text-[15px] font-semibold text-ink">
              {profile?.displayName ?? "Development user"}
            </p>
            <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-smoke/70">
              {profile?.role ?? "STUDENT"}
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-6 w-full cursor-pointer rounded-full border border-clay px-5 py-3 text-[13px] font-semibold text-ink transition-colors duration-300 hover:border-ink/35"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-[22px] border border-clay bg-white p-6">
            {mode === "signup" && (
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-[12.5px] font-medium text-ink">
                  Display name
                </label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-clay px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ember/40"
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-[12.5px] font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-clay px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ember/40"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block text-[12.5px] font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1.5 w-full rounded-xl border border-clay px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ember/40"
              />
              <p className="mt-1.5 text-[11px] text-smoke">
                Minimum eight characters. Passwords are handled by the
                authentication service and never stored in application tables.
              </p>
            </div>

            {error && <p className="mb-4 text-[12.5px] text-ember-deep">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full cursor-pointer rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-bone transition-colors duration-300 hover:bg-ember-deep disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-smoke transition-colors duration-300 hover:text-ink"
            >
              {mode === "signin" ? "Create an account instead" : "I already have an account"}
            </button>
          </form>
        )}

        {/* Honest backend status, always visible */}
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
            {isRealDatabase ? "Connected to Supabase" : "Development mode"}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-smoke">
            {backendWarning ??
              "Authentication and data are handled by Supabase, with Row Level Security enforced in PostgreSQL."}
          </p>
        </div>
      </div>
    </section>
  );
}
