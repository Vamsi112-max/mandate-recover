const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'mandate_recover.db');
const SCHEMA_FILE = path.join(__dirname, 'db', 'schema.sql');

function initDb() {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
    console.log(`Removed existing database ${DB_FILE}`);
  }

  const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Connected to the SQLite database.');
  });

  const schemaScript = fs.readFileSync(SCHEMA_FILE, 'utf8');

  db.serialize(() => {
    db.exec(schemaScript, (err) => {
      if (err) {
        console.error('Error executing schema:', err.message);
        return;
      }
      
      const stmt = db.prepare(`
        INSERT INTO users (id, username, password_hash, role)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run('demo-judge-id', 'judge@razorpay-buildathon.com', 'Demo@2026', 'judge');
      stmt.finalize();

      const ruleStmt = db.prepare(`
        INSERT INTO rules_config (id, max_retries, cooldown_hours, escalation_trigger, updated_at, updated_by)
        VALUES (?, ?, ?, ?, datetime('now'), ?)
      `);
      ruleStmt.run('default-rule-id', 3, 24, 'consecutive_failures', 'system');
      ruleStmt.finalize();

      console.log('Database initialized successfully with schema and demo data.');
    });
  });

  db.close();
}

initDb();
