// astro.config.mjs
import { defineConfig } from "astro/config";
import path from "node:path";

export default defineConfig({
  output: "static",
  site: "http://xs313918.xsrv.jp/maki-electro-staging", // ←公開URL（末尾スラなし）
  base: "/maki-electro-staging/", // ←必ず先頭/あり・末尾/あり

  alias: { "@": "./src" },
  vite: {
    resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) =>
            assetInfo.name && assetInfo.name.endsWith(".lottie")
              ? "assets/[name].[ext]"
              : "assets/[name].[hash].[ext]",
        },
      },
    },
    server: { mimeTypes: { ".lottie": "application/json" } },
  },
});
