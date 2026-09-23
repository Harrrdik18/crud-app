import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelative(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function salaryLabel(app: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryInterval?: string | null;
}): string | null {
  const currency = app.salaryCurrency ?? "USD";
  if (app.salaryMin == null && app.salaryMax == null) return null;
  const fmt = (n: number) =>
    `${currency === "USD" ? "$" : currency + " "}${n.toLocaleString("en-US")}`;
  let label: string;
  if (app.salaryMin != null && app.salaryMax != null) {
    label = `${fmt(app.salaryMin)}–${fmt(app.salaryMax)}`;
  } else if (app.salaryMin != null) {
    label = `From ${fmt(app.salaryMin)}`;
  } else {
    label = `Up to ${fmt(app.salaryMax!)}`;
  }
  const map: Record<string, string> = {
    year: "/yr",
    month: "/mo",
    hour: "/hr",
    one_time: "",
  };
  return label + (app.salaryInterval ? ` ${map[app.salaryInterval] ?? ""}` : "").trim();
}