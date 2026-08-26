const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { runPipeline } = require('./agents');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'mandate_recover.db'));

const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err); else resolve(rows);
  });
});

const querySingle = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err); else resolve(row);
  });
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err); else resolve(this);
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await querySingle(`SELECT * FROM users WHERE username = ?`, [username]);
  if (user && user.password_hash === password) {
    res.json({ token: 'mock-jwt-token', user: { username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/dashboard/overview', async (req, res) => {
  const latestBatch = await querySingle(`SELECT * FROM batches ORDER BY started_at DESC LIMIT 1`);
  if (!latestBatch) return res.json(null);
  
  const results = await querySingle(`SELECT * FROM batch_results WHERE batch_id = ?`, [latestBatch.id]);
  res.json({ batch: latestBatch, results });
});

app.get('/api/dashboard/batch-results', async (req, res) => {
  const data = await query(`
    SELECT t.id, t.mandate_id, t.customer_id, t.amount, t.raw_status, 
           d.diagnosed_cause, d.confidence_score, 
           dec.chosen_action, dec.stopping_rule_hit,
           a.outcome, a.executed_at
    FROM transactions t
    LEFT JOIN diagnoses d ON t.id = d.transaction_id
    LEFT JOIN decisions dec ON t.id = dec.transaction_id
    LEFT JOIN actions a ON dec.id = a.decision_id
    ORDER BY t.created_at DESC
  `);
  res.json(data);
});

app.get('/api/dashboard/audit', async (req, res) => {
  const data = await query(`SELECT * FROM audit_log ORDER BY timestamp DESC`);
  res.json(data.map(r => ({ ...r, event_detail: JSON.parse(r.event_detail) })));
});

app.get('/api/dashboard/rules', async (req, res) => {
  const rule = await querySingle(`SELECT * FROM rules_config LIMIT 1`);
  res.json(rule);
});

app.post('/api/dashboard/rules', async (req, res) => {
  const { max_retries, cooldown_hours, escalation_trigger } = req.body;
  await run(`UPDATE rules_config SET max_retries = ?, cooldown_hours = ?, escalation_trigger = ?, updated_at = datetime('now')`,
    [max_retries, cooldown_hours, escalation_trigger]);
  res.json({ success: true });
});

app.get('/api/dashboard/escalations', async (req, res) => {
  const data = await query(`SELECT * FROM escalations WHERE status = 'pending' ORDER BY created_at DESC`);
  res.json(data);
});

app.post('/api/dashboard/escalations/:id', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // approve, reject, resolve
  await run(`UPDATE escalations SET status = ?, reviewed_by = 'judge', reviewed_at = datetime('now') WHERE id = ?`, [action, id]);
  res.json({ success: true });
});

app.post('/api/pipeline/run', async (req, res) => {
  const { childProcess } = require('child_process');
  const exec = require('util').promisify(require('child_process').exec);
  
  try {
    await exec('node run_batch.js');
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
