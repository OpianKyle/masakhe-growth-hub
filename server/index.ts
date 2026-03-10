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
import { tendersRouter } from "./tenders";
import { notificationsRouter } from "./notifications";
import { startBillingScheduler } from "./billing-scheduler";
import { documentsRouter } from "./documents";
import { vehicleRouter } from "./vehicles";
import { leadsRouter } from "./leads";
import path from "path";

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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "masakhe-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
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
  app.use("/api/tenders", tendersRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/vehicles", vehicleRouter);
  app.use("/api/leads", leadsRouter);
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
