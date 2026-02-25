import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { fixedCost, person, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/utils/uuid";
import { currentMonth } from "@/utils/month";

export function useCosts(portfolioId: string | null) {
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
      .where(portfolioId ? eq(fixedCost.portfolioId, portfolioId) : undefined),
    [portfolioId]
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
}) {
  const id = generateId();
  await db.insert(fixedCost).values({
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

export async function updateCost(
  id: string,
  data: {
    name?: string;
    amount?: number;
    isYearly?: boolean;
    categoryId?: string | null;
    personId?: string | null;
  }
) {
  await db.update(fixedCost).set(data).where(eq(fixedCost.id, id));
}

export async function deleteCost(id: string) {
  await db.delete(fixedCost).where(eq(fixedCost.id, id));
}
