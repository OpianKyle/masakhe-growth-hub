import { Router, Request, Response } from "express";
import { queryOne, queryAll, execute } from "./db";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function requireAuth(req: any, res: any, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

export const documentsRouter = Router();

// ─── BUSINESS PLANS ─────────────────────────────────────────────────────────

documentsRouter.get("/business-plans", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, status, created_at, updated_at FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC",
      [req.session.userId!]
    );
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/business-plans", requireAuth, async (req, res) => {
  try {
    const { title, formData } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO business_plans (id, user_id, title, form_data, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
      [id, req.session.userId!, title || "Untitled Business Plan", JSON.stringify(formData || {}), "draft", now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/business-plans/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), generated_content: JSON.parse(row.generated_content || "null") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/business-plans/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT id FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const { title, formData } = req.body;
    await execute(
      "UPDATE business_plans SET title = ?, form_data = ?, updated_at = ? WHERE id = ?",
      [title || "Untitled Business Plan", JSON.stringify(formData || {}), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/business-plans/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/business-plans/:id/generate", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const fd = JSON.parse(row.form_data || "{}");

    const prompt = `You are an expert South African business consultant. Write a comprehensive, professional business plan for a South African SMME based on the following information. Return a JSON object with exactly these keys: executiveSummary, companyOverview, marketAnalysis, productsServices, marketingStrategy, operationsPlan, financialPlan, fundingRequirements. Each value should be 2-5 paragraphs of well-written professional text appropriate for presentation to banks, investors, or the SEDA/SEFA/IDC.

Business Information:
- Business Name: ${fd.businessName || "N/A"}
- Registration Number: ${fd.registrationNumber || "N/A"}
- Industry: ${fd.industry || "N/A"}
- Founder/Owner: ${fd.founderName || "N/A"}
- Description: ${fd.businessDescription || "N/A"}
- Problem Solved: ${fd.problemSolved || "N/A"}
- Target Market: ${fd.targetMarket || "N/A"}
- Products/Services: ${fd.productsServices || "N/A"}
- Revenue Model: ${fd.revenueModel || "N/A"}
- Competitors: ${fd.competitors || "N/A"}
- Marketing Strategy: ${fd.marketingStrategy || "N/A"}
- Operations Plan: ${fd.operationsPlan || "N/A"}
- Team Members: ${fd.teamMembers || "N/A"}
- Funding Required: R${fd.fundingRequired || "0"}
- Year 1 Projection: R${fd.projectionYear1 || "0"}
- Year 2 Projection: R${fd.projectionYear2 || "0"}
- Year 3 Projection: R${fd.projectionYear3 || "0"}

Return ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0]?.message?.content || "{}");
    await execute(
      "UPDATE business_plans SET generated_content = ?, status = 'generated', updated_at = ? WHERE id = ?",
      [JSON.stringify(content), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── FUNDING PROPOSALS ───────────────────────────────────────────────────────

documentsRouter.get("/funding-proposals", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, status, created_at, updated_at FROM funding_proposals WHERE user_id = ? ORDER BY updated_at DESC",
      [req.session.userId!]
    );
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/funding-proposals", requireAuth, async (req, res) => {
  try {
    const { title, formData } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO funding_proposals (id, user_id, title, form_data, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
      [id, req.session.userId!, title || "Untitled Funding Proposal", JSON.stringify(formData || {}), "draft", now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/funding-proposals/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), generated_content: JSON.parse(row.generated_content || "null") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/funding-proposals/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT id FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const { title, formData } = req.body;
    await execute(
      "UPDATE funding_proposals SET title = ?, form_data = ?, updated_at = ? WHERE id = ?",
      [title || "Untitled Funding Proposal", JSON.stringify(formData || {}), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/funding-proposals/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/funding-proposals/:id/generate", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const fd = JSON.parse(row.form_data || "{}");

    const prompt = `You are an expert South African funding consultant familiar with SEFA, IDC, NEF, SEDA and government SMME funding programmes. Write a professional funding proposal based on the following information. Return a JSON object with exactly these keys: coverPage, executiveSummary, businessOverview, problemOpportunity, fundingRequest, useOfFunds, economicImpact, financialSummary, closingStatement. Each value should be 2-4 paragraphs of compelling, professional text.

Proposal Information:
- Business Name: ${fd.businessName || "N/A"}
- Owner Name: ${fd.ownerName || "N/A"}
- Funding Amount: R${fd.fundingAmount || "0"}
- Purpose of Funding: ${fd.purposeOfFunding || "N/A"}
- Expected Impact: ${fd.expectedImpact || "N/A"}
- Business Stage: ${fd.businessStage || "N/A"}
- Jobs to be Created: ${fd.jobsToCreate || "0"}
- Monthly Revenue: R${fd.monthlyRevenue || "0"}
- Monthly Expenses: R${fd.monthlyExpenses || "0"}
- Growth Plan: ${fd.growthPlan || "N/A"}
- Government Programme: ${fd.governmentProgram || "N/A"}

Return ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0]?.message?.content || "{}");
    await execute(
      "UPDATE funding_proposals SET generated_content = ?, status = 'generated', updated_at = ? WHERE id = ?",
      [JSON.stringify(content), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── FINANCIAL STATEMENTS ────────────────────────────────────────────────────

documentsRouter.get("/financial-statements", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, financial_year, created_at, updated_at FROM financial_statements WHERE user_id = ? ORDER BY financial_year DESC",
      [req.session.userId!]
    );
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/financial-statements", requireAuth, async (req, res) => {
  try {
    const { formData } = req.body;
    const fd = formData || {};
    const year = fd.financialYear || new Date().getFullYear();
    const id = randomUUID();
    const now = new Date().toISOString();

    const revenue = Number(fd.totalRevenue) || 0;
    const costOfSales = Number(fd.costOfSales) || 0;
    const opEx = Number(fd.operatingExpenses) || 0;
    const salaries = Number(fd.salaries) || 0;
    const taxes = Number(fd.taxes) || 0;
    const assets = Number(fd.assets) || 0;
    const liabilities = Number(fd.liabilities) || 0;
    const equity = Number(fd.equity) || 0;

    const grossProfit = revenue - costOfSales;
    const ebitda = grossProfit - opEx - salaries;
    const netProfit = ebitda - taxes;
    const totalExpenses = costOfSales + opEx + salaries + taxes;
    const netEquity = assets - liabilities;

    const computed = { revenue, costOfSales, opEx, salaries, taxes, assets, liabilities, equity, grossProfit, ebitda, netProfit, totalExpenses, netEquity };

    await execute(
      "INSERT INTO financial_statements (id, user_id, financial_year, title, form_data, computed, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
      [id, req.session.userId!, year, `Annual Statement ${year}`, JSON.stringify(fd), JSON.stringify(computed), now, now]
    );
    res.json({ id, computed });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/financial-statements/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM financial_statements WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), computed: JSON.parse(row.computed || "{}") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/financial-statements/:id", requireAuth, async (req, res) => {
  try {
    const { formData } = req.body;
    const fd = formData || {};
    const revenue = Number(fd.totalRevenue) || 0;
    const costOfSales = Number(fd.costOfSales) || 0;
    const opEx = Number(fd.operatingExpenses) || 0;
    const salaries = Number(fd.salaries) || 0;
    const taxes = Number(fd.taxes) || 0;
    const assets = Number(fd.assets) || 0;
    const liabilities = Number(fd.liabilities) || 0;
    const equity = Number(fd.equity) || 0;
    const grossProfit = revenue - costOfSales;
    const ebitda = grossProfit - opEx - salaries;
    const netProfit = ebitda - taxes;
    const totalExpenses = costOfSales + opEx + salaries + taxes;
    const netEquity = assets - liabilities;
    const computed = { revenue, costOfSales, opEx, salaries, taxes, assets, liabilities, equity, grossProfit, ebitda, netProfit, totalExpenses, netEquity };
    await execute(
      "UPDATE financial_statements SET form_data = ?, computed = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [JSON.stringify(fd), JSON.stringify(computed), new Date().toISOString(), req.params.id, req.session.userId!]
    );
    res.json({ ok: true, computed });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/financial-statements/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM financial_statements WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
