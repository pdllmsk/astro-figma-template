import pxtorem from "postcss-pxtorem";

export default {
  plugins: [
    // Все px из кода (классы Tailwind, токены, <style>) становятся rem, поэтому
    // вёрстка масштабируется вместе с корневым font-size (см. global.css).
    // Пишем px как в макете — перевод происходит при сборке.
    // mediaQuery: false оставляет брейкпоинты в px; html исключён, чтобы
    // не пересчитывать сам корневой размер.
    pxtorem({
      rootValue: 16,
      unitPrecision: 5,
      propList: ["*"],
      selectorBlackList: [/^html$/],
      mediaQuery: false,
      minPixelValue: 0,
    }),
  ],
};
