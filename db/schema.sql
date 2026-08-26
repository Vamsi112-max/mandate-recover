CREATE TABLE transactions (
    id               UUID PRIMARY KEY,
    mandate_id       VARCHAR,
    customer_id      VARCHAR,
    amount           DECIMAL,
    currency         VARCHAR DEFAULT 'INR',
    transaction_type VARCHAR,
    raw_status       VARCHAR,
    razorpay_payload JSONB,
    created_at       TIMESTAMP
);

CREATE TABLE diagnoses (
    id                UUID PRIMARY KEY,
    transaction_id    UUID REFERENCES transactions(id),
    diagnosed_cause   VARCHAR,   -- 'afa_gap' | 'insufficient_balance' | 'expired_mandate' | 'revoked_mandate' | 'genuine_decline' | 'network_timeout'
    confidence_score  DECIMAL,
    method            VARCHAR,   -- 'rule_based' | 'llm_reasoning'
    reasoning_text    TEXT,
    created_at        TIMESTAMP
);

CREATE TABLE decisions (
    id                       UUID PRIMARY KEY,
    transaction_id           UUID REFERENCES transactions(id),
    diagnosis_id             UUID REFERENCES diagnoses(id),
    chosen_action            VARCHAR,  -- 'reissue_mandate' | 'retry_immediate' | 'retry_delayed' | 'send_link' | 'escalate' | 'no_action'
    retry_count_at_decision  INT,
    stopping_rule_hit        BOOLEAN,
    rule_snapshot            JSONB,
    created_at               TIMESTAMP
);

CREATE TABLE actions (
    id             UUID PRIMARY KEY,
    decision_id    UUID REFERENCES decisions(id),
    action_type    VARCHAR,
    razorpay_call  VARCHAR,
    api_response   JSONB,
    outcome        VARCHAR,   -- 'success' | 'failed' | 'pending'
    executed_at    TIMESTAMP
);

CREATE TABLE audit_log (
    id             UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    event_type     VARCHAR,   -- 'diagnosis' | 'decision' | 'action' | 'escalation' | 'manual_override'
    actor          VARCHAR,
    event_detail   JSONB,
    timestamp      TIMESTAMP
);

CREATE TABLE escalations (
    id             UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    reason         VARCHAR,
    status         VARCHAR,   -- 'pending' | 'approved' | 'rejected' | 'resolved'
    reviewed_by    VARCHAR,
    reviewed_at    TIMESTAMP,
    created_at     TIMESTAMP
);

CREATE TABLE batches (
    id              UUID PRIMARY KEY,
    batch_name      VARCHAR,
    batch_size      INT,
    causes_included JSONB,
    status          VARCHAR,   -- 'running' | 'completed' | 'failed'
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE TABLE batch_results (
    id                            UUID PRIMARY KEY,
    batch_id                      UUID REFERENCES batches(id),
    recovery_rate                 DECIMAL,
    total_recovered_amount        DECIMAL,
    total_at_risk_amount          DECIMAL,
    naive_baseline_recovery_rate  DECIMAL,
    compliance_violations_count   INT,
    cause_breakdown               JSONB
);

CREATE TABLE rules_config (
    id                  UUID PRIMARY KEY,
    max_retries         INT,
    cooldown_hours      INT,
    escalation_trigger  VARCHAR,
    updated_at          TIMESTAMP,
    updated_by          VARCHAR
);

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    username      VARCHAR,
    password_hash VARCHAR,
    role          VARCHAR   -- 'judge' | 'admin'
);
