import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { PDFDocument, PDFPage, PDFFont, PDFImage, StandardFonts, rgb, RGB } from "pdf-lib";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getTransporterForUser } from "./email-settings";

const upload = multer({ storage: multer.memoryStorage() });

export const invoiceRouter = Router();
invoiceRouter.use(requireAuth);

export function getTemplateColors(template: number): { primary: RGB; accent: RGB; headerBg: RGB | null; headerText: RGB } {
  switch (template) {
    case 2: return { primary: rgb(0.09, 0.22, 0.45), accent: rgb(0.09, 0.22, 0.45), headerBg: null, headerText: rgb(0, 0, 0) };
    case 3: return { primary: rgb(0.15, 0.15, 0.15), accent: rgb(0.85, 0.40, 0.05), headerBg: rgb(0.15, 0.15, 0.15), headerText: rgb(1, 1, 1) };
    case 4: return { primary: rgb(0.12, 0.35, 0.72), accent: rgb(0.12, 0.35, 0.72), headerBg: rgb(0.12, 0.35, 0.72), headerText: rgb(1, 1, 1) };
    case 5: return { primary: rgb(0.52, 0.07, 0.07), accent: rgb(0.52, 0.07, 0.07), headerBg: null, headerText: rgb(0, 0, 0) };
    case 6: return { primary: rgb(0.42, 0.13, 0.69), accent: rgb(0.42, 0.13, 0.69), headerBg: rgb(0.42, 0.13, 0.69), headerText: rgb(1, 1, 1) };
    default: return { primary: rgb(0.08, 0.45, 0.27), accent: rgb(0.08, 0.45, 0.27), headerBg: null, headerText: rgb(0, 0, 0) };
  }
}

interface TemplateCtx {
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  logo: { image: PDFImage; w: number; h: number } | null;
  invoice: any;
  user: any;
  items: any[];
  vatEnabled: boolean;
  vatCents: number;
  subtotalCents: number;
  isQuote: boolean;
}

const W = 595;
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);
const grey = rgb(0.4, 0.4, 0.4);
const lightGrey = rgb(0.85, 0.85, 0.85);

const RIGHT = 545; // right margin for right-aligned text

function rText(page: PDFPage, text: string, rightX: number, y: number, size: number, font: PDFFont, color: RGB) {
  page.drawText(text, { x: rightX - font.widthOfTextAtSize(text, size), y, size, font, color });
}

function truncate(str: string, maxLen: number) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

function drawCustomerInfo(ctx: TemplateCtx, x: number, y: number, labelColor: RGB): number {
  const { page, font, fontBold, invoice, isQuote } = ctx;
  const label = isQuote ? "QUOTE FOR:" : "BILL TO:";
  page.drawText(label, { x, y, size: 8, font: fontBold, color: labelColor });
  y -= 15;
  page.drawText(invoice.customer_name, { x, y, size: 11, font: fontBold, color: black });
  y -= 14;
  if (invoice.customer_email) { page.drawText(invoice.customer_email, { x, y, size: 8.5, font, color: grey }); y -= 12; }
  if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x, y, size: 8.5, font, color: grey }); y -= 12; }
  if (invoice.customer_address) { page.drawText(truncate(invoice.customer_address, 70), { x, y, size: 8.5, font, color: grey }); y -= 12; }
  return y;
}

function drawStandardTable(ctx: TemplateCtx, y: number, headerBg: RGB, headerText: RGB, altRowBg: RGB | null): number {
  const { page, font, fontBold, items } = ctx;
  const ROW_H = 20;
  const COL_QTY = 358;
  const COL_UNIT = 435;
  const COL_AMT = RIGHT;

  // Header
  page.drawRectangle({ x: 50, y: y - 6, width: 495, height: 26, color: headerBg });
  page.drawText("Description", { x: 58, y: y + 5, size: 9, font: fontBold, color: headerText });
  rText(page, "Qty", COL_QTY, y + 5, 9, fontBold, headerText);
  rText(page, "Unit Price", COL_UNIT, y + 5, 9, fontBold, headerText);
  rText(page, "Amount", COL_AMT, y + 5, 9, fontBold, headerText);
  y -= 30;

  items.forEach((item: any, idx: number) => {
    const qty = item.qty || 1;
    const up = item.unitPrice || 0;
    const amt = qty * up;
    if (altRowBg && idx % 2 === 1) page.drawRectangle({ x: 50, y: y - 5, width: 495, height: ROW_H, color: altRowBg });
    page.drawText(truncate(item.name || "Item", 52), { x: 58, y: y + 2, size: 9, font, color: black });
    rText(page, String(qty), COL_QTY, y + 2, 9, font, black);
    rText(page, `R${up.toFixed(2)}`, COL_UNIT, y + 2, 9, font, black);
    rText(page, `R${amt.toFixed(2)}`, COL_AMT, y + 2, 9, fontBold, black);
    y -= ROW_H;
    page.drawRectangle({ x: 50, y: y + 10, width: 495, height: 0.4, color: lightGrey });
  });
  return y;
}

function drawTotals(ctx: TemplateCtx, y: number, accentColor: RGB, boxBg: RGB | null): number {
  const { page, font, fontBold, invoice, vatEnabled, vatCents, subtotalCents, isQuote } = ctx;
  const labelX = 350;
  y -= 12;

  if (vatEnabled) {
    page.drawText("Subtotal:", { x: labelX, y, size: 9, font, color: grey });
    rText(page, `R${(subtotalCents / 100).toFixed(2)}`, RIGHT, y, 9, font, black); y -= 14;
    page.drawText("VAT (15%):", { x: labelX, y, size: 9, font, color: grey });
    rText(page, `R${(vatCents / 100).toFixed(2)}`, RIGHT, y, 9, font, black); y -= 8;
    page.drawRectangle({ x: labelX, y, width: RIGHT - labelX, height: 0.5, color: grey }); y -= 5;
  }

  const totalStr = `R${(invoice.total_cents / 100).toFixed(2)}`;
  const totalLabel = vatEnabled
    ? (isQuote ? "TOTAL ESTIMATE (incl. VAT):" : "TOTAL DUE (incl. VAT):")
    : (isQuote ? "TOTAL ESTIMATE:" : "TOTAL DUE:");

  if (boxBg) {
    page.drawRectangle({ x: labelX, y: y - 10, width: RIGHT - labelX, height: 30, color: boxBg });
    page.drawText(totalLabel, { x: labelX + 6, y: y + 6, size: 8, font: fontBold, color: white });
    rText(page, totalStr, RIGHT - 6, y + 5, 13, fontBold, white);
    y -= 30;
  } else {
    page.drawText(totalLabel, { x: labelX, y: y + 6, size: 8.5, font: fontBold, color: black });
    rText(page, totalStr, RIGHT, y + 5, 14, fontBold, accentColor);
    y -= 26;
  }
  return y;
}

function drawFooter(ctx: TemplateCtx, y: number, accentColor: RGB) {
  const { page, font, fontBold, invoice, user, isQuote } = ctx;

  page.drawRectangle({ x: 50, y: y + 2, width: 495, height: 0.5, color: lightGrey });
  y -= 14;

  const termLabel = isQuote ? "Valid For:" : "Payment Terms:";
  const termValue = invoice.payment_terms || (isQuote ? "30 days" : "Due within 7 days");
  page.drawText(termLabel, { x: 50, y, size: 9, font: fontBold, color: grey });
  page.drawText(termValue, { x: 128, y, size: 9, font, color: black });
  y -= 13;

  if (invoice.notes) {
    page.drawText("Notes:", { x: 50, y, size: 9, font: fontBold, color: grey });
    page.drawText(truncate(invoice.notes, 90), { x: 98, y, size: 9, font, color: black });
    y -= 13;
  }

  // Banking details — styled card
  if (!isQuote && (user?.bank_name || user?.account_number)) {
    y -= 8;
    const bankRows: Array<[string, string]> = [];
    if (user.bank_name) bankRows.push(["Bank", user.bank_name]);
    if (user.account_name) bankRows.push(["Account Name", user.account_name]);
    if (user.account_type) bankRows.push(["Account Type", user.account_type]);
    if (user.account_number) bankRows.push(["Account Number", user.account_number]);
    if (user.branch_code) bankRows.push(["Branch Code", user.branch_code]);

    const cardW = 255;
    const headerH = 16;
    const rowH = 13;
    const bodyH = bankRows.length * rowH + 10;

    // Header bar
    page.drawRectangle({ x: 50, y: y - headerH + 4, width: cardW, height: headerH, color: accentColor });
    page.drawText("BANKING DETAILS", { x: 60, y: y - headerH + 8, size: 8.5, font: fontBold, color: white });

    // Body
    page.drawRectangle({ x: 50, y: y - headerH - bodyH + 4, width: cardW, height: bodyH, color: rgb(0.96, 0.96, 0.97) });

    let by = y - headerH - 4;
    bankRows.forEach(([lbl, val]) => {
      page.drawText(`${lbl}:`, { x: 60, y: by, size: 8, font: fontBold, color: grey });
      page.drawText(val, { x: 148, y: by, size: 8, font, color: black });
      by -= rowH;
    });

    y -= headerH + bodyH + 4;
  }

  // Bottom thank-you + legal note pinned near page bottom
  const noteY = Math.max(y - 8, 80);
  page.drawText(
    isQuote ? "Thank you for the opportunity!" : "Thank you for your business!",
    { x: 50, y: noteY, size: 9, font: fontBold, color: grey }
  );
  const legal = isQuote
    ? "This quote is valid for the period stated above. Prices are subject to change after expiry."
    : "This document serves as a tax invoice in terms of Section 20 of the VAT Act, No. 89 of 1991.";
  page.drawText(legal, { x: 50, y: noteY - 13, size: 7.5, font, color: lightGrey });
  page.drawText("Generated by Masakhe SMME Growth Hub  ·  masakhegroup.co.za", { x: 50, y: 32, size: 7.5, font, color: lightGrey });
}

// ────────────────────────────────────────────────────────────────────────────
// Template 1 — CLASSIC (Green left stripe, clean white body)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate1(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const green = rgb(0.08, 0.45, 0.27);
  const mintBg = rgb(0.93, 0.98, 0.95);

  // Thick green left accent stripe (full height)
  page.drawRectangle({ x: 0, y: 0, width: 8, height: 842, color: green });

  let y = 800;
  if (logo) { page.drawImage(logo.image, { x: 25, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 18; }

  // Business name + doc title on same line
  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(biz, { x: 25, y, size: 18, font: fontBold, color: green });
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 22);
  page.drawText(docTitle, { x: W - 30 - dtW, y, size: 22, font: fontBold, color: green });
  y -= 18;
  if (user?.physical_address) { page.drawText(user.physical_address, { x: 25, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 25, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 25, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT No: ${user.vat_number}`, { x: 25, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg No: ${user.registration_number}`, { x: 25, y, size: 8, font, color: grey }); y -= 11; }

  // Green divider line
  y -= 6;
  page.drawRectangle({ x: 25, y, width: 547, height: 2, color: green });
  y -= 18;

  // Meta row
  const numLabel = isQuote ? "Quote No:" : "Invoice No:";
  page.drawText(numLabel, { x: 25, y, size: 9, font, color: grey });
  page.drawText(invoice.invoice_number, { x: 100, y, size: 9, font: fontBold, color: black });
  page.drawText("Date:", { x: 370, y, size: 9, font, color: grey });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 400, y, size: 9, font: fontBold, color: black }); y -= 14;
  if (invoice.reference) {
    page.drawText("Reference:", { x: 25, y, size: 9, font, color: grey });
    page.drawText(invoice.reference, { x: 100, y, size: 9, font: fontBold, color: black }); y -= 14;
  }
  if (isQuote) {
    page.drawText("Valid For:", { x: 370, y: y + 14, size: 9, font, color: grey });
    page.drawText(invoice.payment_terms || "30 days", { x: 420, y: y + 14, size: 9, font: fontBold, color: black });
  }
  y -= 12;
  y = drawCustomerInfo(ctx, 25, y, green);
  y -= 14;
  y = drawStandardTable(ctx, y, green, white, mintBg);
  y = drawTotals(ctx, y, green, green);
  y -= 10;
  drawFooter(ctx, y, green);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 2 — MODERN (Navy, invoice info in a navy box top-right)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate2(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const navy = rgb(0.09, 0.22, 0.45);
  const navyLight = rgb(0.92, 0.94, 0.98);

  let y = 800;
  if (logo) { page.drawImage(logo.image, { x: 50, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 18; }

  // Navy invoice info box — top right, overlapping biz info area
  const boxY = 800;
  const boxH = 90;
  page.drawRectangle({ x: 360, y: boxY - boxH, width: 185, height: boxH, color: navy });
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  page.drawText(docTitle, { x: 380, y: boxY - 20, size: 13, font: fontBold, color: white });
  page.drawText(invoice.invoice_number, { x: 380, y: boxY - 38, size: 10, font: fontBold, color: rgb(0.75, 0.87, 1) });
  page.drawText("Dated:", { x: 380, y: boxY - 52, size: 8, font, color: rgb(0.7, 0.8, 0.95) });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 420, y: boxY - 52, size: 8, font: fontBold, color: white });
  if (invoice.reference) {
    page.drawText("Ref:", { x: 380, y: boxY - 66, size: 8, font, color: rgb(0.7, 0.8, 0.95) });
    page.drawText(invoice.reference, { x: 404, y: boxY - 66, size: 8, font: fontBold, color: white });
  }
  if (isQuote) {
    page.drawText("Valid:", { x: 380, y: boxY - 80, size: 8, font, color: rgb(0.7, 0.8, 0.95) });
    page.drawText(invoice.payment_terms || "30 days", { x: 410, y: boxY - 80, size: 8, font: fontBold, color: white });
  }

  // Business info left side
  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(biz, { x: 50, y, size: 19, font: fontBold, color: navy }); y -= 19;
  if (user?.physical_address) { page.drawText(user.physical_address, { x: 50, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 50, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 50, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT: ${user.vat_number}`, { x: 50, y, size: 8, font, color: grey }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg: ${user.registration_number}`, { x: 50, y, size: 8, font, color: grey }); y -= 11; }

  // Navy bottom divider under header zone
  const divY = Math.min(y, boxY - boxH) - 10;
  page.drawRectangle({ x: 50, y: divY, width: 495, height: 2.5, color: navy });
  y = divY - 18;

  // Customer box (light navy background)
  const custBoxH = 72;
  page.drawRectangle({ x: 50, y: y - custBoxH, width: 230, height: custBoxH, color: navyLight });
  const billLabel = isQuote ? "QUOTE FOR" : "BILL TO";
  page.drawText(billLabel, { x: 58, y: y - 10, size: 8, font: fontBold, color: navy });
  page.drawText(invoice.customer_name, { x: 58, y: y - 24, size: 10, font: fontBold, color: black });
  let cy = y - 38;
  if (invoice.customer_email) { page.drawText(invoice.customer_email, { x: 58, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x: 58, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_address) { page.drawText(invoice.customer_address, { x: 58, y: cy, size: 8, font, color: grey }); }
  y -= custBoxH + 16;

  y = drawStandardTable(ctx, y, navy, white, navyLight);
  y = drawTotals(ctx, y, navy, null);
  y -= 10;
  drawFooter(ctx, y, navy);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 3 — BOLD (Dark header + orange stripe, high contrast)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate3(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const dark = rgb(0.12, 0.12, 0.12);
  const orange = rgb(0.85, 0.40, 0.05);
  const warmTint = rgb(1.0, 0.96, 0.90);

  // Full dark header (taller to fit address)
  const headerH = 140;
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: dark });
  // Orange stripe below header
  page.drawRectangle({ x: 0, y: 842 - headerH - 7, width: W, height: 7, color: orange });

  const dimGrey = rgb(0.75, 0.75, 0.75);
  let y = 826;
  if (logo) { page.drawImage(logo.image, { x: 30, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 10; }

  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(biz, { x: 30, y, size: 18, font: fontBold, color: white }); y -= 18;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 55), { x: 30, y, size: 8, font, color: dimGrey }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 30, y, size: 8, font, color: dimGrey }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 30, y, size: 8, font, color: dimGrey }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT: ${user.vat_number}`, { x: 30, y, size: 8, font, color: dimGrey }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg: ${user.registration_number}`, { x: 30, y, size: 8, font, color: dimGrey }); }

  // Large doc title right side in orange
  const docTitle = isQuote ? "QUOTE" : "INVOICE";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 34);
  page.drawText(docTitle, { x: W - 35 - dtW, y: 826, size: 34, font: fontBold, color: orange });
  rText(page, invoice.invoice_number, W - 30, 791, 10, fontBold, rgb(0.88, 0.88, 0.88));
  rText(page, new Date(invoice.created_at).toLocaleDateString("en-ZA"), W - 30, 777, 9, font, rgb(0.65, 0.65, 0.65));
  if (invoice.reference) rText(page, `Ref: ${invoice.reference}`, W - 30, 763, 9, font, rgb(0.65, 0.65, 0.65));

  y = 842 - headerH - 7 - 18;

  y = drawCustomerInfo(ctx, 50, y, orange);
  y -= 14;

  y = drawStandardTable(ctx, y, dark, white, warmTint);
  y = drawTotals(ctx, y, orange, orange);
  y -= 10;
  drawFooter(ctx, y, orange);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 4 — CORPORATE (Blue header, two bordered info boxes)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate4(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const blue = rgb(0.12, 0.35, 0.72);
  const skyBlue = rgb(0.91, 0.95, 1.0);
  const midBlue = rgb(0.60, 0.75, 0.95);

  const headerH = 124;
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: blue });

  let y = 826;
  if (logo) { page.drawImage(logo.image, { x: 30, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 10; }

  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(biz, { x: 30, y, size: 18, font: fontBold, color: white }); y -= 18;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 55), { x: 30, y, size: 8, font, color: midBlue }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 30, y, size: 8, font, color: midBlue }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 30, y, size: 8, font, color: midBlue }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT: ${user.vat_number}`, { x: 30, y, size: 8, font, color: midBlue }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg: ${user.registration_number}`, { x: 30, y, size: 8, font, color: midBlue }); }

  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  rText(page, docTitle, W - 30, 826, 15, fontBold, white);

  y = 842 - headerH - 15;

  // Two side-by-side info boxes
  const boxH = 80;
  const boxY = y - boxH;

  // Bill To box
  page.drawRectangle({ x: 50, y: boxY, width: 232, height: boxH, color: skyBlue });
  page.drawRectangle({ x: 50, y: boxY + boxH - 10, width: 232, height: 10, color: blue });
  const billLabel = isQuote ? "QUOTE FOR" : "BILL TO";
  page.drawText(billLabel, { x: 56, y: boxY + boxH - 8, size: 8, font: fontBold, color: white });
  page.drawText(invoice.customer_name, { x: 56, y: boxY + boxH - 24, size: 10, font: fontBold, color: black });
  let cy = boxY + boxH - 38;
  if (invoice.customer_email) { page.drawText(invoice.customer_email, { x: 56, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x: 56, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_address) { page.drawText(invoice.customer_address, { x: 56, y: cy, size: 8, font, color: grey }); }

  // Invoice Details box
  page.drawRectangle({ x: 313, y: boxY, width: 232, height: boxH, color: skyBlue });
  page.drawRectangle({ x: 313, y: boxY + boxH - 10, width: 232, height: 10, color: blue });
  page.drawText("INVOICE DETAILS", { x: 319, y: boxY + boxH - 8, size: 8, font: fontBold, color: white });
  const numLabel = isQuote ? "Quote No:" : "Invoice No:";
  page.drawText(numLabel, { x: 319, y: boxY + boxH - 22, size: 8, font, color: grey });
  page.drawText(invoice.invoice_number, { x: 395, y: boxY + boxH - 22, size: 8, font: fontBold, color: black });
  page.drawText("Date:", { x: 319, y: boxY + boxH - 34, size: 8, font, color: grey });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 395, y: boxY + boxH - 34, size: 8, font: fontBold, color: black });
  if (invoice.reference) {
    page.drawText("Ref:", { x: 319, y: boxY + boxH - 46, size: 8, font, color: grey });
    page.drawText(invoice.reference, { x: 395, y: boxY + boxH - 46, size: 8, font: fontBold, color: black });
  }
  if (isQuote) {
    page.drawText("Valid For:", { x: 319, y: boxY + boxH - 58, size: 8, font, color: grey });
    page.drawText(invoice.payment_terms || "30 days", { x: 395, y: boxY + boxH - 58, size: 8, font: fontBold, color: black });
  }

  y = boxY - 16;
  y = drawStandardTable(ctx, y, blue, white, skyBlue);
  y = drawTotals(ctx, y, blue, blue);
  y -= 10;
  drawFooter(ctx, y, blue);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 5 — ELEGANT (Burgundy, centered header, spaced layout, no fill table)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate5(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const burg = rgb(0.52, 0.07, 0.07);
  const creamBg = rgb(0.99, 0.96, 0.96);

  // Top decorative bars
  page.drawRectangle({ x: 0, y: 836, width: W, height: 6, color: burg });
  page.drawRectangle({ x: 0, y: 831, width: W, height: 1.5, color: burg });

  let y = 816;
  if (logo) {
    const lx = (W - logo.w) / 2;
    page.drawImage(logo.image, { x: lx, y: y - logo.h, width: logo.w, height: logo.h });
    y -= logo.h + 18;
  }

  // Centered business name
  const biz = user?.business_name || user?.full_name || "Business";
  const bizW = fontBold.widthOfTextAtSize(biz, 20);
  page.drawText(biz, { x: (W - bizW) / 2, y, size: 20, font: fontBold, color: burg }); y -= 18;

  const contactParts: string[] = [];
  if (user?.phone) contactParts.push(`Tel: ${user.phone}`);
  if (user?.email) contactParts.push(user.email);
  if (user?.physical_address) contactParts.push(user.physical_address);
  const contactStr = contactParts.join("  |  ");
  if (contactStr) {
    const cw = font.widthOfTextAtSize(contactStr, 8);
    page.drawText(contactStr, { x: (W - cw) / 2, y, size: 8, font, color: grey }); y -= 12;
  }
  if (user?.vat_number) {
    const s = `VAT No: ${user.vat_number}`;
    page.drawText(s, { x: (W - font.widthOfTextAtSize(s, 8)) / 2, y, size: 8, font, color: grey }); y -= 12;
  }
  if (user?.registration_number) {
    const s = `Reg No: ${user.registration_number}`;
    page.drawText(s, { x: (W - font.widthOfTextAtSize(s, 8)) / 2, y, size: 8, font, color: grey }); y -= 12;
  }

  y -= 4;
  // Double rule
  page.drawRectangle({ x: 50, y: y + 3, width: 495, height: 1, color: burg });
  page.drawRectangle({ x: 50, y, width: 495, height: 1, color: burg });
  y -= 16;

  // Centered spaced doc title
  const docTitle = isQuote ? "Q U O T E" : "T A X   I N V O I C E";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 13);
  page.drawText(docTitle, { x: (W - dtW) / 2, y, size: 13, font: fontBold, color: burg }); y -= 20;

  // Meta row
  const numLabel = isQuote ? "Quote No:" : "Invoice No:";
  page.drawText(numLabel, { x: 50, y, size: 9, font, color: grey });
  page.drawText(invoice.invoice_number, { x: 120, y, size: 9, font: fontBold, color: black });
  page.drawText("Date:", { x: 370, y, size: 9, font, color: grey });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 400, y, size: 9, font: fontBold, color: black }); y -= 14;
  if (invoice.reference) {
    page.drawText("Reference:", { x: 50, y, size: 9, font, color: grey });
    page.drawText(invoice.reference, { x: 120, y, size: 9, font: fontBold, color: black }); y -= 14;
  }
  if (isQuote) {
    page.drawText("Valid For:", { x: 370, y: y + 14, size: 9, font, color: grey });
    page.drawText(invoice.payment_terms || "30 days", { x: 420, y: y + 14, size: 9, font: fontBold, color: black });
  }

  // Dotted divider
  y -= 10;
  for (let dotX = 50; dotX < 545; dotX += 8) {
    page.drawRectangle({ x: dotX, y, width: 4, height: 0.7, color: lightGrey });
  }
  y -= 14;

  y = drawCustomerInfo(ctx, 50, y, burg);
  y -= 14;

  // Elegant table — no fill header, column labels with underline
  const COL_QTY5 = 358; const COL_UNIT5 = 435; const COL_AMT5 = RIGHT;
  page.drawText("Description", { x: 50, y, size: 9, font: fontBold, color: burg });
  rText(page, "Qty", COL_QTY5, y, 9, fontBold, burg);
  rText(page, "Unit Price", COL_UNIT5, y, 9, fontBold, burg);
  rText(page, "Amount", COL_AMT5, y, 9, fontBold, burg);
  y -= 4;
  page.drawRectangle({ x: 50, y, width: 495, height: 1, color: burg });
  y -= 16;
  ctx.items.forEach((item: any, idx: number) => {
    const qty = item.qty || 1;
    const up = item.unitPrice || 0;
    const amt = qty * up;
    if (idx % 2 === 1) page.drawRectangle({ x: 50, y: y - 4, width: 495, height: 18, color: creamBg });
    page.drawText(truncate(item.name || "Item", 52), { x: 50, y: y + 2, size: 9, font, color: black });
    rText(page, String(qty), COL_QTY5, y + 2, 9, font, black);
    rText(page, `R${up.toFixed(2)}`, COL_UNIT5, y + 2, 9, font, black);
    rText(page, `R${amt.toFixed(2)}`, COL_AMT5, y + 2, 9, fontBold, black);
    y -= 20;
    page.drawRectangle({ x: 50, y: y + 10, width: 495, height: 0.4, color: lightGrey });
  });

  y = drawTotals(ctx, y, burg, null);
  y -= 10;
  drawFooter(ctx, y, burg);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 6 — VIBRANT (Purple, layered header, left sidebar, bold contrast)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate6(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const purple = rgb(0.42, 0.13, 0.69);
  const purpleMid = rgb(0.50, 0.22, 0.76);
  const purpleDark = rgb(0.20, 0.02, 0.38);
  const lavender = rgb(0.95, 0.89, 1.0);
  const midPurple = rgb(0.72, 0.54, 0.92);

  const headerH = 152;
  // Base header
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: purple });
  // Layered accent shapes for depth
  page.drawRectangle({ x: 260, y: 842 - headerH, width: 335, height: headerH, color: purpleMid });
  page.drawRectangle({ x: 340, y: 842 - headerH, width: 255, height: headerH, color: rgb(0.48, 0.19, 0.74) });

  let y = 828;
  if (logo) { page.drawImage(logo.image, { x: 28, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 10; }

  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(biz, { x: 28, y, size: 19, font: fontBold, color: white }); y -= 19;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 50), { x: 28, y, size: 8, font, color: midPurple }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 28, y, size: 8, font, color: midPurple }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 28, y, size: 8, font, color: midPurple }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT: ${user.vat_number}`, { x: 28, y, size: 8, font, color: midPurple }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg: ${user.registration_number}`, { x: 28, y, size: 8, font, color: midPurple }); }

  // Large doc title right (in the lighter purple zone)
  const docTitle = isQuote ? "QUOTE" : "INVOICE";
  rText(page, docTitle, W - 28, 828, 30, fontBold, white);

  // Invoice number badge (dark pill)
  page.drawRectangle({ x: W - 212, y: 793, width: 182, height: 20, color: purpleDark });
  rText(page, invoice.invoice_number, W - 32, 798, 10, fontBold, white);
  rText(page, new Date(invoice.created_at).toLocaleDateString("en-ZA"), W - 32, 781, 8, font, midPurple);
  if (invoice.reference) rText(page, `Ref: ${invoice.reference}`, W - 32, 769, 8, font, midPurple);

  // Left purple sidebar (body only, below header)
  page.drawRectangle({ x: 0, y: 40, width: 8, height: 842 - headerH - 40, color: purple });

  y = 842 - headerH - 18;
  y = drawCustomerInfo(ctx, 25, y, purple);
  y -= 14;
  y = drawStandardTable(ctx, y, purple, white, lavender);
  y = drawTotals(ctx, y, purple, purple);
  y -= 10;
  drawFooter(ctx, y, purple);
}

// ────────────────────────────────────────────────────────────────────────────
// Route handlers (unchanged from before)
// ────────────────────────────────────────────────────────────────────────────

invoiceRouter.get("/export", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoices = await queryAll("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    const header = "Number,Type,Customer Name,Customer Email,Items,Subtotal,VAT (15%),Total,Status,Date";
    const rows = invoices.map((inv: any) => {
      const items = JSON.parse(inv.items_json || "[]");
      const itemsSummary = items.map((item: any) => `${item.qty || 1}x ${item.name || "Item"} @ R${(item.unitPrice || 0).toFixed(2)}`).join("; ");
      const subtotal = ((inv.total_cents - (inv.vat_cents || 0)) / 100).toFixed(2);
      const vat = ((inv.vat_cents || 0) / 100).toFixed(2);
      const total = (inv.total_cents / 100).toFixed(2);
      const date = inv.created_at ? inv.created_at.split("T")[0] : "";
      return `${inv.invoice_number},"${inv.type || "invoice"}","${(inv.customer_name || "").replace(/"/g, '""')}","${(inv.customer_email || "").replace(/"/g, '""')}","${itemsSummary.replace(/"/g, '""')}",${subtotal},${vat},${total},${inv.status || "final"},${date}`;
    });
    const csv = [header, ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="invoices-export-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

invoiceRouter.post("/import", upload.single("file"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const content = file.buffer.toString("utf-8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: "CSV must have a header and at least one data row" });
    let imported = 0;
    const now = new Date().toISOString();
    const existingCount = ((await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ?", [userId]))?.c || 0) as number;
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 3) continue;
      const [customerName, customerEmail, itemsStr, totalStr] = parts;
      if (!customerName) continue;
      const items: { name: string; qty: number; unitPrice: number }[] = [];
      if (itemsStr) {
        for (const part of itemsStr.split(";").map((s) => s.trim()).filter(Boolean)) {
          const match = part.match(/^(\d+)\s*x\s+(.+?)\s+@\s+(\d+(?:\.\d+)?)$/i);
          if (match) items.push({ qty: parseInt(match[1]), name: match[2].trim(), unitPrice: parseFloat(match[3]) });
        }
      }
      let totalCents = totalStr && totalStr.trim() ? Math.round(parseFloat(totalStr) * 100) : 0;
      if (isNaN(totalCents) || !totalCents) totalCents = items.reduce((sum, it) => sum + Math.round(it.qty * it.unitPrice * 100), 0);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingCount + imported + 1).padStart(3, "0")}`;
      await execute(
        `INSERT INTO invoices (id, user_id, invoice_number, customer_name, customer_email, total_cents, vat_enabled, vat_cents, items_json, status, type, template, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'final', 'invoice', 1, ?)`,
        [randomUUID(), userId, invoiceNumber, customerName, customerEmail || null, totalCents, JSON.stringify(items), now]
      );
      imported++;
    }
    res.json({ ok: true, imported });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to import" });
  }
});

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

invoiceRouter.post("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { customerName, customerEmail, customerAddress, customerPhone, items, vatEnabled, reference, paymentTerms, notes, type, template } = req.body;
    if (!customerName || !items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "customerName and items are required" });
    const docType = type === "quote" ? "quote" : "invoice";
    const docTemplate = Math.min(6, Math.max(1, parseInt(template) || 1));
    const subtotalCents = items.reduce((sum: number, item: any) => sum + Math.round((item.qty || 1) * (item.unitPrice || 0) * 100), 0);
    const vatCents = vatEnabled ? Math.round(subtotalCents * 0.15) : 0;
    const totalCents = subtotalCents + vatCents;
    const prefix = docType === "quote" ? "QUO" : "INV";
    const count = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ? AND type = ?", [userId, docType]))?.c || 0;
    const docNumber = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO invoices (id, user_id, invoice_number, customer_name, customer_email, customer_address, customer_phone, reference, payment_terms, notes, total_cents, vat_enabled, vat_cents, items_json, status, type, template, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'final', ?, ?, ?)`,
      [id, userId, docNumber, customerName, customerEmail || null, customerAddress || null, customerPhone || null, reference || null, paymentTerms || null, notes || null, totalCents, vatEnabled ? 1 : 0, vatCents, JSON.stringify(items), docType, docTemplate, now]
    );
    res.json({ ok: true, id, invoiceNumber: docNumber });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create" });
  }
});

invoiceRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoices = await queryAll("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(invoices.map((inv: any) => ({
      ...inv,
      items: JSON.parse(inv.items_json),
      vat_enabled: !!inv.vat_enabled,
      vat_cents: inv.vat_cents || 0,
      type: inv.type || "invoice",
      template: inv.template || 1,
    })));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

invoiceRouter.post("/:id/convert", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoice = await queryOne("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!invoice) return res.status(404).json({ error: "Not found" });
    if (invoice.type !== "quote") return res.status(400).json({ error: "Only quotes can be converted" });
    const count = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ? AND type = 'invoice'", [userId]))?.c || 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    await execute("UPDATE invoices SET type = 'invoice', invoice_number = ? WHERE id = ?", [invoiceNumber, invoice.id]);
    res.json({ ok: true, invoiceNumber });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to convert" });
  }
});

invoiceRouter.get("/:id/pdf", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoice = await queryOne("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const user = await queryOne(
      `SELECT u.full_name, u.email, bp.business_name, bp.phone, bp.physical_address, bp.logo_url, bp.vat_number,
              bp.bank_name, bp.account_name, bp.account_type, bp.account_number, bp.branch_code, bp.registration_number
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?`,
      [userId]
    );

    const items = JSON.parse(invoice.items_json);
    const vatEnabled = !!invoice.vat_enabled;
    const vatCents = invoice.vat_cents || 0;
    const subtotalCents = invoice.total_cents - vatCents;
    const docType = invoice.type || "invoice";
    const templateNum = invoice.template || 1;
    const isQuote = docType === "quote";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed logo
    let logo: { image: PDFImage; w: number; h: number } | null = null;
    if (user?.logo_url) {
      try {
        let logoBytes: Buffer | null = null;
        let logoMime = "";
        if (user.logo_url.startsWith("data:image/")) {
          const matches = user.logo_url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (matches) { logoMime = matches[1].toLowerCase(); logoBytes = Buffer.from(matches[2], "base64"); }
        } else {
          const logoPath = path.join(process.cwd(), "public", user.logo_url);
          if (fs.existsSync(logoPath)) {
            logoBytes = fs.readFileSync(logoPath);
            logoMime = path.extname(logoPath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
          }
        }
        if (logoBytes) {
          const img = logoMime === "image/png" ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
          const dim = img.scale(1);
          const maxH = 70, maxW = 180;
          let lw = (dim.width / dim.height) * maxH;
          let lh = maxH;
          if (lw > maxW) { lw = maxW; lh = (dim.height / dim.width) * maxW; }
          logo = { image: img, w: lw, h: lh };
        }
      } catch (_) {}
    }

    const ctx: TemplateCtx = { page, font, fontBold, logo, invoice, user, items, vatEnabled, vatCents, subtotalCents, isQuote };

    switch (templateNum) {
      case 2: renderTemplate2(ctx); break;
      case 3: renderTemplate3(ctx); break;
      case 4: renderTemplate4(ctx); break;
      case 5: renderTemplate5(ctx); break;
      case 6: renderTemplate6(ctx); break;
      default: renderTemplate1(ctx);
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("PDF error:", err);
    res.status(500).json({ error: err.message || "Failed to generate PDF" });
  }
});

invoiceRouter.post("/:id/email", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoice = await queryOne("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (!invoice.customer_email) return res.status(400).json({ error: "This invoice has no customer email address." });

    const mailer = await getTransporterForUser(userId);
    if (!mailer) return res.status(400).json({ error: "No email account configured. Go to Settings → Email Sending to set up your SMTP." });

    const user = await queryOne(
      `SELECT u.full_name, u.email, bp.business_name, bp.phone, bp.physical_address, bp.logo_url, bp.vat_number,
              bp.bank_name, bp.account_name, bp.account_type, bp.account_number, bp.branch_code, bp.registration_number
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?`,
      [userId]
    );

    const items = JSON.parse(invoice.items_json);
    const vatEnabled = !!invoice.vat_enabled;
    const vatCents = invoice.vat_cents || 0;
    const subtotalCents = invoice.total_cents - vatCents;
    const docType = invoice.type || "invoice";
    const templateNum = invoice.template || 1;
    const isQuote = docType === "quote";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let logo: { image: PDFImage; w: number; h: number } | null = null;
    if (user?.logo_url) {
      try {
        let logoBytes: Buffer | null = null;
        let logoMime = "";
        if (user.logo_url.startsWith("data:image/")) {
          const matches = user.logo_url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (matches) { logoMime = matches[1].toLowerCase(); logoBytes = Buffer.from(matches[2], "base64"); }
        } else {
          const logoPath = path.join(process.cwd(), "public", user.logo_url);
          if (fs.existsSync(logoPath)) {
            logoBytes = fs.readFileSync(logoPath);
            logoMime = path.extname(logoPath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
          }
        }
        if (logoBytes) {
          const img = logoMime === "image/png" ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
          const dim = img.scale(1);
          const maxH = 70, maxW = 180;
          let lw = (dim.width / dim.height) * maxH;
          let lh = maxH;
          if (lw > maxW) { lw = maxW; lh = (dim.height / dim.width) * maxW; }
          logo = { image: img, w: lw, h: lh };
        }
      } catch (_) {}
    }

    const ctx: TemplateCtx = { page, font, fontBold, logo, invoice, user, items, vatEnabled, vatCents, subtotalCents, isQuote };
    switch (templateNum) {
      case 2: renderTemplate2(ctx); break;
      case 3: renderTemplate3(ctx); break;
      case 4: renderTemplate4(ctx); break;
      case 5: renderTemplate5(ctx); break;
      case 6: renderTemplate6(ctx); break;
      default: renderTemplate1(ctx);
    }
    const pdfBytes = await pdfDoc.save();

    const businessName = user?.business_name || mailer.fromName;
    const label = isQuote ? "Quote" : "Invoice";
    const totalFormatted = `R${(invoice.total_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
    const dateStr = new Date(invoice.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 20px;"><tr><td align="center">
<table width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;">
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${businessName}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${label} #${invoice.invoice_number}</p>
</td></tr>
<tr><td style="padding:40px;">
  <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
    Dear ${invoice.customer_name},<br><br>
    Please find your ${label.toLowerCase()} attached to this email. A summary is provided below.
  </p>
  <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">${label} Details</td><td style="padding:12px 16px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e5e7eb;text-align:right;"></td></tr>
    <tr><td style="padding:12px 16px;color:#4a4a5a;font-size:14px;border-bottom:1px solid #f3f4f6;">${label} Number</td><td style="padding:12px 16px;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">${invoice.invoice_number}</td></tr>
    <tr><td style="padding:12px 16px;color:#4a4a5a;font-size:14px;border-bottom:1px solid #f3f4f6;">Date</td><td style="padding:12px 16px;color:#1a1a2e;font-size:14px;text-align:right;border-bottom:1px solid #f3f4f6;">${dateStr}</td></tr>
    ${invoice.reference ? `<tr><td style="padding:12px 16px;color:#4a4a5a;font-size:14px;border-bottom:1px solid #f3f4f6;">Reference</td><td style="padding:12px 16px;color:#1a1a2e;font-size:14px;text-align:right;border-bottom:1px solid #f3f4f6;">${invoice.reference}</td></tr>` : ""}
    ${invoice.payment_terms ? `<tr><td style="padding:12px 16px;color:#4a4a5a;font-size:14px;border-bottom:1px solid #f3f4f6;">Payment Terms</td><td style="padding:12px 16px;color:#1a1a2e;font-size:14px;text-align:right;border-bottom:1px solid #f3f4f6;">${invoice.payment_terms}</td></tr>` : ""}
    <tr style="background:#f9fafb;"><td style="padding:14px 16px;font-size:16px;font-weight:700;color:#1a1a2e;">Total</td><td style="padding:14px 16px;font-size:18px;font-weight:700;color:#007749;text-align:right;">${totalFormatted}</td></tr>
  </table>
  ${invoice.notes ? `<p style="margin:0 0 20px;color:#6b7280;font-size:13px;font-style:italic;">${invoice.notes}</p>` : ""}
  <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">If you have any questions, please reply to this email or contact us at ${mailer.fromEmail}.</p>
  <p style="margin:16px 0 0;color:#4a4a5a;font-size:14px;">Thank you for your business!<br><strong style="color:#1a1a2e;">${businessName}</strong></p>
</td></tr>
<tr><td style="background:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
  <p style="margin:0;color:#9a9aaa;font-size:12px;">Powered by Masakhe · South African SMME Platform</p>
</td></tr>
</table></td></tr></table></body></html>`;

    await mailer.transporter.sendMail({
      from: `"${mailer.fromName}" <${mailer.fromEmail}>`,
      to: invoice.customer_email,
      ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
      subject: `${label} #${invoice.invoice_number} from ${businessName}`,
      html,
      attachments: [{
        filename: `${invoice.invoice_number}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      }],
    });

    res.json({ ok: true, sentTo: invoice.customer_email });
  } catch (err: any) {
    console.error("Invoice email error:", err);
    res.status(500).json({ error: err.message || "Failed to send email" });
  }
});

invoiceRouter.put("/:id", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const existing = await queryOne("SELECT id FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    const { customer_name, customer_email, customer_address, customer_phone, items, vat_enabled, reference, payment_terms, notes, template } = req.body;
    if (!customer_name || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "customer_name and items are required" });
    const docTemplate = Math.min(6, Math.max(1, parseInt(template) || 1));
    const vatOn = !!vat_enabled;
    let subtotalCents = 0;
    for (const it of items) subtotalCents += Math.round((it.qty || 1) * ((it.unitPrice || 0) * 100));
    const vatCents = vatOn ? Math.round(subtotalCents * 0.15) : 0;
    await execute(
      `UPDATE invoices SET customer_name=?, customer_email=?, customer_address=?, customer_phone=?, reference=?, payment_terms=?, notes=?, items_json=?, vat_enabled=?, vat_cents=?, total_cents=?, template=? WHERE id=?`,
      [customer_name, customer_email || null, customer_address || null, customer_phone || null, reference || null, payment_terms || null, notes || null, JSON.stringify(items), vatOn ? 1 : 0, vatCents, subtotalCents + vatCents, docTemplate, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update" });
  }
});

invoiceRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const existing = await queryOne("SELECT id FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete" });
  }
});
