import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
function buildSitemapXml(siteUrl: string) {
  const origin = siteUrl.replace(/\/+$/, "");
  const now = new Date().toISOString();

  const staticPaths = [
    "/",
    "/solutions",
    "/pricing",
    "/about",
    "/contact",
    "/booking",
    "/free-audit",
    "/whatsapp",
    "/signup",
    "/blog",
  ];

  const urls = staticPaths
    .map((p) => {
      const loc = `${origin}${p}`;
      const priority = p === "/" ? "1.0" : "0.7";
      const changefreq = p === "/" ? "weekly" : "monthly";
      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`.trim();
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://bethelmind.com";

  return {
    build: {
      sourcemap: 'hidden',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      {
        name: "bm-sitemap",
        apply: "build",
        generateBundle() {
          const xml = buildSitemapXml(siteUrl);
          this.emitFile({ type: "asset", fileName: "sitemap.xml", source: xml });
        },
      },
    ],
  };
});