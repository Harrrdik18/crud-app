import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDate, formatDateTime, formatRelative, initials, salaryLabel, cn } from "@/lib/utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDate / formatDateTime", () => {
  it("formats a valid date", () => {
    expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toMatch(/Jan 5, 2026/);
  });

  it("returns a dash for nullish input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns a dash for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats date-time", () => {
    expect(formatDateTime("2026-03-10T14:30:00Z")).toMatch(/Mar 10/);
  });
});

describe("formatRelative", () => {
  it("handles recent times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(formatRelative(new Date("2026-01-01T12:00:00Z"))).toBe("just now");
    expect(formatRelative(new Date("2026-01-01T11:45:00Z"))).toBe("15m ago");
    expect(formatRelative(new Date("2026-01-01T10:00:00Z"))).toBe("2h ago");
    expect(formatRelative(new Date("2025-12-15T12:00:00Z"))).toBe("17d ago");
  });

  it("falls back to a date for old timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(formatRelative(new Date("2025-06-01T12:00:00Z"))).toMatch(/Jun 1, 2025/);
  });
});

describe("initials", () => {
  it("caps the first two words", () => {
    expect(initials("john doe")).toBe("JD");
  });

  it("handles a single name", () => {
    expect(initials("alice")).toBe("A");
  });

  it("ignores extra padding", () => {
    expect(initials("  a   b   c  ")).toBe("AB");
  });

  it("returns empty for missing name", () => {
    expect(initials("")).toBe("");
  });
});

describe("salaryLabel", () => {
  it("formats a range", () => {
    const label = salaryLabel({ salaryMin: 90000, salaryMax: 120000, salaryInterval: "year" });
    expect(label).toContain("$90,000");
    expect(label).toContain("$120,000");
    expect(label).toContain("/yr");
  });

  it("handles min-only and max-only", () => {
    expect(salaryLabel({ salaryMin: 50000, salaryInterval: "hour" })).toMatch(/From/);
    expect(salaryLabel({ salaryMax: 100000, salaryInterval: "year" })).toMatch(/Up to/);
  });

  it("returns null when no salary present", () => {
    expect(salaryLabel({})).toBeNull();
  });
});

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2 py-4", "px-4")).toContain("py-4");
  });

  it("joins conditional classes", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});