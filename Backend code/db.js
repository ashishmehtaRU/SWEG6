const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("users.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT, google_id TEXT, avatar TEXT)",
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, rating INTEGER, text TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
  );
});

module.exports = db;
