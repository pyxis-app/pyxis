CREATE TABLE IF NOT EXISTS api_cache (
  key         TEXT PRIMARY KEY,
  value_json  JSONB NOT NULL,
  source      TEXT NOT NULL,
  expires_at  BIGINT NOT NULL,
  created_at  BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_api_cache_expiry ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_source ON api_cache(source);
