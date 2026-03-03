import { CATEGORY_KEYWORDS, type CategoryFilter } from "@/lib/constants";

export function matchesCategory(
  rawCategory: string | null,
  filter: CategoryFilter,
): boolean {
  if (!rawCategory) return false;
  const keywords = CATEGORY_KEYWORDS[filter];
  const normalized = rawCategory.toLowerCase();
  return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
}
