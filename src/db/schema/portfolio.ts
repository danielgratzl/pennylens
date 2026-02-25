import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const portfolio = sqliteTable("portfolio", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
