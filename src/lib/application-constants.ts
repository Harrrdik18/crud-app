export const STATUS_ORDER = ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"] as const;

export const STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info"> = {
  saved: "default",
  applied: "info",
  screening: "warning",
  interview: "primary",
  offer: "success",
  rejected: "danger",
  withdrawn: "default",
};

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
  { value: "other", label: "Other" },
] as const;

export const APPLICATION_SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "company_website", label: "Company Website" },
  { value: "referral", label: "Referral" },
  { value: "recruiter", label: "Recruiter" },
  { value: "job_board", label: "Job Board" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Other" },
] as const;

export const INTERVIEW_TYPES = [
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video" },
  { value: "onsite", label: "On-site" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "panel", label: "Panel" },
  { value: "take_home", label: "Take-home" },
  { value: "other", label: "Other" },
] as const;

export const INTERVIEW_RESULTS = [
  { value: "unknown", label: "Not decided" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
] as const;