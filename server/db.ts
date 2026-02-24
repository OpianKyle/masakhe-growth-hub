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

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('owner','admin','editor','viewer')),
      created_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(workspace_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      platform TEXT NOT NULL CHECK(platform IN ('META_FACEBOOK','META_INSTAGRAM','LINKEDIN','X','TIKTOK','YOUTUBE')),
      account_name TEXT NOT NULL,
      profile_url TEXT,
      platform_account_id TEXT,
      access_token_enc TEXT,
      refresh_token_enc TEXT,
      token_expires_at TEXT,
      connected_by_user_id TEXT NOT NULL,
      is_mock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(connected_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('IMAGE','VIDEO')),
      file_name TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      uploaded_by_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      content_text TEXT,
      media_asset_ids TEXT DEFAULT '[]',
      scheduled_at TEXT,
      status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SCHEDULED','PUBLISHING','PUBLISHED','FAILED','CANCELLED')),
      idempotency_key TEXT UNIQUE,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(created_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS social_post_targets (
      id TEXT PRIMARY KEY,
      social_post_id TEXT NOT NULL,
      social_account_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK(status IN ('SCHEDULED','PUBLISHING','PUBLISHED','FAILED')),
      platform_post_id TEXT,
      error_message TEXT,
      published_at TEXT,
      FOREIGN KEY(social_post_id) REFERENCES social_posts(id),
      FOREIGN KEY(social_account_id) REFERENCES social_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      actor_user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(actor_user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_social_accounts_ws ON social_accounts(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_social_posts_ws ON social_posts(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
    CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_post_targets_post ON social_post_targets(social_post_id);
    CREATE INDEX IF NOT EXISTS idx_media_assets_ws ON media_assets(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_ws ON audit_logs(workspace_id);
  `);

  const schemaSql = (sqlite.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='social_accounts'").get() as any)?.sql || '';
  const hasProfileUrl = schemaSql.includes('profile_url');
  const hasTikTok = schemaSql.includes('TIKTOK');

  if (!hasProfileUrl && hasTikTok) {
    sqlite.exec("ALTER TABLE social_accounts ADD COLUMN profile_url TEXT");
  }

  if (!hasTikTok) {
    const migrateInTransaction = sqlite.transaction(() => {
      sqlite.pragma("foreign_keys = OFF");
      sqlite.exec("DROP TABLE IF EXISTS social_accounts_tmp");

      const colList = hasProfileUrl
        ? 'id, workspace_id, platform, account_name, profile_url, platform_account_id, access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at'
        : 'id, workspace_id, platform, account_name, NULL AS profile_url, platform_account_id, access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at';

      sqlite.exec(`
        CREATE TABLE social_accounts_tmp (
          id TEXT PRIMARY KEY,
          workspace_id TEXT NOT NULL,
          platform TEXT NOT NULL CHECK(platform IN ('META_FACEBOOK','META_INSTAGRAM','LINKEDIN','X','TIKTOK','YOUTUBE')),
          account_name TEXT NOT NULL,
          profile_url TEXT,
          platform_account_id TEXT,
          access_token_enc TEXT,
          refresh_token_enc TEXT,
          token_expires_at TEXT,
          connected_by_user_id TEXT NOT NULL,
          is_mock INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
          FOREIGN KEY(connected_by_user_id) REFERENCES users(id)
        )
      `);
      sqlite.exec(`INSERT INTO social_accounts_tmp SELECT ${colList} FROM social_accounts`);

      sqlite.exec("DELETE FROM social_post_targets WHERE account_id NOT IN (SELECT id FROM social_accounts_tmp)");

      sqlite.exec("DROP TABLE social_accounts");
      sqlite.exec("ALTER TABLE social_accounts_tmp RENAME TO social_accounts");
      sqlite.exec("CREATE INDEX IF NOT EXISTS idx_social_accounts_ws ON social_accounts(workspace_id)");
      sqlite.pragma("foreign_keys = ON");

      const fkCheck = sqlite.pragma("foreign_key_check") as any[];
      if (fkCheck.length > 0) {
        throw new Error("Foreign key integrity check failed after migration");
      }
    });

    migrateInTransaction();
  }
}
