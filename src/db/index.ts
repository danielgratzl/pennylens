import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const DB_NAME = "pennylens.db";

let _expoDb: ReturnType<typeof openDatabaseSync> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getExpoDb() {
  if (!_expoDb) {
    _expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
    _expoDb.execSync("PRAGMA journal_mode = WAL;");
    _expoDb.execSync("PRAGMA foreign_keys = ON;");
  }
  return _expoDb;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getExpoDb(), { schema });
  }
  return _db;
}

// Convenience re-exports for simpler imports
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export { schema };
