import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { setupSchema } from "./schema";
import { TMP_DB_PATH, downloadDb } from "./db-persistence";

/* ─────────────────────────────────────────────────────────────────────────────
   DB path selection:
   • Local dev  → process.cwd()/database.db
   • Vercel     → /tmp/database.db  (copied from Blob or bundled db on cold start)
────────────────────────────────────────────────────────────────────────────── */
const isProduction = process.env.NODE_ENV === "production";
let dbPath = path.join(process.cwd(), "database.db");

if (isProduction) {
  // Sync fallback: if /tmp/database.db doesn't exist yet, copy the bundled one.
  // The async downloadDb() will overwrite it with the latest Blob version shortly.
  if (!fs.existsSync(TMP_DB_PATH)) {
    const bundledPath = path.join(process.cwd(), "database.db");
    if (fs.existsSync(bundledPath)) {
      fs.copyFileSync(bundledPath, TMP_DB_PATH);
    }
  }
  dbPath = TMP_DB_PATH;
}

// Open the database
let db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
try { setupSchema(db); } catch (e) { console.error("[db] Schema setup:", e); }

/* ─────────────────────────────────────────────────────────────────────────────
   On production cold starts, pull the latest DB from Vercel Blob.
   We close the current connection, download the file, then reopen.
   This happens once per Lambda container lifetime.
────────────────────────────────────────────────────────────────────────────── */
let _blobInitDone = false;

export async function initDb(): Promise<void> {
  if (_blobInitDone || !isProduction || !process.env.DB_BLOB_URL) return;
  _blobInitDone = true;

  try {
    // Close current connection before overwriting the file
    db.close();
    await downloadDb();
    // Reopen with the freshly-downloaded file
    db = new Database(TMP_DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    try { setupSchema(db); } catch (e) { console.error("[db] Schema setup after blob init:", e); }
    console.log("[db] Reopened DB from Blob.");
  } catch (e) {
    console.error("[db] initDb error:", e);
    // Ensure db is open even if something failed
    if (!db.open) {
      db = new Database(TMP_DB_PATH);
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");
    }
  }
}

// Kick off async Blob init on cold start (fire-and-forget).
// First request uses bundled DB; subsequent requests in the same container
// use the Blob-sourced DB with all admin changes.
if (isProduction && process.env.DB_BLOB_URL) {
  initDb().catch(console.error);
}

// Export a getter so every import always gets the current (possibly reopened) instance
const dbProxy = new Proxy({} as ReturnType<typeof Database>, {
  get(_target, prop) {
    return (db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default dbProxy;
