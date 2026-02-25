import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { fixedCost, person, category } from "@/db/schema";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { type YearMonth } from "@/utils/month";
import { generateId } from "@/utils/uuid";

export function useCostsForMonth(portfolioId: string | null, month: YearMonth) {
  const { data } = useLiveQuery(
    db
      .select({
        cost: fixedCost,
        person: person,
        category: category,
      })
      .from(fixedCost)
      .leftJoin(person, eq(fixedCost.personId, person.id))
      .leftJoin(category, eq(fixedCost.categoryId, category.id))
      .where(
        and(
          portfolioId ? eq(fixedCost.portfolioId, portfolioId) : undefined,
          lte(fixedCost.effectiveFrom, month),
          or(isNull(fixedCost.effectiveUntil), gte(fixedCost.effectiveUntil, month))
        )
      ),
    [portfolioId, month]
  );

  return { costItems: data ?? [] };
}

export async function createCost(data: {
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
  await db.insert(fixedCost).values({
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

export async function editCostFromMonth(
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
  const prev = decrementMonthStr(fromMonth);
  const existing = await db.select().from(fixedCost).where(eq(fixedCost.id, existingId));
  if (existing.length === 0) return;

  const item = existing[0];

  await db.update(fixedCost).set({ effectiveUntil: prev }).where(eq(fixedCost.id, existingId));

  const id = generateId();
  await db.insert(fixedCost).values({
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

export async function deleteCost(id: string) {
  await db.delete(fixedCost).where(eq(fixedCost.id, id));
}

function decrementMonthStr(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) - 1;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
