import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { income, person, category } from "@/db/schema";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { type YearMonth } from "@/utils/month";
import { generateId } from "@/utils/uuid";

export function useIncomeForMonth(portfolioId: string | null, month: YearMonth) {
  const { data } = useLiveQuery(
    db
      .select({
        income: income,
        person: person,
        category: category,
      })
      .from(income)
      .leftJoin(person, eq(income.personId, person.id))
      .leftJoin(category, eq(income.categoryId, category.id))
      .where(
        and(
          portfolioId ? eq(income.portfolioId, portfolioId) : undefined,
          lte(income.effectiveFrom, month),
          or(isNull(income.effectiveUntil), gte(income.effectiveUntil, month))
        )
      ),
    [portfolioId, month]
  );

  return { incomeItems: data ?? [] };
}

export async function createIncome(data: {
  portfolioId: string;
  personId: string | null;
  categoryId: string | null;
  name: string;
  amount: number;
  isYearly: boolean;
  currency: string;
  effectiveFrom: YearMonth;
}) {
  const id = generateId();
  const itemGroupId = generateId();
  await db.insert(income).values({
    id,
    itemGroupId,
    portfolioId: data.portfolioId,
    personId: data.personId,
    categoryId: data.categoryId,
    name: data.name,
    amount: data.amount,
    isYearly: data.isYearly,
    currency: data.currency,
    effectiveFrom: data.effectiveFrom,
    effectiveUntil: null,
  });
  return id;
}

export async function editIncomeFromMonth(
  existingId: string,
  fromMonth: YearMonth,
  newData: {
    name: string;
    amount: number;
    isYearly: boolean;
    currency: string;
    personId: string | null;
    categoryId: string | null;
  }
) {
  // Close current version at previous month
  const prev = decrementMonthStr(fromMonth);
  const existing = await db.select().from(income).where(eq(income.id, existingId));
  if (existing.length === 0) return;

  const item = existing[0];

  await db.update(income).set({ effectiveUntil: prev }).where(eq(income.id, existingId));

  // Insert new version
  const id = generateId();
  await db.insert(income).values({
    id,
    itemGroupId: item.itemGroupId,
    portfolioId: item.portfolioId,
    personId: newData.personId,
    categoryId: newData.categoryId,
    name: newData.name,
    amount: newData.amount,
    isYearly: newData.isYearly,
    currency: newData.currency,
    effectiveFrom: fromMonth,
    effectiveUntil: null,
  });
  return id;
}

export async function deleteIncome(id: string) {
  await db.delete(income).where(eq(income.id, id));
}

function decrementMonthStr(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) - 1;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
