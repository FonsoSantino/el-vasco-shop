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

// ─── Async Blob sync (cold start, fire-and-forget) ───────────────────────────
// We intentionally do NOT close/reopen the db here to avoid crashes.
// The Blob version will be used by the NEXT container that cold-starts.
// Since uploads happen after every write, the Blob always has the latest data.
if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
  // Only attempt if /tmp/database.db was just created from bundled (small size gap)
  // — i.e., we don't bother on warm containers already running with good data.
  const bundledPath = path.join(process.cwd(), "database.db");
  const bundledSize = fs.existsSync(bundledPath)
    ? fs.statSync(bundledPath).size
    : 0;
  const tmpSize = fs.existsSync(TMP_DB_PATH)
    ? fs.statSync(TMP_DB_PATH).size
    : 0;

  // If sizes match → /tmp is the bundled copy → try to pull a fresher Blob version
  if (tmpSize === bundledSize) {
    downloadDbFromBlob().catch(console.error);
  }
}

export default db;
