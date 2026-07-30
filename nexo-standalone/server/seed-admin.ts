/**
 * Run this once to create your first admin account:
 *   npm run seed:admin
 *
 * It will prompt for email + password, then insert the user with role='admin'.
 */
import "dotenv/config";
import { createInterface } from "readline";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { pool } from "./db.js";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>(resolve => rl.question(q, resolve));

async function main() {
  console.log("\n=== Nexo Admin Seed ===\n");

  const email    = await ask("Admin email:    ");
  const fullName = await ask("Full name:      ");
  const password = await ask("Password:       ");

  if (!email || !password || !fullName) {
    console.error("All fields are required."); process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const now  = new Date().toISOString();
  const id   = randomUUID();

  const conn = await pool.getConnection();
  try {
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

    await conn.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
      [id, email.toLowerCase().trim(), hash, fullName.trim(), now, now]
    );
    console.log(`\n✓ Admin account created for ${email}\n  → Log in at /nexo and you'll be redirected to /nexo/admin\n`);
  } catch (err: any) {
    if (err.message?.includes("Duplicate")) {
      // Promote existing user
      await conn.query("UPDATE users SET role = 'admin' WHERE email = ?", [email.toLowerCase().trim()]);
      console.log(`\n✓ Existing user ${email} promoted to admin.\n`);
    } else {
      console.error("Error:", err.message);
    }
  } finally {
    conn.release();
    rl.close();
    process.exit(0);
  }
}

main();
