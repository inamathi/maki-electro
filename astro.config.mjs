// astro.config.mjs（開発専用・最小）
import { defineConfig } from "astro/config";
import path from "node:path";

export default defineConfig({
  output: "static",
  site: "http://localhost:4321", // 開発の見やすさ用（任意）
  base: "/", // 開発は常にルート
  alias: { "@": "./src" },
  vite: {
    resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
    server: { mimeTypes: { ".lottie": "application/json" } },
  },
});
