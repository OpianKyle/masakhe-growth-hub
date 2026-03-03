import { Request, Response, NextFunction, Router } from "express";
import { queryOne, execute } from "./db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./email";

export const authRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, businessData } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, fullName, now, now]
    );

    if (businessData) {
      const profileId = randomUUID();
      await execute(
        `INSERT INTO business_profiles (id, user_id, business_name, trading_name, business_status, business_type, industry_sector,
          years_operating, employee_count, sa_id, cipc_number, phone, whatsapp, email, physical_address,
          bank_name, account_type, account_number, branch_code, popia_consent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId, userId,
          businessData.businessName || null,
          businessData.tradingName || null,
          businessData.businessStatus || null,
          businessData.businessType || null,
          businessData.industrySector || null,
          businessData.yearsOperating || null,
          businessData.employeeCount || null,
          businessData.saId || null,
          businessData.cipcNumber || null,
          businessData.phone || null,
          businessData.whatsapp || null,
          businessData.email || email,
          businessData.physicalAddress || null,
          businessData.bankName || null,
          businessData.accountType || null,
          businessData.accountNumber || null,
          businessData.branchCode || null,
          businessData.popiaConsent ? 1 : 0,
          now, now
        ]
      );
    }

    req.session.userId = userId;
    req.session.save(async () => {
      const user = await queryOne("SELECT id, email, full_name, role, created_at FROM users WHERE id = ?", [userId]);
      sendWelcomeEmail(email.toLowerCase(), fullName).catch(() => {});
      res.json({ ok: true, user });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.userId = user.id;
    req.session.save(() => {
      res.json({
        ok: true,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, created_at: user.created_at }
      });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

authRouter.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    return res.json({ user: null });
  }

  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
            bp.business_name, bp.trading_name, bp.business_status, bp.industry_sector,
            bp.business_type, bp.years_operating, bp.employee_count, bp.phone, bp.whatsapp,
            bp.email as bp_email, bp.physical_address, bp.bank_name, bp.account_type,
            bp.account_number, bp.branch_code, bp.sa_id, bp.cipc_number, bp.logo_url
     FROM users u
     LEFT JOIN business_profiles bp ON bp.user_id = u.id
     WHERE u.id = ?`,
    [req.session.userId]
  );

  if (!user) {
    return res.json({ user: null });
  }
  res.json({ user });
});
