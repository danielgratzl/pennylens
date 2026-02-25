import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { portfolio } from "./portfolio";
import { person } from "./person";
import { category } from "./category";

export const income = sqliteTable("income", {
  id: text("id").primaryKey(),
  itemGroupId: text("item_group_id").notNull(),
  portfolioId: text("portfolio_id").notNull().references(() => portfolio.id),
  personId: text("person_id").references(() => person.id),
  categoryId: text("category_id").references(() => category.id),
  name: text("name").notNull(),
  amount: integer("amount").notNull(), // cents
  isYearly: integer("is_yearly", { mode: "boolean" }).notNull().default(false),
  currency: text("currency").notNull().default("CHF"),
  effectiveFrom: text("effective_from").notNull(), // YYYY-MM
  effectiveUntil: text("effective_until"), // YYYY-MM, null = current
});
