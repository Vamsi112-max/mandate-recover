const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { runPipeline } = require('./agents');

const DB_FILE = path.join(__dirname, 'mandate_recover.db');

function generateTransactions(count) {
  const causes = ['afa_gap', 'insufficient_balance', 'expired_mandate', 'genuine_decline', 'ambiguous'];
  const transactions = [];
  for (let i = 0; i < count; i++) {
    const amount = Math.floor(Math.random() * 50000) + 15001; // Above 15,000 for AFA rule
    const causeSeed = causes[Math.floor(Math.random() * causes.length)];
    
    // Simulate Razorpay payload
    const payload = {
      id: `mandate_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // in paise
      status: 'rejected',
      error_code: causeSeed === 'afa_gap' ? 'BAD_REQUEST_ERROR' : 
                  causeSeed === 'insufficient_balance' ? 'INSUFFICIENT_FUNDS' :
                  causeSeed === 'expired_mandate' ? 'MANDATE_EXPIRED' : 'UNKNOWN_ERROR',
      error_description: causeSeed === 'afa_gap' ? 'Additional Factor Authentication required for amounts > 15000' : 'Transaction declined'
    };

    if(causeSeed === 'ambiguous') {
      payload.error_code = 'GATEWAY_ERROR';
      payload.error_description = 'Bank declined the transaction for unknown reasons';
    }

    transactions.push({
      id: `txn-${Math.random().toString(36).substring(2, 15)}`,
      mandate_id: payload.id,
      customer_id: `cust_${Math.random().toString(36).substring(7)}`,
      amount,
      currency: 'INR',
      transaction_type: 'recurring_debit',
      raw_status: 'rejected',
      razorpay_payload: JSON.stringify(payload)
    });
  }
  return transactions;
}

async function main() {
  console.log("Starting Mandate Recover Batch Pipeline...");
  
  const db = new sqlite3.Database(DB_FILE);
  
  // Create a new batch
  const batchId = `batch-${Date.now()}`;
  const runBatch = () => new Promise((resolve, reject) => {
    db.run(`INSERT INTO batches (id, batch_name, batch_size, causes_included, status, started_at) 
            VALUES (?, ?, ?, ?, ?, datetime('now'))`, 
      [batchId, 'Demo Synthetic Batch', 55, JSON.stringify(['all']), 'running'], function(err) {
        if(err) reject(err); else resolve();
    });
  });

  await runBatch();

  const transactions = generateTransactions(55);
  console.log(`Generated ${transactions.length} mock transactions.`);

  // Insert transactions
  const insertTxn = (txn) => new Promise((resolve, reject) => {
    db.run(`INSERT INTO transactions (id, mandate_id, customer_id, amount, currency, transaction_type, raw_status, razorpay_payload, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [txn.id, txn.mandate_id, txn.customer_id, txn.amount, txn.currency, txn.transaction_type, txn.raw_status, txn.razorpay_payload], function(err) {
        if(err) reject(err); else resolve();
    });
  });

  for(let txn of transactions) {
    await insertTxn(txn);
  }

  // Run Agentic Pipeline
  console.log("Running agents on transactions...");
  const results = await runPipeline(db, transactions, batchId);
  
  console.log(`Batch complete. Recovery rate: ${results.recoveryRate}%`);
  db.close();
}

main().catch(console.error);
