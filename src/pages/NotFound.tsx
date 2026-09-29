import RouteLink from "../components/RouteLink";

export default function NotFound() {
  return (
    <section
      className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center"
      aria-labelledby="notfound-heading"
    >
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-smoke">
        404 — Off the map
      </p>
      <h1
        id="notfound-heading"
        className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl"
      >
        This page doesn't exist
        <span className="text-ember">.</span>
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
        The address you followed isn't part of Pharma Virtual Lab — yet.
      </p>
      <div className="mt-10">
        <RouteLink to="/" variant="solid">
          Back to Home
        </RouteLink>
      </div>
    </section>
  );
}
