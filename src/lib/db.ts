/**
 * db.ts
 *
 * Opens the SQLite database. On Vercel, we use /tmp/database.db.
 *
 * STRATEGY:
 *  - On cold start (module load): copy bundled seed to /tmp, then pull latest from Blob.
 *  - The connection is a singleton per container — never closed or reloaded.
 *  - After every write, server actions await uploadDbToBlob() so the Blob always
 *    has the freshest copy before Vercel freezes the Lambda.
 *  - The next request that hits a new container will download the fresh Blob.
 *
 * NOTE: Do NOT close or reopen this connection mid-request. Overwriting the SQLite
 * file while it is open corrupts it (better-sqlite3 crash → Status 0).
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { setupSchema } from "./schema";
import { TMP_DB_PATH, downloadDbFromBlob } from "./db-persistence";

const isProduction = process.env.NODE_ENV === "production";

// ─── Ensure /tmp/database.db exists (cold start) ──────────────────────────────
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

// ─── Pull fresh data from Blob before opening the connection ──────────────────
if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    await downloadDbFromBlob();
  } catch (e) {
    console.error("[db] Cold start Blob download failed:", e);
  }
}

// ─── Open the database (singleton for this container's lifetime) ──────────────
const db = new Database(dbPath);
db.pragma("journal_mode = DELETE");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

try {
  setupSchema(db);
} catch (e) {
  console.error("[db] Schema setup error:", e);
}

const dbProxy = new Proxy({} as InstanceType<typeof Database>, {
  get(_target, prop) {
    return (db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default dbProxy;
