import { Router } from "express";
import { randomUUID } from "crypto";
import { pool, queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";

export const inventoryRouter = Router();

// ───────────────────────── Migrations ─────────────────────────
async function runInventoryMigrations() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_products (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        sku VARCHAR(80) NULL,
        barcode VARCHAR(80) NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        category VARCHAR(80) NULL,
        unit VARCHAR(40) NULL DEFAULT 'unit',
        cost_cents INT NOT NULL DEFAULT 0,
        price_cents INT NOT NULL DEFAULT 0,
        quantity_on_hand INT NOT NULL DEFAULT 0,
        low_stock_threshold INT NOT NULL DEFAULT 0,
        image_url VARCHAR(500) NULL,
        archived TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inv_prod_user (user_id),
        INDEX idx_inv_prod_barcode (user_id, barcode),
        INDEX idx_inv_prod_sku (user_id, sku),
        INDEX idx_inv_prod_archived (user_id, archived)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        movement_type VARCHAR(20) NOT NULL,
        qty_delta INT NOT NULL,
        qty_after INT NOT NULL,
        unit_cost_cents INT NULL,
        note TEXT NULL,
        reference VARCHAR(120) NULL,
        created_by VARCHAR(36) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_inv_mv_user_prod (user_id, product_id),
        INDEX idx_inv_mv_user_created (user_id, created_at)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS stocktake_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(160) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        notes TEXT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME NULL,
        created_by VARCHAR(36) NULL,
        INDEX idx_st_user_status (user_id, status),
        INDEX idx_st_user_started (user_id, started_at)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS stocktake_counts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        counted_qty INT NOT NULL DEFAULT 0,
        expected_qty INT NOT NULL DEFAULT 0,
        last_scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_session_product (session_id, product_id),
        INDEX idx_stc_session (session_id)
      ) ENGINE=InnoDB
    `);

    console.log("[Inventory] Migrations complete");
  } catch (err: any) {
    console.error("[Inventory] Migration error:", err.message);
  } finally {
    conn.release();
  }
}
runInventoryMigrations();

// ───────────────────────── Products ─────────────────────────
inventoryRouter.get("/products", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const lowStock = req.query.lowStock === "true";
    const includeArchived = req.query.archived === "true";

    const where: string[] = ["user_id = ?"];
    const params: any[] = [userId];
    if (!includeArchived) where.push("archived = 0");
    if (search) {
      where.push("(name LIKE ? OR sku LIKE ? OR barcode LIKE ? OR description LIKE ?)");
      const q = `%${search}%`;
      params.push(q, q, q, q);
    }
    if (category) { where.push("category = ?"); params.push(category); }
    if (lowStock) where.push("quantity_on_hand <= low_stock_threshold AND low_stock_threshold > 0");

    const rows = await queryAll(
      `SELECT * FROM inventory_products WHERE ${where.join(" AND ")} ORDER BY name ASC LIMIT 1000`,
      params
    );
    res.json(rows);
  } catch (err: any) {
    console.error("[Inventory] list products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

inventoryRouter.get("/categories", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const rows = await queryAll(
      `SELECT category, COUNT(*) as c FROM inventory_products
       WHERE user_id = ? AND archived = 0 AND category IS NOT NULL AND category != ''
       GROUP BY category ORDER BY category ASC`,
      [userId]
    );
    res.json(rows.map((r: any) => ({ category: r.category, count: Number(r.c) })));
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

inventoryRouter.get("/stats", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const total = await queryOne("SELECT COUNT(*) as c FROM inventory_products WHERE user_id = ? AND archived = 0", [userId]);
    const value = await queryOne(
      "SELECT COALESCE(SUM(quantity_on_hand * cost_cents), 0) as v FROM inventory_products WHERE user_id = ? AND archived = 0",
      [userId]
    );
    const retailValue = await queryOne(
      "SELECT COALESCE(SUM(quantity_on_hand * price_cents), 0) as v FROM inventory_products WHERE user_id = ? AND archived = 0",
      [userId]
    );
    const low = await queryOne(
      "SELECT COUNT(*) as c FROM inventory_products WHERE user_id = ? AND archived = 0 AND low_stock_threshold > 0 AND quantity_on_hand <= low_stock_threshold AND quantity_on_hand > 0",
      [userId]
    );
    const out = await queryOne(
      "SELECT COUNT(*) as c FROM inventory_products WHERE user_id = ? AND archived = 0 AND quantity_on_hand <= 0",
      [userId]
    );
    const totalUnits = await queryOne(
      "SELECT COALESCE(SUM(quantity_on_hand), 0) as v FROM inventory_products WHERE user_id = ? AND archived = 0",
      [userId]
    );
    const openSessions = await queryOne(
      "SELECT COUNT(*) as c FROM stocktake_sessions WHERE user_id = ? AND status = 'OPEN'", [userId]
    );

    res.json({
      totalProducts: Number(total?.c || 0),
      totalUnits: Number(totalUnits?.v || 0),
      stockValueCents: Number(value?.v || 0),
      retailValueCents: Number(retailValue?.v || 0),
      lowStockCount: Number(low?.c || 0),
      outOfStockCount: Number(out?.c || 0),
      openStocktakes: Number(openSessions?.c || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

inventoryRouter.get("/products/by-barcode/:barcode", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const code = String(req.params.barcode).trim();
    if (!code) return res.status(400).json({ error: "Barcode required" });
    const product = await queryOne(
      "SELECT * FROM inventory_products WHERE user_id = ? AND barcode = ? AND archived = 0 LIMIT 1",
      [userId, code]
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Lookup failed" });
  }
});

inventoryRouter.get("/products/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const product = await queryOne(
      "SELECT * FROM inventory_products WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    const movements = await queryAll(
      "SELECT * FROM inventory_movements WHERE product_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.params.id, userId]
    );
    res.json({ product, movements });
  } catch {
    res.status(500).json({ error: "Failed to load product" });
  }
});

inventoryRouter.post("/products", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const {
      sku, barcode, name, description, category, unit,
      cost_cents = 0, price_cents = 0,
      quantity_on_hand = 0, low_stock_threshold = 0, image_url,
    } = req.body || {};

    if (!name || !String(name).trim()) return res.status(400).json({ error: "Name is required" });

    if (barcode) {
      const dup = await queryOne(
        "SELECT id FROM inventory_products WHERE user_id = ? AND barcode = ? AND archived = 0 LIMIT 1",
        [userId, String(barcode).trim()]
      );
      if (dup) return res.status(409).json({ error: "A product with this barcode already exists" });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO inventory_products
       (id, user_id, sku, barcode, name, description, category, unit, cost_cents, price_cents, quantity_on_hand, low_stock_threshold, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId,
        sku?.trim() || null,
        barcode?.trim() || null,
        String(name).trim(),
        description || null,
        category?.trim() || null,
        unit?.trim() || "unit",
        Math.round(Number(cost_cents) || 0),
        Math.round(Number(price_cents) || 0),
        Math.max(0, Math.round(Number(quantity_on_hand) || 0)),
        Math.max(0, Math.round(Number(low_stock_threshold) || 0)),
        image_url || null,
      ]
    );

    if (Number(quantity_on_hand) > 0) {
      await execute(
        `INSERT INTO inventory_movements (user_id, product_id, movement_type, qty_delta, qty_after, unit_cost_cents, note, created_by)
         VALUES (?, ?, 'IN', ?, ?, ?, ?, ?)`,
        [userId, id, Number(quantity_on_hand), Number(quantity_on_hand), Number(cost_cents) || null, "Opening stock", req.session.userId]
      );
    }

    const product = await queryOne("SELECT * FROM inventory_products WHERE id = ?", [id]);
    res.json(product);
  } catch (err: any) {
    console.error("[Inventory] create:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

inventoryRouter.patch("/products/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne(
      "SELECT * FROM inventory_products WHERE id = ? AND user_id = ?", [req.params.id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });

    const allowed = ["sku", "barcode", "name", "description", "category", "unit",
      "cost_cents", "price_cents", "low_stock_threshold", "image_url", "archived"];
    const updates: string[] = [];
    const params: any[] = [];
    for (const k of allowed) {
      if (k in (req.body || {})) {
        if (k === "barcode" && req.body[k]) {
          const dup = await queryOne(
            "SELECT id FROM inventory_products WHERE user_id = ? AND barcode = ? AND archived = 0 AND id != ? LIMIT 1",
            [userId, String(req.body[k]).trim(), req.params.id]
          );
          if (dup) return res.status(409).json({ error: "A product with this barcode already exists" });
        }
        updates.push(`${k} = ?`);
        let v: any = req.body[k];
        if (typeof v === "string") v = v.trim() || null;
        if (k === "cost_cents" || k === "price_cents" || k === "low_stock_threshold") v = Math.max(0, Math.round(Number(v) || 0));
        if (k === "archived") v = v ? 1 : 0;
        params.push(v);
      }
    }
    if (updates.length === 0) return res.json(existing);

    params.push(req.params.id);
    await execute(`UPDATE inventory_products SET ${updates.join(", ")} WHERE id = ?`, params);

    const product = await queryOne("SELECT * FROM inventory_products WHERE id = ?", [req.params.id]);
    res.json(product);
  } catch (err: any) {
    console.error("[Inventory] update:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

inventoryRouter.delete("/products/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne(
      "SELECT id FROM inventory_products WHERE id = ? AND user_id = ?", [req.params.id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });
    // Soft-archive (preserves movement history). Caller can pass ?hard=true for permanent delete if no movements.
    if (req.query.hard === "true") {
      const moves = await queryOne("SELECT COUNT(*) as c FROM inventory_movements WHERE product_id = ?", [req.params.id]);
      if (Number(moves?.c || 0) > 0) {
        return res.status(400).json({ error: "Product has movement history; archive instead." });
      }
      await execute("DELETE FROM inventory_products WHERE id = ?", [req.params.id]);
    } else {
      await execute("UPDATE inventory_products SET archived = 1 WHERE id = ?", [req.params.id]);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// ───────────────────────── Movements (manual) ─────────────────────────
inventoryRouter.post("/products/:id/movements", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const product = await queryOne(
      "SELECT * FROM inventory_products WHERE id = ? AND user_id = ?", [req.params.id, userId]
    );
    if (!product) return res.status(404).json({ error: "Not found" });

    const { movement_type, qty, unit_cost_cents, note, reference } = req.body || {};
    if (!["IN", "OUT", "ADJUST"].includes(movement_type)) {
      return res.status(400).json({ error: "movement_type must be IN, OUT or ADJUST" });
    }
    const qtyNum = Math.round(Number(qty) || 0);
    if (qtyNum <= 0) return res.status(400).json({ error: "qty must be a positive integer" });

    let delta = 0;
    let newQty = product.quantity_on_hand;
    if (movement_type === "IN") { delta = qtyNum; newQty = product.quantity_on_hand + qtyNum; }
    else if (movement_type === "OUT") {
      delta = -qtyNum;
      newQty = product.quantity_on_hand - qtyNum;
      if (newQty < 0) return res.status(400).json({ error: `Insufficient stock — only ${product.quantity_on_hand} on hand` });
    }
    else if (movement_type === "ADJUST") {
      // qty here is the new absolute on-hand value
      delta = qtyNum - product.quantity_on_hand;
      newQty = qtyNum;
    }

    await execute(
      "UPDATE inventory_products SET quantity_on_hand = ?, updated_at = NOW() WHERE id = ?",
      [newQty, req.params.id]
    );
    await execute(
      `INSERT INTO inventory_movements (user_id, product_id, movement_type, qty_delta, qty_after, unit_cost_cents, note, reference, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, req.params.id, movement_type, delta, newQty, unit_cost_cents || null, note || null, reference || null, req.session.userId]
    );

    res.json({ ok: true, quantity_on_hand: newQty });
  } catch (err: any) {
    console.error("[Inventory] movement:", err.message);
    res.status(500).json({ error: "Failed to record movement" });
  }
});

inventoryRouter.get("/movements", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const where = ["m.user_id = ?"];
    const params: any[] = [userId];
    if (req.query.productId) { where.push("m.product_id = ?"); params.push(req.query.productId); }
    if (req.query.type) { where.push("m.movement_type = ?"); params.push(req.query.type); }
    const rows = await queryAll(
      `SELECT m.*, p.name as product_name, p.sku, p.barcode, u.full_name as actor_name
       FROM inventory_movements m
       JOIN inventory_products p ON p.id = m.product_id
       LEFT JOIN users u ON u.id = m.created_by
       WHERE ${where.join(" AND ")}
       ORDER BY m.created_at DESC
       LIMIT ${limit}`,
      params
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch movements" });
  }
});

// ───────────────────────── Stock-take sessions ─────────────────────────
inventoryRouter.get("/stocktakes", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const rows = await queryAll(
      `SELECT s.*,
              (SELECT COUNT(*) FROM stocktake_counts WHERE session_id = s.id) as products_counted,
              (SELECT COALESCE(SUM(counted_qty), 0) FROM stocktake_counts WHERE session_id = s.id) as units_counted,
              (SELECT COALESCE(SUM(counted_qty - expected_qty), 0) FROM stocktake_counts WHERE session_id = s.id) as net_variance
       FROM stocktake_sessions s
       WHERE s.user_id = ?
       ORDER BY s.started_at DESC
       LIMIT 200`,
      [userId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

inventoryRouter.post("/stocktakes", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const name = String(req.body?.name || "").trim() ||
      `Stock take — ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`;
    const id = randomUUID();
    await execute(
      `INSERT INTO stocktake_sessions (id, user_id, name, status, notes, created_by)
       VALUES (?, ?, ?, 'OPEN', ?, ?)`,
      [id, userId, name, req.body?.notes || null, req.session.userId]
    );
    const session = await queryOne("SELECT * FROM stocktake_sessions WHERE id = ?", [id]);
    res.json(session);
  } catch (err: any) {
    console.error("[Inventory] new stocktake:", err.message);
    res.status(500).json({ error: "Failed to start stock take" });
  }
});

inventoryRouter.get("/stocktakes/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });

    const counts = await queryAll(
      `SELECT c.*, p.name as product_name, p.sku, p.barcode, p.unit, p.cost_cents, p.price_cents,
              (c.counted_qty - c.expected_qty) as variance
       FROM stocktake_counts c
       JOIN inventory_products p ON p.id = c.product_id
       WHERE c.session_id = ?
       ORDER BY c.last_scanned_at DESC`,
      [req.params.id]
    );
    res.json({ session, counts });
  } catch {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Scan/increment a product in an open session.
// Body: { barcode?, productId?, qty=1 }. Either barcode or productId required.
inventoryRouter.post("/stocktakes/:id/scan", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "OPEN") return res.status(400).json({ error: "Session is not open" });

    const { barcode, productId, qty = 1 } = req.body || {};
    const qtyNum = Math.max(1, Math.round(Number(qty) || 1));

    let product: any = null;
    if (productId) {
      product = await queryOne(
        "SELECT * FROM inventory_products WHERE id = ? AND user_id = ? AND archived = 0",
        [productId, userId]
      );
    } else if (barcode) {
      product = await queryOne(
        "SELECT * FROM inventory_products WHERE user_id = ? AND barcode = ? AND archived = 0 LIMIT 1",
        [userId, String(barcode).trim()]
      );
    } else {
      return res.status(400).json({ error: "barcode or productId required" });
    }

    if (!product) {
      return res.status(404).json({
        error: "Unknown barcode",
        unknown_barcode: barcode || null,
      });
    }

    const existing = await queryOne(
      "SELECT * FROM stocktake_counts WHERE session_id = ? AND product_id = ? LIMIT 1",
      [req.params.id, product.id]
    );
    let countedAfter: number;
    if (existing) {
      countedAfter = existing.counted_qty + qtyNum;
      await execute(
        "UPDATE stocktake_counts SET counted_qty = ?, last_scanned_at = NOW() WHERE id = ?",
        [countedAfter, existing.id]
      );
    } else {
      countedAfter = qtyNum;
      await execute(
        `INSERT INTO stocktake_counts (session_id, product_id, counted_qty, expected_qty)
         VALUES (?, ?, ?, ?)`,
        [req.params.id, product.id, qtyNum, product.quantity_on_hand]
      );
    }

    res.json({
      ok: true,
      product,
      counted_qty: countedAfter,
      expected_qty: product.quantity_on_hand,
      variance: countedAfter - product.quantity_on_hand,
    });
  } catch (err: any) {
    console.error("[Inventory] scan:", err.message);
    res.status(500).json({ error: "Scan failed" });
  }
});

// Manual override for a count (e.g. user typed an exact figure).
inventoryRouter.patch("/stocktakes/:id/counts/:productId", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "OPEN") return res.status(400).json({ error: "Session is not open" });

    const newQty = Math.max(0, Math.round(Number(req.body?.counted_qty) || 0));
    const product = await queryOne(
      "SELECT * FROM inventory_products WHERE id = ? AND user_id = ?",
      [req.params.productId, userId]
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existing = await queryOne(
      "SELECT * FROM stocktake_counts WHERE session_id = ? AND product_id = ? LIMIT 1",
      [req.params.id, req.params.productId]
    );
    if (existing) {
      await execute(
        "UPDATE stocktake_counts SET counted_qty = ?, last_scanned_at = NOW() WHERE id = ?",
        [newQty, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO stocktake_counts (session_id, product_id, counted_qty, expected_qty) VALUES (?, ?, ?, ?)",
        [req.params.id, req.params.productId, newQty, product.quantity_on_hand]
      );
    }
    res.json({ ok: true, counted_qty: newQty, expected_qty: product.quantity_on_hand, variance: newQty - product.quantity_on_hand });
  } catch {
    res.status(500).json({ error: "Failed to update count" });
  }
});

inventoryRouter.delete("/stocktakes/:id/counts/:productId", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "OPEN") return res.status(400).json({ error: "Session is not open" });
    await execute(
      "DELETE FROM stocktake_counts WHERE session_id = ? AND product_id = ?",
      [req.params.id, req.params.productId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove count" });
  }
});

// Close a stock-take: apply variances to product quantities + write STOCKTAKE movements.
inventoryRouter.post("/stocktakes/:id/close", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "OPEN") return res.status(400).json({ error: "Already closed" });

    const counts = await queryAll(
      `SELECT c.*, p.quantity_on_hand as current_qty
       FROM stocktake_counts c
       JOIN inventory_products p ON p.id = c.product_id
       WHERE c.session_id = ?`,
      [req.params.id]
    );

    let appliedCount = 0;
    let netDelta = 0;
    for (const c of counts) {
      const delta = c.counted_qty - c.current_qty;
      if (delta === 0) continue;
      await execute(
        "UPDATE inventory_products SET quantity_on_hand = ?, updated_at = NOW() WHERE id = ?",
        [c.counted_qty, c.product_id]
      );
      await execute(
        `INSERT INTO inventory_movements (user_id, product_id, movement_type, qty_delta, qty_after, note, reference, created_by)
         VALUES (?, ?, 'STOCKTAKE', ?, ?, ?, ?, ?)`,
        [userId, c.product_id, delta, c.counted_qty, `Stock take adjustment`, session.id, req.session.userId]
      );
      appliedCount++;
      netDelta += delta;
    }

    await execute(
      "UPDATE stocktake_sessions SET status = 'CLOSED', closed_at = NOW() WHERE id = ?",
      [session.id]
    );

    res.json({ ok: true, appliedCount, netDelta, totalCounts: counts.length });
  } catch (err: any) {
    console.error("[Inventory] close stocktake:", err.message);
    res.status(500).json({ error: "Failed to close stock take" });
  }
});

inventoryRouter.post("/stocktakes/:id/cancel", requireAuth, async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const session = await queryOne(
      "SELECT * FROM stocktake_sessions WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "OPEN") return res.status(400).json({ error: "Already closed" });
    await execute(
      "UPDATE stocktake_sessions SET status = 'CANCELLED', closed_at = NOW() WHERE id = ?",
      [session.id]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to cancel" });
  }
});
