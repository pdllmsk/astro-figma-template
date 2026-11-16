import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

const defPORT = 4321;
// pnpm build:static — статический сайт в dist/ без сервера; pnpm build — node для Docker
const isStatic = process.env.STATIC === "true";

export default defineConfig({
  adapter: isStatic ? undefined : node({ mode: "standalone" }),
  output: isStatic ? "static" : "server",
  trailingSlash: "never",
  env: {
    schema: {
      FRONTEND_SITE: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      NOINDEX: envField.boolean({
        context: "server",
        access: "secret",
        optional: true,
        default: false,
      }),
    },
  },
  prefetch: true,
  server: {
    port: Number(process.env.FRONTEND_PORT) || defPORT,
    host: true,
    open: true,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        "@components": "/src/components",
        "@constants": "/src/constants",
        "@layouts": "/src/layouts",
        "@utils": "/src/utils",
        "@test": "/src/test",
        "@ui": "/src/ui",
      },
    },
  },
  build: { inlineStylesheets: "auto" },
  scopedStyleStrategy: "where",
  experimental: {
    // Шрифты макета (заполняются при старте проекта, см. AGENTS.md).
    // CSS-переменная шрифта используется в токенах --font-* (tokens.css),
    // <Font cssVariable="…" preload /> выводится в components/Head.
    // Google Fonts: { provider: fontProviders.google(), name: "Inter", cssVariable: "--font-inter", weights: [400, 700], subsets: ["latin", "cyrillic"] }
    // Свой файл: { provider: fontProviders.local(), name: "…", cssVariable: "--font-…", options: { variants: [{ src: ["./src/assets/fonts/…woff2"], weight: "400", style: "normal" }] } }
    fonts: [],
    svgo: {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              // Не трогать то, на что могут опираться анимации
              removeHiddenElems: false,
              removeUnknownsAndDefaults: false,
              removeUselessDefs: false,
              cleanupIds: false,
            },
          },
        },
      ],
      js2svg: {
        pretty: true,
      },
    },
  },
});
