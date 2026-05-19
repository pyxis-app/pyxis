import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

let _sql: ReturnType<typeof postgres> | null = null;
let _migrationsApplied = false;

function migrationsDir(): string {
  return path.join(process.cwd(), "lib", "migrations");
}

function databaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL not set — required for Postgres connection (provisioned via Vercel Neon integration).",
    );
  }
  return url;
}

export function getSql(): ReturnType<typeof postgres> {
  if (_sql) return _sql;
  _sql = postgres(databaseUrl(), {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  return _sql;
}

export async function ensureMigrations(): Promise<void> {
  if (_migrationsApplied) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          INTEGER PRIMARY KEY,
      applied_at  BIGINT NOT NULL
    )
  `;

  const dir = migrationsDir();
  if (!fs.existsSync(dir)) {
    _migrationsApplied = true;
    return;
  }

  const seen = (await sql<{ id: number }[]>`SELECT id FROM _migrations`) as Array<{ id: number }>;
  const applied = new Set<number>(seen.map((r) => r.id));

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = parseInt(file.split("_")[0], 10);
    if (!id || applied.has(id)) continue;
    const sqlText = fs.readFileSync(path.join(dir, file), "utf8");

    await sql.begin(async (tx) => {
      await tx.unsafe(sqlText);
      await tx`INSERT INTO _migrations (id, applied_at) VALUES (${id}, ${Date.now()})`;
    });
  }

  _migrationsApplied = true;
}

export async function closeDb(): Promise<void> {
  if (_sql) {
    await _sql.end({ timeout: 5 });
    _sql = null;
    _migrationsApplied = false;
  }
}
