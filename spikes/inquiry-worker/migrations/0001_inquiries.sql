CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  offer_id TEXT NOT NULL,
  package_id TEXT,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  privacy_consent INTEGER NOT NULL CHECK (privacy_consent = 1),
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS inquiries_offer_date_idx ON inquiries (offer_id, event_date);
