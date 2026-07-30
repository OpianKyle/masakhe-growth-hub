import "dotenv/config";
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME     || "nexo_db",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  ssl: false,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
});

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  const [rows] = await pool.execute(sql, params);
  return (rows as any[])[0] || null;
}

export async function queryAll(sql: string, params: any[] = []): Promise<any[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as any[];
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function queryRaw(sql: string, params: any[] = []): Promise<any> {
  const [result] = await pool.query(sql, params);
  return result;
}

// ─── Migrations ───────────────────────────────────────────────────────────────
export async function runMigrations() {
  const conn = await pool.getConnection();
  try {
    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('user','admin','franchise') NOT NULL DEFAULT 'user',
        nexo_code VARCHAR(50) NULL,
        phone VARCHAR(30) NULL,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL
      ) ENGINE=InnoDB
    `);

    // Business profiles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        business_name VARCHAR(255),
        business_type VARCHAR(100),
        industry_sector VARCHAR(100),
        phone VARCHAR(30),
        email VARCHAR(255),
        physical_address TEXT,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    // Workspaces
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
        role VARCHAR(20) NOT NULL DEFAULT 'owner',
        created_at VARCHAR(30) NOT NULL,
        UNIQUE KEY uq_ws_user (workspace_id, user_id),
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    // Franchises (needed by /api/franchise/me)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS franchises (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        owner_user_id VARCHAR(36) NOT NULL UNIQUE,
        region VARCHAR(100) NULL,
        status ENUM('active','suspended') NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(owner_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS franchise_clients (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(36) NOT NULL,
        client_user_id VARCHAR(36) NOT NULL UNIQUE,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(franchise_id) REFERENCES franchises(id),
        FOREIGN KEY(client_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    // Promotions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mtn_promotions (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        promo_type ENUM('phone_ad','social_post','campaign','offer','general') NOT NULL DEFAULT 'general',
        image_url LONGTEXT,
        cta_text VARCHAR(100),
        cta_url TEXT,
        status ENUM('draft','active','scheduled','ended') NOT NULL DEFAULT 'draft',
        target_audience ENUM('all','active','new') NOT NULL DEFAULT 'all',
        scheduled_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Nexo partners
    await conn.query(`
      CREATE TABLE IF NOT EXISTS nexo_partners (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        partner_name VARCHAR(255) NOT NULL,
        partner_code VARCHAR(20) NOT NULL UNIQUE,
        region VARCHAR(100) NULL,
        branch VARCHAR(150) NULL,
        contact_person VARCHAR(150) NULL,
        contact_email VARCHAR(255) NULL,
        contact_phone VARCHAR(30) NULL,
        status ENUM('pending','active','suspended') DEFAULT 'pending',
        total_clients INT DEFAULT 0,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS nexo_clients (
        id VARCHAR(36) PRIMARY KEY,
        partner_id VARCHAR(36) NOT NULL,
        client_user_id VARCHAR(36) NOT NULL UNIQUE,
        business_name VARCHAR(255) NULL,
        sector VARCHAR(100) NULL,
        status VARCHAR(20) DEFAULT 'active',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Password reset tokens
    await conn.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    console.log("[DB] Migrations complete");
  } finally {
    conn.release();
  }
}
