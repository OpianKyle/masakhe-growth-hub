import { Request, Response, NextFunction, Router } from "express";
import { queryOne, execute } from "./db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function getDataOwnerId(req: Request): string {
  return req.session.userId!;
}

export const authRouter = Router();

authRouter.get("/me", async (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  try {
    const user = await queryOne(
      "SELECT id, email, name FROM wb_users WHERE id = ?",
      [req.session.userId]
    );
    res.json({ user: user || null });
  } catch {
    res.json({ user: null });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    const existing = await queryOne("SELECT id FROM wb_users WHERE email = ?", [email.toLowerCase()]);
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO wb_users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, email.toLowerCase(), hash, name, now, now]
    );
    req.session.userId = id;
    res.json({ ok: true, user: { id, email: email.toLowerCase(), name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await queryOne(
      "SELECT id, email, name, password_hash FROM wb_users WHERE email = ?",
      [email.toLowerCase()]
    );
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user.id;
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});
