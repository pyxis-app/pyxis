import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let _db: Database.Database | null = null;

function migrationsDir(): string {
  return path.join(process.cwd(), "lib", "migrations");
}

function runMigrations(db: Database.Database) {
  const dir = migrationsDir();
  if (!fs.existsSync(dir)) return;

  // Ensure the tracking table exists before we query it
  db.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)",
  );

  const seen = db.prepare("SELECT id FROM _migrations").all() as {
    id: number;
  }[];
  const applied = new Set<number>(seen.map((r) => r.id));

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = parseInt(file.split("_")[0], 10);
    if (!id || applied.has(id)) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare(
        "INSERT INTO _migrations (id, applied_at) VALUES (?, ?)",
      ).run(id, Date.now());
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
}

export function getDb(): Database.Database {
  if (_db) return _db;
  const file =
    process.env.SQLITE_PATH || path.join(process.cwd(), "data", "probe.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  _db = new Database(file);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  runMigrations(_db);
  return _db;
}

export function closeDb() {
  _db?.close();
  _db = null;
}
