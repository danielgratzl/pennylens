import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { income, person, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/utils/uuid";
import { currentMonth } from "@/utils/month";

export function useIncome(portfolioId: string | null) {
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
      .where(portfolioId ? eq(income.portfolioId, portfolioId) : undefined),
    [portfolioId]
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
}) {
  const id = generateId();
  await db.insert(income).values({
    id,
    itemGroupId: id,
    portfolioId: data.portfolioId,
    personId: data.personId,
    categoryId: data.categoryId,
    name: data.name,
    amount: data.amount,
    isYearly: data.isYearly,
    currency: data.currency,
    effectiveFrom: currentMonth(),
    effectiveUntil: null,
  });
  return id;
}

export async function updateIncome(
  id: string,
  data: {
    name?: string;
    amount?: number;
    isYearly?: boolean;
    categoryId?: string | null;
    personId?: string | null;
  }
) {
  await db.update(income).set(data).where(eq(income.id, id));
}

export async function deleteIncome(id: string) {
  await db.delete(income).where(eq(income.id, id));
}
