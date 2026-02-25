import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { portfolio } from "./portfolio";

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id").references(() => portfolio.id),
  type: text("type", { enum: ["income", "fixed_cost", "investment"] }).notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
});
