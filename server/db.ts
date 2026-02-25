import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const sslConfig: any = {};
const caPath = process.env.XNEELO_DB_SSL_CA_PATH;
if (caPath && fs.existsSync(caPath)) {
  sslConfig.ca = fs.readFileSync(caPath);
  sslConfig.rejectUnauthorized = true;
} else {
  sslConfig.rejectUnauthorized = false;
}

export const pool = mysql.createPool({
  host: process.env.XNEELO_DB_HOST || "sql16.cpt3.host-h.net",
  port: Number(process.env.XNEELO_DB_PORT || 3306),
  database: process.env.XNEELO_DB_NAME || "opiandigital",
  user: process.env.XNEELO_DB_USER || "admin",
  password: process.env.XNEELO_DB_PASSWORD || "",
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  try {
    const [rows] = await pool.execute(sql, params);
    return (rows as any[])[0] || null;
  } catch (err: any) {
    console.error(`DB queryOne error [${sql.slice(0, 80)}]:`, err.message);
    throw err;
  }
}

export async function queryAll(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as any[];
  } catch (err: any) {
    console.error(`DB queryAll error [${sql.slice(0, 80)}]:`, err.message);
    throw err;
  }
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (err: any) {
    console.error(`DB execute error [${sql.slice(0, 80)}]:`, err.message);
    throw err;
  }
}

export async function runMigrations() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS onboarding_flows (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS onboarding_steps (
        id VARCHAR(36) PRIMARY KEY,
        flow_id VARCHAR(36) NOT NULL,
        step_key VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INT NOT NULL,
        condition_json TEXT,
        fields_json TEXT NOT NULL,
        FOREIGN KEY(flow_id) REFERENCES onboarding_flows(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS page_definitions (
        id VARCHAR(36) PRIMARY KEY,
        route VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id VARCHAR(36) PRIMARY KEY,
        page_id VARCHAR(36) NOT NULL,
        section_type VARCHAR(100) NOT NULL,
        order_index INT NOT NULL,
        config_json TEXT NOT NULL,
        FOREIGN KEY(page_id) REFERENCES page_definitions(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        kind VARCHAR(100) NOT NULL,
        payload_json TEXT NOT NULL,
        created_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id VARCHAR(36) PRIMARY KEY,
        owner_id VARCHAR(36) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(30) NOT NULL,
        content_json LONGTEXT NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        business_name VARCHAR(255),
        trading_name VARCHAR(255),
        business_status VARCHAR(100),
        business_type VARCHAR(100),
        industry_sector VARCHAR(100),
        years_operating INT,
        employee_count INT,
        sa_id VARCHAR(20),
        cipc_number VARCHAR(50),
        phone VARCHAR(30),
        whatsapp VARCHAR(30),
        email VARCHAR(255),
        physical_address TEXT,
        bank_name VARCHAR(100),
        account_type VARCHAR(50),
        account_number VARCHAR(50),
        branch_code VARCHAR(20),
        popia_consent TINYINT(1) DEFAULT 0,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(10) NOT NULL,
        amount_cents INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        occurred_at VARCHAR(30) NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        invoice_number VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        total_cents INT NOT NULL DEFAULT 0,
        items_json TEXT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS grant_readiness (
        user_id VARCHAR(36) PRIMARY KEY,
        id_verified TINYINT(1) NOT NULL DEFAULT 0,
        business_registered TINYINT(1) NOT NULL DEFAULT 0,
        tax_number VARCHAR(50),
        vat_registered TINYINT(1) NOT NULL DEFAULT 0,
        bank_account_provided TINYINT(1) NOT NULL DEFAULT 0,
        six_months_records TINYINT(1) NOT NULL DEFAULT 0,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id VARCHAR(36) NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(owner_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'viewer',
        created_at VARCHAR(30) NOT NULL,
        UNIQUE KEY uq_ws_user (workspace_id, user_id),
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        platform VARCHAR(30) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        profile_url TEXT,
        platform_account_id VARCHAR(255),
        access_token_enc TEXT,
        refresh_token_enc TEXT,
        token_expires_at VARCHAR(30),
        connected_by_user_id VARCHAR(36) NOT NULL,
        is_mock TINYINT(1) NOT NULL DEFAULT 0,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(connected_by_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        size INT NOT NULL DEFAULT 0,
        uploaded_by_user_id VARCHAR(36) NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        created_by_user_id VARCHAR(36) NOT NULL,
        content_text TEXT,
        media_asset_ids TEXT,
        scheduled_at VARCHAR(30),
        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        idempotency_key VARCHAR(100) UNIQUE,
        retry_count INT NOT NULL DEFAULT 0,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(created_by_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS social_post_targets (
        id VARCHAR(36) PRIMARY KEY,
        social_post_id VARCHAR(36) NOT NULL,
        social_account_id VARCHAR(36) NOT NULL,
        platform VARCHAR(30) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
        platform_post_id VARCHAR(255),
        error_message TEXT,
        published_at VARCHAR(30),
        created_at VARCHAR(30),
        updated_at VARCHAR(30),
        FOREIGN KEY(social_post_id) REFERENCES social_posts(id),
        FOREIGN KEY(social_account_id) REFERENCES social_accounts(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        actor_user_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(36),
        metadata TEXT,
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(actor_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    const addColumnIfMissing = async (table: string, column: string, definition: string) => {
      try {
        await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      } catch (e: any) {
        if (!e.message.includes("Duplicate column name")) throw e;
      }
    };

    await addColumnIfMissing("social_post_targets", "created_at", "VARCHAR(30)");
    await addColumnIfMissing("social_post_targets", "updated_at", "VARCHAR(30)");

    const createIndex = async (name: string, table: string, col: string) => {
      try {
        await conn.query(`CREATE INDEX ${name} ON ${table}(${col})`);
      } catch (e: any) {
        if (!e.message.includes("Duplicate key name")) throw e;
      }
    };

    await createIndex("idx_workspace_members_ws", "workspace_members", "workspace_id");
    await createIndex("idx_workspace_members_user", "workspace_members", "user_id");
    await createIndex("idx_social_accounts_ws", "social_accounts", "workspace_id");
    await createIndex("idx_social_posts_ws", "social_posts", "workspace_id");
    await createIndex("idx_social_posts_status", "social_posts", "status");
    await createIndex("idx_social_posts_scheduled", "social_posts", "scheduled_at");
    await createIndex("idx_post_targets_post", "social_post_targets", "social_post_id");
    await createIndex("idx_media_assets_ws", "media_assets", "workspace_id");
    await createIndex("idx_audit_logs_ws", "audit_logs", "workspace_id");

    console.log("MySQL migrations completed successfully");
  } finally {
    conn.release();
  }
}
