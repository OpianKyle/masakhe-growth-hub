import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const invoiceRouter = Router();
invoiceRouter.use(requireAuth);

invoiceRouter.post("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { customerName, customerEmail, items } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "customerName and items are required" });
    }

    const totalCents = items.reduce((sum: number, item: any) => {
      return sum + Math.round((item.qty || 1) * (item.unitPrice || 0) * 100);
    }, 0);

    const count = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ?", [userId]))?.c || 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const id = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO invoices (id, user_id, invoice_number, customer_name, customer_email, total_cents, items_json, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'final', ?)`,
      [id, userId, invoiceNumber, customerName, customerEmail || null, totalCents, JSON.stringify(items), now]
    );

    res.json({ ok: true, id, invoiceNumber });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create invoice" });
  }
});

invoiceRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoices = await queryAll("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(invoices.map((inv: any) => ({ ...inv, items: JSON.parse(inv.items_json) })));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

invoiceRouter.get("/:id/pdf", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invoice = await queryOne("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const user = await queryOne(
      `SELECT u.full_name, u.email, bp.business_name, bp.phone, bp.physical_address, bp.logo_url
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    const items = JSON.parse(invoice.items_json);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const green = rgb(0.08, 0.45, 0.27);
    const black = rgb(0, 0, 0);
    const grey = rgb(0.4, 0.4, 0.4);

    let y = 790;
    let textStartX = 50;

    if (user?.logo_url) {
      try {
        const logoPath = path.join(process.cwd(), "public", user.logo_url);
        if (fs.existsSync(logoPath)) {
          const logoBytes = fs.readFileSync(logoPath);
          const ext = path.extname(logoPath).toLowerCase();
          let logoImage;
          if (ext === ".png") {
            logoImage = await pdfDoc.embedPng(logoBytes);
          } else if (ext === ".jpg" || ext === ".jpeg") {
            logoImage = await pdfDoc.embedJpg(logoBytes);
          }
          if (logoImage) {
            const logoDim = logoImage.scale(1);
            const logoHeight = 50;
            const logoWidth = (logoDim.width / logoDim.height) * logoHeight;
            page.drawImage(logoImage, { x: 50, y: y - 35, width: logoWidth, height: logoHeight });
            textStartX = 50 + logoWidth + 12;
          }
        }
      } catch (logoErr) {
        console.error("Failed to embed logo in PDF:", logoErr);
      }
    }

    page.drawText(user?.business_name || user?.full_name || "Business", { x: textStartX, y, size: 20, font: fontBold, color: green });
    y -= 20;
    page.drawText("TAX INVOICE", { x: 400, y: y + 15, size: 14, font: fontBold, color: green });
    y -= 5;

    if (user?.physical_address) {
      page.drawText(user.physical_address, { x: textStartX, y, size: 9, font, color: grey });
      y -= 14;
    }
    if (user?.phone) {
      page.drawText(`Tel: ${user.phone}`, { x: textStartX, y, size: 9, font, color: grey });
      y -= 14;
    }
    if (user?.email) {
      page.drawText(`Email: ${user.email}`, { x: textStartX, y, size: 9, font, color: grey });
      y -= 14;
    }

    y -= 15;
    page.drawRectangle({ x: 50, y, width: 495, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    page.drawText("Invoice Number:", { x: 50, y, size: 9, font, color: grey });
    page.drawText(invoice.invoice_number, { x: 150, y, size: 9, font: fontBold, color: black });
    page.drawText("Date:", { x: 350, y, size: 9, font, color: grey });
    page.drawText(new Date(invoice.created_at).toLocaleDateString("en-ZA"), { x: 400, y, size: 9, font: fontBold, color: black });
    y -= 18;

    y -= 10;
    page.drawText("BILL TO:", { x: 50, y, size: 9, font: fontBold, color: green });
    y -= 15;
    page.drawText(invoice.customer_name, { x: 50, y, size: 10, font: fontBold, color: black });
    y -= 14;
    if (invoice.customer_email) {
      page.drawText(invoice.customer_email, { x: 50, y, size: 9, font, color: grey });
      y -= 14;
    }

    y -= 20;

    page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 22, color: rgb(0.95, 0.95, 0.95) });
    page.drawText("Description", { x: 55, y: y + 3, size: 9, font: fontBold, color: black });
    page.drawText("Qty", { x: 320, y: y + 3, size: 9, font: fontBold, color: black });
    page.drawText("Unit Price", { x: 380, y: y + 3, size: 9, font: fontBold, color: black });
    page.drawText("Amount", { x: 480, y: y + 3, size: 9, font: fontBold, color: black });
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

    const totalRands = invoice.total_cents / 100;
    page.drawText("TOTAL:", { x: 380, y, size: 11, font: fontBold, color: black });
    page.drawText(`R${totalRands.toFixed(2)}`, { x: 465, y, size: 11, font: fontBold, color: green });

    page.drawText("Thank you for your business!", { x: 50, y: 60, size: 9, font, color: grey });
    page.drawText("Generated by Masakhe Growth Hub", { x: 50, y: 45, size: 8, font, color: rgb(0.7, 0.7, 0.7) });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate PDF" });
  }
});
