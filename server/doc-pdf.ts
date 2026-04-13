import { Router } from "express";
import { PDFDocument, PDFPage, PDFFont, rgb, RGB, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { queryOne } from "./db";

const PAGE_W = 595;
const PAGE_H = 842;
const ML = 50;
const MR = 50;
const MT = 55;
const MB = 55;
const TW = PAGE_W - ML - MR;

function requireAuth(req: any, res: any, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function wrapText(text: string, maxW: number, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxW) { cur = test; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function flattenSection(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map(flattenSection).join("\n\n");
  if (typeof val === "object") return Object.values(val).map(flattenSection).join("\n\n");
  return String(val);
}

interface DocCtx {
  pdfDoc: PDFDocument;
  currentPage: PDFPage;
  y: number;
  font: PDFFont;
  fontBold: PDFFont;
  pageNum: number;
  footerLeft: string;
  accentColor: RGB;
}

function newPage(ctx: DocCtx): void {
  const page = ctx.pdfDoc.addPage([PAGE_W, PAGE_H]);
  ctx.currentPage = page;
  ctx.y = PAGE_H - MT;
  ctx.pageNum++;
  const fy = 28;
  page.drawRectangle({ x: ML, y: fy + 14, width: TW, height: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(ctx.footerLeft, { x: ML, y: fy, size: 7.5, font: ctx.font, color: rgb(0.65, 0.65, 0.65) });
  const pg = String(ctx.pageNum);
  page.drawText(pg, { x: PAGE_W - MR - ctx.font.widthOfTextAtSize(pg, 8), y: fy, size: 8, font: ctx.font, color: rgb(0.5, 0.5, 0.5) });
}

function ensureSpace(ctx: DocCtx, needed: number): void {
  if (ctx.y - needed < MB + 20) newPage(ctx);
}

function drawText(ctx: DocCtx, text: string, size: number, font: PDFFont, color: RGB, lineH: number, indent = 0): void {
  const lines = wrapText(text, TW - indent, font, size);
  for (const line of lines) {
    ensureSpace(ctx, lineH);
    ctx.currentPage.drawText(line, { x: ML + indent, y: ctx.y, size, font, color });
    ctx.y -= lineH;
  }
}

function drawContent(ctx: DocCtx, rawText: any): void {
  const text = flattenSection(rawText);
  if (!text.trim()) return;
  const paras = text.split(/\n+/);
  for (const para of paras) {
    const t = para.trim();
    if (!t) continue;
    drawText(ctx, t, 9.5, ctx.font, rgb(0.12, 0.12, 0.12), 14);
    ctx.y -= 5;
  }
}

function drawSectionHeader(ctx: DocCtx, label: string): void {
  ensureSpace(ctx, 40);
  ctx.y -= 6;
  ctx.currentPage.drawRectangle({ x: ML, y: ctx.y - 6, width: TW, height: 24, color: ctx.accentColor });
  ctx.currentPage.drawText(label, { x: ML + 8, y: ctx.y + 5, size: 11, font: ctx.fontBold, color: rgb(1, 1, 1) });
  ctx.y -= 32;
}

async function loadUserLogo(pdfDoc: PDFDocument, user: any): Promise<{ image: any; w: number; h: number } | null> {
  if (!user?.logo_url) return null;
  try {
    let bytes: Buffer | null = null;
    let mime = "";
    if (user.logo_url.startsWith("data:image/")) {
      const m = user.logo_url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (m) { mime = m[1].toLowerCase(); bytes = Buffer.from(m[2], "base64"); }
    } else {
      const lp = path.join(process.cwd(), "public", user.logo_url);
      if (fs.existsSync(lp)) {
        bytes = fs.readFileSync(lp);
        mime = path.extname(lp).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
      }
    }
    if (!bytes) return null;
    const img = mime === "image/png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    const dim = img.scale(1);
    const maxH = 60, maxW = 160;
    let lw = (dim.width / dim.height) * maxH;
    let lh = maxH;
    if (lw > maxW) { lw = maxW; lh = (dim.height / dim.width) * maxW; }
    return { image: img, w: lw, h: lh };
  } catch { return null; }
}

// ─── Business Plan PDF ─────────────────────────────────────────────────────

const BP_SECTIONS = [
  { key: "executiveSummary", label: "1. Executive Summary" },
  { key: "companyOverview", label: "2. Company Overview" },
  { key: "marketAnalysis", label: "3. Market Analysis" },
  { key: "productsServices", label: "4. Products & Services" },
  { key: "operationsPlan", label: "5. Operations Plan" },
  { key: "marketingStrategy", label: "6. Marketing Strategy" },
  { key: "financialPlan", label: "7. Financial Plan" },
  { key: "fundingRequirements", label: "8. Funding Requirements" },
];

async function buildBusinessPlanPdf(doc: any, user: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.05, 0.41, 0.28);
  const fd = doc.form_data || {};
  const content = doc.generated_content || {};
  const logo = await loadUserLogo(pdfDoc, user);

  // ── Cover page
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);

  cover.drawRectangle({ x: 0, y: PAGE_H - 220, width: PAGE_W, height: 220, color: green });
  cover.drawRectangle({ x: 0, y: PAGE_H - 226, width: PAGE_W, height: 6, color: rgb(0.87, 0.70, 0.17) });

  let ly = PAGE_H - 30;
  if (logo) {
    cover.drawImage(logo.image, { x: ML, y: ly - logo.h, width: logo.w, height: logo.h });
    ly -= logo.h;
  }

  const biz = fd.businessName || user?.business_name || "Business";
  const bizW = fontBold.widthOfTextAtSize(biz, 24);
  cover.drawText(biz, { x: Math.min(ML, (PAGE_W - bizW) / 2), y: PAGE_H - 120, size: 24, font: fontBold, color: rgb(1, 1, 1) });

  cover.drawText("BUSINESS PLAN", { x: ML, y: PAGE_H - 155, size: 14, font: fontBold, color: rgb(0.87, 0.70, 0.17) });

  let cy = PAGE_H - 260;
  const metaItems: Array<[string, string]> = [];
  if (fd.founderName) metaItems.push(["Founder / Owner", fd.founderName]);
  if (fd.industry) metaItems.push(["Industry", fd.industry]);
  if (fd.registrationNumber) metaItems.push(["Registration No.", fd.registrationNumber]);
  if (fd.location) metaItems.push(["Location", fd.location]);
  metaItems.push(["Date", new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })]);

  for (const [lbl, val] of metaItems) {
    cover.drawText(`${lbl}:`, { x: ML, y: cy, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
    cover.drawText(val, { x: 200, y: cy, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
    cy -= 16;
  }

  if (fd.fundingRequired) {
    cy -= 8;
    cover.drawRectangle({ x: ML, y: cy - 8, width: TW / 2, height: 30, color: rgb(0.93, 0.97, 0.94) });
    cover.drawText("Funding Required:", { x: ML + 8, y: cy + 8, size: 9, font: fontBold, color: green });
    cover.drawText(`R${Number(fd.fundingRequired).toLocaleString("en-ZA")}`, { x: ML + 8, y: cy - 4, size: 12, font: fontBold, color: green });
  }

  cover.drawText("Confidential — Prepared for Funding Purposes", { x: ML, y: 50, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
  cover.drawText("Generated by Masakhe SMME Growth Hub  ·  masakheportal.co.za", { x: ML, y: 35, size: 7.5, font, color: rgb(0.7, 0.7, 0.7) });

  // ── Content pages
  const ctx: DocCtx = {
    pdfDoc, currentPage: cover, y: 0, font, fontBold,
    pageNum: 1, footerLeft: `${biz} — Business Plan`, accentColor: green,
  };
  newPage(ctx);

  for (const sec of BP_SECTIONS) {
    drawSectionHeader(ctx, sec.label);
    drawContent(ctx, content[sec.key]);
    ctx.y -= 10;
  }

  return pdfDoc.save();
}

// ─── Funding Proposal PDF ──────────────────────────────────────────────────

const FP_SECTIONS = [
  { key: "executiveSummary", label: "1. Executive Summary" },
  { key: "businessOverview", label: "2. Business Overview" },
  { key: "problemOpportunity", label: "3. Problem & Opportunity" },
  { key: "fundingRequest", label: "4. Funding Request" },
  { key: "useOfFunds", label: "5. Use of Funds" },
  { key: "economicImpact", label: "6. Economic Impact" },
  { key: "financialSummary", label: "7. Financial Summary" },
  { key: "closingStatement", label: "8. Closing Statement" },
];

async function buildFundingProposalPdf(doc: any, user: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.09, 0.22, 0.46);
  const gold = rgb(0.87, 0.70, 0.17);
  const fd = doc.form_data || {};
  const content = doc.generated_content || {};
  const logo = await loadUserLogo(pdfDoc, user);

  // ── Cover page
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);

  cover.drawRectangle({ x: 0, y: PAGE_H - 240, width: PAGE_W, height: 240, color: navy });
  cover.drawRectangle({ x: 0, y: PAGE_H - 246, width: PAGE_W, height: 6, color: gold });

  let logoY = PAGE_H - 30;
  if (logo) {
    cover.drawImage(logo.image, { x: ML, y: logoY - logo.h, width: logo.w, height: logo.h });
  }

  const prog = fd.governmentProgram || "";
  if (prog) {
    const progW = fontBold.widthOfTextAtSize(prog, 11);
    cover.drawRectangle({ x: PAGE_W - MR - progW - 16, y: PAGE_H - 32, width: progW + 16, height: 20, color: gold });
    cover.drawText(prog, { x: PAGE_W - MR - progW - 8, y: PAGE_H - 26, size: 11, font: fontBold, color: navy });
  }

  const biz = fd.businessName || user?.business_name || "Business";
  cover.drawText(biz, { x: ML, y: PAGE_H - 110, size: 22, font: fontBold, color: rgb(1, 1, 1) });
  cover.drawText("FUNDING PROPOSAL", { x: ML, y: PAGE_H - 140, size: 13, font: fontBold, color: gold });

  if (fd.fundingAmount) {
    const amt = `R${Number(fd.fundingAmount).toLocaleString("en-ZA")}`;
    cover.drawText(amt, { x: ML, y: PAGE_H - 168, size: 30, font: fontBold, color: gold });
    cover.drawText("Funding Requested", { x: ML, y: PAGE_H - 190, size: 9, font, color: rgb(0.75, 0.80, 0.95) });
  }

  let cy = PAGE_H - 270;
  const metaItems: Array<[string, string]> = [];
  if (fd.ownerName) metaItems.push(["Owner / Director", fd.ownerName]);
  if (fd.governmentProgram) metaItems.push(["Target Programme", fd.governmentProgram]);
  if (fd.businessStage) metaItems.push(["Business Stage", fd.businessStage]);
  if (fd.jobsToCreate) metaItems.push(["Jobs to be Created", fd.jobsToCreate]);
  metaItems.push(["Date", new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })]);

  for (const [lbl, val] of metaItems) {
    cover.drawRectangle({ x: ML, y: cy - 2, width: TW, height: 0.4, color: rgb(0.85, 0.87, 0.92) });
    cover.drawText(`${lbl}:`, { x: ML, y: cy - 12, size: 9, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
    cover.drawText(val, { x: 200, y: cy - 12, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
    cy -= 20;
  }

  if (content.coverPage) {
    cy -= 10;
    const cpLines = wrapText(flattenSection(content.coverPage).split("\n")[0] || "", TW, font, 9);
    if (cpLines[0]) {
      cover.drawText(cpLines[0], { x: ML, y: cy, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
    }
  }

  cover.drawText("Confidential — Private & Commercial In Confidence", { x: ML, y: 50, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
  cover.drawText("Generated by Masakhe SMME Growth Hub  ·  masakheportal.co.za", { x: ML, y: 35, size: 7.5, font, color: rgb(0.7, 0.7, 0.7) });

  // ── Content pages
  const ctx: DocCtx = {
    pdfDoc, currentPage: cover, y: 0, font, fontBold,
    pageNum: 1, footerLeft: `${biz} — Funding Proposal${prog ? ` (${prog})` : ""}`, accentColor: navy,
  };
  newPage(ctx);

  for (const sec of FP_SECTIONS) {
    drawSectionHeader(ctx, sec.label);
    drawContent(ctx, content[sec.key]);
    ctx.y -= 10;
  }

  return pdfDoc.save();
}

// ─── Funding Application PDF ───────────────────────────────────────────────

const FA_SECTIONS = [
  { key: "coverLetter", label: "1. Cover Letter" },
  { key: "applicantProfile", label: "2. Applicant Profile" },
  { key: "businessSummary", label: "3. Business Summary" },
  { key: "fundingRequest", label: "4. Funding Request" },
  { key: "projectDescription", label: "5. Project Description" },
  { key: "financialOverview", label: "6. Financial Overview" },
  { key: "jobCreationPlan", label: "7. Job Creation Plan" },
  { key: "transformationImpact", label: "8. Transformation & Impact" },
  { key: "declarationStatement", label: "9. Declaration" },
];

const PROG_COLORS: Record<string, RGB> = {
  SEFA: rgb(0.05, 0.45, 0.22),
  NEF: rgb(0.09, 0.25, 0.55),
  NYDA: rgb(0.42, 0.10, 0.68),
  IDC: rgb(0.70, 0.38, 0.02),
};
const PROG_FULL: Record<string, string> = {
  SEFA: "Small Enterprise Finance Agency",
  NEF: "National Empowerment Fund",
  NYDA: "National Youth Development Agency",
  IDC: "Industrial Development Corporation",
};

async function buildFundingApplicationPdf(doc: any, user: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const prog = doc.program || "SEFA";
  const accent = PROG_COLORS[prog] || rgb(0.05, 0.45, 0.22);
  const content = doc.generated_content || {};
  const logo = await loadUserLogo(pdfDoc, user);

  // ── Cover page
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);

  cover.drawRectangle({ x: 0, y: PAGE_H - 200, width: PAGE_W, height: 200, color: accent });
  cover.drawRectangle({ x: 0, y: PAGE_H - 206, width: PAGE_W, height: 6, color: rgb(1, 1, 1) });
  cover.drawRectangle({ x: 0, y: PAGE_H - 212, width: PAGE_W, height: 6, color: accent });

  if (logo) {
    cover.drawImage(logo.image, { x: ML, y: PAGE_H - 30 - logo.h, width: logo.w, height: logo.h });
  }

  const progFull = PROG_FULL[prog] || prog;
  cover.drawText(`${prog} APPLICATION`, { x: ML, y: PAGE_H - 100, size: 13, font: fontBold, color: rgb(1, 1, 1) });
  const title = flattenSection(content.applicationTitle) || "Funding Application";
  const titleLines = wrapText(title, TW, fontBold, 20);
  let ty = PAGE_H - 125;
  for (const ln of titleLines.slice(0, 3)) {
    cover.drawText(ln, { x: ML, y: ty, size: 20, font: fontBold, color: rgb(1, 1, 1) });
    ty -= 24;
  }

  let cy = PAGE_H - 235;
  cover.drawText(progFull, { x: ML, y: cy, size: 11, font, color: rgb(0.2, 0.2, 0.2) }); cy -= 20;

  const metaItems: Array<[string, string]> = [
    ["Programme", `${prog} — ${progFull}`],
    ["Applicant", user?.full_name || user?.business_name || ""],
    ["Date", new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })],
  ].filter(([, v]) => v) as Array<[string, string]>;

  for (const [lbl, val] of metaItems) {
    cover.drawRectangle({ x: ML, y: cy - 1, width: TW, height: 0.4, color: rgb(0.8, 0.8, 0.8) });
    cover.drawText(`${lbl}:`, { x: ML, y: cy - 12, size: 9, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
    cover.drawText(val, { x: 200, y: cy - 12, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
    cy -= 20;
  }

  cover.drawText("This document is submitted in confidence. All information is accurate to the best of our knowledge.", { x: ML, y: 60, size: 8, font, color: rgb(0.55, 0.55, 0.55) });
  cover.drawText("Generated by Masakhe SMME Growth Hub  ·  masakheportal.co.za", { x: ML, y: 44, size: 7.5, font, color: rgb(0.7, 0.7, 0.7) });

  // ── Content pages
  const ctx: DocCtx = {
    pdfDoc, currentPage: cover, y: 0, font, fontBold,
    pageNum: 1, footerLeft: `${prog} Funding Application`, accentColor: accent,
  };
  newPage(ctx);

  for (const sec of FA_SECTIONS) {
    drawSectionHeader(ctx, sec.label);
    drawContent(ctx, content[sec.key]);
    ctx.y -= 10;
  }

  return pdfDoc.save();
}

// ─── Router ────────────────────────────────────────────────────────────────

export const docPdfRouter = Router();

docPdfRouter.get("/business-plans/:id/pdf", requireAuth, async (req, res) => {
  try {
    const doc = await queryOne("SELECT * FROM business_plans WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "generated") return res.status(400).json({ error: "Document not yet generated" });
    const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.session.userId!]);
    const fd = typeof doc.form_data === "string" ? JSON.parse(doc.form_data || "{}") : (doc.form_data || {});
    const gc = typeof doc.generated_content === "string" ? JSON.parse(doc.generated_content || "{}") : (doc.generated_content || {});
    const docObj = { ...doc, form_data: fd, generated_content: gc };
    const pdfBytes = await buildBusinessPlanPdf(docObj, user);
    const filename = `business-plan-${(fd.businessName || "document").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) { console.error("[doc-pdf] business-plan:", err.message); res.status(500).json({ error: err.message }); }
});

docPdfRouter.get("/funding-proposals/:id/pdf", requireAuth, async (req, res) => {
  try {
    const doc = await queryOne("SELECT * FROM funding_proposals WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "generated") return res.status(400).json({ error: "Document not yet generated" });
    const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.session.userId!]);
    const fd = typeof doc.form_data === "string" ? JSON.parse(doc.form_data || "{}") : (doc.form_data || {});
    const gc = typeof doc.generated_content === "string" ? JSON.parse(doc.generated_content || "{}") : (doc.generated_content || {});
    const docObj = { ...doc, form_data: fd, generated_content: gc };
    const pdfBytes = await buildFundingProposalPdf(docObj, user);
    const filename = `funding-proposal-${(fd.businessName || "document").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) { console.error("[doc-pdf] funding-proposal:", err.message); res.status(500).json({ error: err.message }); }
});

docPdfRouter.get("/funding-applications/:id/pdf", requireAuth, async (req, res) => {
  try {
    const doc = await queryOne("SELECT * FROM funding_applications WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!doc) return res.status(404).json({ error: "Not found" });
    const gc = typeof doc.generated_content === "string" ? JSON.parse(doc.generated_content || "null") : doc.generated_content;
    if (!gc) return res.status(400).json({ error: "Document not yet generated" });
    const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.session.userId!]);
    const fd = typeof doc.form_data === "string" ? JSON.parse(doc.form_data || "{}") : (doc.form_data || {});
    const docObj = { ...doc, form_data: fd, generated_content: gc };
    const pdfBytes = await buildFundingApplicationPdf(docObj, user);
    const filename = `funding-application-${doc.program || "document"}.pdf`.toLowerCase();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) { console.error("[doc-pdf] funding-application:", err.message); res.status(500).json({ error: err.message }); }
});
