// astro.prod.mjs（本番固定）
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://www.maki-elec.co.jp", // 本番のフルURL（末尾スラなし）
  base: "/", // 本番はルート配信
});
