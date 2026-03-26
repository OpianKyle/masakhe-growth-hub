import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb, RGB } from "pdf-lib";
import fs from "fs";
import path from "path";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const invoiceRouter = Router();
invoiceRouter.use(requireAuth);

function getTemplateColors(template: number): { primary: RGB; accent: RGB; headerBg: RGB | null; headerText: RGB } {
  switch (template) {
    case 2: return { primary: rgb(0.09, 0.22, 0.45), accent: rgb(0.09, 0.22, 0.45), headerBg: null, headerText: rgb(0, 0, 0) };
    case 3: return { primary: rgb(0.15, 0.15, 0.15), accent: rgb(0.85, 0.40, 0.05), headerBg: rgb(0.15, 0.15, 0.15), headerText: rgb(1, 1, 1) };
    case 4: return { primary: rgb(0.12, 0.35, 0.72), accent: rgb(0.12, 0.35, 0.72), headerBg: rgb(0.12, 0.35, 0.72), headerText: rgb(1, 1, 1) };
    case 5: return { primary: rgb(0.52, 0.07, 0.07), accent: rgb(0.52, 0.07, 0.07), headerBg: null, headerText: rgb(0, 0, 0) };
    case 6: return { primary: rgb(0.42, 0.13, 0.69), accent: rgb(0.42, 0.13, 0.69), headerBg: rgb(0.42, 0.13, 0.69), headerText: rgb(1, 1, 1) };
    default: return { primary: rgb(0.08, 0.45, 0.27), accent: rgb(0.08, 0.45, 0.27), headerBg: null, headerText: rgb(0, 0, 0) };
  }
}

invoiceRouter.get("/export", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoices = await queryAll(
      "SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    const header = "Number,Type,Customer Name,Customer Email,Items,Subtotal,VAT (15%),Total,Status,Date";
    const rows = invoices.map((inv: any) => {
      const items = JSON.parse(inv.items_json || "[]");
      const itemsSummary = items
        .map((item: any) => {
          const qty = item.qty || 1;
          const unitPrice = (item.unitPrice || 0).toFixed(2);
          return `${qty}x ${item.name || "Item"} @ R${unitPrice}`;
        })
        .join("; ");
      const subtotal = ((inv.total_cents - (inv.vat_cents || 0)) / 100).toFixed(2);
      const vat = ((inv.vat_cents || 0) / 100).toFixed(2);
      const total = (inv.total_cents / 100).toFixed(2);
      const date = inv.created_at ? inv.created_at.split("T")[0] : "";
      const custName = (inv.customer_name || "").replace(/"/g, '""');
      const custEmail = (inv.customer_email || "").replace(/"/g, '""');
      const docType = inv.type || "invoice";
      return `${inv.invoice_number},"${docType}","${custName}","${custEmail}","${itemsSummary.replace(/"/g, '""')}",${subtotal},${vat},${total},${inv.status || "final"},${date}`;
    });

    const csv = [header, ...rows].join("\n");
    const today = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="invoices-export-${today}.csv"`);
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
        const itemParts = itemsStr.split(";").map((s) => s.trim()).filter(Boolean);
        for (const part of itemParts) {
          const match = part.match(/^(\d+)\s*x\s+(.+?)\s+@\s+(\d+(?:\.\d+)?)$/i);
          if (match) {
            items.push({
              qty: parseInt(match[1]),
              name: match[2].trim(),
              unitPrice: parseFloat(match[3]),
            });
          }
        }
      }

      let totalCents: number;
      if (totalStr && totalStr.trim()) {
        totalCents = Math.round(parseFloat(totalStr) * 100);
        if (isNaN(totalCents)) {
          totalCents = items.reduce((sum, item) => sum + Math.round(item.qty * item.unitPrice * 100), 0);
        }
      } else {
        totalCents = items.reduce((sum, item) => sum + Math.round(item.qty * item.unitPrice * 100), 0);
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingCount + imported + 1).padStart(3, "0")}`;
      const id = randomUUID();

      await execute(
        `INSERT INTO invoices (id, user_id, invoice_number, customer_name, customer_email, total_cents, vat_enabled, vat_cents, items_json, status, type, template, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'final', 'invoice', 1, ?)`,
        [id, userId, invoiceNumber, customerName, customerEmail || null, totalCents, JSON.stringify(items), now]
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

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "customerName and items are required" });
    }

    const docType = type === "quote" ? "quote" : "invoice";
    const docTemplate = Math.min(6, Math.max(1, parseInt(template) || 1));

    const subtotalCents = items.reduce((sum: number, item: any) => {
      return sum + Math.round((item.qty || 1) * (item.unitPrice || 0) * 100);
    }, 0);

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

    await execute(
      "UPDATE invoices SET type = 'invoice', invoice_number = ? WHERE id = ?",
      [invoiceNumber, invoice.id]
    );
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
              bp.bank_name, bp.account_name, bp.account_type, bp.account_number, bp.branch_code,
              bp.registration_number
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    const items = JSON.parse(invoice.items_json);
    const vatEnabled = !!invoice.vat_enabled;
    const vatCents = invoice.vat_cents || 0;
    const subtotalCents = invoice.total_cents - vatCents;
    const docType = invoice.type || "invoice";
    const templateNum = invoice.template || 1;
    const colors = getTemplateColors(templateNum);
    const isQuote = docType === "quote";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const black = rgb(0, 0, 0);
    const grey = rgb(0.4, 0.4, 0.4);
    const white = rgb(1, 1, 1);

    let y = 800;
    const hasHeaderBg = colors.headerBg !== null;

    if (hasHeaderBg) {
      page.drawRectangle({ x: 0, y: 742, width: 595, height: 110, color: colors.headerBg! });
    }

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
          let logoImage = logoMime === "image/png" ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
          const logoDim = logoImage.scale(1);
          const maxLogoHeight = 60;
          const maxLogoWidth = 160;
          let logoWidth = (logoDim.width / logoDim.height) * maxLogoHeight;
          let logoHeight = maxLogoHeight;
          if (logoWidth > maxLogoWidth) { logoWidth = maxLogoWidth; logoHeight = (logoDim.height / logoDim.width) * maxLogoWidth; }
          page.drawImage(logoImage, { x: 50, y: y - logoHeight, width: logoWidth, height: logoHeight });
          y -= logoHeight + 8;
        }
      } catch (logoErr) {
        console.error("Failed to embed logo:", logoErr);
      }
    }

    const bizName = user?.business_name || user?.full_name || "Business";
    const maxNameWidth = 335;
    let nameSize = 20;
    while (nameSize > 10 && fontBold.widthOfTextAtSize(bizName, nameSize) > maxNameWidth) nameSize -= 1;
    const nameOffset = Math.max(0, Math.round((nameSize - 14) / 2));
    const nameColor = hasHeaderBg ? white : colors.primary;
    const titleColor = hasHeaderBg ? white : colors.primary;

    page.drawText(bizName, { x: 50, y: y - nameOffset, size: nameSize, font: fontBold, color: nameColor });
    const docTitle = isQuote ? "QUOTE" : "TAX INVOICE";
    page.drawText(docTitle, { x: 400, y, size: 14, font: fontBold, color: titleColor });
    y -= 20;

    const detailColor = hasHeaderBg ? rgb(0.9, 0.9, 0.9) : grey;
    if (user?.physical_address) { page.drawText(user.physical_address, { x: 50, y, size: 9, font, color: detailColor }); y -= 14; }
    if (user?.phone) { page.drawText(`Tel: ${user.phone}`, { x: 50, y, size: 9, font, color: detailColor }); y -= 14; }
    if (user?.email) { page.drawText(`Email: ${user.email}`, { x: 50, y, size: 9, font, color: detailColor }); y -= 14; }
    if (user?.vat_number) { page.drawText(`VAT Reg No: ${user.vat_number}`, { x: 50, y, size: 9, font, color: detailColor }); y -= 14; }
    if (user?.registration_number) { page.drawText(`Reg No: ${user.registration_number}`, { x: 50, y, size: 9, font, color: detailColor }); y -= 14; }

    if (hasHeaderBg) y = Math.min(y, 738);

    y -= 15;
    page.drawRectangle({ x: 50, y, width: 495, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    const numLabel = isQuote ? "Quote Number:" : "Invoice Number:";
    page.drawText(numLabel, { x: 50, y, size: 9, font, color: grey });
    page.drawText(invoice.invoice_number, { x: 160, y, size: 9, font: fontBold, color: black });
    page.drawText("Date:", { x: 350, y, size: 9, font, color: grey });
    page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 400, y, size: 9, font: fontBold, color: black });
    y -= 16;
    if (invoice.reference) {
      page.drawText("Reference:", { x: 50, y, size: 9, font, color: grey });
      page.drawText(invoice.reference, { x: 160, y, size: 9, font: fontBold, color: black });
      y -= 16;
    }

    if (isQuote) {
      page.drawText("Valid For:", { x: 350, y: y + 16, size: 9, font, color: grey });
      page.drawText(invoice.payment_terms || "30 days", { x: 400, y: y + 16, size: 9, font: fontBold, color: black });
    }

    y -= 8;
    const billLabel = isQuote ? "QUOTE FOR:" : "BILL TO:";
    page.drawText(billLabel, { x: 50, y, size: 9, font: fontBold, color: colors.primary });
    y -= 15;
    page.drawText(invoice.customer_name, { x: 50, y, size: 10, font: fontBold, color: black });
    y -= 14;
    if (invoice.customer_email) { page.drawText(invoice.customer_email, { x: 50, y, size: 9, font, color: grey }); y -= 14; }
    if (invoice.customer_phone) { page.drawText(`Tel: ${invoice.customer_phone}`, { x: 50, y, size: 9, font, color: grey }); y -= 14; }
    if (invoice.customer_address) { page.drawText(invoice.customer_address, { x: 50, y, size: 9, font, color: grey }); y -= 14; }

    y -= 14;

    page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 22, color: colors.primary });
    page.drawText("Description", { x: 55, y: y + 3, size: 9, font: fontBold, color: white });
    page.drawText("Qty", { x: 320, y: y + 3, size: 9, font: fontBold, color: white });
    page.drawText("Unit Price", { x: 380, y: y + 3, size: 9, font: fontBold, color: white });
    page.drawText("Amount", { x: 480, y: y + 3, size: 9, font: fontBold, color: white });
    y -= 25;

    for (const item of items) {
      const qty = item.qty || 1;
      const unitPrice = item.unitPrice || 0;
      const amount = qty * unitPrice;
      page.drawText(item.name || "Item", { x: 55, y, size: 9, font, color: black });
      page.drawText(String(qty), { x: 325, y, size: 9, font, color: black });
      page.drawText(`R${unitPrice.toFixed(2)}`, { x: 380, y, size: 9, font, color: black });
      page.drawText(`R${amount.toFixed(2)}`, { x: 480, y, size: 9, font, color: black });
      y -= 18;
      page.drawRectangle({ x: 50, y: y + 10, width: 495, height: 0.5, color: rgb(0.9, 0.9, 0.9) });
    }

    y -= 10;
    page.drawRectangle({ x: 350, y: y - 2, width: 195, height: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 18;

    if (vatEnabled) {
      const subtotalRands = subtotalCents / 100;
      const vatRands = vatCents / 100;
      const totalRands = invoice.total_cents / 100;
      page.drawText("Subtotal:", { x: 360, y, size: 9, font, color: grey });
      page.drawText(`R${subtotalRands.toFixed(2)}`, { x: 465, y, size: 9, font, color: black });
      y -= 16;
      page.drawText("VAT (15%):", { x: 360, y, size: 9, font, color: grey });
      page.drawText(`R${vatRands.toFixed(2)}`, { x: 465, y, size: 9, font, color: black });
      y -= 16;
      page.drawRectangle({ x: 350, y: y + 8, width: 195, height: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 6;
      page.drawText(isQuote ? "TOTAL ESTIMATE (incl. VAT):" : "TOTAL (incl. VAT):", { x: 310, y, size: 11, font: fontBold, color: black });
      page.drawText(`R${totalRands.toFixed(2)}`, { x: 460, y, size: 11, font: fontBold, color: colors.accent });
    } else {
      const totalRands = invoice.total_cents / 100;
      page.drawText(isQuote ? "TOTAL ESTIMATE:" : "TOTAL:", { x: 360, y, size: 11, font: fontBold, color: black });
      page.drawText(`R${totalRands.toFixed(2)}`, { x: 465, y, size: 11, font: fontBold, color: colors.accent });
    }

    const termLabel = isQuote ? "Quote Valid For:" : "Payment Terms:";
    const termValue = invoice.payment_terms || (isQuote ? "30 days" : "Due within 7 days");
    y -= 20;
    page.drawRectangle({ x: 50, y, width: 495, height: 0.5, color: rgb(0.85, 0.85, 0.85) });
    y -= 16;
    page.drawText(termLabel, { x: 50, y, size: 9, font: fontBold, color: grey });
    page.drawText(termValue, { x: 145, y, size: 9, font, color: black });
    if (!isQuote) {
      y -= 13;
      page.drawText("Late payments may incur a 5% fee.", { x: 50, y, size: 8, font, color: grey });
    }

    if (invoice.notes) {
      y -= 20;
      page.drawRectangle({ x: 50, y, width: 495, height: 0.5, color: rgb(0.85, 0.85, 0.85) });
      y -= 16;
      page.drawText("Notes:", { x: 50, y, size: 9, font: fontBold, color: grey });
      y -= 14;
      page.drawText(invoice.notes, { x: 50, y, size: 9, font, color: black });
    }

    if (!isQuote) {
      const hasBankDetails = user?.bank_name || user?.account_number;
      if (hasBankDetails) {
        y -= 22;
        page.drawText("Please make payment to the following banking details:", { x: 50, y, size: 9, font, color: grey });
        y -= 14;
        page.drawRectangle({ x: 50, y, width: 495, height: 0.5, color: rgb(0.85, 0.85, 0.85) });
        y -= 16;
        page.drawText("BANKING DETAILS", { x: 50, y, size: 9, font: fontBold, color: grey });
        y -= 14;
        if (user.bank_name) { page.drawText(`Bank:  ${user.bank_name}`, { x: 50, y, size: 9, font, color: black }); y -= 13; }
        if (user.account_name) { page.drawText(`Account Name:  ${user.account_name}`, { x: 50, y, size: 9, font, color: black }); y -= 13; }
        if (user.account_type) { page.drawText(`Account Type:  ${user.account_type}`, { x: 50, y, size: 9, font, color: black }); y -= 13; }
        if (user.account_number) { page.drawText(`Account Number:  ${user.account_number}`, { x: 50, y, size: 9, font, color: black }); y -= 13; }
        if (user.branch_code) { page.drawText(`Branch Code:  ${user.branch_code}`, { x: 50, y, size: 9, font, color: black }); }
      }
    }

    const footerMsg = isQuote
      ? "This quote is valid for the period stated above. Prices are subject to change after expiry."
      : "This invoice serves as a tax invoice in terms of Section 20 of the VAT Act.";
    page.drawText(isQuote ? "Thank you for the opportunity!" : "Thank you for your business!", { x: 50, y: 75, size: 9, font, color: grey });
    page.drawText(footerMsg, { x: 50, y: 60, size: 8, font, color: grey });
    page.drawText("Generated by Masakhe Growth Hub", { x: 50, y: 45, size: 8, font, color: rgb(0.7, 0.7, 0.7) });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate PDF" });
  }
});

invoiceRouter.put("/:id", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const existing = await queryOne("SELECT id FROM invoices WHERE id = ? AND user_id = ?", [id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { customer_name, customer_email, customer_address, customer_phone, items, vat_enabled, reference, payment_terms, notes, template } = req.body;
    if (!customer_name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "customer_name and items are required" });
    }

    const docTemplate = Math.min(6, Math.max(1, parseInt(template) || 1));
    const vatOn = !!vat_enabled;
    let subtotalCents = 0;
    for (const it of items) subtotalCents += Math.round((it.qty || 1) * ((it.unitPrice || 0) * 100));
    const vatCents = vatOn ? Math.round(subtotalCents * 0.15) : 0;
    const totalCents = subtotalCents + vatCents;

    await execute(
      `UPDATE invoices SET customer_name = ?, customer_email = ?, customer_address = ?, customer_phone = ?, reference = ?, payment_terms = ?, notes = ?, items_json = ?, vat_enabled = ?, vat_cents = ?, total_cents = ?, template = ? WHERE id = ?`,
      [customer_name, customer_email || null, customer_address || null, customer_phone || null, reference || null, payment_terms || null, notes || null, JSON.stringify(items), vatOn ? 1 : 0, vatCents, totalCents, docTemplate, id]
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
