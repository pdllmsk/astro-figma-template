import type { APIRoute } from "astro";
import { FRONTEND_SITE } from "astro:env/server";

// Одностраничный лендинг; 404 и /test закрыты от индексации и сюда не попадают
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${new URL("/", FRONTEND_SITE).href}</loc></url></urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
