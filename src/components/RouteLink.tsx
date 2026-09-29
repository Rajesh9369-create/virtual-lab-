import type { ReactNode } from "react";

type RouteLinkProps = {
  to: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "sm" | "md";
  signal?: boolean;
  full?: boolean;
  onDark?: boolean;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

/** A styled internal-navigation anchor, consistent with Phase 1 buttons. */
export default function RouteLink({
  to,
  children,
  variant = "solid",
  size = "md",
  signal = false,
  full = false,
  onDark = false,
  className = "",
  onClick,
  ariaLabel,
}: RouteLinkProps) {
  const variantCls =
    variant === "solid"
      ? onDark
        ? "bg-bone text-ink hover:bg-ember hover:text-bone"
        : "bg-ink text-bone hover:bg-ember-deep"
      : onDark
        ? "border border-bone/30 text-bone hover:border-bone/70 hover:bg-bone/10"
        : "border border-ink/20 bg-white/40 text-ink backdrop-blur-sm hover:border-ink/45 hover:bg-white/80";

  const sizeCls =
    size === "sm"
      ? "px-5 py-2.5 text-[13px] font-medium"
      : "px-8 py-4 text-sm font-semibold";

  return (
    <a
      href={`#${to}`}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full transition-all duration-300 active:scale-[0.98] ${
        full ? "w-full" : ""
      } ${variantCls} ${sizeCls} ${className}`}
    >
      {signal && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-ember" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
        </span>
      )}
      {children}
    </a>
  );
}
