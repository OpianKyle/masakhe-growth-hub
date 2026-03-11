import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";

export const vehicleRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

vehicleRouter.get("/public/by-website/:websiteId", async (req, res) => {
  try {
    const vehicles = await queryAll(
      "SELECT id, website_id, make, model, variant, year, price, mileage, fuel_type, transmission, color, body_type, description, features, images, status, featured, created_at FROM vehicle_listings WHERE website_id = ? AND status = 'available' ORDER BY featured DESC, created_at DESC",
      [req.params.websiteId]
    );
    res.json(vehicles.map((v: any) => {
      const images = typeof v.images === "string" ? JSON.parse(v.images) : (v.images || []);
      return {
        ...v,
        features: typeof v.features === "string" ? JSON.parse(v.features) : v.features,
        thumbnail: images[0] || null,
        image_count: images.length,
        images: undefined,
      };
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.get("/public/detail/:id", async (req, res) => {
  try {
    const vehicle = await queryOne("SELECT * FROM vehicle_listings WHERE id = ?", [req.params.id]);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    vehicle.features = typeof vehicle.features === "string" ? JSON.parse(vehicle.features) : vehicle.features;
    vehicle.images = typeof vehicle.images === "string" ? JSON.parse(vehicle.images) : vehicle.images;
    res.json(vehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const websiteId = req.query.websiteId as string;
    const cols = "id, website_id, user_id, make, model, variant, year, price, mileage, fuel_type, transmission, color, body_type, description, features, images, status, featured, created_at, updated_at";
    let vehicles;
    if (websiteId) {
      vehicles = await queryAll(
        `SELECT ${cols} FROM vehicle_listings WHERE user_id = ? AND website_id = ? ORDER BY featured DESC, created_at DESC`,
        [userId, websiteId]
      );
    } else {
      vehicles = await queryAll(
        `SELECT ${cols} FROM vehicle_listings WHERE user_id = ? ORDER BY featured DESC, created_at DESC`,
        [userId]
      );
    }
    res.json(vehicles.map((v: any) => {
      const images = typeof v.images === "string" ? JSON.parse(v.images) : (v.images || []);
      return {
        ...v,
        features: typeof v.features === "string" ? JSON.parse(v.features) : v.features,
        thumbnail: images[0] || null,
        image_count: images.length,
        images: undefined,
      };
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const vehicle = await queryOne("SELECT * FROM vehicle_listings WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId!]);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    vehicle.features = typeof vehicle.features === "string" ? JSON.parse(vehicle.features) : vehicle.features;
    vehicle.images = typeof vehicle.images === "string" ? JSON.parse(vehicle.images) : vehicle.images;
    res.json(vehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = randomUUID();
    const { websiteId, make, model, variant, year, price, mileage, fuelType, transmission, color, bodyType, description, features, images, status, featured } = req.body;

    if (!websiteId || !make || !model || !year || price === undefined) {
      return res.status(400).json({ error: "Required: websiteId, make, model, year, price" });
    }

    const website = await queryOne("SELECT id FROM websites WHERE id = ? AND owner_id = ?", [websiteId, userId]);
    if (!website) return res.status(403).json({ error: "You do not own this website" });

    await execute(
      `INSERT INTO vehicle_listings (id, website_id, user_id, make, model, variant, year, price, mileage, fuel_type, transmission, color, body_type, description, features, images, status, featured)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, websiteId, userId, make, model, variant || null, year, price, mileage || null, fuelType || null, transmission || null, color || null, bodyType || null, description || null, JSON.stringify(features || []), JSON.stringify(images || []), status || "available", featured ? 1 : 0]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const existing = await queryOne("SELECT id FROM vehicle_listings WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Vehicle not found" });

    const { make, model, variant, year, price, mileage, fuelType, transmission, color, bodyType, description, features, images, status, featured } = req.body;

    await execute(
      `UPDATE vehicle_listings SET make=?, model=?, variant=?, year=?, price=?, mileage=?, fuel_type=?, transmission=?, color=?, body_type=?, description=?, features=?, images=?, status=?, featured=?, updated_at=NOW() WHERE id=?`,
      [make, model, variant || null, year, price, mileage || null, fuelType || null, transmission || null, color || null, bodyType || null, description || null, JSON.stringify(features || []), JSON.stringify(images || []), status || "available", featured ? 1 : 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const existing = await queryOne("SELECT id FROM vehicle_listings WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Vehicle not found" });
    await execute("DELETE FROM vehicle_listings WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.post("/:id/images", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const userId = req.session.userId!;
    const vehicle = await queryOne("SELECT images FROM vehicle_listings WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const mimeType = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");
    const url = `data:${mimeType};base64,${base64}`;

    const currentImages = typeof vehicle.images === "string" ? JSON.parse(vehicle.images) : (vehicle.images || []);
    currentImages.push(url);

    await execute("UPDATE vehicle_listings SET images = ? WHERE id = ?", [JSON.stringify(currentImages), req.params.id]);
    res.json({ ok: true, url, images: currentImages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
