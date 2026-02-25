import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { portfolio } from "./portfolio";

export const person = sqliteTable("person", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id").notNull().references(() => portfolio.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
