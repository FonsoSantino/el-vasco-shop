/**
 * db.ts
 *
 * Opens the SQLite database. On Vercel, we use /tmp/database.db.
 *
 * CORE PROBLEM WITH SQLITE ON SERVERLESS:
 * Multiple Vercel containers run concurrently, each with its own in-memory DB state.
 * If Container A uploads Blob after a delete, and Container B (with stale data) makes 
 * a write later, Container B will overwrite the Blob with its stale state → data loss.
 *
 * SOLUTION:
 * Before EVERY write: syncFromBlob() downloads the latest Blob to a temp file,
 * closes the current connection, renames temp→main (atomic), reopens fresh connection.
 * This guarantees every write starts from the latest state across all containers.
 *
 * Before READS in admin: same syncFromBlob() is called so the UI always shows fresh data.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { setupSchema } from "./schema";
import { TMP_DB_PATH, downloadDbFromBlob } from "./db-persistence";

const isProduction = process.env.NODE_ENV === "production";
const INCOMING_DB_PATH = "/tmp/database_incoming.db";

let dbPath = path.join(process.cwd(), "database.db");

if (isProduction) {
  const bundledPath = path.join(process.cwd(), "database.db");
  if (!fs.existsSync(TMP_DB_PATH) && fs.existsSync(bundledPath)) {
    try { fs.copyFileSync(bundledPath, TMP_DB_PATH); } catch { /* /tmp not writable */ }
  }
  dbPath = TMP_DB_PATH;
}

// Cold start: pull the latest DB from Blob before opening the connection
if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    await downloadDbFromBlob();
  } catch (e) {
    console.error("[db] Cold start download failed:", e);
  }
}

function openConnection(filePath: string): InstanceType<typeof Database> {
  const d = new Database(filePath);
  d.pragma("journal_mode = DELETE");
  d.pragma("foreign_keys = ON");
  d.pragma("busy_timeout = 5000");
  setupSchema(d);
  return d;
}

let currentDb = openConnection(dbPath);

/**
 * Safely refreshes the DB connection from Vercel Blob.
 *
 * Steps:
 * 1. Download latest Blob to /tmp/database_incoming.db (never the open file)
 * 2. Close the current connection
 * 3. fs.renameSync (atomic on same filesystem) — no corruption window
 * 4. Open a fresh connection on the renamed file
 *
 * Call this BEFORE every write AND before reads in admin pages.
 */
export async function syncFromBlob(): Promise<void> {
  if (!isProduction || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "database.db" });
    const match = blobs.find((b: any) => b.pathname === "database.db");
    if (!match) {
      console.log("[db] syncFromBlob: no Blob found, keeping current connection");
      return;
    }

    const res = await fetch(`${match.url}?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) {
      console.error("[db] syncFromBlob: fetch failed", res.status);
      return;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    // Write to a DIFFERENT temp file — not the one currently open
    fs.writeFileSync(INCOMING_DB_PATH, buf);

    // Atomically swap: close → rename → reopen
    try { currentDb.close(); } catch { /* ignore if already closed */ }
    fs.renameSync(INCOMING_DB_PATH, dbPath);
    currentDb = openConnection(dbPath);
    console.log("[db] syncFromBlob: refreshed from Blob ✓");
  } catch (e) {
    console.error("[db] syncFromBlob failed:", e);
    // Ensure we always have a working connection
    try {
      if (!(currentDb as any)?.open) {
        currentDb = openConnection(dbPath);
      }
    } catch { /* best effort */ }
  }
}

const dbProxy = new Proxy({} as InstanceType<typeof Database>, {
  get(_target, prop) {
    return (currentDb as any)[prop];
  },
});

export default dbProxy;
