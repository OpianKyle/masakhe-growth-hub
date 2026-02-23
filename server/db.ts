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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      business_name TEXT,
      trading_name TEXT,
      business_status TEXT,
      business_type TEXT,
      industry_sector TEXT,
      years_operating INTEGER,
      employee_count INTEGER,
      sa_id TEXT,
      cipc_number TEXT,
      phone TEXT,
      whatsapp TEXT,
      email TEXT,
      physical_address TEXT,
      bank_name TEXT,
      account_type TEXT,
      account_number TEXT,
      branch_code TEXT,
      popia_consent INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
      amount_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      total_cents INTEGER NOT NULL DEFAULT 0,
      items_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS grant_readiness (
      user_id TEXT PRIMARY KEY,
      id_verified INTEGER NOT NULL DEFAULT 0,
      business_registered INTEGER NOT NULL DEFAULT 0,
      tax_number TEXT,
      vat_registered INTEGER NOT NULL DEFAULT 0,
      bank_account_provided INTEGER NOT NULL DEFAULT 0,
      six_months_records INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
}
