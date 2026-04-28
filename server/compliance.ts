import { Router } from "express";
import { queryOne } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";

export const complianceRouter = Router();
complianceRouter.use(requireAuth);

complianceRouter.get("/score", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);

    const profile = await queryOne("SELECT * FROM business_profiles WHERE user_id = ?", [userId]);
    const website = await queryOne("SELECT id FROM websites WHERE owner_id = ? AND status = 'published' LIMIT 1", [userId]);
    const invoiceCount = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ?", [userId]))?.c || 0;
    const ledgerCount = (await queryOne("SELECT COUNT(*) as c FROM ledger_entries WHERE user_id = ?", [userId]))?.c || 0;

    const profileComplete = profile && profile.business_name && profile.business_type && profile.industry_sector && profile.phone;
    const popiaConsent = profile?.popia_consent === 1;

    let socialPostCount = 0;
    try {
      const wsMember = await queryOne("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1", [userId]);
      if (wsMember) {
        socialPostCount = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ?", [wsMember.workspace_id]))?.c || 0;
      }
    } catch {}

    const items = [
      { key: "popia", label: "POPIA consent completed", points: 10, completed: popiaConsent, link: "/register" },
      { key: "profile", label: "Business profile completed", points: 20, completed: !!profileComplete, link: "/dashboard/settings" },
      { key: "website", label: "Website published", points: 20, completed: !!website, link: "/dashboard/website" },
      { key: "invoices", label: "At least 1 invoice created", points: 20, completed: invoiceCount >= 1, link: "/dashboard/invoices" },
      { key: "ledger", label: "At least 10 ledger entries logged", points: 20, completed: ledgerCount >= 10, link: "/dashboard/finance" },
      { key: "social", label: "At least 3 social posts created", points: 10, completed: socialPostCount >= 3, link: "/dashboard/social" },
    ];

    const score = items.reduce((sum, item) => sum + (item.completed ? item.points : 0), 0);
    const nextSteps = items.filter((i) => !i.completed).map((i) => ({
      label: i.label,
      points: i.points,
      link: i.link,
    }));

    res.json({ score, items, nextSteps });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to calculate compliance score" });
  }
});
