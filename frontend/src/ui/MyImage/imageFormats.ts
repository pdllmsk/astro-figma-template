import type { ImageOutputFormat } from "astro";

// Только WebP: SSR пережимает картинки на лету, AVIF кодируется на порядок дольше и на стенде
// не успевал за загрузкой страницы (504). Вернуть ["avif"] — только вместе с предгенерацией картинок
export const imageFormats: ImageOutputFormat[] = [];
export const fallbackFormat: ImageOutputFormat = "webp";
