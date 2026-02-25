export type YearMonth = string; // "YYYY-MM"

export function currentMonth(): YearMonth {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonth(ym: YearMonth): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, month: m };
}

export function formatMonth(year: number, month: number): YearMonth {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function incrementMonth(ym: YearMonth, delta: number = 1): YearMonth {
  const { year, month } = parseMonth(ym);
  const total = year * 12 + (month - 1) + delta;
  return formatMonth(Math.floor(total / 12), (total % 12) + 1);
}

export function decrementMonth(ym: YearMonth, delta: number = 1): YearMonth {
  return incrementMonth(ym, -delta);
}

export function compareMonths(a: YearMonth, b: YearMonth): number {
  return a.localeCompare(b);
}

export function isInRange(
  month: YearMonth,
  effectiveFrom: YearMonth,
  effectiveUntil: YearMonth | null
): boolean {
  if (compareMonths(month, effectiveFrom) < 0) return false;
  if (effectiveUntil !== null && compareMonths(month, effectiveUntil) > 0) return false;
  return true;
}

export function monthRange(from: YearMonth, to: YearMonth): YearMonth[] {
  const result: YearMonth[] = [];
  let current = from;
  while (compareMonths(current, to) <= 0) {
    result.push(current);
    current = incrementMonth(current);
  }
  return result;
}

export function displayMonth(ym: YearMonth): string {
  const { year, month } = parseMonth(ym);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
