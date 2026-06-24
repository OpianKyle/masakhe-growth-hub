import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.XNEELO_DB_HOST || "localhost",
  port: parseInt(process.env.XNEELO_DB_PORT || "3306"),
  database: process.env.XNEELO_DB_NAME,
  user: process.env.XNEELO_DB_USER,
  password: process.env.XNEELO_DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function queryOne(sql: string, params?: any[]): Promise<any> {
  const [rows] = await pool.query(sql, params);
  const arr = rows as any[];
  return arr[0] ?? null;
}

export async function queryAll(sql: string, params?: any[]): Promise<any[]> {
  const [rows] = await pool.query(sql, params);
  return rows as any[];
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function runMigrations() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wb_users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id VARCHAR(36) PRIMARY KEY,
        owner_id VARCHAR(36) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        content_json LONGTEXT NOT NULL,
        custom_domain VARCHAR(255) NULL,
        domain_verified TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_websites_owner (owner_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS website_leads (
        id VARCHAR(36) PRIMARY KEY,
        website_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(64) NULL,
        message TEXT NULL,
        source VARCHAR(64) NOT NULL DEFAULT 'contact_form',
        status VARCHAR(32) NOT NULL DEFAULT 'new',
        notes TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT NOW(),
        updated_at DATETIME NULL,
        INDEX idx_wl_website (website_id),
        INDEX idx_wl_user (user_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wb_sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT,
        INDEX idx_sessions_expires (expires)
      )
    `);

    console.log("[db] Migrations complete");
  } finally {
    conn.release();
  }
}
