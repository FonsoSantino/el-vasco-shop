import Database from 'better-sqlite3';
import path from 'path';
import { setupSchema } from './schema';

const dbPath = path.join(process.cwd(), 'database.db');

// Create or open the database
const db = new Database(dbPath, {
  // verbose: console.log, // Enable for debugging
});

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema if not exists
setupSchema(db);

export default db;
