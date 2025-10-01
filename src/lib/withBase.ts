// src/lib/withBase.ts
function effectiveBase(): string {
  // 通常は BASE_URL を使う
  let base = import.meta.env.BASE_URL || "/";

  // ★ BASE_URL が "/" のままでも、SITE のパス部分から補完（例: /maki-electro-staging）
  if (base === "/" && import.meta.env.SITE) {
    try {
      const p = new URL(import.meta.env.SITE as string).pathname; // 例: "/maki-electro-staging"
      if (p && p !== "/") base = p.endsWith("/") ? p : p + "/";
    } catch {
      /* no-op */
    }
  }
  return base;
}

export function withBaseSafe(href: string): string {
  if (!href || typeof href !== "string") return href as any;

  // 外部/アンカー/メール/電話はそのまま
  if (
    /^([a-z]+:)?\/\//i.test(href) ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  const base = effectiveBase();

  // 既に base 付きならそのまま
  if (href.startsWith(base)) return href;

  // 先頭スラを落として base を前置
  return `${base}${href.replace(/^\//, "")}`;
}
