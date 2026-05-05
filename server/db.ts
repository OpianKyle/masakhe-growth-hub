import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

let sslConfig: any = false;
if (process.env.XNEELO_DB_SSL !== "false") {
  const caPath = process.env.XNEELO_DB_SSL_CA_PATH;
  if (caPath && fs.existsSync(caPath)) {
    sslConfig = { ca: fs.readFileSync(caPath), rejectUnauthorized: true };
  } else {
    sslConfig = { rejectUnauthorized: false };
  }
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
      ALTER TABLE websites ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) NULL UNIQUE
    `).catch(() => {});
    await conn.query(`
      ALTER TABLE websites ADD COLUMN IF NOT EXISTS domain_verified TINYINT(1) NOT NULL DEFAULT 0
    `).catch(() => {});

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
        url LONGTEXT NOT NULL,
        type VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        size INT NOT NULL DEFAULT 0,
        uploaded_by_user_id VARCHAR(36) NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    // Migrate existing media_assets table if needed
    try {
      await conn.query(`ALTER TABLE media_assets MODIFY url LONGTEXT NOT NULL`);
    } catch (err: any) {
      if (!err.message.includes("Identical")) {
        console.error("Media assets migration warning:", err.message);
      }
    }

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
    await addColumnIfMissing("business_profiles", "logo_url", "LONGTEXT");
    try {
      await conn.query("ALTER TABLE business_profiles MODIFY COLUMN logo_url LONGTEXT");
    } catch (_) {}
    await addColumnIfMissing("business_profiles", "tax_number", "VARCHAR(50) NULL");
    await addColumnIfMissing("business_profiles", "vat_number", "VARCHAR(50) NULL");
    await addColumnIfMissing("business_profiles", "invoice_color", "VARCHAR(20) NULL");
    await addColumnIfMissing("billing_subscriptions", "adumo_subscription_id", "VARCHAR(255) NULL");
    await addColumnIfMissing("billing_invoices", "plan_id", "INT NULL");
    await addColumnIfMissing("billing_invoices", "promo_code", "VARCHAR(50) NULL");
    await addColumnIfMissing("billing_invoices", "original_amount_cents", "INT NULL");
    await addColumnIfMissing("users", "first_month_promo_used", "TINYINT(1) NOT NULL DEFAULT 0");
    await addColumnIfMissing("users", "first_month_promo_code", "VARCHAR(50) NULL");
    await addColumnIfMissing("billing_payment_methods", "puid", "VARCHAR(255) NULL");
    await addColumnIfMissing("billing_payment_methods", "profile_token", "VARCHAR(255) NULL");
    await addColumnIfMissing("billing_payment_methods", "card_token", "VARCHAR(255) NULL");

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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS billing_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        price_cents INT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'ZAR',
        bill_interval VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS billing_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        plan_id INT NOT NULL,
        status ENUM('TRIAL','ACTIVE','PAST_DUE','CANCELLED') NOT NULL DEFAULT 'TRIAL',
        trial_start_at DATETIME NULL,
        trial_end_at DATETIME NULL,
        next_billing_at DATETIME NULL,
        cancelled_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(plan_id) REFERENCES billing_plans(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS billing_payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        provider VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        provider_customer_ref VARCHAR(255) NULL,
        provider_payment_method_ref VARCHAR(255) NULL,
        last4 VARCHAR(4) NULL,
        brand VARCHAR(50) NULL,
        exp_month TINYINT NULL,
        exp_year SMALLINT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ON_FILE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS billing_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        subscription_id INT NULL,
        amount_cents INT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'ZAR',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        provider_ref VARCHAR(255) NULL UNIQUE,
        merchant_ref VARCHAR(38) NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME NULL,
        failure_reason TEXT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(subscription_id) REFERENCES billing_subscriptions(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS billing_webhook_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
        event_key VARCHAR(255) NOT NULL UNIQUE,
        payload_json TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
      ) ENGINE=InnoDB
    `);

    await createIndex("idx_billing_sub_ws_status", "billing_subscriptions", "workspace_id, status");
    await createIndex("idx_billing_sub_next", "billing_subscriptions", "next_billing_at");
    await createIndex("idx_bi_sub_status", "billing_invoices", "subscription_id, status");
    await createIndex("idx_bi_created", "billing_invoices", "created_at");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        budget_min INT,
        budget_max INT,
        currency VARCHAR(10) DEFAULT 'ZAR',
        location VARCHAR(255),
        deadline DATE,
        requirements TEXT,
        status VARCHAR(20) DEFAULT 'OPEN',
        created_by VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS tender_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tender_id INT NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        cover_letter TEXT,
        proposed_amount INT,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await createIndex("idx_tender_status", "tenders", "status");
    await createIndex("idx_tender_app_tid", "tender_applications", "tender_id");
    await createIndex("idx_tender_app_uid", "tender_applications", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(255),
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_notif_user_read", "notifications", "user_id, is_read");
    await createIndex("idx_notif_created", "notifications", "created_at");

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
    await createIndex("idx_prt_token", "password_reset_tokens", "token");
    await createIndex("idx_prt_user", "password_reset_tokens", "user_id");

    await conn.query(`INSERT IGNORE INTO billing_plans (code, name, price_cents) VALUES ('starter', 'Enterprize', 59900), ('pro', 'Enterprize Plus', 89900), ('premium', 'Enterprize Premium', 149900)`);
    await conn.query(`UPDATE billing_plans SET name = 'Enterprize', price_cents = 59900 WHERE code = 'starter'`);
    await conn.query(`UPDATE billing_plans SET name = 'Enterprize Plus', price_cents = 89900 WHERE code = 'pro'`);
    await conn.query(`UPDATE billing_plans SET name = 'Enterprize Premium', price_cents = 149900 WHERE code = 'premium'`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS business_plans (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Untitled Business Plan',
        form_data JSON,
        generated_content JSON,
        status ENUM('draft','generated') DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_bp_user", "business_plans", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS funding_proposals (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Untitled Funding Proposal',
        form_data JSON,
        generated_content JSON,
        status ENUM('draft','generated') DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_fp_user", "funding_proposals", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS financial_statements (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        financial_year INT NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Annual Financial Statement',
        form_data JSON,
        computed JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_fs_user", "financial_statements", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100),
        company_type VARCHAR(100),
        registration_date VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Active',
        directors TEXT,
        address TEXT,
        financial_year_end VARCHAR(20),
        is_verified TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_companies_user", "companies", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS funding_applications (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        program ENUM('SEFA','NEF','NYDA','IDC') NOT NULL,
        company_id VARCHAR(36),
        business_plan_id VARCHAR(36),
        financial_statement_id VARCHAR(36),
        funding_proposal_id VARCHAR(36),
        form_data JSON,
        generated_content JSON,
        status ENUM('draft','submitted') DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_fa_user", "funding_applications", "user_id");

    try {
      await conn.query(`ALTER TABLE business_plans ADD COLUMN company_id VARCHAR(36) DEFAULT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    try {
      await conn.query(`ALTER TABLE funding_proposals ADD COLUMN company_id VARCHAR(36) DEFAULT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    try {
      await conn.query(`ALTER TABLE companies ADD COLUMN verification_details TEXT DEFAULT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    try {
      await conn.query(`ALTER TABLE users ADD COLUMN subscription_exempt TINYINT(1) NOT NULL DEFAULT 0`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    try {
      await conn.query(`ALTER TABLE users ADD COLUMN parent_owner_id VARCHAR(36) NULL DEFAULT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }
    await createIndex("idx_users_parent_owner", "users", "parent_owner_id");

    try {
      await conn.query(`ALTER TABLE workspace_members ADD COLUMN permissions TEXT NULL DEFAULT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    try {
      await conn.query(`ALTER TABLE workspace_members ADD COLUMN invite_pending TINYINT(1) NOT NULL DEFAULT 0`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) throw e; }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_listings (
        id VARCHAR(36) PRIMARY KEY,
        website_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        variant VARCHAR(150),
        year INT NOT NULL,
        price INT NOT NULL,
        mileage INT,
        fuel_type VARCHAR(50),
        transmission VARCHAR(50),
        color VARCHAR(50),
        body_type VARCHAR(50),
        description TEXT,
        features JSON,
        images JSON,
        status ENUM('available','sold','reserved') DEFAULT 'available',
        featured TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_vl_website", "vehicle_listings", "website_id");
    await createIndex("idx_vl_user", "vehicle_listings", "user_id");
    await createIndex("idx_vl_status", "vehicle_listings", "status");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS website_leads (
        id VARCHAR(36) PRIMARY KEY,
        website_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        vehicle_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        message TEXT,
        source VARCHAR(50) DEFAULT 'contact_form',
        status ENUM('new','contacted','qualified','converted','closed') DEFAULT 'new',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_wl_website", "website_leads", "website_id");
    await createIndex("idx_wl_user", "website_leads", "user_id");
    await createIndex("idx_wl_status", "website_leads", "status");
    await createIndex("idx_wl_vehicle", "website_leads", "vehicle_id");

    try {
      await conn.query(`ALTER TABLE vehicle_listings MODIFY COLUMN user_id VARCHAR(36) NOT NULL`);
    } catch (e: any) { if (!e.message?.includes("Unknown column")) throw e; }

    try {
      await conn.query(`ALTER TABLE website_leads MODIFY COLUMN user_id VARCHAR(36) NOT NULL`);
    } catch (e: any) { if (!e.message?.includes("Unknown column")) throw e; }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        id_number VARCHAR(20),
        tax_number VARCHAR(30),
        position VARCHAR(100),
        department VARCHAR(100),
        start_date DATE,
        employment_type ENUM('full_time','part_time','contract') NOT NULL DEFAULT 'full_time',
        basic_salary INT NOT NULL DEFAULT 0,
        age INT NOT NULL DEFAULT 30,
        uif_exempt TINYINT(1) NOT NULL DEFAULT 0,
        phone VARCHAR(30),
        email VARCHAR(255),
        address TEXT,
        bank_name VARCHAR(100),
        account_type VARCHAR(50),
        account_number VARCHAR(50),
        branch_code VARCHAR(20),
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_emp_user", "employees", "user_id");
    await createIndex("idx_emp_status", "employees", "status");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        employee_id VARCHAR(36) NOT NULL,
        pay_period VARCHAR(7) NOT NULL,
        pay_date DATE NOT NULL,
        basic_salary_cents INT NOT NULL DEFAULT 0,
        allowances_json TEXT NOT NULL DEFAULT '[]',
        deductions_json TEXT NOT NULL DEFAULT '[]',
        paye_cents INT NOT NULL DEFAULT 0,
        uif_employee_cents INT NOT NULL DEFAULT 0,
        uif_employer_cents INT NOT NULL DEFAULT 0,
        gross_pay_cents INT NOT NULL DEFAULT 0,
        net_pay_cents INT NOT NULL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(employee_id) REFERENCES employees(id)
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_pr_user", "payroll_runs", "user_id");
    await createIndex("idx_pr_employee", "payroll_runs", "employee_id");
    await createIndex("idx_pr_period", "payroll_runs", "pay_period");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS broker_clients (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(20),
        date_of_birth VARCHAR(20),
        gender VARCHAR(15),
        marital_status VARCHAR(20),
        email VARCHAR(255),
        phone VARCHAR(30),
        whatsapp VARCHAR(30),
        physical_address TEXT,
        postal_address TEXT,
        employment_status VARCHAR(50),
        employer_name VARCHAR(255),
        occupation VARCHAR(100),
        monthly_income_cents INT DEFAULT 0,
        dependants INT DEFAULT 0,
        risk_profile VARCHAR(15) DEFAULT 'medium',
        credit_score INT,
        policy_number VARCHAR(100),
        property_interest TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'prospect',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_bc_user", "broker_clients", "user_id");
    await createIndex("idx_bc_status", "broker_clients", "status");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS broker_client_documents (
        id VARCHAR(36) PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(50) NOT NULL DEFAULT 'other',
        file_data LONGTEXT NOT NULL,
        file_size INT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES broker_clients(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_bcd_client", "broker_client_documents", "client_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS campaign_contacts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company VARCHAR(255),
        phone VARCHAR(50),
        tags VARCHAR(500),
        status ENUM('subscribed','unsubscribed') DEFAULT 'subscribed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_ccontacts_user", "campaign_contacts", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        from_name VARCHAR(150),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        body_html LONGTEXT,
        template_key VARCHAR(50) DEFAULT 'blank',
        status ENUM('draft','scheduled','sending','sent','paused') DEFAULT 'draft',
        audience ENUM('all','tagged') DEFAULT 'all',
        audience_tag VARCHAR(150),
        scheduled_at DATETIME,
        sent_at DATETIME,
        total_recipients INT DEFAULT 0,
        sent_count INT DEFAULT 0,
        opened_count INT DEFAULT 0,
        clicked_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_campaigns_user", "campaigns", "user_id");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS campaign_sends (
        id VARCHAR(36) PRIMARY KEY,
        campaign_id VARCHAR(36) NOT NULL,
        contact_id VARCHAR(36),
        email VARCHAR(255) NOT NULL,
        status ENUM('pending','sent','failed','opened','clicked') DEFAULT 'pending',
        sent_at DATETIME,
        opened_at DATETIME,
        clicked_at DATETIME,
        error_message TEXT,
        FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await createIndex("idx_csends_campaign", "campaign_sends", "campaign_id");

    // Widen audience column to VARCHAR so broker_clients option is accepted
    try {
      await conn.query(`ALTER TABLE campaigns MODIFY COLUMN audience VARCHAR(50) NOT NULL DEFAULT 'all'`);
    } catch (e: any) {
      if (!e.message.includes("doesn't exist")) throw e;
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_email_settings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        provider VARCHAR(20) NOT NULL DEFAULT 'smtp',
        smtp_host VARCHAR(255),
        smtp_port INT DEFAULT 587,
        smtp_secure TINYINT(1) DEFAULT 0,
        smtp_user VARCHAR(255),
        smtp_pass_enc TEXT,
        from_name VARCHAR(150),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await addColumnIfMissing("invoices", "vat_enabled", "TINYINT(1) NOT NULL DEFAULT 0");
    await addColumnIfMissing("invoices", "vat_cents", "INT NOT NULL DEFAULT 0");
    await addColumnIfMissing("invoices", "customer_address", "TEXT NULL");
    await addColumnIfMissing("invoices", "customer_phone", "VARCHAR(50) NULL");
    await addColumnIfMissing("invoices", "reference", "VARCHAR(255) NULL");
    await addColumnIfMissing("invoices", "payment_terms", "VARCHAR(255) NULL");
    await addColumnIfMissing("invoices", "notes", "TEXT NULL");
    await addColumnIfMissing("invoices", "type", "VARCHAR(10) NOT NULL DEFAULT 'invoice'");
    await addColumnIfMissing("invoices", "template", "INT NOT NULL DEFAULT 1");
    await addColumnIfMissing("invoices", "template_config", "TEXT NULL");
    await addColumnIfMissing("business_profiles", "account_name", "VARCHAR(255) NULL");
    await addColumnIfMissing("business_profiles", "registration_number", "VARCHAR(100) NULL");

    await addColumnIfMissing("social_accounts", "facebook_user_id", "VARCHAR(50) NULL");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS meta_data_deletion_requests (
        id VARCHAR(36) PRIMARY KEY,
        confirmation_code VARCHAR(64) NOT NULL UNIQUE,
        facebook_user_id VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        deleted_accounts INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME NULL
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS compliance_documents (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        doc_type ENUM('FICA','BUSINESS_REG') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_data LONGTEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
        file_size INT NOT NULL DEFAULT 0,
        uploaded_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_doc_type (user_id, doc_type),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Reseller custom domain support
    await addColumnIfMissing("resellers", "custom_domain", "VARCHAR(255) NULL");
    await addColumnIfMissing("resellers", "domain_verified", "TINYINT(1) NOT NULL DEFAULT 0");
    try {
      await conn.query("CREATE UNIQUE INDEX IF NOT EXISTS uq_resellers_domain ON resellers(custom_domain)");
    } catch (_) {}

    // ── Automations: Money-In + CRM ─────────────────────────────────────────
    await addColumnIfMissing("invoices", "paid_at", "DATETIME NULL");
    await addColumnIfMissing("invoices", "recurring_id", "VARCHAR(36) NULL");
    await addColumnIfMissing("invoices", "valid_until", "DATE NULL");
    await addColumnIfMissing("invoices", "quote_followups_sent", "INT NOT NULL DEFAULT 0");
    await addColumnIfMissing("invoices", "last_quote_followup_at", "DATETIME NULL");
    await addColumnIfMissing("invoices", "quote_expiry_notified_at", "DATETIME NULL");
    await addColumnIfMissing("invoices", "late_fee_cents", "INT NOT NULL DEFAULT 0");
    await addColumnIfMissing("invoices", "late_fee_applied_at", "DATETIME NULL");
    await addColumnIfMissing("invoices", "thank_you_sent_at", "DATETIME NULL");

    await addColumnIfMissing("broker_clients", "client_since", "DATE NULL");
    await addColumnIfMissing("broker_clients", "company_anniversary", "DATE NULL");
    await addColumnIfMissing("broker_clients", "last_contacted_at", "DATETIME NULL");
    await addColumnIfMissing("broker_clients", "inactive_nudge_sent_at", "DATETIME NULL");
    await addColumnIfMissing("broker_clients", "last_birthday_msg_year", "INT NULL");
    await addColumnIfMissing("broker_clients", "last_anniversary_msg_year", "INT NULL");

    await addColumnIfMissing("website_leads", "autoreply_sent_at", "DATETIME NULL");
    await addColumnIfMissing("website_leads", "drip_step", "INT NOT NULL DEFAULT 0");
    await addColumnIfMissing("website_leads", "drip_last_sent_at", "DATETIME NULL");
    await addColumnIfMissing("website_leads", "drip_completed", "TINYINT(1) NOT NULL DEFAULT 0");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS automation_settings (
        user_id VARCHAR(36) PRIMARY KEY,
        thank_you_enabled TINYINT(1) NOT NULL DEFAULT 1,
        thank_you_subject VARCHAR(255) NOT NULL DEFAULT 'Thank you — payment received',
        thank_you_body TEXT NULL,
        late_fee_enabled TINYINT(1) NOT NULL DEFAULT 0,
        late_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
        late_fee_after_days INT NOT NULL DEFAULT 7,
        stop_credit_enabled TINYINT(1) NOT NULL DEFAULT 0,
        stop_credit_threshold_cents BIGINT NOT NULL DEFAULT 1000000,
        quote_expiry_days INT NOT NULL DEFAULT 30,
        quote_followup_enabled TINYINT(1) NOT NULL DEFAULT 1,
        quote_followup_after_days INT NOT NULL DEFAULT 5,
        quote_max_followups INT NOT NULL DEFAULT 2,
        quote_followup_subject VARCHAR(255) NOT NULL DEFAULT 'Following up on your quote',
        quote_followup_body TEXT NULL,
        lead_autoreply_enabled TINYINT(1) NOT NULL DEFAULT 1,
        lead_autoreply_subject VARCHAR(255) NOT NULL DEFAULT 'Thanks for reaching out',
        lead_autoreply_body TEXT NULL,
        drip_enabled TINYINT(1) NOT NULL DEFAULT 0,
        drip_emails_json TEXT NULL,
        inactive_nudge_enabled TINYINT(1) NOT NULL DEFAULT 0,
        inactive_nudge_after_days INT NOT NULL DEFAULT 90,
        inactive_nudge_subject VARCHAR(255) NOT NULL DEFAULT 'We miss you',
        inactive_nudge_body TEXT NULL,
        birthday_msg_enabled TINYINT(1) NOT NULL DEFAULT 0,
        birthday_msg_subject VARCHAR(255) NOT NULL DEFAULT 'Happy birthday from {{business}}!',
        birthday_msg_body TEXT NULL,
        anniversary_msg_enabled TINYINT(1) NOT NULL DEFAULT 0,
        anniversary_msg_subject VARCHAR(255) NOT NULL DEFAULT 'Happy anniversary!',
        anniversary_msg_body TEXT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS recurring_invoices (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NULL,
        customer_address TEXT NULL,
        customer_phone VARCHAR(50) NULL,
        reference VARCHAR(100) NULL,
        payment_terms VARCHAR(50) NULL,
        notes TEXT NULL,
        items_json TEXT NOT NULL,
        vat_enabled TINYINT(1) NOT NULL DEFAULT 0,
        vat_cents INT NOT NULL DEFAULT 0,
        total_cents INT NOT NULL DEFAULT 0,
        template INT NOT NULL DEFAULT 1,
        template_config TEXT NULL,
        frequency ENUM('weekly','monthly','quarterly','yearly','custom_days') NOT NULL DEFAULT 'monthly',
        custom_days INT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        next_run_at DATE NOT NULL,
        last_run_at DATETIME NULL,
        invoices_generated INT NOT NULL DEFAULT 0,
        active TINYINT(1) NOT NULL DEFAULT 1,
        auto_send TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        KEY idx_ri_user (user_id),
        KEY idx_ri_next_run (next_run_at, active)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS automation_log (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        target_id VARCHAR(36) NULL,
        recipient VARCHAR(255) NULL,
        message TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'sent',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_al_user_type (user_id, type, created_at)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        role VARCHAR(20) NOT NULL,
        content LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
        KEY idx_ai_msg_conv (conversation_id)
      ) ENGINE=InnoDB
    `);

    console.log("MySQL migrations completed successfully");
  } finally {
    conn.release();
  }
}
