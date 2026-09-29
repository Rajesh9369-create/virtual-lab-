import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getBackend, backendStatus } from "../backend";
import type { Profile, UserRole } from "../backend/types";

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  /** True only when a real, persisted database is connected. */
  isRealDatabase: boolean;
  backendLabel: string;
  backendWarning?: string;
  isAdmin: boolean;
  isFaculty: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (id: string | null) => {
    if (!id) {
      setProfile(null);
      return;
    }
    try {
      const backend = await getBackend();
      const p = await backend.getProfile(id);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const backend = await getBackend();
        const current = await backend.getCurrentUserId();
        setUserId(current);
        await load(current);

        unsubscribe = backend.onAuthStateChange(async (id) => {
          setUserId(id);
          await load(id);
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, []);

  const value: AuthState = {
    userId,
    profile,
    loading,
    isRealDatabase: backendStatus.isRealDatabase,
    backendLabel: backendStatus.label,
    backendWarning: backendStatus.warning,
    isAdmin: profile?.role === "ADMIN",
    isFaculty: profile?.role === "FACULTY" || profile?.role === "ADMIN",

    async signIn(email, password) {
      const backend = await getBackend();
      const { userId: id } = await backend.signIn(email, password);
      setUserId(id);
      await load(id);
    },

    async signUp(email, password, displayName) {
      const backend = await getBackend();
      const { userId: id } = await backend.signUp(email, password, displayName);
      setUserId(id);
      await load(id);
    },

    async signOut() {
      const backend = await getBackend();
      await backend.signOut();
      setUserId(null);
      setProfile(null);
    },

    async refresh() {
      await load(userId);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function roleLabel(role: UserRole | undefined): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "FACULTY":
      return "Faculty";
    default:
      return "Student";
  }
}
