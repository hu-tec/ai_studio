const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'hutechc.db');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const database = getDB();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  database.exec(schema);
  console.log('Database initialized');
}

// Run directly: node server/db/init.js
if (require.main === module) {
  initDB();
  console.log('Database created at', DB_PATH);
}

function closeDB() {
  if (db) {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
      db = null;
      console.log('Database closed (WAL checkpointed)');
    } catch (e) {
      console.error('DB close error:', e.message);
    }
  }
}

module.exports = { getDB, initDB, closeDB };
