import express from "express";
import cors from "cors";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import { runMigrations } from "./db";
import { seedIfEmpty } from "./seed";
import { router } from "./routes";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { financeRouter } from "./finance";
import { invoiceRouter } from "./invoices";
import { complianceRouter } from "./compliance";
import { grantsRouter } from "./grants";
import { socialRouter } from "./social/index";
import { startScheduler } from "./social/scheduler";
import path from "path";

runMigrations();
seedIfEmpty();

const SQLiteStore = connectSqlite3(session);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
  store: new (SQLiteStore as any)({
    db: "sessions.db",
    dir: path.join(process.cwd(), "data"),
  }),
  secret: process.env.SESSION_SECRET || "masakhe-dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
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
app.use("/api/social", socialRouter);
app.use("/api", router);

const distPath = path.join(process.cwd(), "dist");
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const port = Number(isProduction ? (process.env.PORT || 5000) : (process.env.API_PORT || 3001));
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on 0.0.0.0:${port}`);
  startScheduler();
});
