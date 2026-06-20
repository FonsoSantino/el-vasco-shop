import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { setupSchema } from './schema';

let dbPath = path.join(process.cwd(), 'database.db');

// VERCEL HACK: Vercel file system is read-only. 
// We must copy the database to /tmp so better-sqlite3 can open it and write WAL/shm files.
// WARNING: Data added via admin panel on Vercel will be LOST when the lambda restarts.
if (process.env.NODE_ENV === 'production') {
  const tmpPath = path.join('/tmp', 'database.db');
  if (!fs.existsSync(tmpPath)) {
    try {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
      }
    } catch (e) {
      console.error('Error copying DB to /tmp', e);
    }
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
