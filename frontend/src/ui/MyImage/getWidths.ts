export type MainConfig = { width: number; breakpoint?: number; base: number };
export type WidthOnly = { width: number };
export type OriginConfig = { origin: number };

export type Config = (MainConfig | OriginConfig | WidthOnly)[];

const getWidthWithDensities = (width: number) => [width, width * 2, width * 3];
const getWidthsInArray = (config: Config) =>
  config.map((v) => (v as MainConfig)?.width || (v as OriginConfig)?.origin);

// Плотности режем по оригиналу, а не по следующему брейкпоинту: иначе 2x мобилки выпадает и браузер берёт кадр сильно крупнее
function getWidths(config: Config) {
  const origin =
    (config.find((v) => "origin" in v) as OriginConfig | undefined)?.origin ??
    Infinity;
  const widths = getWidthsInArray(config).flatMap((width) =>
    getWidthWithDensities(width).filter((w) => w <= origin),
  );
  return [...new Set(widths)].sort((a, b) => a - b);
}

export default getWidths;
