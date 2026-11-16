import type { Config, MainConfig } from "./getWidths";

const getWidthInVw = (base: number, width: number) =>
  ((width / base) * 100).toFixed(0);

// С base — доля экрана (вёрстка масштабируется от фрейма), без breakpoint — для всех шире
const getSize = (width: number, base?: number, breakpoint?: number) => {
  if (typeof base !== "number") return `${width}px`;
  const vw = `${getWidthInVw(base, width)}vw`;
  return typeof breakpoint === "number"
    ? `(max-width: ${breakpoint}px) ${vw}`
    : vw;
};

const getSizes = (config: Config) =>
  config
    .filter((v): v is MainConfig => !!(v as MainConfig).width)
    .map((v) => getSize(v.width, v.base, v.breakpoint))
    .join(",");

export default getSizes;
