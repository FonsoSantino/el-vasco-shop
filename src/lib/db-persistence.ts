/**
 * db-persistence.ts
 *
 * Persists the SQLite database file to Vercel Blob storage so that
 * writes survive Lambda container recycling.
 *
 * Flow:
 *  Cold start  → download blob → write to /tmp/database.db → use it
 *  After write → upload /tmp/database.db back to blob
 */

import fs from "fs";
import path from "path";

export const TMP_DB_PATH = "/tmp/database.db";
const BLOB_DB_NAME = "database.db";

function getBlobUrl(): string | undefined {
  return process.env.DB_BLOB_URL;
}

/**
 * Download the database from Vercel Blob into /tmp.
 * Falls back to the bundled database.db if blob is not configured or fails.
 */
export async function downloadDb(): Promise<void> {
  const blobUrl = getBlobUrl();

  if (blobUrl) {
    try {
      const res = await fetch(blobUrl, { cache: "no-store" });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(TMP_DB_PATH, buffer);
        console.log("[db-persistence] Database downloaded from Blob.");
        return;
      } else {
        console.warn("[db-persistence] Blob fetch returned", res.status, "— falling back to bundled DB.");
      }
    } catch (e) {
      console.warn("[db-persistence] Failed to fetch blob:", e);
    }
  }

  // Fallback: copy the bundled database.db
  const bundledPath = path.join(process.cwd(), "database.db");
  if (fs.existsSync(bundledPath)) {
    fs.copyFileSync(bundledPath, TMP_DB_PATH);
    console.log("[db-persistence] Using bundled database.db as base.");
  }
}

/**
 * Upload /tmp/database.db back to Vercel Blob.
 * This must be called after every write operation in the admin panel.
 */
export async function uploadDb(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("[db-persistence] BLOB_READ_WRITE_TOKEN not set — skipping upload.");
    return null;
  }

  try {
    const { put } = await import("@vercel/blob");
    const buffer = fs.readFileSync(TMP_DB_PATH);
    const blob = await put(BLOB_DB_NAME, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/octet-stream",
    });

    // Store the URL so next cold start downloads the latest version
    // (the URL is stable when addRandomSuffix: false)
    console.log("[db-persistence] Database uploaded to Blob:", blob.url);
    return blob.url;
  } catch (e) {
    console.error("[db-persistence] Failed to upload DB:", e);
    return null;
  }
}
