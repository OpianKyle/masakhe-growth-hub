import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";

export const ficaDocsRouter = Router();
ficaDocsRouter.use(requireAuth);

const GRACE_PERIOD_DAYS = 2;

ficaDocsRouter.get("/status", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT created_at, role FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin") {
      return res.json({ ficaUploaded: true, businessRegUploaded: true, allUploaded: true, daysLeft: 999, gracePeriodExpired: false, isBlocked: false, docs: [] });
    }

    const docs = await queryAll(
      "SELECT id, doc_type, file_name, file_size, uploaded_at FROM compliance_documents WHERE user_id = ?",
      [userId]
    );

    const ficaDoc = docs.find((d: any) => d.doc_type === "FICA") || null;
    const businessRegDoc = docs.find((d: any) => d.doc_type === "BUSINESS_REG") || null;
    const ficaUploaded = !!ficaDoc;
    const businessRegUploaded = !!businessRegDoc;
    const allUploaded = ficaUploaded && businessRegUploaded;

    const daysSinceSignup = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.max(0, GRACE_PERIOD_DAYS - daysSinceSignup);
    const gracePeriodExpired = daysSinceSignup >= GRACE_PERIOD_DAYS;
    const isBlocked = gracePeriodExpired && !allUploaded;

    res.json({
      ficaUploaded,
      businessRegUploaded,
      allUploaded,
      daysLeft,
      gracePeriodExpired,
      isBlocked,
      docs: docs.map((d: any) => ({
        id: d.id,
        docType: d.doc_type,
        fileName: d.file_name,
        fileSize: d.file_size,
        uploadedAt: d.uploaded_at,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

ficaDocsRouter.post("/upload", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { docType, fileData, fileName, mimeType, fileSize } = req.body;

    if (!docType || !["FICA", "BUSINESS_REG"].includes(docType)) {
      return res.status(400).json({ error: "Invalid document type. Must be FICA or BUSINESS_REG." });
    }
    if (!fileData || !fileName) {
      return res.status(400).json({ error: "fileData and fileName are required" });
    }
    if (fileData.length > 14_000_000) {
      return res.status(400).json({ error: "File too large. Maximum 10MB allowed." });
    }

    await execute(
      "DELETE FROM compliance_documents WHERE user_id = ? AND doc_type = ?",
      [userId, docType]
    );

    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO compliance_documents (id, user_id, doc_type, file_name, file_data, mime_type, file_size, uploaded_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, docType, fileName, fileData, mimeType || "application/octet-stream", fileSize || 0, now, now]
    );

    res.json({ ok: true, id, fileName, docType });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

ficaDocsRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const doc = await queryOne(
      "SELECT id FROM compliance_documents WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!doc) return res.status(404).json({ error: "Document not found" });

    await execute("DELETE FROM compliance_documents WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
