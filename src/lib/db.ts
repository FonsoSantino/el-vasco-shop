/**
 * db.ts
 *
 * Opens the SQLite database. On Vercel, we use /tmp/database.db.
 *
 * STRATEGY:
 *  - On cold start: copy bundled seed to /tmp, then download latest from Blob.
 *  - The DB instance is a module-level singleton (created once per container).
 *  - After every write, server actions call uploadDbToBlob() AND reloadDb().
 *    reloadDb() re-downloads the Blob and reopens the connection, so the SAME
 *    warm container will see the freshest data on the next read.
 *
 * RESULT: Writes persist permanently. Reads always see the latest data.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { setupSchema } from "./schema";
import { TMP_DB_PATH, downloadDbFromBlob } from "./db-persistence";

const isProduction = process.env.NODE_ENV === "production";

// ─── Ensure /tmp/database.db exists before we open it ─────────────────────────
let dbPath = path.join(process.cwd(), "database.db");

if (isProduction) {
  const bundledPath = path.join(process.cwd(), "database.db");
  if (!fs.existsSync(TMP_DB_PATH) && fs.existsSync(bundledPath)) {
    try {
      fs.copyFileSync(bundledPath, TMP_DB_PATH);
    } catch { /* /tmp not writable */ }
  }
  dbPath = TMP_DB_PATH;
}

// ─── Cold start: pull fresh data from Blob before opening ─────────────────────
if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    await downloadDbFromBlob();
  } catch (e) {
    console.error("[db] Cold start Blob download failed:", e);
  }
}

// ─── Open the database ────────────────────────────────────────────────────────
function openDb(): InstanceType<typeof Database> {
  const instance = new Database(dbPath);
  instance.pragma("journal_mode = DELETE");
  instance.pragma("foreign_keys = ON");
  instance.pragma("busy_timeout = 5000");
  try {
    setupSchema(instance);
  } catch (e) {
    console.error("[db] Schema setup error:", e);
  }
  return instance;
}

let currentDb = openDb();

/**
 * Re-download the DB from Blob and reopen the connection.
 * Call this after every write (uploadDbToBlob) so that subsequent reads
 * on the same warm container see the freshest data.
 */
export async function reloadDb(): Promise<void> {
  if (!isProduction || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await downloadDbFromBlob();
    const newDb = openDb();
    // Swap the reference so the proxy now points to the fresh instance
    currentDb = newDb;
    console.log("[db] Reloaded DB from Blob.");
  } catch (e) {
    console.error("[db] reloadDb failed:", e);
  }
}

// Proxy so all imports always see the current (potentially reloaded) instance
const dbProxy = new Proxy({} as InstanceType<typeof Database>, {
  get(_target, prop) {
    return (currentDb as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default dbProxy;
