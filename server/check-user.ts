import { createPool } from "mysql2/promise";

async function main() {
  const pool = createPool({
    host: process.env.XNEELO_DB_HOST,
    port: Number(process.env.XNEELO_DB_PORT || 3306),
    user: process.env.XNEELO_DB_USER,
    password: process.env.XNEELO_DB_PASSWORD,
    database: process.env.XNEELO_DB_NAME,
  });

  // Search broadly for any "info@" or "mybusines" variation
  const [rows] = await pool.execute(`
    SELECT u.id, u.email, u.full_name, u.role, u.subscription_exempt,
           bp.code as plan_code, bp.name as plan_name,
           bs.status, bs.trial_end_at, bs.cancelled_at
    FROM users u
    LEFT JOIN workspace_members wm ON wm.user_id = u.id
    LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id
    LEFT JOIN billing_plans bp ON bp.id = bs.plan_id
    WHERE u.email LIKE '%mybusines%' OR u.email LIKE 'info@%'
    ORDER BY u.created_at DESC
    LIMIT 20
  `);

  console.log(JSON.stringify(rows, null, 2));
  await pool.end();
}

main().catch(console.error);
