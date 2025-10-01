// scripts/preview-subpath.mjs
import http from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { join, extname } from "node:path";

const DIST = "dist";
const SUBPATH = process.env.SUBPATH || "/maki-electro-staging/";
const PORT = Number(process.env.PORT || 5179);

// ここは「サブパス外でも直配信したいアセット」のプレフィックス
const ASSET_PREFIXES = [
  "/_astro/",
  "/images/",
  "/assets/",
  "/animations/",
  "/favicon",
  "/robots.txt",
  "/sitemap", // 任意
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",

  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".lottie": "application/json",
};

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}

function serveFile(res, relPath) {
  let file = join(DIST, relPath || "index.html");
  try {
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, "index.html");
    }
    if (!existsSync(file)) return send(res, 404, "Not Found");
    const type = MIME[extname(file)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    createReadStream(file).pipe(res);
  } catch (e) {
    send(res, 500, String(e?.message || e));
  }
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let p = url.pathname;

    // 1) アセットはサブパス外でもそのまま配信（/images/*, /_astro/* など）
    if (ASSET_PREFIXES.some((pre) => p.startsWith(pre))) {
      // 例: /images/foo.webp -> dist/images/foo.webp
      return serveFile(res, p.replace(/^\//, ""));
    }

    // 2) サブパス配下のページを配信
    if (p.startsWith(SUBPATH)) {
      // 例: /maki-electro-staging/company/ -> dist/company/index.html
      const withoutSubpath = p.slice(SUBPATH.length);
      return serveFile(res, withoutSubpath);
    }

    // 3) それ以外のリクエストはサブパスへリダイレクト（入口統一）
    res.writeHead(302, { Location: SUBPATH });
    res.end();
  })
  .listen(PORT, () => {
    console.log(`▶ Staging preview on http://localhost:${PORT}${SUBPATH}`);
  });
