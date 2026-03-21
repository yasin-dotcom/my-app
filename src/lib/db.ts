import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "reelintel.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      date_from TEXT,
      date_to TEXT,
      result_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_id INTEGER REFERENCES searches(id),
      instagram_id TEXT,
      instagram_url TEXT,
      creator_handle TEXT,
      caption TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      duration_seconds INTEGER,
      thumbnail_url TEXT,
      video_url TEXT,
      posted_at TEXT,
      scraped_at TEXT DEFAULT (datetime('now')),
      UNIQUE(instagram_id)
    );

    CREATE TABLE IF NOT EXISTS transcripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reel_id INTEGER NOT NULL REFERENCES reels(id),
      text TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(reel_id)
    );

    CREATE TABLE IF NOT EXISTS visual_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reel_id INTEGER NOT NULL REFERENCES reels(id),
      frame_descriptions TEXT,
      overall_analysis TEXT,
      hook_analysis TEXT,
      content_style TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(reel_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
