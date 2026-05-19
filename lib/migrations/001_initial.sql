CREATE TABLE IF NOT EXISTS research_sessions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_hash TEXT NOT NULL,
  briefing_json JSONB NOT NULL,
  payment_tx TEXT,
  partial BOOLEAN NOT NULL DEFAULT false,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wallet_created ON research_sessions(wallet_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idempotency  ON research_sessions(wallet_address, topic_hash, created_at);

CREATE TABLE IF NOT EXISTS auth_nonces (
  nonce TEXT PRIMARY KEY,
  issued_at BIGINT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_nonces_issued ON auth_nonces(issued_at);

CREATE TABLE IF NOT EXISTS payment_nonces (
  nonce TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  seen_at BIGINT NOT NULL
);
