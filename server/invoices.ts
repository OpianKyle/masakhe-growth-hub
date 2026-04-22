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

// Parse a #rrggbb hex string to pdf-lib RGB, returns null on invalid input
function hexToRgb(hex: string): RGB | null {
  const m = hex?.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
  if (!m) return null;
  return rgb(parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255);
}

// Return the user's custom invoice colour if set, otherwise the template default
function brandColor(user: any, defaultColor: RGB): RGB {
  if (user?.invoice_color) {
    const c = hexToRgb(user.invoice_color);
    if (c) return c;
  }
  return defaultColor;
}

// Lighten an RGB colour by blending toward white (factor 0–1)
function lighten(c: RGB, factor: number): RGB {
  return rgb(
    c.red   + (1 - c.red)   * factor,
    c.green + (1 - c.green) * factor,
    c.blue  + (1 - c.blue)  * factor,
  );
}

// Darken an RGB colour by multiplying channels (factor 0–1)
function darken(c: RGB, factor: number): RGB {
  return rgb(c.red * (1 - factor), c.green * (1 - factor), c.blue * (1 - factor));
}

const RIGHT = 545; // right margin for right-aligned text

// Count optional business info lines so headers can size themselves
function countBizLines(user: any): number {
  let n = 0;
  if (user?.physical_address) n++;
  if (user?.phone) n++;
  if (user?.email) n++;
  if (user?.vat_number) n++;
  if (user?.registration_number) n++;
  return n;
}

// Draw logo + business info side-by-side inside a coloured header
// Returns the y position just below the header content
function drawHeaderInfo(
  ctx: TemplateCtx,
  startY: number,
  textColor: RGB,
  subColor: RGB,
  leftPad: number = 30,
  maxLogoW: number = 140,
  maxLogoH: number = 60,
): number {
  const { page, font, fontBold, logo, user } = ctx;
  let logoW = 0;
  if (logo) {
    // Scale logo to fit
    let lw = (logo.w / logo.h) * maxLogoH;
    let lh = maxLogoH;
    if (lw > maxLogoW) { lw = maxLogoW; lh = (logo.h / logo.w) * maxLogoW; }
    page.drawImage(logo.image, { x: leftPad, y: startY - lh, width: lw, height: lh });
    logoW = lw + 14;
  }
  const textX = leftPad + logoW;
  let y = startY - 4;
  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(truncate(biz, 44), { x: textX, y, size: 16, font: fontBold, color: textColor });
  y -= 16;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 55), { x: textX, y, size: 8, font, color: subColor }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: textX, y, size: 8, font, color: subColor }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: textX, y, size: 8, font, color: subColor }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT: ${user.vat_number}`, { x: textX, y, size: 8, font, color: subColor }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg: ${user.registration_number}`, { x: textX, y, size: 8, font, color: subColor }); y -= 11; }
  return y;
}

// Compute dynamic header height based on content
function calcHeaderH(user: any, logo: { h: number } | null): number {
  const bizLines = 1 + countBizLines(user); // 1 for biz name
  const infoH = bizLines * 13 + 8;
  const logoH = logo ? logo.h : 0;
  return Math.max(logoH, infoH) + 32;
}

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
  const COL_AMT = RIGHT - 10; // 10pt padding from right border

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
  const amtRight = RIGHT - 10; // 10pt padding from the right border
  y -= 16;

  if (vatEnabled) {
    page.drawText("Subtotal:", { x: labelX, y, size: 9, font, color: grey });
    rText(page, `R${(subtotalCents / 100).toFixed(2)}`, amtRight, y, 9, font, black); y -= 20;
    page.drawText("VAT (15%):", { x: labelX, y, size: 9, font, color: grey });
    rText(page, `R${(vatCents / 100).toFixed(2)}`, amtRight, y, 9, font, black); y -= 14;
    page.drawRectangle({ x: labelX, y, width: RIGHT - labelX, height: 0.5, color: grey }); y -= 8;
  }

  const totalStr = `R${(invoice.total_cents / 100).toFixed(2)}`;
  const totalLabel = vatEnabled
    ? (isQuote ? "TOTAL ESTIMATE (incl. VAT):" : "TOTAL DUE (incl. VAT):")
    : (isQuote ? "TOTAL ESTIMATE:" : "TOTAL DUE:");

  if (boxBg) {
    const boxH = 38;
    page.drawRectangle({ x: labelX, y: y - 8, width: RIGHT - labelX, height: boxH, color: boxBg });
    page.drawText(totalLabel, { x: labelX + 8, y: y + 12, size: 8, font: fontBold, color: white });
    rText(page, totalStr, amtRight, y + 11, 13, fontBold, white);
    y -= boxH;
  } else {
    page.drawText(totalLabel, { x: labelX, y: y + 8, size: 8.5, font: fontBold, color: black });
    rText(page, totalStr, amtRight, y + 7, 14, fontBold, accentColor);
    y -= 30;
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
  page.drawText("Generated by Masakhe SMME Growth Hub  ·  masakheportal.co.za", { x: 50, y: 32, size: 7.5, font, color: lightGrey });
}

// ────────────────────────────────────────────────────────────────────────────
// Template 1 — CLASSIC (Green left stripe, clean white body)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate1(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const green = brandColor(user, rgb(0.08, 0.45, 0.27));
  const mintBg = lighten(green, 0.75);

  // Thick green left accent stripe (full height)
  page.drawRectangle({ x: 0, y: 0, width: 8, height: 842, color: green });

  // Doc title — always anchored top-right (never conflicts with biz name)
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 22);
  page.drawText(docTitle, { x: W - 30 - dtW, y: 800, size: 22, font: fontBold, color: green });

  // Logo top-left
  let y = 800;
  if (logo) {
    let lw = (logo.w / logo.h) * 60; let lh = 60;
    if (lw > 150) { lw = 150; lh = (logo.h / logo.w) * 150; }
    page.drawImage(logo.image, { x: 25, y: y - lh, width: lw, height: lh });
    y -= lh + 10;
  }

  // Business name — left side only, never goes past where the title starts
  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(truncate(biz, 38), { x: 25, y, size: 17, font: fontBold, color: green });
  y -= 16;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 60), { x: 25, y, size: 8, font, color: grey }); y -= 11; }
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
  const navy = brandColor(user, rgb(0.09, 0.22, 0.45));
  const navyLight = lighten(navy, 0.80);

  let y = 800;
  if (logo) { page.drawImage(logo.image, { x: 50, y: y - logo.h, width: logo.w, height: logo.h }); y -= logo.h + 18; }

  // Navy invoice info box — top right, overlapping biz info area
  const boxY = 800;
  const boxH = 90;
  const navyHighlight = lighten(navy, 0.55);
  page.drawRectangle({ x: 360, y: boxY - boxH, width: 185, height: boxH, color: navy });
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  page.drawText(docTitle, { x: 380, y: boxY - 20, size: 13, font: fontBold, color: white });
  page.drawText(invoice.invoice_number, { x: 380, y: boxY - 38, size: 10, font: fontBold, color: navyHighlight });
  page.drawText("Dated:", { x: 380, y: boxY - 52, size: 8, font, color: navyHighlight });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 420, y: boxY - 52, size: 8, font: fontBold, color: white });
  if (invoice.reference) {
    page.drawText("Ref:", { x: 380, y: boxY - 66, size: 8, font, color: navyHighlight });
    page.drawText(invoice.reference, { x: 404, y: boxY - 66, size: 8, font: fontBold, color: white });
  }
  if (isQuote) {
    page.drawText("Valid:", { x: 380, y: boxY - 80, size: 8, font, color: navyHighlight });
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
  const orange = brandColor(user, rgb(0.85, 0.40, 0.05));
  const warmTint = lighten(orange, 0.88);
  const dimGrey = rgb(0.75, 0.75, 0.75);

  // Dynamic header height so logo + biz info never overflow
  const headerH = Math.max(calcHeaderH(user, logo), 110);
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: dark });
  page.drawRectangle({ x: 0, y: 842 - headerH - 7, width: W, height: 7, color: orange });

  const startY = 842 - 14;
  drawHeaderInfo(ctx, startY, white, dimGrey, 30, 130, 55);

  // Large doc title right side in orange — fixed top-right position
  const docTitle = isQuote ? "QUOTE" : "INVOICE";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 32);
  page.drawText(docTitle, { x: W - 35 - dtW, y: 842 - 40, size: 32, font: fontBold, color: orange });
  rText(page, invoice.invoice_number, W - 30, 842 - 58, 9, fontBold, rgb(0.88, 0.88, 0.88));
  rText(page, new Date(invoice.created_at).toLocaleDateString("en-ZA"), W - 30, 842 - 71, 8, font, dimGrey);
  if (invoice.reference) rText(page, `Ref: ${invoice.reference}`, W - 30, 842 - 84, 8, font, dimGrey);

  let y = 842 - headerH - 7 - 18;

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
  const blue = brandColor(user, rgb(0.12, 0.35, 0.72));
  const skyBlue = lighten(blue, 0.82);
  const midBlue = lighten(blue, 0.45);

  // Dynamic header height: logo and biz text are placed SIDE BY SIDE so nothing overflows
  const headerH = Math.max(calcHeaderH(user, logo), 100);
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: blue });

  // Doc title top-right — always at a fixed anchor
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  rText(page, docTitle, W - 28, 842 - 22, 14, fontBold, white);

  // Logo left + biz info right-of-logo, side by side
  const startY = 842 - 14;
  drawHeaderInfo(ctx, startY, white, midBlue, 30, 130, 55);

  let y = 842 - headerH - 15;

  // Two side-by-side info boxes — taller to fit more customer detail
  const boxH = 88;
  const boxY = y - boxH;

  // Bill To box
  page.drawRectangle({ x: 50, y: boxY, width: 232, height: boxH, color: skyBlue });
  page.drawRectangle({ x: 50, y: boxY + boxH - 16, width: 232, height: 16, color: blue });
  const billLabel = isQuote ? "QUOTE FOR" : "BILL TO";
  page.drawText(billLabel, { x: 56, y: boxY + boxH - 12, size: 8.5, font: fontBold, color: white });
  page.drawText(truncate(invoice.customer_name, 30), { x: 56, y: boxY + boxH - 30, size: 10, font: fontBold, color: black });
  let cy = boxY + boxH - 44;
  if (invoice.customer_email) { page.drawText(truncate(invoice.customer_email, 34), { x: 56, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x: 56, y: cy, size: 8, font, color: grey }); cy -= 12; }
  if (invoice.customer_address) { page.drawText(truncate(invoice.customer_address, 34), { x: 56, y: cy, size: 8, font, color: grey }); }

  // Invoice Details box
  page.drawRectangle({ x: 313, y: boxY, width: 232, height: boxH, color: skyBlue });
  page.drawRectangle({ x: 313, y: boxY + boxH - 16, width: 232, height: 16, color: blue });
  const detailLabel = isQuote ? "QUOTE DETAILS" : "INVOICE DETAILS";
  page.drawText(detailLabel, { x: 319, y: boxY + boxH - 12, size: 8.5, font: fontBold, color: white });
  const numLabel = isQuote ? "Quote No:" : "Invoice No:";
  page.drawText(numLabel, { x: 319, y: boxY + boxH - 28, size: 8, font, color: grey });
  page.drawText(invoice.invoice_number, { x: 395, y: boxY + boxH - 28, size: 8, font: fontBold, color: black });
  page.drawText("Date:", { x: 319, y: boxY + boxH - 42, size: 8, font, color: grey });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 395, y: boxY + boxH - 42, size: 8, font: fontBold, color: black });
  if (invoice.reference) {
    page.drawText("Ref:", { x: 319, y: boxY + boxH - 56, size: 8, font, color: grey });
    page.drawText(truncate(invoice.reference, 20), { x: 395, y: boxY + boxH - 56, size: 8, font: fontBold, color: black });
  }
  if (isQuote) {
    page.drawText("Valid For:", { x: 319, y: boxY + boxH - 70, size: 8, font, color: grey });
    page.drawText(invoice.payment_terms || "30 days", { x: 395, y: boxY + boxH - 70, size: 8, font: fontBold, color: black });
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
  const burg = brandColor(user, rgb(0.52, 0.07, 0.07));
  const creamBg = lighten(burg, 0.92);

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
  const purple = brandColor(user, rgb(0.42, 0.13, 0.69));
  const purpleMid = lighten(purple, 0.15);
  const purpleDark = darken(purple, 0.55);
  const lavender = lighten(purple, 0.82);
  const midPurple = lighten(purple, 0.45);

  // Dynamic header height so logo + biz info are side-by-side and never overflow
  const headerH = Math.max(calcHeaderH(user, logo), 115);
  page.drawRectangle({ x: 0, y: 842 - headerH, width: W, height: headerH, color: purple });
  page.drawRectangle({ x: 260, y: 842 - headerH, width: 335, height: headerH, color: purpleMid });
  page.drawRectangle({ x: 340, y: 842 - headerH, width: 255, height: headerH, color: rgb(0.48, 0.19, 0.74) });

  // Logo + biz info side-by-side on the left
  const startY = 842 - 14;
  drawHeaderInfo(ctx, startY, white, midPurple, 28, 120, 52);

  // Large doc title right
  const docTitle = isQuote ? "QUOTE" : "INVOICE";
  rText(page, docTitle, W - 28, 842 - 40, 28, fontBold, white);

  // Invoice number badge (dark pill) — anchored to top-right
  page.drawRectangle({ x: W - 210, y: 842 - 78, width: 180, height: 20, color: purpleDark });
  rText(page, invoice.invoice_number, W - 32, 842 - 73, 9, fontBold, white);
  rText(page, new Date(invoice.created_at).toLocaleDateString("en-ZA"), W - 32, 842 - 89, 8, font, midPurple);
  if (invoice.reference) rText(page, `Ref: ${invoice.reference}`, W - 32, 842 - 101, 8, font, midPurple);

  // Left purple sidebar (body only, below header)
  page.drawRectangle({ x: 0, y: 40, width: 8, height: 842 - headerH - 40, color: purple });

  let y = 842 - headerH - 18;
  y = drawCustomerInfo(ctx, 25, y, purple);
  y -= 14;
  y = drawStandardTable(ctx, y, purple, white, lavender);
  y = drawTotals(ctx, y, purple, purple);
  y -= 10;
  drawFooter(ctx, y, purple);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 7 — PLAIN (Black & white, professional, no colour fills)
// ────────────────────────────────────────────────────────────────────────────
function renderTemplate7(ctx: TemplateCtx) {
  const { page, font, fontBold, logo, invoice, user, isQuote } = ctx;
  const darkGrey = rgb(0.15, 0.15, 0.15);
  const midGrey = rgb(0.45, 0.45, 0.45);
  const lineGrey = rgb(0.75, 0.75, 0.75);
  const veryLight = rgb(0.94, 0.94, 0.94);

  // ── Header zone (white background) ──────────────────────────────────────
  // Doc title always top-right
  const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
  const dtW = fontBold.widthOfTextAtSize(docTitle, 20);
  page.drawText(docTitle, { x: W - 30 - dtW, y: 800, size: 20, font: fontBold, color: darkGrey });

  // Logo top-left, then business info below / beside logo
  let y = 800;
  if (logo) {
    let lw = (logo.w / logo.h) * 60; let lh = 60;
    if (lw > 150) { lw = 150; lh = (logo.h / logo.w) * 150; }
    page.drawImage(logo.image, { x: 50, y: y - lh, width: lw, height: lh });
    y -= lh + 10;
  }
  const biz = user?.business_name || user?.full_name || "Business";
  page.drawText(truncate(biz, 40), { x: 50, y, size: 16, font: fontBold, color: darkGrey }); y -= 14;
  if (user?.physical_address) { page.drawText(truncate(user.physical_address, 65), { x: 50, y, size: 8, font, color: midGrey }); y -= 11; }
  if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 50, y, size: 8, font, color: midGrey }); y -= 11; }
  if (user?.email) { page.drawText(user.email, { x: 50, y, size: 8, font, color: midGrey }); y -= 11; }
  if (user?.vat_number) { page.drawText(`VAT No: ${user.vat_number}`, { x: 50, y, size: 8, font, color: midGrey }); y -= 11; }
  if (user?.registration_number) { page.drawText(`Reg No: ${user.registration_number}`, { x: 50, y, size: 8, font, color: midGrey }); y -= 11; }

  // Thick divider below header
  y -= 8;
  page.drawRectangle({ x: 50, y, width: 495, height: 2, color: darkGrey });
  y -= 16;

  // ── Two info boxes: Bill To (left) | Invoice Details (right) ────────────
  const boxH = 88;
  const boxY = y - boxH;

  // Bill To — simple border, no fill
  page.drawRectangle({ x: 50, y: boxY, width: 232, height: boxH, color: veryLight });
  page.drawRectangle({ x: 50, y: boxY + boxH - 18, width: 232, height: 18, color: darkGrey });
  const billLabel = isQuote ? "QUOTE FOR" : "BILL TO";
  page.drawText(billLabel, { x: 56, y: boxY + boxH - 13, size: 8.5, font: fontBold, color: white });
  page.drawText(truncate(invoice.customer_name, 30), { x: 56, y: boxY + boxH - 32, size: 10, font: fontBold, color: darkGrey });
  let cy = boxY + boxH - 46;
  if (invoice.customer_email) { page.drawText(truncate(invoice.customer_email, 34), { x: 56, y: cy, size: 8, font, color: midGrey }); cy -= 12; }
  if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x: 56, y: cy, size: 8, font, color: midGrey }); cy -= 12; }
  if (invoice.customer_address) { page.drawText(truncate(invoice.customer_address, 34), { x: 56, y: cy, size: 8, font, color: midGrey }); }

  // Invoice Details — simple border, no fill
  page.drawRectangle({ x: 313, y: boxY, width: 232, height: boxH, color: veryLight });
  page.drawRectangle({ x: 313, y: boxY + boxH - 18, width: 232, height: 18, color: darkGrey });
  const detailLabel = isQuote ? "QUOTE DETAILS" : "INVOICE DETAILS";
  page.drawText(detailLabel, { x: 319, y: boxY + boxH - 13, size: 8.5, font: fontBold, color: white });
  const numLabel = isQuote ? "Quote No:" : "Invoice No:";
  page.drawText(numLabel, { x: 319, y: boxY + boxH - 30, size: 8, font, color: midGrey });
  page.drawText(invoice.invoice_number, { x: 400, y: boxY + boxH - 30, size: 8, font: fontBold, color: darkGrey });
  page.drawText("Date:", { x: 319, y: boxY + boxH - 44, size: 8, font, color: midGrey });
  page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 400, y: boxY + boxH - 44, size: 8, font: fontBold, color: darkGrey });
  if (invoice.reference) {
    page.drawText("Ref:", { x: 319, y: boxY + boxH - 58, size: 8, font, color: midGrey });
    page.drawText(truncate(invoice.reference, 20), { x: 400, y: boxY + boxH - 58, size: 8, font: fontBold, color: darkGrey });
  }
  if (isQuote) {
    page.drawText("Valid For:", { x: 319, y: boxY + boxH - 72, size: 8, font, color: midGrey });
    page.drawText(invoice.payment_terms || "30 days", { x: 400, y: boxY + boxH - 72, size: 8, font: fontBold, color: darkGrey });
  }

  y = boxY - 16;

  // ── Item table — dark header row, alternating very-light rows ───────────
  const ROW_H = 20;
  const COL_QTY = 358; const COL_UNIT = 435; const COL_AMT = RIGHT - 10;
  page.drawRectangle({ x: 50, y: y - 6, width: 495, height: 26, color: darkGrey });
  page.drawText("Description", { x: 58, y: y + 5, size: 9, font: fontBold, color: white });
  rText(page, "Qty", COL_QTY, y + 5, 9, fontBold, white);
  rText(page, "Unit Price", COL_UNIT, y + 5, 9, fontBold, white);
  rText(page, "Amount", COL_AMT, y + 5, 9, fontBold, white);
  y -= 30;

  ctx.items.forEach((item: any, idx: number) => {
    const qty = item.qty || 1;
    const up = item.unitPrice || 0;
    const amt = qty * up;
    if (idx % 2 === 1) page.drawRectangle({ x: 50, y: y - 5, width: 495, height: ROW_H, color: veryLight });
    page.drawText(truncate(item.name || "Item", 55), { x: 58, y: y + 2, size: 9, font, color: darkGrey });
    rText(page, String(qty), COL_QTY, y + 2, 9, font, darkGrey);
    rText(page, `R${up.toFixed(2)}`, COL_UNIT, y + 2, 9, font, darkGrey);
    rText(page, `R${amt.toFixed(2)}`, COL_AMT, y + 2, 9, fontBold, darkGrey);
    y -= ROW_H;
    page.drawRectangle({ x: 50, y: y + 10, width: 495, height: 0.4, color: lineGrey });
  });

  // ── Totals ───────────────────────────────────────────────────────────────
  const { vatEnabled, vatCents, subtotalCents } = ctx;
  const labelX = 350;
  const amtRight = RIGHT - 10;
  y -= 14;

  if (vatEnabled) {
    page.drawText("Subtotal:", { x: labelX, y, size: 9, font, color: midGrey });
    rText(page, `R${(subtotalCents / 100).toFixed(2)}`, amtRight, y, 9, font, darkGrey); y -= 18;
    page.drawText("VAT (15%):", { x: labelX, y, size: 9, font, color: midGrey });
    rText(page, `R${(vatCents / 100).toFixed(2)}`, amtRight, y, 9, font, darkGrey); y -= 12;
    page.drawRectangle({ x: labelX, y, width: RIGHT - labelX, height: 0.5, color: lineGrey }); y -= 8;
  }

  const totalStr = `R${(invoice.total_cents / 100).toFixed(2)}`;
  const totalLabel = vatEnabled
    ? (isQuote ? "TOTAL ESTIMATE (incl. VAT):" : "TOTAL DUE (incl. VAT):")
    : (isQuote ? "TOTAL ESTIMATE:" : "TOTAL DUE:");

  // Outlined total box (no fill, just border)
  const totalBoxH = 38;
  page.drawRectangle({ x: labelX, y: y - 8, width: RIGHT - labelX, height: totalBoxH, color: veryLight });
  page.drawRectangle({ x: labelX, y: y - 8, width: RIGHT - labelX, height: totalBoxH,
    borderColor: darkGrey, borderWidth: 1.5 });
  page.drawText(totalLabel, { x: labelX + 8, y: y + 12, size: 7.5, font: fontBold, color: darkGrey });
  rText(page, totalStr, amtRight, y + 10, 14, fontBold, darkGrey);
  y -= totalBoxH;

  // ── Footer ───────────────────────────────────────────────────────────────
  y -= 10;
  drawFooter(ctx, y, darkGrey);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 8 — fully custom (driven by template_config JSON)
// ────────────────────────────────────────────────────────────────────────────

interface CustomConfig {
  accentColor?: string;
  documentTitle?: string;
  currencySymbol?: string;
  vatRate?: number;
  headerLayout?: "left" | "centered";
  tableStyle?: "striped" | "bordered" | "minimal";
  /* header style */
  headerBg?: "white" | "accent" | "dark" | "gradient" | "custom";
  headerCustomBg?: string;
  headerTitleStyle?: "large" | "badge" | "outline" | "minimal";
  headerDivider?: "bar" | "line" | "double" | "shadow" | "none";
  headerLogoSize?: "sm" | "md" | "lg";
  headerLogoShape?: "square" | "rounded" | "circle";
  headerPadding?: "compact" | "normal" | "spacious";
  headerTagline?: string;
  headerShowAddress?: boolean;
  headerShowPhone?: boolean;
  /* layout positions */
  billToPosition?: "left" | "right";
  totalsAlign?: "right" | "left";
  notesPosition?: "after-items" | "before-totals" | "after-bank";
  bankPosition?: "footer" | "after-totals";
  footerText?: string;
  showFields?: {
    logo?: boolean;
    vatNumber?: boolean;
    customerPhone?: boolean;
    customerAddress?: boolean;
    reference?: boolean;
    paymentTerms?: boolean;
    vat?: boolean;
    notes?: boolean;
    bankDetails?: boolean;
  };
  labels?: {
    itemCol?: string;
    qtyCol?: string;
    unitPriceCol?: string;
    amountCol?: string;
    subtotalLabel?: string;
    vatLabel?: string;
    totalLabel?: string;
    notesLabel?: string;
    billToLabel?: string;
  };
}

function renderCustomTemplate(ctx: TemplateCtx, rawConfig: any) {
  const cfg: CustomConfig = rawConfig || {};
  const sf = cfg.showFields || {};
  const lbl = cfg.labels || {};

  const accent = hexToRgb(cfg.accentColor || "#156C41") || rgb(0.08, 0.42, 0.25);
  const sym = cfg.currencySymbol || "R";
  const docTitle = cfg.documentTitle || (ctx.isQuote ? "QUOTE" : "TAX INVOICE");
  const vatRate = cfg.vatRate ?? 15;

  const showLogo = sf.logo !== false;
  const showVatNum = sf.vatNumber !== false;
  const showPhone = sf.customerPhone !== false;
  const showAddress = sf.customerAddress !== false;
  const showRef = sf.reference !== false;
  const showTerms = sf.paymentTerms !== false;
  const showVat = sf.vat !== false;
  const showNotes = sf.notes !== false;
  const showBank = sf.bankDetails !== false;

  const headerShowAddress = cfg.headerShowAddress !== false;
  const headerShowPhone = cfg.headerShowPhone !== false;
  const billToPos = cfg.billToPosition || "left";
  const totalsAlign = cfg.totalsAlign || "right";
  const notesPos = cfg.notesPosition || "after-items";
  const bankPos = cfg.bankPosition || "footer";

  const { page, font, fontBold, logo, invoice, user, items, vatEnabled, vatCents, subtotalCents, isQuote } = ctx;
  const pageH = 842;
  const L = 40, R2 = 555;
  const W2 = R2 - L;

  // ── Resolve header background colour ────────────────────────
  let headerBgColor: RGB | null = null;
  if (cfg.headerBg === "accent") headerBgColor = accent;
  else if (cfg.headerBg === "dark") headerBgColor = rgb(0.10, 0.13, 0.25);
  else if (cfg.headerBg === "gradient") headerBgColor = darken(accent, 0.15);
  else if (cfg.headerBg === "custom") headerBgColor = hexToRgb(cfg.headerCustomBg || "#2d3748") || rgb(0.18, 0.21, 0.28);
  const isColoredHeader = !!headerBgColor;
  const hMain = isColoredHeader ? white : black;
  const hSub = isColoredHeader ? rgb(0.85, 0.87, 0.90) : grey;
  const titleColor = isColoredHeader ? white : accent;

  // ── Logo sizing ────────────────────────────────────────────
  const logoSizeMap = { sm: 28, md: 42, lg: 60 } as const;
  const logoBox = logoSizeMap[(cfg.headerLogoSize || "md")];
  const padMap = { compact: { top: 18, side: 32, bottom: 14 }, normal: { top: 26, side: 32, bottom: 22 }, spacious: { top: 36, side: 40, bottom: 32 } } as const;
  const headerPad = padMap[(cfg.headerPadding || "normal")];

  const drawText = (text: string, x: number, y: number, size: number, f: PDFFont, color: RGB, maxW?: number) => {
    if (!text) return;
    let t = text;
    if (maxW) {
      while (t.length > 0 && f.widthOfTextAtSize(t, size) > maxW) t = t.slice(0, -1);
      if (t.length < text.length) t = t.slice(0, -3) + "...";
    }
    page.drawText(t, { x, y, size, font: f, color });
  };
  const rText = (text: string, rx: number, y: number, size: number, f: PDFFont, color: RGB) => {
    const tw = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: rx - tw, y, size, font: f, color });
  };
  const cText = (text: string, cx: number, y: number, size: number, f: PDFFont, color: RGB) => {
    const tw = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: cx - tw / 2, y, size, font: f, color });
  };

  // Helper to draw the document title with a configurable style
  const drawDocTitle = (rightX: number, topY: number): number => {
    const style = cfg.headerTitleStyle || "large";
    const titleSize = 16;
    const titleW = fontBold.widthOfTextAtSize(docTitle, titleSize);
    if (style === "badge") {
      const padX = 8, padY = 4;
      page.drawRectangle({ x: rightX - titleW - padX * 2, y: topY - titleSize - padY, width: titleW + padX * 2, height: titleSize + padY * 2, color: isColoredHeader ? rgb(1, 1, 1) : accent });
      drawText(docTitle, rightX - titleW - padX, topY - titleSize, titleSize, fontBold, isColoredHeader ? accent : white);
      return topY - titleSize - padY * 2 - 4;
    }
    if (style === "outline") {
      const padX = 8, padY = 4;
      page.drawRectangle({ x: rightX - titleW - padX * 2, y: topY - titleSize - padY, width: titleW + padX * 2, height: titleSize + padY * 2, borderColor: isColoredHeader ? white : accent, borderWidth: 1.2 });
      drawText(docTitle, rightX - titleW - padX, topY - titleSize, titleSize, fontBold, titleColor);
      return topY - titleSize - padY * 2 - 4;
    }
    if (style === "minimal") {
      const sz = 9;
      const w = fontBold.widthOfTextAtSize(docTitle, sz);
      drawText(docTitle.toUpperCase(), rightX - w, topY - sz, sz, fontBold, hSub);
      return topY - sz - 4;
    }
    drawText(docTitle, rightX - titleW, topY - titleSize, titleSize, fontBold, titleColor);
    return topY - titleSize - 4;
  };

  // ── HEADER ─────────────────────────────────────────────────
  const headerStartY = pageH;
  let headerHeight: number;

  // Calculate header content height first to draw bg correctly
  const bizName = user?.business_name || user?.full_name || "";
  const bizLines: string[] = [];
  if (cfg.headerTagline) bizLines.push(cfg.headerTagline);
  if (headerShowAddress && user?.physical_address) bizLines.push(user.physical_address);
  if (headerShowPhone && user?.phone) bizLines.push(user.phone);
  if (showVatNum && user?.vat_number) bizLines.push(`VAT: ${user.vat_number}`);

  // Header height: top pad + max(logo, biz block) + bottom pad
  const bizTextBlockH = 16 /* name */ + bizLines.length * 11;
  const contentH = Math.max(showLogo && logo ? logoBox : 0, bizTextBlockH);
  headerHeight = headerPad.top + contentH + headerPad.bottom;

  // Draw header background
  if (isColoredHeader && headerBgColor) {
    page.drawRectangle({ x: 0, y: headerStartY - headerHeight, width: W, height: headerHeight, color: headerBgColor });
  } else {
    // top accent bar (only when divider="bar" and white header)
    if ((cfg.headerDivider || "bar") === "bar") {
      page.drawRectangle({ x: 0, y: headerStartY - 5, width: W, height: 5, color: accent });
    }
  }

  // Header content positions
  const hContentTopY = headerStartY - headerPad.top;
  let y: number;

  if (cfg.headerLayout === "centered") {
    let cy = hContentTopY;
    if (showLogo && logo) {
      const aspect = logo.w / logo.h;
      const lh = logoBox;
      const lw = Math.min(lh * aspect, 180);
      page.drawImage(logo.image, { x: (W - lw) / 2, y: cy - lh, width: lw, height: lh });
      cy -= lh + 8;
    }
    cText(bizName, W / 2, cy - 14, 14, fontBold, hMain);
    cy -= 16;
    for (const line of bizLines) {
      cText(line, W / 2, cy - 9, 8.5, font, hSub);
      cy -= 11;
    }
    cy -= 6;
    drawDocTitle(W / 2 + (fontBold.widthOfTextAtSize(docTitle, 16) / 2), cy);
    y = headerStartY - headerHeight;
  } else {
    // Left layout: logo + biz info (left), title + meta (right) — side by side
    const leftBlockX = headerPad.side;
    let leftCursorY = hContentTopY;
    let textStartX = leftBlockX;
    if (showLogo && logo) {
      const aspect = logo.w / logo.h;
      const lh = logoBox;
      const lw = Math.min(lh * aspect, 120);
      page.drawImage(logo.image, { x: leftBlockX, y: hContentTopY - lh, width: lw, height: lh });
      textStartX = leftBlockX + lw + 12;
    }
    // biz name
    drawText(bizName, textStartX, leftCursorY - 14, 13, fontBold, hMain, 280);
    let infoY = leftCursorY - 26;
    for (const line of bizLines) {
      drawText(line, textStartX, infoY, 8.5, font, hSub, 280);
      infoY -= 11;
    }

    // right side: title + meta
    const rightX = W - headerPad.side;
    const afterTitleY = drawDocTitle(rightX, hContentTopY);
    rText(`# ${invoice.invoice_number}`, rightX, afterTitleY - 4, 9, font, hSub);
    rText(`Date: ${new Date(invoice.created_at).toLocaleDateString("en-ZA")}`, rightX, afterTitleY - 16, 9, font, hSub);
    const dueDate = new Date(new Date(invoice.created_at).getTime() + 7 * 86400000).toLocaleDateString("en-ZA");
    rText(`Due: ${dueDate}`, rightX, afterTitleY - 28, 9, font, hSub);

    y = headerStartY - headerHeight;
  }

  // Header divider
  const div = cfg.headerDivider || "bar";
  if (isColoredHeader) {
    if (div !== "none") page.drawRectangle({ x: 0, y: y - 4, width: W, height: 4, color: darken(accent, 0.25) });
    y -= 4;
  } else {
    if (div === "line") { page.drawRectangle({ x: L, y: y - 1, width: W2, height: 0.6, color: lightGrey }); y -= 1; }
    else if (div === "double") { page.drawRectangle({ x: L, y: y - 1, width: W2, height: 0.6, color: lightGrey }); page.drawRectangle({ x: L, y: y - 5, width: W2, height: 0.6, color: lightGrey }); y -= 5; }
    else if (div === "shadow") { page.drawRectangle({ x: 0, y: y - 4, width: W, height: 4, color: rgb(0.92, 0.92, 0.92) }); y -= 4; }
    // "bar" already drawn at top, "none" does nothing
  }
  y -= 14;

  // ── BILL TO + DETAILS ROW ──────────────────────────────────
  const colW = (W2 - 12) / 2;
  // Compute box height based on content
  let btLines = 1; // customer name
  if (showAddress && invoice.customer_address) btLines++;
  if (showPhone && invoice.customer_phone) btLines++;
  if (invoice.customer_email) btLines++;
  let dtLines = 0;
  if (showRef && invoice.reference) dtLines++;
  if (showTerms && invoice.payment_terms) dtLines++;
  const boxH = Math.max(56, 18 + Math.max(btLines, dtLines) * 11 + 8);

  const boxBg = rgb(0.97, 0.97, 0.97);
  const billToX = billToPos === "right" ? L + colW + 12 : L;
  const detailsX = billToPos === "right" ? L : L + colW + 12;

  // Bill To
  page.drawRectangle({ x: billToX, y: y - boxH, width: colW, height: boxH, color: boxBg });
  const btLabel = (lbl.billToLabel || "Bill To").toUpperCase();
  drawText(btLabel, billToX + 8, y - 12, 7, fontBold, accent);
  drawText(invoice.customer_name || "", billToX + 8, y - 24, 9.5, fontBold, black, colW - 16);
  let btY = y - 36;
  if (showAddress && invoice.customer_address) { drawText(invoice.customer_address, billToX + 8, btY, 8, font, grey, colW - 16); btY -= 11; }
  if (showPhone && invoice.customer_phone) { drawText(invoice.customer_phone, billToX + 8, btY, 8, font, grey); btY -= 11; }
  if (invoice.customer_email) drawText(invoice.customer_email, billToX + 8, btY, 8, font, grey, colW - 16);

  // Details
  page.drawRectangle({ x: detailsX, y: y - boxH, width: colW, height: boxH, color: boxBg });
  let detY = y - 14;
  if (showRef && invoice.reference) {
    drawText("Reference:", detailsX + 8, detY, 8, fontBold, rgb(0.2, 0.2, 0.2));
    drawText(invoice.reference, detailsX + 8 + font.widthOfTextAtSize("Reference: ", 8) + 4, detY, 8, font, grey, colW - 90);
    detY -= 12;
  }
  if (showTerms && invoice.payment_terms) {
    drawText("Terms:", detailsX + 8, detY, 8, fontBold, rgb(0.2, 0.2, 0.2));
    drawText(invoice.payment_terms, detailsX + 8 + font.widthOfTextAtSize("Terms: ", 8) + 4, detY, 8, font, grey, colW - 70);
    detY -= 12;
  }
  y -= boxH + 16;

  // ── ITEMS TABLE ────────────────────────────────────────────
  const cols = [
    { label: lbl.itemCol || "Description", x: L + 6, w: W2 * 0.50, align: "left" as const },
    { label: lbl.qtyCol || "Qty", x: L + W2 * 0.50, w: W2 * 0.10, align: "center" as const },
    { label: lbl.unitPriceCol || "Unit Price", x: L + W2 * 0.60, w: W2 * 0.20, align: "right" as const },
    { label: lbl.amountCol || "Amount", x: L + W2 * 0.80, w: W2 * 0.20, align: "right" as const },
  ];
  const headerRowH = 20;
  page.drawRectangle({ x: L, y: y - headerRowH, width: W2, height: headerRowH, color: accent });
  for (const col of cols) {
    if (col.align === "right") rText(col.label, col.x + col.w - 6, y - headerRowH + 6, 8.5, fontBold, white);
    else if (col.align === "center") cText(col.label, col.x + col.w / 2, y - headerRowH + 6, 8.5, fontBold, white);
    else drawText(col.label, col.x, y - headerRowH + 6, 8.5, fontBold, white);
  }
  y -= headerRowH;

  const rowH = 20;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isStriped = (cfg.tableStyle || "striped") === "striped";
    const isBordered = cfg.tableStyle === "bordered";
    if (isStriped && i % 2 === 0) page.drawRectangle({ x: L, y: y - rowH, width: W2, height: rowH, color: rgb(0.975, 0.98, 0.975) });
    if (isBordered) page.drawRectangle({ x: L, y: y - rowH, width: W2, height: rowH, borderColor: lightGrey, borderWidth: 0.5 });
    const amt = (item.qty || 1) * (item.unitPrice || 0);
    drawText(item.name || "", L + 6, y - rowH + 6, 9, font, black, W2 * 0.48);
    cText(String(item.qty || 1), L + W2 * 0.50 + W2 * 0.05, y - rowH + 6, 9, font, grey);
    rText(`${sym}${(item.unitPrice || 0).toFixed(2)}`, L + W2 * 0.80 - 6, y - rowH + 6, 9, font, grey);
    rText(`${sym}${amt.toFixed(2)}`, R2 - 6, y - rowH + 6, 9, fontBold, black);
    y -= rowH;
  }

  // small spacer + thin divider
  page.drawRectangle({ x: L, y: y - 1, width: W2, height: 0.4, color: lightGrey });
  y -= 12;

  // ── CONTENT BLOCK BUILDERS ────────────────────────────────
  const drawTotals = (curY: number): number => {
    const totalsW = 220;
    const totalsX = totalsAlign === "left" ? L : R2 - totalsW;
    let ty = curY;

    drawText(lbl.subtotalLabel || "Subtotal", totalsX + 10, ty - 10, 9, font, grey);
    rText(`${sym}${(subtotalCents / 100).toFixed(2)}`, totalsX + totalsW - 10, ty - 10, 9, font, grey);
    ty -= 16;

    if (vatEnabled && showVat) {
      const vatLbl = (lbl.vatLabel || `VAT (${vatRate}%)`).replace("15%", `${vatRate}%`);
      drawText(vatLbl, totalsX + 10, ty - 10, 9, font, grey);
      rText(`${sym}${(vatCents / 100).toFixed(2)}`, totalsX + totalsW - 10, ty - 10, 9, font, grey);
      ty -= 16;
    }

    const totalH = 26;
    page.drawRectangle({ x: totalsX, y: ty - totalH, width: totalsW, height: totalH, color: accent });
    const totLbl = lbl.totalLabel || (isQuote ? "TOTAL ESTIMATE" : "TOTAL DUE");
    drawText(totLbl, totalsX + 10, ty - totalH + 9, 10, fontBold, white);
    rText(`${sym}${(invoice.total_cents / 100).toFixed(2)}`, totalsX + totalsW - 10, ty - totalH + 9, 12, fontBold, white);
    return ty - totalH - 14;
  };

  const drawNotes = (curY: number): number => {
    if (!showNotes || !invoice.notes) return curY;
    const notesLbl = (lbl.notesLabel || "Notes").toUpperCase();
    page.drawRectangle({ x: L, y: curY - 24, width: 3, height: 26, color: accent });
    drawText(notesLbl, L + 10, curY - 8, 8, fontBold, accent);
    drawText(invoice.notes, L + 10, curY - 22, 8.5, font, grey, W2 - 16);
    return curY - 36;
  };

  const drawBank = (curY: number): number => {
    if (!showBank || !(user?.bank_name || user?.account_number)) return curY;
    let by = curY;
    page.drawRectangle({ x: L, y: by - 1, width: W2, height: 0.5, color: lightGrey });
    by -= 12;
    const bCols = [
      { label: "BANK", value: user.bank_name },
      { label: "ACCOUNT NAME", value: user.account_name },
      { label: "ACCOUNT NO.", value: user.account_number },
      { label: "BRANCH CODE", value: user.branch_code },
    ].filter(b => b.value);
    if (bCols.length === 0) return curY;
    const bColW = W2 / 4;
    for (let i = 0; i < bCols.length; i++) {
      const bx = L + i * bColW;
      drawText(bCols[i].label, bx, by, 7, fontBold, accent);
      drawText(bCols[i].value, bx, by - 11, 8.5, font, black, bColW - 6);
    }
    return by - 24;
  };

  const drawFooter = (curY: number): number => {
    if (!cfg.footerText) return curY;
    let fy = curY;
    // dashed-style divider (approximate with short rects)
    const dashY = fy - 4;
    let dx = L;
    while (dx < R2) {
      page.drawRectangle({ x: dx, y: dashY, width: 4, height: 0.5, color: lightGrey });
      dx += 8;
    }
    fy -= 12;
    cText(cfg.footerText, W / 2, fy - 8, 8.5, font, grey);
    return fy - 16;
  };

  // ── ASSEMBLE BODY IN CHOSEN ORDER ─────────────────────────
  // Build ordered list of section drawers
  type SectionId = "totals" | "notes" | "bank" | "footer";
  const order: SectionId[] = [];
  if (notesPos === "before-totals") order.push("notes");
  order.push("totals");
  if (notesPos === "after-items") order.push("notes");
  if (bankPos === "after-totals") order.push("bank");
  if (notesPos === "after-bank") order.push("notes");
  if (bankPos === "footer") order.push("bank");
  order.push("footer");

  for (const id of order) {
    if (id === "totals") y = drawTotals(y);
    else if (id === "notes") y = drawNotes(y);
    else if (id === "bank") y = drawBank(y);
    else if (id === "footer") y = drawFooter(y);
  }

  // Bottom accent bar
  page.drawRectangle({ x: 0, y: 0, width: W, height: 4, color: accent });
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
    const { customerName, customerEmail, customerAddress, customerPhone, items, vatEnabled, reference, paymentTerms, notes, type, template, templateConfig } = req.body;
    if (!customerName || !items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "customerName and items are required" });
    const docType = type === "quote" ? "quote" : "invoice";
    const docTemplate = Math.min(8, Math.max(1, parseInt(template) || 1));
    const subtotalCents = items.reduce((sum: number, item: any) => sum + Math.round((item.qty || 1) * (item.unitPrice || 0) * 100), 0);
    const vatCents = vatEnabled ? Math.round(subtotalCents * 0.15) : 0;
    const totalCents = subtotalCents + vatCents;
    const prefix = docType === "quote" ? "QUO" : "INV";
    const count = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ? AND type = ?", [userId, docType]))?.c || 0;
    const docNumber = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const id = randomUUID();
    const now = new Date().toISOString();
    const configJson = templateConfig ? JSON.stringify(templateConfig) : null;
    await execute(
      `INSERT INTO invoices (id, user_id, invoice_number, customer_name, customer_email, customer_address, customer_phone, reference, payment_terms, notes, total_cents, vat_enabled, vat_cents, items_json, status, type, template, template_config, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'final', ?, ?, ?, ?)`,
      [id, userId, docNumber, customerName, customerEmail || null, customerAddress || null, customerPhone || null, reference || null, paymentTerms || null, notes || null, totalCents, vatEnabled ? 1 : 0, vatCents, JSON.stringify(items), docType, docTemplate, configJson, now]
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
      template_config: inv.template_config ? JSON.parse(inv.template_config) : null,
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
              bp.invoice_color, bp.bank_name, bp.account_name, bp.account_type, bp.account_number,
              bp.branch_code, bp.registration_number
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

    if (templateNum === 8) {
      const rawConfig = invoice.template_config ? JSON.parse(invoice.template_config) : {};
      renderCustomTemplate(ctx, rawConfig);
    } else {
      switch (templateNum) {
        case 2: renderTemplate2(ctx); break;
        case 3: renderTemplate3(ctx); break;
        case 4: renderTemplate4(ctx); break;
        case 5: renderTemplate5(ctx); break;
        case 6: renderTemplate6(ctx); break;
        case 7: renderTemplate7(ctx); break;
        default: renderTemplate1(ctx);
      }
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
      `SELECT u.full_name, u.email, u.role, bp.business_name, bp.phone, bp.physical_address, bp.logo_url, bp.vat_number,
              bp.invoice_color, bp.bank_name, bp.account_name, bp.account_type, bp.account_number,
              bp.branch_code, bp.registration_number
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
    if (templateNum === 8) {
      const rawConfig = invoice.template_config ? JSON.parse(invoice.template_config) : {};
      renderCustomTemplate(ctx, rawConfig);
    } else {
      switch (templateNum) {
        case 2: renderTemplate2(ctx); break;
        case 3: renderTemplate3(ctx); break;
        case 4: renderTemplate4(ctx); break;
        case 5: renderTemplate5(ctx); break;
        case 6: renderTemplate6(ctx); break;
        case 7: renderTemplate7(ctx); break;
        default: renderTemplate1(ctx);
      }
    }
    const pdfBytes = await pdfDoc.save();

    const businessName = user?.business_name || mailer.fromName;
    const label = isQuote ? "Quote" : "Invoice";
    const totalFormatted = `R${(invoice.total_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
    const dateStr = new Date(invoice.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
    const appUrl = process.env.APP_URL || "https://masakheportal.co.za";

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
  ${user?.role === "admin" ? `<table cellspacing="0" cellpadding="0" style="margin:0 0 24px;"><tr><td style="background:#007749;border-radius:8px;"><a href="${appUrl}/dashboard/billing?invId=${invoice.id}" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Pay Now — ${totalFormatted}</a></td></tr></table>` : ""}
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
    const { customer_name, customer_email, customer_address, customer_phone, items, vat_enabled, reference, payment_terms, notes, template, templateConfig } = req.body;
    if (!customer_name || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "customer_name and items are required" });
    const docTemplate = Math.min(8, Math.max(1, parseInt(template) || 1));
    const vatOn = !!vat_enabled;
    let subtotalCents = 0;
    for (const it of items) subtotalCents += Math.round((it.qty || 1) * ((it.unitPrice || 0) * 100));
    const vatCents = vatOn ? Math.round(subtotalCents * 0.15) : 0;
    const configJson = templateConfig ? JSON.stringify(templateConfig) : null;
    await execute(
      `UPDATE invoices SET customer_name=?, customer_email=?, customer_address=?, customer_phone=?, reference=?, payment_terms=?, notes=?, items_json=?, vat_enabled=?, vat_cents=?, total_cents=?, template=?, template_config=? WHERE id=?`,
      [customer_name, customer_email || null, customer_address || null, customer_phone || null, reference || null, payment_terms || null, notes || null, JSON.stringify(items), vatOn ? 1 : 0, vatCents, subtotalCents + vatCents, docTemplate, configJson, req.params.id]
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
