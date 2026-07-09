import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

const excludeUploadsPlugin = {
  name: "exclude-uploads-from-build",
  apply: "build" as const,
  buildStart() {
    const src = path.resolve(__dirname, "public/uploads");
    const temp = path.resolve(__dirname, "public/.uploads-build-temp");
    // If a stale temp exists from a previous failed build, clean it up first
    if (fs.existsSync(temp)) {
      if (fs.existsSync(src)) {
        fs.rmSync(src, { recursive: true, force: true });
      }
      fs.renameSync(temp, src);
    }
    // Now move uploads out of the way so Vite doesn't copy it
    if (fs.existsSync(src)) {
      fs.renameSync(src, temp);
    }
  },
  closeBundle() {
    const src = path.resolve(__dirname, "public/uploads");
    const temp = path.resolve(__dirname, "public/.uploads-build-temp");
    if (fs.existsSync(temp)) {
      // Remove any empty uploads dir that may have been recreated during build
      if (fs.existsSync(src)) {
        fs.rmSync(src, { recursive: true, force: true });
      }
      fs.renameSync(temp, src);
    }
  },
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        cookieDomainRewrite: { "*": "" },
      },
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  appType: "spa",
  plugins: [react(), excludeUploadsPlugin].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  optimizeDeps: {
    include: [
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "@tiptap/extension-underline",
      "@tiptap/extension-text-align",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-text-style",
      "@tiptap/extension-color",
    ],
  },
}));
