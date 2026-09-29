import { useEffect, useRef } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Curriculum from "./pages/Curriculum";
import Subject from "./pages/Subject";
import Lab from "./pages/Lab";
import Experiment from "./pages/Experiment";
import Progress from "./pages/Progress";
import Clinical from "./pages/Clinical";
import Hospital from "./pages/Hospital";
import Resources from "./pages/Resources";
import Admin from "./pages/Admin";
import SignIn from "./pages/SignIn";
import { AuthProvider } from "./auth/AuthContext";
import NotFound from "./pages/NotFound";
import { useRoute } from "./router";
import { closeEvidenceDrawers } from "./components/evidence/EvidencePanel";
import { resolveSubject } from "./data/curriculum";
import { findExperiment } from "./data/experiments";

const TITLES: Record<string, string> = {
  "/": "Pharma Virtual Lab — Interactive Pharm.D Learning",
  "/curriculum": "Curriculum — Pharma Virtual Lab",
  "/lab": "The Virtual Lab — Pharma Virtual Lab",
  "/progress": "Progress — Pharma Virtual Lab",
  "/clinical": "Clinical Pharmacy — Pharma Virtual Lab",
  "/hospital": "Hospital Pharmacy — Pharma Virtual Lab",
  "/resources": "Sources & Evidence — Pharma Virtual Lab",
  "/admin": "Administration — Pharma Virtual Lab",
  "/signin": "Sign in — Pharma Virtual Lab",
};

const EXPERIMENT_PREFIX = "/lab/experiment/";

export default function App() {
  const { path } = useRoute();
  const firstRender = useRef(true);

  const subjectMatch = path.startsWith("/curriculum/")
    ? resolveSubject(path)
    : null;
  const experimentSlug = path.startsWith(EXPERIMENT_PREFIX)
    ? path.slice(EXPERIMENT_PREFIX.length)
    : null;

  /* Keep the document title in sync with the route. */
  useEffect(() => {
    let title = TITLES[path] ?? "Pharma Virtual Lab";
    if (subjectMatch) {
      title = `${subjectMatch.subject.name} — ${subjectMatch.year.label} — Pharma Virtual Lab`;
    } else if (experimentSlug) {
      const experiment = findExperiment(experimentSlug);
      title = experiment
        ? `${experiment.title} — Pharma Virtual Lab`
        : "Experiment — Pharma Virtual Lab";
    }
    document.title = title;
  }, [path, subjectMatch, experimentSlug]);

  /* On real navigation: scroll to top and move focus to the new page. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
    closeEvidenceDrawers();
  }, [path]);

  const page = subjectMatch ? (
    <Subject year={subjectMatch.year} subject={subjectMatch.subject} />
  ) : experimentSlug ? (
    <Experiment slug={experimentSlug} />
  ) : path === "/" ? (
    <Home />
  ) : path.startsWith("/curriculum") ? (
    <Curriculum />
  ) : path.startsWith("/lab") ? (
    <Lab />
  ) : path === "/progress" ? (
    <Progress />
  ) : path === "/clinical" ? (
    <Clinical />
  ) : path === "/hospital" ? (
    <Hospital />
  ) : path === "/resources" ? (
    <Resources />
  ) : path === "/admin" ? (
    <Admin />
  ) : path === "/signin" ? (
    <SignIn />
  ) : (
    <NotFound />
  );

  return (
    <AuthProvider>
    <div id="top" className="min-h-screen bg-bone font-sans text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-bone"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {page}
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}
