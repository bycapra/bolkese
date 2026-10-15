PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  preset_key TEXT,
  price REAL NOT NULL DEFAULT 0,
  ask REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);

CREATE TABLE IF NOT EXISTS movements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_id TEXT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  unit TEXT NOT NULL,
  direction TEXT NOT NULL,
  quantity REAL NOT NULL,
  balance REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_movements_user_created ON movements(user_id, created_at);

CREATE TABLE IF NOT EXISTS units (
  value TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS symbols (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL
);
