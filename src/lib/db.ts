import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { setupSchema } from './schema';

let dbPath = path.join(process.cwd(), 'database.db');

// VERCEL: The file system is read-only at runtime.
// We copy the bundled database.db (with seed data/categories) to /tmp on every
// cold start so better-sqlite3 can open it in read-write mode.
// NOTE: Any data written at runtime (new products, etc.) is ephemeral — it will
// be lost when the Lambda container is recycled. For persistent writes, migrate
// to a hosted database (e.g. Turso / PlanetScale).
if (process.env.NODE_ENV === 'production') {
  const tmpPath = path.join('/tmp', 'database.db');
  try {
    // Always overwrite so the /tmp copy is never a stale, empty file
    // from a previous warm invocation that missed the seed data.
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpPath);
    }
  } catch (e) {
    console.error('Error copying DB to /tmp:', e);
  }
  dbPath = tmpPath;
}

// Create or open the database
const db = new Database(dbPath, {
  // verbose: console.log,
});

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema if not exists
try {
  setupSchema(db);
} catch (e) {
  console.error("Schema setup error (safe to ignore if readonly):", e);
}

export default db;
