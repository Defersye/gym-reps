const sqlite3 = require("sqlite3").verbose();

const path = require("path");
const dbPath = path.join(__dirname, "../data", "exercises.db");

const db = new sqlite3.Database(dbPath, (err) => {
   if (err) {
      console.error("Error while connecting database:", err.message);
   } else {
      console.log("Connected to database SQLite");
      db.run(
         `
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                sets TEXT DEFAULT '[]'
            )
        `,
         (err) => {
            if (err) {
               console.error("Error while creating table:", err.message);
            }
         }
      );
   }
});

process.on("SIGINT", () => {
   db.close((err) => {
      if (err) {
         console.error("Error while closing database:", err.message);
      }
      console.log("Database is closed");
      process.exit(0);
   });
});

module.exports = db;
