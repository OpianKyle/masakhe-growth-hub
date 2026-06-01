import { Router } from "express";
import { randomBytes } from "crypto";
import { queryOne, execute } from "./db";
import { generatePaymentToken, verifyResponseToken } from "./adumo";
import { sendThankYouReceipt } from "./automations";

export const invoicePaymentsRouter = Router();

const ADUMO_URL =
  process.env.ADUMO_ENV === "production"
    ? "https://apiv3.adumoonline.com/product/payment/v1/initialisevirtual"
    : "https://staging-apiv3.adumoonline.com/product/payment/v1/initialisevirtual";

const APP_URL = (
  process.env.ADUMO_ENV === "production"
    ? process.env.APP_URL || "https://masakheportal.co.za"
    : `https://${process.env.REPLIT_DEV_DOMAIN || `localhost:${process.env.PORT || 5000}`}`
).replace(/\/+$/, "");

export function generateInvoicePaymentToken(): string {
  return randomBytes(32).toString("hex");
}

invoicePaymentsRouter.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const invoice = await queryOne(
      `SELECT i.id, i.invoice_number, i.customer_name, i.customer_email,
              i.total_cents, i.vat_cents, i.vat_enabled, i.items_json,
              i.status, i.type, i.payment_terms, i.due_date, i.notes,
              i.created_at, i.paid_at, i.payment_token_expires_at, i.user_id
       FROM invoices i
       WHERE i.payment_token = ? AND i.type = 'invoice'`,
      [token]
    );

    if (!invoice) {
      return res.status(404).json({ error: "Payment link not found or has expired." });
    }

    if (invoice.payment_token_expires_at && new Date(invoice.payment_token_expires_at) < new Date()) {
      return res.status(410).json({ error: "This payment link has expired. Please contact the sender for a new link." });
    }

    const user = await queryOne(
      `SELECT u.full_name, u.email, bp.business_name, bp.phone, bp.physical_address,
              bp.logo_url, bp.vat_number, bp.bank_name, bp.account_number
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [invoice.user_id]
    );

    res.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        customerEmail: invoice.customer_email,
        totalCents: invoice.total_cents,
        vatCents: invoice.vat_cents || 0,
        vatEnabled: !!invoice.vat_enabled,
        items: JSON.parse(invoice.items_json || "[]"),
        status: invoice.status,
        paymentTerms: invoice.payment_terms,
        dueDate: invoice.due_date,
        notes: invoice.notes,
        createdAt: invoice.created_at,
        paidAt: invoice.paid_at,
      },
      business: {
        name: user?.business_name || user?.full_name || "Business",
        email: user?.email,
        phone: user?.phone,
        address: user?.physical_address,
        logoUrl: user?.logo_url,
      },
    });
  } catch (err: any) {
    console.error("[InvPay] GET /:token error:", err.message);
    res.status(500).json({ error: "Failed to load payment details." });
  }
});

invoicePaymentsRouter.post("/:token/session", async (req, res) => {
  try {
    const { token } = req.params;

    const invoice = await queryOne(
      `SELECT * FROM invoices WHERE payment_token = ? AND type = 'invoice'`,
      [token]
    );

    if (!invoice) {
      return res.status(404).json({ error: "Payment link not found." });
    }
    if (invoice.payment_token_expires_at && new Date(invoice.payment_token_expires_at) < new Date()) {
      return res.status(410).json({ error: "This payment link has expired." });
    }
    if (invoice.status === "paid" || invoice.paid_at) {
      return res.status(409).json({ error: "This invoice has already been paid." });
    }

    if (!process.env.ADUMO_MERCHANT_ID || !process.env.ADUMO_APPLICATION_ID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(503).json({ error: "Payment gateway not configured." });
    }

    const amount = (invoice.total_cents / 100).toFixed(2);
    const refSuffix = randomBytes(4).toString("hex");
    const merchantRef = `CUSTINV_${refSuffix}`;

    await execute(
      "UPDATE invoices SET payment_merchant_ref = ? WHERE id = ?",
      [merchantRef, invoice.id]
    );

    const user = await queryOne(
      "SELECT full_name, email FROM users WHERE id = ?",
      [invoice.user_id]
    );

    const jwtToken = generatePaymentToken(merchantRef, amount);

    const returnBase = `${APP_URL}/api/invoices/pay/${token}/return`;

    const fields: Record<string, string> = {
      MerchantID: (process.env.ADUMO_MERCHANT_ID || "").toLowerCase(),
      ApplicationID: (process.env.ADUMO_APPLICATION_ID || "").toLowerCase(),
      MerchantReference: merchantRef,
      Amount: amount,
      Token: jwtToken,
      PaymentType: "1",
      txtCurrencyCode: "ZAR",
      RedirectSuccessfulURL: `${returnBase}?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${returnBase}?status=failed&merchantRef=${merchantRef}`,
      Variable1: "CustomerInvoicePayment",
      Variable2: invoice.invoice_number,
      Qty1: "1",
      ItemRef1: invoice.invoice_number,
      ItemDescr1: `Invoice ${invoice.invoice_number}`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: invoice.customer_name || "Customer",
      emailAddress: invoice.customer_email || user?.email || "",
      contactNumber: invoice.customer_phone || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[InvPay] Session created:", { merchantRef, invoiceNumber: invoice.invoice_number, amount });
    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[InvPay] POST /:token/session error:", err.message);
    res.status(500).json({ error: "Failed to create payment session." });
  }
});

async function handleInvoicePayReturn(req: any, res: any) {
  try {
    const { token } = req.params;
    const q = { ...req.body, ...req.query };
    const status = (q.status || q._STATUS || "") as string;
    const merchantRef = (q.merchantRef || q._MERCHANTREFERENCE || q.MerchantReference || "") as string;
    const adumoResult = (q._RESULT || "") as string;
    const responseToken = (q._RESPONSE_TOKEN || "") as string;

    console.log(`[InvPay] Return: token=${token}, status=${status}, merchantRef=${merchantRef}`);

    const invoice = await queryOne(
      "SELECT * FROM invoices WHERE payment_token = ? AND type = 'invoice'",
      [token]
    );

    if (!invoice) {
      return res.redirect(`/pay/${token}?error=not_found`);
    }

    if (invoice.status === "paid" || invoice.paid_at) {
      return res.redirect(`/pay/${token}?paid=already`);
    }

    if (merchantRef && invoice.payment_merchant_ref !== merchantRef) {
      console.warn(`[InvPay] merchantRef mismatch: stored=${invoice.payment_merchant_ref}, received=${merchantRef}`);
    }

    const isSuccess = status === "success" || adumoResult === "0";

    if (!isSuccess) {
      const errorMsg = (q._ERROR_MESSAGE as string) || "Payment declined";
      console.log(`[InvPay] Payment failed: ${errorMsg}`);
      return res.redirect(`/pay/${token}?error=failed`);
    }

    if (responseToken) {
      try {
        const decoded = verifyResponseToken(responseToken);
        if (decoded.mref && decoded.mref !== merchantRef) {
          console.error(`[InvPay] Token mref mismatch`);
          return res.redirect(`/pay/${token}?error=verify`);
        }
        const expectedAmount = (invoice.total_cents / 100).toFixed(2);
        if (decoded.amount && decoded.amount !== expectedAmount) {
          console.error(`[InvPay] Token amount mismatch`);
          return res.redirect(`/pay/${token}?error=verify`);
        }
      } catch (e: any) {
        console.error(`[InvPay] Token verify failed:`, e.message);
        if (process.env.ADUMO_ENV === "production") {
          return res.redirect(`/pay/${token}?error=verify`);
        }
      }
    } else if (process.env.ADUMO_ENV === "production") {
      return res.redirect(`/pay/${token}?error=verify`);
    }

    await execute(
      "UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE id = ?",
      [invoice.id]
    );

    sendThankYouReceipt(invoice.id).catch(() => {});

    console.log(`[InvPay] Invoice ${invoice.invoice_number} marked as paid via customer payment link`);
    return res.redirect(`/pay/${token}?paid=true`);
  } catch (err: any) {
    console.error("[InvPay] Return handler error:", err.message);
    const { token } = req.params;
    return res.redirect(`/pay/${token}?error=server`);
  }
}

invoicePaymentsRouter.get("/:token/return", handleInvoicePayReturn);
invoicePaymentsRouter.post("/:token/return", handleInvoicePayReturn);
