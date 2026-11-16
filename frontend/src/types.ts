import { type ImageMetadata } from "astro";
import type { SvgComponent } from "astro/types";

export type Tag = keyof HTMLElementTagNameMap;
export type ImageAstro = ImageMetadata;
export type SVG = SvgComponent & ImageMetadata;

export type DataAttrs = {
  [key: `data-${string}`]: string | number | boolean;
};
