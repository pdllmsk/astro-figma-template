// Текст из data/*.data.ts (а потом из CMS) → HTML. Маркеры переносов:
// Enter — везде, [mob] — только на мобилке, [tab] — только на планшете,
// [desk] — только на десктопе.
// Текст в {фигурных скобках} — ссылки по порядку из links.
const breaks: Record<string, string> = {
  "\n": "<br>",
  "[mob]": '<br class="tab:hidden">',
  "[tab]": '<br class="hidden tab:max-desk:inline">',
  "[desk]": '<br class="max-desk:hidden">',
};

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const lines = (
  text: string | null | undefined,
  links: string[] = [],
) => {
  let link = 0;
  // Без типографа: неразрывные пробелы ставит редактор (U+00A0), как в макете
  return escape(text ?? "")
    .replace(/\n|\[mob\]|\[tab\]|\[desk\]/g, (marker) => breaks[marker])
    .replace(
      /\{([^}]+)\}/g,
      (_, label) => `<a href="${escape(links[link++] ?? "#")}">${label}</a>`,
    );
};

// Тот же текст без разметки — для JSON-LD: маркеры → пробел, {ссылка} → её текст
export const plainLines = (text: string | null | undefined) =>
  (text ?? "")
    .replace(/\n|\[mob\]|\[tab\]|\[desk\]/g, " ")
    .replace(/\{([^}]+)\}/g, "$1")
    .replace(/ {2,}/g, " ")
    .trim();
