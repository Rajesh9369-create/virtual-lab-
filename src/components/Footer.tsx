import type { MouseEvent } from "react";
import { useRoute } from "../router";

export default function Footer() {
  const year = new Date().getFullYear();
  const { path } = useRoute();

  const handleWordmark = (e: MouseEvent) => {
    if (path === "/") {
      e.preventDefault();
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <footer className="border-t border-clay/80 bg-sand/40">
      <div className="container py-14 lg:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <a
              href="#/"
              onClick={handleWordmark}
              aria-label="Pharma Virtual Lab — home"
              className="group inline-flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 bg-white/70 transition-colors duration-300 group-hover:border-ink/35">
                <span className="h-2.5 w-2.5 rounded-full bg-ember transition-transform duration-500 group-hover:scale-125" />
              </span>
              <span className="leading-none">
                <span className="block text-[13px] font-semibold tracking-[0.22em] text-ink">
                  PHARMA
                </span>
                <span className="mt-1 block font-mono text-[9.5px] tracking-[0.34em] text-smoke">
                  VIRTUAL LAB
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-smoke">
              Interactive learning environment for Pharm.D education.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-smoke">
              Phase 15 — Database, Credits & Admin
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
              Curriculum · Lab · Progress — introductory pages
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-clay/70 pt-6 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Pharma Virtual Lab. All rights reserved.</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
            Designed for scientific curiosity
          </p>
        </div>
      </div>
    </footer>
  );
}
