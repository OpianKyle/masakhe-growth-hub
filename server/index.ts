import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { pool, runMigrations } from "./db";
import { seedIfEmpty } from "./seed";
import { router } from "./routes";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { financeRouter } from "./finance";
import { invoiceRouter } from "./invoices";
import { complianceRouter } from "./compliance";
import { grantsRouter } from "./grants";
import { profileRouter } from "./profile";
import { dashboardRouter } from "./dashboard";
import { socialRouter } from "./social/index";
import { startScheduler } from "./social/scheduler";
import { billingRouter } from "./billing";
import { supportChatRouter } from "./supportChat";
import { tendersRouter } from "./tenders";
import { notificationsRouter } from "./notifications";
import { startBillingScheduler } from "./billing-scheduler";
import { startInvoiceScheduler } from "./invoice-scheduler";
import { leaveRouter, runLeaveMigrations } from "./leave";
import { resellerRouter, runResellerMigrations } from "./reseller";
import { franchiseRouter, runFranchiseMigrations } from "./franchise";
import { documentsRouter } from "./documents";
import { docPdfRouter } from "./doc-pdf";
import { vehicleRouter } from "./vehicles";
import { leadsRouter } from "./leads";
import { inventoryRouter } from "./inventory";
import { payrollRouter } from "./payroll";
import { clientsRouter } from "./clients";
import { campaignsRouter } from "./campaigns";
import { emailSettingsRouter } from "./email-settings";
import { contactRouter } from "./contact";
import { automationsRouter } from "./automations";
import { startAutomationsScheduler } from "./automations-scheduler";
import { startDripScheduler } from "./drip-scheduler";
import path from "path";
import { queryOne } from "./db";

async function main() {
  await runMigrations();
  await seedIfEmpty();

  const MySQLStore = MySQLStoreFactory(session as any);
  const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 7 * 24 * 60 * 60 * 1000,
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  }, pool as any);

  const app = express();
  app.set("trust proxy", 1);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const isProxyHttps = process.env.REPLIT_DEV_DOMAIN || process.env.NODE_ENV === "production";
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "masakhe-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !!isProxyHttps,
      sameSite: isProxyHttps ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  app.use("/uploads", express.static("public/uploads"));

  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/finance", financeRouter);
  app.use("/api/invoices", invoiceRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/funding", grantsRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/social", socialRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/support-chat", supportChatRouter);
  app.use("/api/leave", leaveRouter);
  app.use("/api/reseller", resellerRouter);
  app.use("/api/franchise", franchiseRouter);
  app.use("/api/tenders", tendersRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/documents", docPdfRouter);
  app.use("/api/vehicles", vehicleRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/payroll", payrollRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/email-settings", emailSettingsRouter);
  app.use("/api/automations", automationsRouter);
  app.use("/api", contactRouter);
  app.use("/api", router);

  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = Number(isProduction ? (process.env.PORT || 5000) : (process.env.API_PORT || 3001));
  app.listen(port, "0.0.0.0", () => {
    console.log(`API running on 0.0.0.0:${port}`);
    startScheduler();
    startBillingScheduler();
    startInvoiceScheduler();
    startAutomationsScheduler();
    startDripScheduler();
    runLeaveMigrations().catch(e => console.error("[Leave] Migration error:", e.message));
    runResellerMigrations().catch(e => console.error("[Reseller] Migration error:", e.message));
    runFranchiseMigrations().catch(e => console.error("[Franchise] Migration error:", e.message));
  });
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
