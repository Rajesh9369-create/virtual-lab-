import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useRoute } from "../router";
import RouteLink from "./RouteLink";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Curriculum", to: "/curriculum" },
  { label: "Lab", to: "/lab" },
  { label: "Clinical", to: "/clinical" },
  { label: "Hospital", to: "/hospital" },
  { label: "Progress", to: "/progress" },
  { label: "Sources", to: "/resources" },
];

function scrollToTop() {
  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

function Wordmark({ onClick }: { onClick: (e: MouseEvent) => void }) {
  return (
    <a
      href="#/"
      onClick={onClick}
      aria-label="Pharma Virtual Lab — home"
      className="group flex items-center gap-3"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 bg-white/60 transition-colors duration-300 group-hover:border-ink/35">
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
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { path } = useRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* A section stays active on its own page and any nested route beneath it. */
  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);

  /* If the target route is already active, scroll to top instead. */
  const handleLinkClick =
    (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      setOpen(false);
      if (to === path) {
        e.preventDefault();
        scrollToTop();
      }
    };

  const handleWordmark = (e: MouseEvent) => {
    setOpen(false);
    if (path === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled || open
          ? "border-clay bg-bone/90 shadow-[0_10px_36px_-24px_rgba(29,27,26,0.4)] backdrop-blur-xl"
          : "border-transparent bg-bone/60 backdrop-blur-md"
      }`}
    >
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Wordmark onClick={handleWordmark} />

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = path === item.to;
            return (
              <a
                key={item.to}
                href={`#${item.to}`}
                onClick={handleLinkClick(item.to)}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-sm transition-colors duration-300 ${
                  active
                    ? "font-medium text-ink"
                    : "text-smoke hover:text-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute -bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-ember"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex">
            <RouteLink to="/lab" size="sm" signal>
              Enter Lab
            </RouteLink>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-clay bg-white/60 transition-colors duration-300 hover:bg-white md:hidden"
          >
            <span className="relative block h-3 w-[18px]" aria-hidden="true">
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-fade border-t border-clay/80 bg-bone/95 backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Mobile" className="container flex flex-col pb-6 pt-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <a
                  key={item.to}
                  href={`#${item.to}`}
                  onClick={handleLinkClick(item.to)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-clay/60 py-4 text-sm ${
                    active ? "font-medium text-ink" : "text-smoke"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-ember"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}
            <div className="mt-5">
              <RouteLink to="/lab" size="sm" signal full>
                Enter Lab
              </RouteLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
