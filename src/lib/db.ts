import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "reelintel.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS beta_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      business_type TEXT NOT NULL,
      instagram_handle TEXT NOT NULL,
      goals TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instagram_url TEXT UNIQUE,
      creator_handle TEXT NOT NULL,
      creator_niche TEXT,
      caption TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      duration_seconds INTEGER,
      analyzed_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reel_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reel_id INTEGER NOT NULL REFERENCES reels(id),
      hook_style TEXT,
      hook_framework TEXT,
      script_template TEXT,
      emotional_arc TEXT,
      conversion_triggers TEXT,
      persuasion_techniques TEXT,
      cta_type TEXT,
      cta_placement TEXT,
      engagement_rate REAL,
      save_rate REAL,
      lead_score INTEGER,
      authority_indicators TEXT,
      booking_intent_signals TEXT,
      content_category TEXT,
      target_audience TEXT,
      key_takeaways TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES beta_signups(id),
      report_date TEXT NOT NULL,
      report_data TEXT NOT NULL,
      status TEXT DEFAULT 'generated',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES beta_signups(id),
      title TEXT NOT NULL,
      hook_suggestion TEXT,
      script_outline TEXT,
      target_emotion TEXT,
      estimated_engagement TEXT,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
