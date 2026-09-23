import { cn } from "@/lib/utils";

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm",
          markClassName,
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="4" y="7" width="16" height="12" rx="2.5" fill="currentColor" opacity="0.9" />
          <path d="M9.5 10.5h5M9.5 13.5h3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        JobHunt{" "}
        <span className="font-light text-slate-500 dark:text-slate-400">OS</span>
      </span>
    </span>
  );
}