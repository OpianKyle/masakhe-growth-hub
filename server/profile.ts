import { Router } from "express";
import { queryOne, execute } from "./db";
import { requireAuth } from "./auth";
import multer from "multer";
import path from "path";

export const profileRouter = Router();
profileRouter.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: jpg, png, gif, webp, svg"));
    }
  },
});

profileRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT id, email, full_name, role, created_at FROM users WHERE id = ?", [userId]);
    const profile = await queryOne("SELECT * FROM business_profiles WHERE user_id = ?", [userId]);
    res.json({ user, profile });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

profileRouter.put("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { fullName, businessName, tradingName, businessStatus, businessType, industrySector,
            yearsOperating, employeeCount, phone, whatsapp, email, physicalAddress,
            bankName, accountName, accountType, accountNumber, branchCode, saId, cipcNumber,
            registrationNumber } = req.body;

    const now = new Date().toISOString();

    if (fullName) {
      await execute("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?", [fullName, now, userId]);
    }

    const existing = await queryOne("SELECT id FROM business_profiles WHERE user_id = ?", [userId]);

    if (existing) {
      await execute(
        `UPDATE business_profiles SET
          business_name = ?, trading_name = ?, business_status = ?, business_type = ?,
          industry_sector = ?, years_operating = ?, employee_count = ?,
          phone = ?, whatsapp = ?, email = ?, physical_address = ?,
          bank_name = ?, account_name = ?, account_type = ?, account_number = ?, branch_code = ?,
          sa_id = ?, cipc_number = ?, registration_number = ?, updated_at = ?
         WHERE user_id = ?`,
        [
          businessName || null, tradingName || null, businessStatus || null, businessType || null,
          industrySector || null, yearsOperating || null, employeeCount || null,
          phone || null, whatsapp || null, email || null, physicalAddress || null,
          bankName || null, accountName || null, accountType || null, accountNumber || null, branchCode || null,
          saId || null, cipcNumber || null, registrationNumber || null, now, userId
        ]
      );
    } else {
      const { randomUUID } = await import("crypto");
      await execute(
        `INSERT INTO business_profiles (id, user_id, business_name, trading_name, business_status, business_type,
          industry_sector, years_operating, employee_count, phone, whatsapp, email, physical_address,
          bank_name, account_name, account_type, account_number, branch_code, sa_id, cipc_number,
          registration_number, popia_consent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          randomUUID(), userId,
          businessName || null, tradingName || null, businessStatus || null, businessType || null,
          industrySector || null, yearsOperating || null, employeeCount || null,
          phone || null, whatsapp || null, email || null, physicalAddress || null,
          bankName || null, accountName || null, accountType || null, accountNumber || null, branchCode || null,
          saId || null, cipcNumber || null, registrationNumber || null, now, now
        ]
      );
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
});

profileRouter.post("/logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = req.session.userId!;
    const mimeType = req.file.mimetype || "image/png";
    const base64 = req.file.buffer.toString("base64");
    const logoUrl = `data:${mimeType};base64,${base64}`;
    const now = new Date().toISOString();

    const existing = await queryOne("SELECT id FROM business_profiles WHERE user_id = ?", [userId]);

    if (existing) {
      await execute("UPDATE business_profiles SET logo_url = ?, updated_at = ? WHERE user_id = ?", [logoUrl, now, userId]);
    } else {
      const { randomUUID } = await import("crypto");
      await execute(
        `INSERT INTO business_profiles (id, user_id, logo_url, popia_consent, created_at, updated_at)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [randomUUID(), userId, logoUrl, now, now]
      );
    }

    res.json({ ok: true, logoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload logo" });
  }
});

profileRouter.delete("/logo", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const now = new Date().toISOString();
    await execute("UPDATE business_profiles SET logo_url = NULL, updated_at = ? WHERE user_id = ?", [now, userId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to remove logo" });
  }
});
