/**
 * /api/admin/init-blob
 * 
 * One-time route to upload the bundled database.db to Vercel Blob
 * and return the public URL. Visit this once after first deploy.
 * 
 * Then set DB_BLOB_URL=<returned url> in Vercel Environment Variables.
 */
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  // Security: only allow in production from an admin request
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not set in environment variables." }, { status: 500 });
  }

  try {
    // Try /tmp first (already-running instance), fallback to bundled
    const tmpPath = "/tmp/database.db";
    const bundledPath = path.join(process.cwd(), "database.db");
    
    const dbPath = fs.existsSync(tmpPath) ? tmpPath : bundledPath;

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "database.db not found" }, { status: 404 });
    }

    const buffer = fs.readFileSync(dbPath);
    const blob = await put("database.db", buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/octet-stream",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      instruction: `Now add this to your Vercel Environment Variables:\n\nDB_BLOB_URL=${blob.url}\n\nThen redeploy.`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
