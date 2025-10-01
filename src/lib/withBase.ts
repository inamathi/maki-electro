// src/lib/withBase.ts
function effectiveBase(): string {
  // まずは通常どおりの BASE_URL
  let base = import.meta.env.BASE_URL || "/";

  // ★ 本番ビルドで BASE_URL が "/" のままでも、
  //    SITE のパス部分（例: http://host/maki-electro-staging）から補完する
  if (import.meta.env.PROD && base === "/" && import.meta.env.SITE) {
    try {
      const p = new URL(import.meta.env.SITE).pathname; // → "/maki-electro-staging"
      if (p && p !== "/") base = p.endsWith("/") ? p : p + "/";
    } catch {
      /* no-op */
    }
  }
  return base;
}

export function withBaseSafe(src: string): string {
  if (!src || typeof src !== "string") return src as any;
  // そのまま通すパターン
  if (/^https?:\/\//.test(src)) return src;
  if (src.startsWith("/_astro/") || src.startsWith("/@")) return src;

  const base = effectiveBase();

  // すでに base 付きならそのまま返す
  if (src.startsWith(base)) return src;

  // "/images/..." 等に base を前置
  return `${base}${src.replace(/^\//, "")}`;
}
