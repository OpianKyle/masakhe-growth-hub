import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "data", "masakhe.db");
export const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_flows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onboarding_steps (
      id TEXT PRIMARY KEY,
      flow_id TEXT NOT NULL,
      step_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      condition_json TEXT,
      fields_json TEXT NOT NULL,
      FOREIGN KEY(flow_id) REFERENCES onboarding_flows(id)
    );

    CREATE TABLE IF NOT EXISTS page_definitions (
      id TEXT PRIMARY KEY,
      route TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_sections (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      section_type TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      config_json TEXT NOT NULL,
      FOREIGN KEY(page_id) REFERENCES page_definitions(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
