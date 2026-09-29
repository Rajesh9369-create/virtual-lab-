import { useEffect, useState } from "react";

/**
 * Minimal hash-based router — the simplest reliable approach for a
 * statically served single-page app. Routes look like "#/curriculum".
 * Non-route hashes (e.g. the in-page anchor "#main") return null so
 * they never hijack navigation.
 */
export function parseRoute(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  if (raw === "" || raw === "/") return "/";
  if (!raw.startsWith("/")) return null; // in-page anchor, not a route
  const clean = raw.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

export function useRoute() {
  const [path, setPath] = useState<string>(
    () => parseRoute(window.location.hash) ?? "/"
  );

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRoute(window.location.hash);
      if (next !== null) setPath(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return { path };
}
