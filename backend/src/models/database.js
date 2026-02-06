import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../pulse.db');

let db = null;
let sqlInstance = null;

// Initialize sql.js and database
async function initSql() {
  if (!sqlInstance) {
    sqlInstance = await initSqlJs();
    
    // Try to load existing database
    try {
      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new sqlInstance.Database(buffer);
      } else {
        db = new sqlInstance.Database();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      db = new sqlInstance.Database();
    }
  }
  return { sql: sqlInstance, database: db };
}

export async function getDatabase() {
  const { database } = await initSql();
  return database;
}

export async function initDatabase() {
  const database = await getDatabase();
  
  // Create tables
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS searchconsole_sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_url TEXT UNIQUE NOT NULL,
      permission_level TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS analytics_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id TEXT UNIQUE NOT NULL,
      property_name TEXT,
      account_name TEXT,
      account_type TEXT DEFAULT 'silvertubes',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      date DATE NOT NULL,
      active_users INTEGER DEFAULT 0,
      sessions INTEGER DEFAULT 0,
      pageviews INTEGER DEFAULT 0,
      bounces INTEGER DEFAULT 0,
      avg_session_duration REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS searchconsole_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_url TEXT NOT NULL,
      date DATE NOT NULL,
      query TEXT,
      clicks INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      ctr REAL DEFAULT 0,
      position REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      analysis_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS dashboard_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      settings TEXT DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Save database
  await saveDatabase();
  
  console.log('✅ Database initialized with sql.js');
  return database;
}

async function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export async function run(sql, params = []) {
  const database = await getDatabase();
  try {
    database.run(sql, params);
    const changes = database.getRowsModified();
    await saveDatabase();
    return { changes };
  } catch (error) {
    console.error('Run error:', sql, error);
    throw error;
  }
}

export async function get(sql, params = []) {
  const database = await getDatabase();
  try {
    const stmt = database.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error('Get error:', sql, error);
    throw error;
  }
}

export async function all(sql, params = []) {
  const database = await getDatabase();
  try {
    const results = [];
    const stmt = database.prepare(sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('All error:', sql, error);
    throw error;
  }
}

export async function transaction(callback) {
  const database = await getDatabase();
  database.run('BEGIN TRANSACTION');
  try {
    await callback();
    database.run('COMMIT');
    await saveDatabase();
  } catch (error) {
    database.run('ROLLBACK');
    throw error;
  }
}

export default {
  getDatabase,
  initDatabase,
  run,
  get,
  all,
  transaction,
  saveDatabase
};
