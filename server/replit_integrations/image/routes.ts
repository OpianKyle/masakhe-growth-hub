import type { Express, Request, Response } from "express";
import multer from "multer";
import { toFile } from "openai";
import { openai, getOpenAI } from "./client";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export function registerImageRoutes(app: Express): void {
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, size = "1024x1024" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: size as "1024x1024" | "512x512" | "256x256",
      });

      const imageData = response.data[0];
      res.json({
        url: imageData.url,
        b64_json: imageData.b64_json,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // POST /api/edit-image — upload an image + prompt, AI edits/enhances it
  app.post("/api/edit-image", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      if (!req.file) return res.status(400).json({ error: "Image file is required" });

      const imageFile = await toFile(req.file.buffer, "image.png", { type: "image/png" });

      const response = await getOpenAI().images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageData = response.data[0];
      res.json({
        b64_json: imageData.b64_json,
        url: imageData.url,
      });
    } catch (error: any) {
      console.error("Error editing image:", error?.message || error);
      res.status(500).json({ error: error?.message || "Failed to edit image" });
    }
  });
}

