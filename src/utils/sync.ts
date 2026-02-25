import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { DB_NAME, getExpoDb, closeDb, db } from "@/db";
import { appMeta } from "@/db/schema";

const DB_DIR_URI = Paths.document.uri + "SQLite/";

export async function exportDatabase(): Promise<void> {
  // WAL checkpoint to flush pending writes
  const expoDb = getExpoDb();
  expoDb.execSync("PRAGMA wal_checkpoint(FULL);");

  const dbFile = new File(DB_DIR_URI + DB_NAME);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportName = `pennylens-${timestamp}.db`;
  const exportFile = new File(Paths.cache, exportName);

  // Clean up any prior export
  if (exportFile.exists) exportFile.delete();

  dbFile.copy(exportFile);

  await Sharing.shareAsync(exportFile.uri, {
    mimeType: "application/x-sqlite3",
    dialogTitle: "Export PennyLens Database",
    UTI: "public.database",
  });

  // Clean up temp file
  if (exportFile.exists) exportFile.delete();
}

export async function importDatabase(): Promise<boolean> {
  const picked = await File.pickFileAsync();

  if (!picked) return false;
  const pickedFile = Array.isArray(picked) ? picked[0] : picked;
  if (!pickedFile) return false;

  // Validate SQLite header (first 16 bytes start with "SQLite format 3\0")
  const base64 = await pickedFile.base64();
  const headerBytes = atob(base64.slice(0, 24)); // 16 bytes = ~24 base64 chars
  if (!headerBytes.startsWith("SQLite format 3")) {
    throw new Error("The selected file is not a valid SQLite database.");
  }

  // Close current DB
  closeDb();

  const dbFile = new File(DB_DIR_URI + DB_NAME);
  const walFile = new File(DB_DIR_URI + DB_NAME + "-wal");
  const shmFile = new File(DB_DIR_URI + DB_NAME + "-shm");

  // Delete existing DB files
  if (dbFile.exists) dbFile.delete();
  if (walFile.exists) walFile.delete();
  if (shmFile.exists) shmFile.delete();

  // Copy imported file into place
  pickedFile.copy(dbFile);

  // Clean up cached pick
  if (pickedFile.exists) pickedFile.delete();

  return true;
}

export async function saveImportTimestamp() {
  const now = new Date().toISOString();
  await db
    .insert(appMeta)
    .values({ key: "lastImportDate", value: now })
    .onConflictDoUpdate({ target: appMeta.key, set: { value: now } });
}

export function useLastImportDate(): string | null {
  const { data } = useLiveQuery(
    db.select().from(appMeta).where(eq(appMeta.key, "lastImportDate"))
  );
  return data?.[0]?.value ?? null;
}
