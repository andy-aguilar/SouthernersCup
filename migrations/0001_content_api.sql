CREATE TABLE IF NOT EXISTS catalog_versions (
  version TEXT PRIMARY KEY,
  git_sha TEXT,
  catalog_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  catalog_version TEXT NOT NULL,
  spec_json TEXT NOT NULL,
  author TEXT NOT NULL,
  current_revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_at TEXT,
  FOREIGN KEY (catalog_version) REFERENCES catalog_versions(version)
);

CREATE INDEX IF NOT EXISTS idx_posts_status_updated_at
  ON posts(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  catalog_version TEXT NOT NULL,
  spec_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_version) REFERENCES catalog_versions(version),
  UNIQUE (post_id, revision)
);

CREATE TABLE IF NOT EXISTS feature_requests (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'rejected', 'shipped')),
  requested_block TEXT NOT NULL,
  needed_for TEXT NOT NULL,
  reason TEXT NOT NULL,
  fallback TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  source_post_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by TEXT NOT NULL,
  FOREIGN KEY (source_post_id) REFERENCES posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status_created_at
  ON feature_requests(status, created_at DESC);
