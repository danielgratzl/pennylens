import { db } from "./index";
import { category, appMeta } from "./schema";
import { eq } from "drizzle-orm";
import { generateId } from "../utils/uuid";

const DEFAULT_CATEGORIES = [
  { type: "income" as const, name: "Other", icon: "more-horizontal", color: "#A5D6A7" },
  { type: "fixed_cost" as const, name: "Other", icon: "more-horizontal", color: "#FFAB91" },
  { type: "investment" as const, name: "Other", icon: "more-horizontal", color: "#BBDEFB" },
];

export async function seedDatabase() {
  const schemaVersion = await db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "schema_version"));

  if (schemaVersion.length > 0) return; // Already seeded

  for (const cat of DEFAULT_CATEGORIES) {
    await db.insert(category).values({
      id: generateId(),
      portfolioId: null,
      type: cat.type,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    });
  }

  await db.insert(appMeta).values({
    key: "schema_version",
    value: "1",
  }).onConflictDoNothing();

  await db.insert(appMeta).values({
    key: "device_id",
    value: generateId(),
  }).onConflictDoNothing();

  await db.insert(appMeta).values({
    key: "base_currency",
    value: "CHF",
  }).onConflictDoNothing();
}
