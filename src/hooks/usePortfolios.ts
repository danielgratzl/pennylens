import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
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
