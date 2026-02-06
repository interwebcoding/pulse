import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../pulse.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export async function initDatabase() {
  const database = getDatabase();
  
  // Enable foreign keys
  database.pragma('foreign_keys = ON');

  // Create tables
  database.exec(`
    -- Users table (for OAuth)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Sites table
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      property_id TEXT,
      account_type TEXT DEFAULT 'silvertubes',
      category TEXT DEFAULT 'client',
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Search Console sites
    CREATE TABLE IF NOT EXISTS searchconsole_sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_url TEXT UNIQUE NOT NULL,
      permission_level TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Analytics properties
    CREATE TABLE IF NOT EXISTS analytics_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id TEXT UNIQUE NOT NULL,
      property_name TEXT,
      account_name TEXT,
      account_type TEXT DEFAULT 'silvertubes',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Analytics data cache
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      date DATE NOT NULL,
      active_users INTEGER DEFAULT 0,
      sessions INTEGER DEFAULT 0,
      pageviews INTEGER DEFAULT 0,
      bounces INTEGER DEFAULT 0,
      avg_session_duration REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id),
      UNIQUE(site_id, date)
    );

    -- Search Console data cache
    CREATE TABLE IF NOT EXISTS searchconsole_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_url TEXT NOT NULL,
      date DATE NOT NULL,
      query TEXT,
      clicks INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      ctr REAL DEFAULT 0,
      position REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_url) REFERENCES searchconsole_sites(site_url),
      UNIQUE(site_url, date, query)
    );

    -- AI Insights cache
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      analysis_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    -- Dashboard settings
    CREATE TABLE IF NOT EXISTS dashboard_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      settings TEXT DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_date ON analytics_cache(date);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_site ON analytics_cache(site_id);
    CREATE INDEX IF NOT EXISTS idx_searchcache_date ON searchconsole_cache(date);
    CREATE INDEX IF NOT EXISTS idx_searchcache_site ON searchconsole_cache(site_url);
  `);

  console.log('✅ Database schema created');
  return database;
}

// Database utilities
export function runQuery(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).run(...params);
}

export function getQuery(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).get(...params);
}

export function allQuery(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).all(...params);
}

export function transaction(callback) {
  const database = getDatabase();
  return database.transaction(callback);
}

export default {
  getDatabase,
  initDatabase,
  runQuery,
  getQuery,
  allQuery,
  transaction
};
