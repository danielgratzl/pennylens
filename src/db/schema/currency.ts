import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const currency = sqliteTable("currency", {
  code: text("code").primaryKey(), // ISO 4217, e.g. "USD"
  name: text("name").notNull(), // e.g. "US Dollar"
  rate: real("rate").notNull(), // 1 unit of this currency = rate units of base currency
});
