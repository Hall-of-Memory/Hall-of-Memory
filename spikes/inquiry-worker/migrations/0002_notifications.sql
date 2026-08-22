CREATE TABLE IF NOT EXISTS inquiry_notifications (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('owner-new-inquiry')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  message_id TEXT,
  last_error TEXT,
  UNIQUE (inquiry_id, kind)
);
CREATE INDEX IF NOT EXISTS inquiry_notifications_status_idx
  ON inquiry_notifications (status, updated_at);
