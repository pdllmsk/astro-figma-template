export const componentInit = (fn: () => void) =>
  document.addEventListener("astro:page-load", fn);
