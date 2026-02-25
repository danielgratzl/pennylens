import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import {
  portfolio,
  person,
  income,
  fixedCost,
  investmentAccount,
  accountSnapshot,
  category,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/utils/uuid";

export function usePortfolios() {
  const { data: portfolios } = useLiveQuery(
    db.select().from(portfolio).where(eq(portfolio.archived, false))
  );

  return { portfolios: portfolios ?? [] };
}

export async function createPortfolio(name: string, description?: string) {
  const id = generateId();
  const now = new Date().toISOString();
  await db.insert(portfolio).values({ id, name, description: description ?? null, createdAt: now });
  return id;
}

export async function updatePortfolio(id: string, data: { name?: string; description?: string }) {
  await db.update(portfolio).set(data).where(eq(portfolio.id, id));
}

export async function archivePortfolio(id: string) {
  await db.update(portfolio).set({ archived: true }).where(eq(portfolio.id, id));
}

export async function deletePortfolio(id: string) {
  // Cascade: snapshots → accounts → income → costs → persons → portfolio categories → portfolio
  const accounts = await db
    .select({ id: investmentAccount.id })
    .from(investmentAccount)
    .where(eq(investmentAccount.portfolioId, id));

  for (const a of accounts) {
    await db.delete(accountSnapshot).where(eq(accountSnapshot.accountId, a.id));
  }
  await db.delete(investmentAccount).where(eq(investmentAccount.portfolioId, id));
  await db.delete(income).where(eq(income.portfolioId, id));
  await db.delete(fixedCost).where(eq(fixedCost.portfolioId, id));
  await db.delete(person).where(eq(person.portfolioId, id));
  await db.delete(category).where(eq(category.portfolioId, id));
  await db.delete(portfolio).where(eq(portfolio.id, id));
}
