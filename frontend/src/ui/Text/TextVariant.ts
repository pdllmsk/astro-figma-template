import type { ClassSet } from "@utils/responsive";

// Текстовые стили макета → утилиты typo-* из styles/typography.css.
// Новый стиль: токен --text-* в tokens.css, @utility в typography.css, строка здесь.
// Заглушка до старта проекта: один стиль body.
const TextVariant = {
  body: ["typo-body", "tab:typo-body", "desk:typo-body"],
} as const satisfies Record<string, ClassSet>;

export type Variant = keyof typeof TextVariant;

export default TextVariant;
