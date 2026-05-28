CREATE TABLE IF NOT EXISTS csp_violations (
  id                   BIGSERIAL PRIMARY KEY,
  reported_at          BIGINT  NOT NULL,
  document_uri         TEXT,
  violated_directive   TEXT    NOT NULL,
  effective_directive  TEXT,
  blocked_uri          TEXT,
  source_file          TEXT,
  line_number          INT,
  column_number        INT,
  status_code          INT,
  user_agent           TEXT,
  client_ip            TEXT,
  raw_json             JSONB   NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_csp_directive ON csp_violations(violated_directive, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_csp_blocked   ON csp_violations(blocked_uri);
CREATE INDEX IF NOT EXISTS idx_csp_reported  ON csp_violations(reported_at DESC);
