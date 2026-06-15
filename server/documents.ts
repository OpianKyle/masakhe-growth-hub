import { Router, Request, Response } from "express";
import { queryOne, queryAll, execute } from "./db";
import { randomUUID } from "crypto";
import OpenAI from "openai";

function getOpenAI() {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: { "HTTP-Referer": process.env.APP_URL || "https://masakheportal.co.za", "X-Title": "Masakhe" },
    });
  }
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) throw new Error("No AI API key configured. Please add OPENROUTER_API_KEY or OPENAI_API_KEY to your environment secrets.");
  const opts: ConstructorParameters<typeof OpenAI>[0] = { apiKey };
  if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    opts.baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  }
  return new OpenAI(opts);
}

function getModel() {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash";
  }
  return process.env.AI_MODEL || "gpt-4o-mini";
}

function requireAuth(req: any, res: any, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function safeJsonParse(raw: string): any {
  let text = (raw || "{}").trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
  }
  text = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
             .replace(/\n/g, "\\n")
             .replace(/\r/g, "\\r")
             .replace(/\t/g, "\\t");
  try {
    return JSON.parse(text);
  } catch {
    const fixed = text.replace(/\\n/g, " ").replace(/\\r/g, "").replace(/\\t/g, " ");
    return JSON.parse(fixed);
  }
}

export const documentsRouter = Router();

// ─── BUSINESS PLANS ─────────────────────────────────────────────────────────

documentsRouter.get("/business-plans", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, status, created_at, updated_at FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC",
      [getDataOwnerId(req)]
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
      [id, getDataOwnerId(req), title || "Untitled Business Plan", JSON.stringify(formData || {}), "draft", now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/business-plans/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), generated_content: JSON.parse(row.generated_content || "null") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/business-plans/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT id FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
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
    await execute("DELETE FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/business-plans/:id/generate", requireAuth, async (req, res) => {
  try {
    console.log(`[generate] business-plan ${req.params.id} using model: ${getModel()}`);
    const row = await queryOne("SELECT * FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const fd = JSON.parse(row.form_data || "{}");

    const prompt = `You are an expert South African business consultant. Write a comprehensive, professional business plan for a South African SMME based on the following information.

CRITICAL FORMATTING RULES:
- Return a JSON object with EXACTLY these keys: executiveSummary, companyOverview, marketAnalysis, productsServices, marketingStrategy, operationsPlan, financialPlan, fundingRequirements
- Every value MUST be a plain text STRING — 2 to 5 paragraphs of prose separated by newline characters
- Do NOT nest objects inside any value. Do NOT use arrays. Every value must be a flat string of text.
- Example of CORRECT format: { "executiveSummary": "Paragraph one text here.\n\nParagraph two text here." }
- Example of WRONG format: { "executiveSummary": { "overview": "...", "mission": "..." } }

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

Return ONLY valid JSON where every value is a plain text string.`;

    const completion = await getOpenAI().chat.completions.create({
      model: getModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = safeJsonParse(completion.choices[0]?.message?.content || "{}");
    await execute(
      "UPDATE business_plans SET generated_content = ?, status = 'generated', updated_at = ? WHERE id = ?",
      [JSON.stringify(content), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, content });
  } catch (err: any) { console.error("[generate] business-plan error:", err.message); res.status(500).json({ error: err.message }); }
});

// ─── FUNDING PROPOSALS ───────────────────────────────────────────────────────

documentsRouter.get("/funding-proposals", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, status, created_at, updated_at FROM funding_proposals WHERE user_id = ? ORDER BY updated_at DESC",
      [getDataOwnerId(req)]
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
      [id, getDataOwnerId(req), title || "Untitled Funding Proposal", JSON.stringify(formData || {}), "draft", now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/funding-proposals/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), generated_content: JSON.parse(row.generated_content || "null") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/funding-proposals/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT id FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
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
    await execute("DELETE FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/funding-proposals/:id/generate", requireAuth, async (req, res) => {
  try {
    console.log(`[generate] funding-proposal ${req.params.id} using model: ${getModel()}`);
    const row = await queryOne("SELECT * FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const fd = JSON.parse(row.form_data || "{}");

    const prompt = `You are an expert South African funding consultant familiar with SEFA, IDC, NEF, SEDA and government SMME funding programmes. Write a professional funding proposal based on the following information.

CRITICAL FORMATTING RULES:
- Return a JSON object with EXACTLY these keys: coverPage, executiveSummary, businessOverview, problemOpportunity, fundingRequest, useOfFunds, economicImpact, financialSummary, closingStatement
- Every value MUST be a plain text STRING — 2 to 4 paragraphs of prose separated by newline characters
- Do NOT nest objects inside any value. Do NOT use arrays. Every value must be a flat string of text.
- Example of CORRECT format: { "coverPage": "Cover page text here.\n\nConfidential document prepared for XYZ.", "executiveSummary": "Summary paragraph one.\n\nSummary paragraph two." }
- Example of WRONG format: { "coverPage": { "businessName": "...", "date": "..." } }

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

Return ONLY valid JSON where every value is a plain text string.`;

    const completion = await getOpenAI().chat.completions.create({
      model: getModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = safeJsonParse(completion.choices[0]?.message?.content || "{}");
    await execute(
      "UPDATE funding_proposals SET generated_content = ?, status = 'generated', updated_at = ? WHERE id = ?",
      [JSON.stringify(content), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, content });
  } catch (err: any) { console.error("[generate] funding-proposal error:", err.message); res.status(500).json({ error: err.message }); }
});

// ─── FINANCIAL STATEMENTS ────────────────────────────────────────────────────

documentsRouter.get("/financial-statements", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT id, title, financial_year, created_at, updated_at FROM financial_statements WHERE user_id = ? ORDER BY financial_year DESC",
      [getDataOwnerId(req)]
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
      [id, getDataOwnerId(req), year, `Annual Statement ${year}`, JSON.stringify(fd), JSON.stringify(computed), now, now]
    );
    res.json({ id, computed });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/financial-statements/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM financial_statements WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
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
      [JSON.stringify(fd), JSON.stringify(computed), new Date().toISOString(), req.params.id, getDataOwnerId(req)]
    );
    res.json({ ok: true, computed });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/financial-statements/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM financial_statements WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── COMPANIES ───────────────────────────────────────────────────────────────

documentsRouter.get("/companies", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll("SELECT * FROM companies WHERE user_id = ? ORDER BY updated_at DESC", [getDataOwnerId(req)]);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/companies", requireAuth, async (req, res) => {
  try {
    const { companyName, registrationNumber, companyType, registrationDate, status, directors, address, financialYearEnd } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO companies (id, user_id, company_name, registration_number, company_type, registration_date, status, directors, address, financial_year_end, is_verified, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?)`,
      [id, getDataOwnerId(req), companyName, registrationNumber || null, companyType || null, registrationDate || null, status || "Active", directors || null, address || null, financialYearEnd || null, now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/companies/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM companies WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/companies/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT id FROM companies WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const { companyName, registrationNumber, companyType, registrationDate, status, directors, address, financialYearEnd } = req.body;
    await execute(
      `UPDATE companies SET company_name=?, registration_number=?, company_type=?, registration_date=?, status=?, directors=?, address=?, financial_year_end=?, updated_at=? WHERE id=?`,
      [companyName, registrationNumber || null, companyType || null, registrationDate || null, status || "Active", directors || null, address || null, financialYearEnd || null, new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/companies/:id/verify", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM companies WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });

    if (!row.registration_number) {
      return res.status(400).json({ error: "A CIPC registration number is required before verification. Please edit the company and add it." });
    }

    const cipcRegex = /^(\d{4})\/(\d{6})\/(\d{2})$/;
    const match = (row.registration_number as string).trim().match(cipcRegex);
    if (!match) {
      return res.status(400).json({ error: `Invalid CIPC registration number format. Expected format: YYYY/NNNNNN/NN (e.g. 2024/123456/07). Got: "${row.registration_number}"` });
    }

    const [, yearStr, , suffix] = match;
    const year = parseInt(yearStr);
    const currentYear = new Date().getFullYear();
    if (year < 1910 || year > currentYear) {
      return res.status(400).json({ error: `Registration year ${year} is invalid. Must be between 1910 and ${currentYear}.` });
    }

    const formatChecks: string[] = [`Registration number format valid: ${row.registration_number}`, `Registration year ${year} is within valid range`];
    const formatIssues: string[] = [];

    const suffixTypeMap: Record<string, string> = {
      "07": "Private Company (Pty) Ltd", "06": "Public Company (Ltd)",
      "08": "Non-Profit Company (NPC)", "10": "Personal Liability Company",
      "21": "Close Corporation (CC)", "23": "External Company",
    };
    if (suffixTypeMap[suffix]) {
      const expectedType = suffixTypeMap[suffix];
      const companyType: string = row.company_type || "";
      if (companyType && !companyType.toLowerCase().includes(expectedType.split(" ")[0].toLowerCase())) {
        formatIssues.push(`Registration suffix /${suffix} is for ${expectedType}, but company type is listed as "${companyType}"`);
      } else {
        formatChecks.push(`Registration suffix /${suffix} matches company type`);
      }
    }
    if (row.status !== "Active") {
      formatIssues.push(`Company status is "${row.status}" — only Active companies are in good standing`);
    } else {
      formatChecks.push("Company status is Active");
    }
    if (row.registration_date) {
      const regYear = new Date(row.registration_date).getFullYear();
      if (regYear === year) {
        formatChecks.push(`Registration date year (${regYear}) matches registration number year`);
      } else if (Math.abs(regYear - year) > 1) {
        formatIssues.push(`Registration date year (${regYear}) does not match registration number year (${year})`);
      }
    }

    const aiPrompt = `You are a South African CIPC company verification assistant performing a consistency check (NOT a live CIPC database lookup).

Company Name: ${row.company_name}
Registration Number: ${row.registration_number}
Company Type: ${row.company_type || "Not specified"}
Registration Date: ${row.registration_date || "Not specified"}
Status: ${row.status || "Not specified"}
Directors/Members: ${row.directors || "Not specified"}
Registered Address: ${row.address || "Not specified"}

Check for consistency issues only. Examples:
- Does "(Pty) Ltd" or "(Pty)(Ltd)" appear in the name for a private company?
- Do director names appear plausible (no obvious placeholder text like "John Doe")?
- Does the address seem like a real South African address?
- Any other obvious inconsistencies?

Important: Do NOT fabricate checks against a real database. Only check what is provided.

Respond ONLY in JSON:
{
  "passed": true or false,
  "checks": ["list of things that look correct"],
  "issues": ["list of inconsistencies or concerns — empty array if none"],
  "summary": "1-2 sentence plain English summary of verification result"
}`;

    const aiRes = await getOpenAI().chat.completions.create({
      model: getModel(),
      messages: [{ role: "user", content: aiPrompt }],
      response_format: { type: "json_object" },
    });
    const aiResult = JSON.parse(aiRes.choices[0].message.content || "{}");

    const allIssues = [...formatIssues, ...(aiResult.issues || [])];
    const allChecks = [...formatChecks, ...(aiResult.checks || [])];
    const verified = formatIssues.length === 0 && aiResult.passed !== false;

    const verificationDetails = {
      verified,
      registrationNumber: row.registration_number,
      checks: allChecks,
      issues: allIssues,
      summary: aiResult.summary || (verified ? "Company details are consistent and well-formed." : "Verification failed due to inconsistencies."),
      verifiedAt: new Date().toISOString(),
      disclaimer: "This is a format and consistency check only. It is not an official live CIPC database lookup.",
    };

    await execute(
      "UPDATE companies SET is_verified=?, verification_details=?, updated_at=? WHERE id=?",
      [verified ? 1 : 0, JSON.stringify(verificationDetails), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, verified, verificationDetails });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/companies/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM companies WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── FUNDING APPLICATIONS ────────────────────────────────────────────────────

documentsRouter.get("/funding-applications", requireAuth, async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT fa.*, c.company_name FROM funding_applications fa
       LEFT JOIN companies c ON fa.company_id = c.id
       WHERE fa.user_id = ? ORDER BY fa.updated_at DESC`,
      [getDataOwnerId(req)]
    );
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/funding-applications", requireAuth, async (req, res) => {
  try {
    const { program, companyId, businessPlanId, financialStatementId, fundingProposalId, formData } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO funding_applications (id, user_id, program, company_id, business_plan_id, financial_statement_id, funding_proposal_id, form_data, status, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, getDataOwnerId(req), program, companyId || null, businessPlanId || null, financialStatementId || null, fundingProposalId || null, JSON.stringify(formData || {}), "draft", now, now]
    );
    res.json({ id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.get("/funding-applications/:id", requireAuth, async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM funding_applications WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, form_data: JSON.parse(row.form_data || "{}"), generated_content: JSON.parse(row.generated_content || "null") });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.put("/funding-applications/:id", requireAuth, async (req, res) => {
  try {
    const { formData, program, companyId, businessPlanId, financialStatementId, fundingProposalId } = req.body;
    await execute(
      `UPDATE funding_applications SET program=?, company_id=?, business_plan_id=?, financial_statement_id=?, funding_proposal_id=?, form_data=?, updated_at=? WHERE id=? AND user_id=?`,
      [program, companyId || null, businessPlanId || null, financialStatementId || null, fundingProposalId || null, JSON.stringify(formData || {}), new Date().toISOString(), req.params.id, getDataOwnerId(req)]
    );
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.delete("/funding-applications/:id", requireAuth, async (req, res) => {
  try {
    await execute("DELETE FROM funding_applications WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

documentsRouter.post("/funding-applications/:id/generate", requireAuth, async (req, res) => {
  try {
    const appRow = await queryOne("SELECT * FROM funding_applications WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!appRow) return res.status(404).json({ error: "Not found" });
    const fd = JSON.parse(appRow.form_data || "{}");

    let companyData: any = {};
    let planData: any = {};
    let statementData: any = {};
    let proposalData: any = {};

    if (appRow.company_id) {
      const c = await queryOne("SELECT * FROM companies WHERE id=?", [appRow.company_id]);
      if (c) companyData = c;
    }
    if (appRow.business_plan_id) {
      const p = await queryOne("SELECT * FROM business_plans WHERE id=?", [appRow.business_plan_id]);
      if (p) planData = JSON.parse(p.form_data || "{}");
    }
    if (appRow.financial_statement_id) {
      const s = await queryOne("SELECT * FROM financial_statements WHERE id=?", [appRow.financial_statement_id]);
      if (s) statementData = JSON.parse(s.computed || "{}");
    }
    if (appRow.funding_proposal_id) {
      const pr = await queryOne("SELECT * FROM funding_proposals WHERE id=?", [appRow.funding_proposal_id]);
      if (pr) proposalData = JSON.parse(pr.form_data || "{}");
    }

    const programDetails: Record<string, string> = {
      SEFA: "Small Enterprise Finance Agency (SEFA) — provides financial products for SMMEs in South Africa",
      NEF: "National Empowerment Fund (NEF) — funds black economic empowerment businesses",
      NYDA: "National Youth Development Agency (NYDA) — supports youth-owned businesses aged 14–35",
      IDC: "Industrial Development Corporation (IDC) — industrial financing for medium to large businesses",
    };

    const prompt = `You are an expert South African funding consultant. Write a formal funding application for the ${appRow.program} programme (${programDetails[appRow.program] || appRow.program}).

CRITICAL FORMATTING RULES:
- Return a JSON object with EXACTLY these keys: applicationTitle, coverLetter, applicantProfile, businessSummary, fundingRequest, projectDescription, financialOverview, jobCreationPlan, transformationImpact, declarationStatement
- Every value MUST be a plain text STRING. Do NOT use nested objects or arrays as values.
- applicationTitle should be a short string like "SEFA Funding Application — Business Name"
- All other keys: 2 to 4 paragraphs of formal, professional prose separated by newline characters
- WRONG: { "coverLetter": { "greeting": "...", "body": "..." } } | CORRECT: { "coverLetter": "Dear Sir/Madam,\n\nParagraph..." }

Use the following company and business data to write the application.

COMPANY INFORMATION:
- Company Name: ${companyData.company_name || fd.businessName || "N/A"}
- Registration Number: ${companyData.registration_number || "N/A"}
- Company Type: ${companyData.company_type || "N/A"}
- Status: ${companyData.status || "Active"}
- Address: ${companyData.address || "N/A"}
- Directors: ${companyData.directors || "N/A"}

BUSINESS DETAILS:
- Industry: ${planData.industry || "N/A"}
- Business Description: ${planData.businessDescription || "N/A"}
- Products/Services: ${planData.productsServices || "N/A"}
- Target Market: ${planData.targetMarket || "N/A"}

FINANCIAL DATA:
- Annual Revenue: R${statementData.revenue || proposalData.monthlyRevenue * 12 || 0}
- Net Profit: R${statementData.netProfit || 0}
- Monthly Revenue: R${proposalData.monthlyRevenue || 0}
- Monthly Expenses: R${proposalData.monthlyExpenses || 0}

FUNDING REQUEST:
- Amount: R${proposalData.fundingAmount || fd.fundingAmount || 0}
- Purpose: ${proposalData.purposeOfFunding || fd.purpose || "Business expansion"}
- Jobs to Create: ${proposalData.jobsToCreate || fd.jobsToCreate || 0}
- Growth Plan: ${proposalData.growthPlan || fd.growthPlan || "N/A"}

ADDITIONAL NOTES: ${fd.notes || "None"}

Return ONLY valid JSON.`;

    const completion = await getOpenAI().chat.completions.create({
      model: getModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = safeJsonParse(completion.choices[0]?.message?.content || "{}");
    await execute(
      "UPDATE funding_applications SET generated_content=?, status='submitted', updated_at=? WHERE id=?",
      [JSON.stringify(content), new Date().toISOString(), req.params.id]
    );
    res.json({ ok: true, content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── GRANT READINESS ─────────────────────────────────────────────────────────

documentsRouter.get("/grant-readiness", requireAuth, async (req, res) => {
  try {
    const uid = getDataOwnerId(req);
    const [companies, plans, statements, proposals, applications] = await Promise.all([
      queryAll("SELECT id, is_verified FROM companies WHERE user_id=?", [uid]),
      queryAll("SELECT id FROM business_plans WHERE user_id=?", [uid]),
      queryAll("SELECT id FROM financial_statements WHERE user_id=?", [uid]),
      queryAll("SELECT id FROM funding_proposals WHERE user_id=?", [uid]),
      queryAll("SELECT id FROM funding_applications WHERE user_id=?", [uid]),
    ]);

    const gr = await queryOne("SELECT * FROM grant_readiness WHERE user_id=?", [uid]);

    const hasVerifiedCompany = companies.some((c: any) => c.is_verified);
    const hasCompany = companies.length > 0;
    const hasPlan = plans.length > 0;
    const hasStatement = statements.length > 0;
    const hasProposal = proposals.length > 0;
    const hasApplication = applications.length > 0;
    const hasTaxNumber = !!(gr?.tax_number);
    const isRegistered = !!(gr?.business_registered);

    const items = [
      { key: "company_verified", label: "Company verified", points: 25, completed: hasVerifiedCompany, link: "/dashboard/company-verify" },
      { key: "business_plan", label: "Business plan created", points: 20, completed: hasPlan, link: "/dashboard/business-plan" },
      { key: "financial_statements", label: "Financial statements available", points: 20, completed: hasStatement, link: "/dashboard/annual-statements" },
      { key: "funding_proposal", label: "Funding proposal created", points: 15, completed: hasProposal, link: "/dashboard/funding-proposal" },
      { key: "funding_application", label: "Funding application submitted", points: 10, completed: hasApplication, link: "/dashboard/funding-applications" },
      { key: "tax_number", label: "Tax number registered", points: 5, completed: hasTaxNumber, link: "/dashboard/funding" },
      { key: "business_registered", label: "Business registered", points: 5, completed: isRegistered, link: "/dashboard/funding" },
    ];

    const totalPoints = items.reduce((acc, i) => acc + i.points, 0);
    const earnedPoints = items.filter(i => i.completed).reduce((acc, i) => acc + i.points, 0);
    const score = Math.round((earnedPoints / totalPoints) * 100);

    const nextSteps = items.filter(i => !i.completed).map(i => ({ label: i.label, points: i.points, link: i.link }));

    res.json({ score, items, nextSteps, earnedPoints, totalPoints });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
