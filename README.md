# astro-figma-template

Шаблон лендинга по макету Figma: Astro 5 + Tailwind CSS 4, pnpm-монорепо, вёрстка с заделом под CMS. Правила — в `AGENTS.md`, состояние проекта — в `.ca-workflow/workflow.md`.

## Запуск

```bash
cp .env.example .env
pnpm install
pnpm start
```

Витрина ui-компонентов — `/test/preview`.

## Как работаем с Claude

1. **Старт проекта.** Дать ссылки на фреймы макета (от одного до трёх, по одному на размер экрана). Claude достаёт токены, текстовые стили и шрифты, предлагает брейкпоинты — подтвердить. Шрифтов нет в Google Fonts — положить файлы в `frontend/src/assets/fonts/`.
2. **Блок.** Дать ноды блока на каждом фрейме. Claude записывает их в таблицу `workflow.md`, верстает, сверяет с макетом скиллом `pixel-check`.
3. **Автономно.** Заполнить таблицу блоков `workflow.md` целиком — Claude пройдёт все несвёрстанные блоки по очереди.

## Сборка

- `pnpm build` — node standalone, запуск в Docker (`Dockerfile`, порт 4000).
- `pnpm build:static` — статический сайт в `frontend/dist`. Серверных эндпоинтов (приём заявок с формы) в статике нет.

Перед коммитом: `pnpm prettier && pnpm check && pnpm build`.

## Окружение

- `pixel-check` — Python 3.11 с `playwright`, `pillow`, `numpy`.
- Claude Code: плагин ponytail включается из `.claude/settings.json` на уровне `ultra`.
