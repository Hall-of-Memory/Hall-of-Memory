CREATE TABLE inquiries_hardened (
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
    CHECK (status IN ('new', 'contacted', 'quoted', 'closed', 'rejected'))
);

INSERT INTO inquiries_hardened (
  id, created_at, offer_id, package_id, event_date, event_type,
  location, name, email, phone, message, privacy_consent, status
)
SELECT
  id, created_at, offer_id, package_id, event_date, event_type,
  location, name, email, phone, message, privacy_consent, status
FROM inquiries;

CREATE TABLE inquiry_notifications_hardened (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('owner-new-inquiry')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  message_id TEXT,
  last_error TEXT,
  UNIQUE (inquiry_id, kind),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries_hardened (id)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION
);

INSERT INTO inquiry_notifications_hardened (
  id, inquiry_id, kind, status, attempts, created_at, updated_at, message_id, last_error
)
SELECT
  id, inquiry_id, kind, status, attempts, created_at, updated_at, message_id, last_error
FROM inquiry_notifications;

DROP TABLE inquiry_notifications;
DROP TABLE inquiries;
ALTER TABLE inquiries_hardened RENAME TO inquiries;
ALTER TABLE inquiry_notifications_hardened RENAME TO inquiry_notifications;

CREATE INDEX inquiries_offer_date_idx ON inquiries (offer_id, event_date);
CREATE INDEX inquiries_created_at_desc_idx ON inquiries (created_at DESC);
CREATE INDEX inquiry_notifications_status_idx
  ON inquiry_notifications (status, updated_at);
