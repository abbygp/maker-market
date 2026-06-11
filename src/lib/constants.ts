import type { ApplicationStatus, CraftCategory } from "@/types/database";

export const CRAFT_CATEGORIES: {
  value: CraftCategory;
  label: string;
}[] = [
  { value: "fiber_arts", label: "Fiber Arts" },
  { value: "ceramics", label: "Ceramics" },
  { value: "jewelry", label: "Jewelry" },
  { value: "illustration", label: "Illustration" },
  { value: "candles", label: "Candles" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CRAFT_CATEGORIES.map((c) => [c.value, c.label])
) as Record<CraftCategory, string>;

export const APPLICATION_COLUMNS: {
  status: ApplicationStatus;
  label: string;
}[] = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Approved" },
  { status: "waitlisted", label: "Waitlisted" },
  { status: "declined", label: "Declined" },
];

export function formatCategory(category: string): string {
  return (
    CATEGORY_LABELS[category as CraftCategory] ??
    category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
