/**
 * db-persistence.ts
 *
 * Syncs the SQLite database file with Vercel Blob storage.
 *
 * DESIGN:
 *  - Static imports only (no dynamic import() that can fail in edge cases)
 *  - Never closes or modifies an open DB connection
 *  - Uses blob list() to auto-discover the DB URL — no DB_BLOB_URL env var needed
 *  - Upload is always fire-and-forget (never blocks a request)
 */

import fs from "fs";
import path from "path";

export const TMP_DB_PATH = "/tmp/database.db";
const BLOB_FILENAME = "database.db";

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Download the latest DB from Vercel Blob into /tmp/database.db.
 * Falls back to the bundled file if Blob isn't configured or fails.
 * 
 * IMPORTANT: Call this only before the DB connection is opened.
 */
export async function downloadDbFromBlob(): Promise<void> {
  if (!hasBlob()) {
    copyBundled();
    return;
  }

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    const match = blobs.find((b) => b.pathname === BLOB_FILENAME);

    if (match) {
      const res = await fetch(match.url, { cache: "no-store" });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(TMP_DB_PATH, buf);
        console.log("[db-persistence] Downloaded DB from Blob:", match.url);
        return;
      }
    }
    // Blob not found yet → copy bundled as seed
    copyBundled();
  } catch (e) {
    console.warn("[db-persistence] Blob download failed, using bundled:", e);
    copyBundled();
  }
}

function copyBundled() {
  const bundled = path.join(process.cwd(), "database.db");
  if (fs.existsSync(bundled) && !fs.existsSync(TMP_DB_PATH)) {
    fs.copyFileSync(bundled, TMP_DB_PATH);
    console.log("[db-persistence] Copied bundled database.db to /tmp.");
  }
}

/**
 * Upload /tmp/database.db to Vercel Blob.
 * Fire-and-forget — never await this from a server action.
 */
export async function uploadDbToBlob(): Promise<void> {
  if (!hasBlob()) return;

  try {
    const { put } = await import("@vercel/blob");
    const buf = fs.readFileSync(TMP_DB_PATH);
    await put(BLOB_FILENAME, buf, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/octet-stream",
    });
    console.log("[db-persistence] Uploaded DB to Blob.");
  } catch (e) {
    console.error("[db-persistence] Upload failed:", e);
  }
}
