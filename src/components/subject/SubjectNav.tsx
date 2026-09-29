import { useEffect, useState } from "react";

type NavItem = { id: string; label: string; hint: string };

const ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", hint: "Subject & learning path" },
  { id: "topics", label: "Topics", hint: "Outline being mapped" },
  { id: "practicals", label: "Practicals", hint: "Verification required" },
  { id: "modules", label: "Learning modules", hint: "Nine module types" },
  { id: "resources", label: "Resources", hint: "Pending sources" },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

/** Elegant section rail — desktop sidebar, compact chips on mobile. */
export default function SubjectNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const onScroll = () => {
      let current = "overview";
      for (const item of ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 150) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav aria-label="Subject sections">
      {/* Desktop rail */}
      <div className="hidden lg:block">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-smoke/70">
          In this subject
        </p>
        <ul className="mt-5 space-y-1">
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex w-full cursor-pointer items-start gap-3 py-2.5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full border transition-colors duration-300 ${
                      isActive
                        ? "border-ember bg-ember"
                        : "border-clay bg-white group-hover:border-ink/35"
                    }`}
                  />
                  <span>
                    <span
                      className={`block text-[13px] transition-colors duration-300 ${
                        isActive
                          ? "font-medium text-ink"
                          : "text-smoke group-hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-snug text-smoke/70">
                      {item.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile chips */}
      <div className="-mx-6 border-b border-clay/70 bg-bone/90 px-6 backdrop-blur-lg lg:hidden">
        <ul className="flex snap-x gap-2 overflow-x-auto pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-[12px] font-medium transition-colors duration-300 ${
                    isActive
                      ? "border-ink bg-ink text-bone"
                      : "border-clay bg-white/60 text-smoke"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
