import sqlite3
import os

DB_FILE = 'mandate_recover.db'
SCHEMA_FILE = 'db/schema.sql'

def init_db():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"Removed existing database {DB_FILE}")

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    try:
        with open(SCHEMA_FILE, 'r') as f:
            schema_script = f.read()
        
        # SQLite ignores JSONB, UUID, etc., but parses standard SQL just fine.
        cursor.executescript(schema_script)
        
        # Insert demo user
        cursor.execute("""
            INSERT INTO users (id, username, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, ('demo-judge-id', 'judge@razorpay-buildathon.com', 'Demo@2026', 'judge'))
        
        # Insert demo rule config
        cursor.execute("""
            INSERT INTO rules_config (id, max_retries, cooldown_hours, escalation_trigger, updated_at, updated_by)
            VALUES (?, ?, ?, ?, datetime('now'), ?)
        """, ('default-rule-id', 3, 24, 'consecutive_failures', 'system'))

        conn.commit()
        print("Database initialized successfully with schema and demo data.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
