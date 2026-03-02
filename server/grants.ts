import { Router } from "express";
import { queryOne, execute } from "./db";
import { requireAuth } from "./auth";

export const grantsRouter = Router();
grantsRouter.use(requireAuth);

grantsRouter.get("/readiness", async (req, res) => {
  try {
    const userId = req.session.userId!;

    const [readiness, profile, invoiceCountRow, ledgerCountRow] = await Promise.all([
      queryOne("SELECT * FROM grant_readiness WHERE user_id = ?", [userId]),
      queryOne("SELECT * FROM business_profiles WHERE user_id = ?", [userId]),
      queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ?", [userId]),
      queryOne("SELECT COUNT(*) as c FROM ledger_entries WHERE user_id = ?", [userId]),
    ]);

    const invoiceCount = invoiceCountRow?.c || 0;
    const ledgerCount = ledgerCountRow?.c || 0;

    const autoChecks = {
      profileComplete: profile && profile.business_name && profile.business_type && profile.phone,
      popiaConsent: profile?.popia_consent === 1,
      hasInvoices: invoiceCount >= 1,
      hasRecords: ledgerCount >= 10,
      hasBankDetails: profile?.bank_name && profile?.account_number,
      hasCipc: !!profile?.cipc_number,
    };

    const items = [
      { key: "id_verified", label: "ID / Passport Verified", section: "Identity & Registration", manual: true, checked: readiness?.id_verified === 1 },
      { key: "business_registered", label: "Business Registered (CIPC)", section: "Identity & Registration", manual: true, checked: readiness?.business_registered === 1 || autoChecks.hasCipc },
      { key: "popia_consent", label: "POPIA Consent Given", section: "Identity & Registration", manual: false, checked: autoChecks.popiaConsent },
      { key: "profile_complete", label: "Business Profile Complete", section: "Identity & Registration", manual: false, checked: autoChecks.profileComplete },
      { key: "tax_number", label: "Tax Number Provided", section: "Tax & Compliance", manual: true, checked: !!readiness?.tax_number },
      { key: "vat_registered", label: "VAT Registered", section: "Tax & Compliance", manual: true, checked: readiness?.vat_registered === 1 },
      { key: "bank_account_provided", label: "Bank Account Verified", section: "Banking", manual: true, checked: readiness?.bank_account_provided === 1 || autoChecks.hasBankDetails },
      { key: "has_invoices", label: "At Least 1 Invoice Created", section: "Records", manual: false, checked: autoChecks.hasInvoices },
      { key: "six_months_records", label: "6 Months Financial Records", section: "Records", manual: true, checked: readiness?.six_months_records === 1 },
      { key: "has_ledger", label: "10+ Ledger Entries Logged", section: "Records", manual: false, checked: autoChecks.hasRecords },
    ];

    const completedCount = items.filter((i) => i.checked).length;
    const readinessPercent = Math.round((completedCount / items.length) * 100);

    res.json({ items, readinessPercent, completedCount, totalCount: items.length, savedData: readiness || null });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch readiness" });
  }
});

grantsRouter.post("/readiness", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const now = new Date().toISOString();
    const data = req.body;

    const existing = await queryOne("SELECT user_id FROM grant_readiness WHERE user_id = ?", [userId]);

    if (existing) {
      await execute(
        `UPDATE grant_readiness SET
          id_verified = ?, business_registered = ?, tax_number = ?,
          vat_registered = ?, bank_account_provided = ?, six_months_records = ?,
          updated_at = ?
         WHERE user_id = ?`,
        [
          data.id_verified ? 1 : 0,
          data.business_registered ? 1 : 0,
          data.tax_number || null,
          data.vat_registered ? 1 : 0,
          data.bank_account_provided ? 1 : 0,
          data.six_months_records ? 1 : 0,
          now,
          userId
        ]
      );
    } else {
      await execute(
        `INSERT INTO grant_readiness (user_id, id_verified, business_registered, tax_number, vat_registered, bank_account_provided, six_months_records, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.id_verified ? 1 : 0,
          data.business_registered ? 1 : 0,
          data.tax_number || null,
          data.vat_registered ? 1 : 0,
          data.bank_account_provided ? 1 : 0,
          data.six_months_records ? 1 : 0,
          now,
          now
        ]
      );
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save readiness" });
  }
});
