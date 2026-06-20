/**
 * db.ts
 *
 * Opens the SQLite database. On Vercel, we use /tmp/database.db.
 *
 * STRATEGY:
 *  - Synchronously copy bundled DB to /tmp on cold start (fast, always works).
 *  - Then asynchronously attempt to pull a newer version from Vercel Blob.
 *    Because we CAN'T safely close+reopen the DB mid-request, the fresh Blob
 *    version is used starting from the NEXT Lambda invocation on this container.
 *  - All admin writes immediately call uploadDbToBlob() (fire-and-forget), so
 *    any new admin change is persisted to Blob within seconds and survives
 *    container recycling.
 *
 * RESULT: Data written in the admin panel persists permanently via Vercel Blob.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { setupSchema } from "./schema";
import { TMP_DB_PATH, downloadDbFromBlob } from "./db-persistence";

const isProduction = process.env.NODE_ENV === "production";

// ─── Determine DB file path ────────────────────────────────────────────────────
let dbPath = path.join(process.cwd(), "database.db");

if (isProduction) {
  // Synchronous copy ensures /tmp/database.db always exists before we open it.
  // The async Blob download below may overwrite this with fresher data later.
  const bundledPath = path.join(process.cwd(), "database.db");
  if (!fs.existsSync(TMP_DB_PATH) && fs.existsSync(bundledPath)) {
    try {
      fs.copyFileSync(bundledPath, TMP_DB_PATH);
    } catch { /* /tmp not writable — very unusual */ }
  }
  dbPath = TMP_DB_PATH;
}

// ─── Top-level await Blob sync (cold start) ───────────────────────────
// We must await the download before opening the DB. If we use fire-and-forget,
// Vercel will freeze the background task when the request finishes, causing the 
// download to never complete and data to be lost.
if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
  const bundledPath = path.join(process.cwd(), "database.db");
  const bundledSize = fs.existsSync(bundledPath) ? fs.statSync(bundledPath).size : 0;
  const tmpSize = fs.existsSync(TMP_DB_PATH) ? fs.statSync(TMP_DB_PATH).size : 0;

  // If sizes match, /tmp is likely the bare bundled copy. We pull the latest from Blob.
  if (tmpSize === bundledSize) {
    try {
      await downloadDbFromBlob();
    } catch (e) {
      console.error("[db] Error awaiting Blob download:", e);
    }
  }
}

// ─── Open the database (synchronous) ─────────────────────────────────────────
const db = new Database(dbPath);
db.pragma("journal_mode = DELETE"); // Use DELETE mode — safer than WAL on /tmp
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

try {
  setupSchema(db);
} catch (e) {
  console.error("[db] Schema setup error:", e);
}

// Export a getter so every import always gets the current instance
const dbProxy = new Proxy({} as ReturnType<typeof Database>, {
  get(_target, prop) {
    return (db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default dbProxy;
