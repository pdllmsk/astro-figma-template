import type { APIRoute } from "astro";
import { FRONTEND_SITE, NOINDEX } from "astro:env/server";

export const GET: APIRoute = () => {
  const rules = NOINDEX ? "Disallow: /" : "Allow: /";
  return new Response(
    `User-agent: *\n${rules}\n\nSitemap: ${new URL("/sitemap.xml", FRONTEND_SITE).href}`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  );
};
