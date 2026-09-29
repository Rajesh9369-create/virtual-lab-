/**
 * BACKEND LAYER — adapter selection
 * ---------------------------------
 * Two adapters implement one interface:
 *
 *   SupabaseBackend  — the REAL production database (Supabase Auth +
 *                      PostgreSQL + Row Level Security). Active only when
 *                      VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 *
 *   DevBackend       — an in-memory development adapter used when no real
 *                      backend is configured. It is NOT a database and is
 *                      NOT production-ready. Data does not survive a reload.
 *
 * The selection is explicit and surfaced in the UI so nobody can mistake
 * development mode for a connected production database.
 */
import type { SupabaseBackend } from "./supabaseAdapter";
import type { DevBackend } from "./devAdapter";

export type BackendKind = "supabase" | "dev";

export interface BackendStatus {
  kind: BackendKind;
  /** True only when talking to a real, persisted PostgreSQL database. */
  isRealDatabase: boolean;
  /** Human-readable label for the UI. */
  label: string;
  /** Shown when development mode is active. */
  warning?: string;
}

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? "";

/** True only when real credentials are present in the environment. */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export const backendStatus: BackendStatus = isSupabaseConfigured
  ? {
      kind: "supabase",
      isRealDatabase: true,
      label: "Supabase PostgreSQL",
    }
  : {
      kind: "dev",
      isRealDatabase: false,
      label: "Development mode — no database connected",
      warning:
        "No Supabase credentials are configured, so this session uses an in-memory development adapter. Nothing is persisted and this is not a production database.",
    };

let instance: SupabaseBackend | DevBackend | null = null;

export async function getBackend(): Promise<SupabaseBackend | DevBackend> {
  if (instance) return instance;

  if (isSupabaseConfigured) {
    const { createSupabaseBackend } = await import("./supabaseAdapter");
    instance = createSupabaseBackend(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    const { createDevBackend } = await import("./devAdapter");
    instance = createDevBackend();
  }

  return instance;
}
