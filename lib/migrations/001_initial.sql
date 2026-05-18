CREATE TABLE IF NOT EXISTS research_sessions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_hash TEXT NOT NULL,
  briefing_json TEXT NOT NULL,
  payment_tx TEXT,
  partial INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wallet_created ON research_sessions(wallet_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idempotency  ON research_sessions(wallet_address, topic_hash, created_at);

CREATE TABLE IF NOT EXISTS auth_nonces (
  nonce TEXT PRIMARY KEY,
  issued_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_nonces_issued ON auth_nonces(issued_at);

CREATE TABLE IF NOT EXISTS payment_nonces (
  nonce TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
