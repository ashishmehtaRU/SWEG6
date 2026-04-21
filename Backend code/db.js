const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("users.db");

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT UNIQUE,
      password TEXT,
      google_id TEXT UNIQUE,
      avatar TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      model TEXT DEFAULT 'llama3:8b',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model_name TEXT,
      batch_id TEXT,
      is_recommended INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"
  );

  db.run("ALTER TABLE messages ADD COLUMN model_name TEXT", () => {});
  db.run("ALTER TABLE messages ADD COLUMN batch_id TEXT", () => {});
  db.run(
    "ALTER TABLE messages ADD COLUMN is_recommended INTEGER DEFAULT 0",
    () => {}
  );
});

module.exports = db;