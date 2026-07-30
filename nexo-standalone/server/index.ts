import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import path from "path";
import { fileURLToPath } from "url";
import { pool, runMigrations } from "./db.js";
import { authRouter } from "./auth.js";
import { nexoRouter, runNexoMigrations } from "./nexo.js";
import { franchiseRouter } from "./franchise.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === "production";

const app = express();

app.use(cors({
  origin: process.env.APP_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Sessions ─────────────────────────────────────────────────────────────────
const MySQLStore = MySQLStoreFactory(session as any);
const sessionStore = new MySQLStore({
  createDatabaseTable: true,
  schema: { tableName: "nexo_sessions", columnNames: { session_id: "session_id", expires: "expires", data: "data" } },
} as any, pool as any);

app.use(session({
  secret: process.env.SESSION_SECRET || "nexo-dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: isProduction ? "strict" : "lax",
  },
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/nexo",      nexoRouter);
app.use("/api/franchise", franchiseRouter);

// ─── Static (production) ──────────────────────────────────────────────────────
if (isProduction) {
  const distPath = path.join(__dirname, "../client");
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`[Nexo] Server running on port ${PORT}`);
  try {
    await runMigrations();
    await runNexoMigrations();
    console.log("[Nexo] All migrations complete");
  } catch (e: any) {
    console.error("[Nexo] Migration error:", e.message);
  }
});
