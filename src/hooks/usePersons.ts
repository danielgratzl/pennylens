import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { person } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateId } from "@/utils/uuid";

export function usePersons(portfolioId: string | null) {
  const { data: persons } = useLiveQuery(
    db
      .select()
      .from(person)
      .where(portfolioId ? eq(person.portfolioId, portfolioId) : undefined)
      .orderBy(asc(person.sortOrder)),
    [portfolioId]
  );

  return { persons: persons ?? [] };
}

export async function createPerson(
  portfolioId: string,
  name: string,
  color: string,
  sortOrder: number = 0
) {
  const id = generateId();
  await db.insert(person).values({ id, portfolioId, name, color, sortOrder });
  return id;
}

export async function updatePerson(id: string, data: { name?: string; color?: string; sortOrder?: number }) {
  await db.update(person).set(data).where(eq(person.id, id));
}

export async function deletePerson(id: string) {
  await db.delete(person).where(eq(person.id, id));
}
