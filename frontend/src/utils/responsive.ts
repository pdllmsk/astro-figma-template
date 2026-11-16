// Адаптивные значения пропов: одно значение для всех экранов или
// { base, tab, desk }. base — мобилка, tab — от 768px, desk — от 1024px.
// Mobile-first: незаданный tab берёт base, незаданный desk — tab (или base).
export const BREAKPOINTS = ["base", "tab", "desk"] as const;

export type Breakpoint = (typeof BREAKPOINTS)[number];

export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

// Классы для base, tab и desk. Все строки пишутся литералами (не собираются
// из шаблона), иначе Tailwind их не увидит при сканировании исходников.
export type ClassSet = readonly [base: string, tab: string, desk: string];

function isBreakpointMap<T>(
  value: Responsive<T>,
): value is Partial<Record<Breakpoint, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toBreakpointMap<T>(
  value: Responsive<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (value === undefined) return {};
  return isBreakpointMap(value) ? value : { base: value };
}

export function responsiveClasses<T extends string>(
  value: Responsive<T> | undefined,
  map: Record<T, ClassSet>,
): string[] {
  const { base, tab, desk } = toBreakpointMap(value);
  return [
    base && map[base][0],
    tab && map[tab][1],
    desk && map[desk][2],
  ].filter((cls): cls is string => !!cls);
}

// px макета → rem. Нужен для значений в inline style, которые не проходят
// через postcss-pxtorem.
export const pxToRem = (px: number) => (px === 0 ? "0" : `${px / 16}rem`);
