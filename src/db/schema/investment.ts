import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { portfolio } from "./portfolio";
import { person } from "./person";
import { category } from "./category";

export const investmentAccount = sqliteTable("investment_account", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id").notNull().references(() => portfolio.id),
  personId: text("person_id").references(() => person.id),
  categoryId: text("category_id").references(() => category.id),
  name: text("name").notNull(),
  accountType: text("account_type"),
  institution: text("institution"),
  currency: text("currency").notNull().default("CHF"),
});

export const accountSnapshot = sqliteTable("account_snapshot", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => investmentAccount.id),
  snapshotMonth: text("snapshot_month").notNull(), // YYYY-MM
  value: real("value").notNull(), // value in the account's currency
  baseValue: real("base_value"), // value converted to base currency (null = same as value)
});
