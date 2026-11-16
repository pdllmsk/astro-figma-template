#!/usr/bin/env python3.11
"""Сравнивает блок страницы со скриншотом Figma и выгружает геометрию текстов.

python3.11 .claude/skills/pixel-check/pixel_check.py \
  --selector "main > :nth-child(2)" --width 1920 --figma .ca-workflow/pixel-check/hero-1920/figma.png --out .ca-workflow/pixel-check/hero-1920

Пишет в --out: impl.png, diff.png, compare.png (figma | impl | diff), texts.tsv.
Зависимости: pip install playwright pillow numpy && playwright install chromium
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

FREEZE_CSS = """
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
"""

LOAD_IMAGES_JS = """
async (root) => {
  const imgs = [...root.querySelectorAll("img")];
  imgs.forEach((i) => (i.loading = "eager"));
  const wait = imgs.map((i) =>
    i.complete ? null : new Promise((r) => ((i.onload = r), (i.onerror = r))),
  );
  await Promise.race([Promise.all(wait), new Promise((r) => setTimeout(r, 10000))]);
}
"""

# Тексты блока: листовые элементы с непустым собственным текстом, координаты от левого верхнего угла блока
TEXTS_JS = """
(root) => {
  const r0 = root.getBoundingClientRect();
  const out = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join("")
      .replace(/\\s+/g, " ")
      .trim();
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const s = getComputedStyle(el);
    out.push({
      text: own.slice(0, 40),
      x: r.left - r0.left,
      y: r.top - r0.top,
      w: r.width,
      h: r.height,
      font: s.fontFamily.split(",")[0].replace(/"/g, ""),
      size: s.fontSize,
      lh: s.lineHeight,
      ls: s.letterSpacing,
      weight: s.fontWeight,
    });
  }
  return out;
}
"""


def capture(url, selector, hide, out, width):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": width, "height": 1080},
            device_scale_factor=1,
            reduced_motion="reduce",
        )
        page.goto(url, wait_until="networkidle")
        page.add_style_tag(content=FREEZE_CSS)
        if hide:
            page.add_style_tag(content=f"{hide} {{ visibility: hidden !important; }}")
        page.evaluate("() => document.fonts.ready")
        el = page.locator(selector).first
        el.scroll_into_view_if_needed()
        # lazy-картинки блока грузим сразу и ждём, иначе в скриншоте будут пустые места
        el.evaluate(LOAD_IMAGES_JS)
        page.wait_for_timeout(300)
        # блок выше окна: картинки за его пределами браузер не отрисовывает — растягиваем окно
        height = el.evaluate("e => Math.ceil(e.getBoundingClientRect().height)")
        if height > 1080:
            page.set_viewport_size({"width": width, "height": height})
            el.scroll_into_view_if_needed()
            el.evaluate(LOAD_IMAGES_JS)
            page.wait_for_timeout(500)
        # блоки выше бывают дробной высоты: Figma рисует блок от его начала, а браузер прибивает
        # глифы к сетке страницы — сдвигаем страницу, чтобы верх блока лёг на целый пиксель
        el.evaluate(
            "e => { const t = e.getBoundingClientRect().top + scrollY;"
            " document.body.style.paddingTop = (Math.ceil(t) - t) + 'px'; }"
        )
        box = el.evaluate(
            "e => { const r = e.getBoundingClientRect();"
            " return {x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height} }"
        )
        clip = {k: round(v) for k, v in box.items()}
        page.screenshot(path=str(out / "impl.png"), clip=clip, full_page=True, animations="disabled")
        texts = el.evaluate(TEXTS_JS)
        browser.close()
    return texts


def compare(figma_path, out, threshold):
    figma = Image.open(figma_path).convert("RGB")
    impl = Image.open(out / "impl.png").convert("RGB")
    w, h = min(figma.width, impl.width), min(figma.height, impl.height)
    a = np.asarray(figma.crop((0, 0, w, h)), dtype=np.int16)
    b = np.asarray(impl.crop((0, 0, w, h)), dtype=np.int16)
    bad = np.abs(a - b).max(axis=2) > threshold

    gray = np.asarray(impl.crop((0, 0, w, h)).convert("L"))
    diff = np.stack([gray // 3] * 3, axis=2).astype(np.uint8)
    diff[bad] = [255, 0, 0]
    diff_img = Image.fromarray(diff)
    diff_img.save(out / "diff.png")

    sheet = Image.new("RGB", (figma.width + impl.width + w, max(figma.height, impl.height)), "white")
    sheet.paste(figma, (0, 0))
    sheet.paste(impl, (figma.width, 0))
    sheet.paste(diff_img, (figma.width + impl.width, 0))
    sheet.save(out / "compare.png")

    # Первая строка, где расхождение больше 2% ширины, — отсюда обычно и начинается сдвиг по вертикали
    row_bad = bad.mean(axis=1)
    first = next((y for y, v in enumerate(row_bad) if v > 0.02), None)
    return {
        "figma_size": [figma.width, figma.height],
        "impl_size": [impl.width, impl.height],
        "mismatch_pct": round(float(bad.mean()) * 100, 2),
        "first_bad_row": first,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:3001/")
    ap.add_argument("--selector", required=True, help="корень блока, например 'main > :nth-child(2)'")
    ap.add_argument("--figma", required=True, help="PNG фрейма из Figma в масштабе 1")
    ap.add_argument("--out", required=True)
    ap.add_argument("--width", type=int, default=1920, help="ширина окна = ширина фрейма Figma (.ca-workflow/workflow.md)")
    ap.add_argument("--hide", default="[data-header]", help="CSS-селектор, который спрятать (фиксированная шапка)")
    ap.add_argument("--threshold", type=int, default=40, help="порог отличия канала 0–255")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    texts = capture(args.url, args.selector, args.hide, out, args.width)

    with open(out / "texts.tsv", "w") as f:
        f.write("y\tx\th\tw\tsize\tlh\tls\tweight\tfont\ttext\n")
        for t in texts:
            f.write(
                f"{t['y']:.1f}\t{t['x']:.1f}\t{t['h']:.1f}\t{t['w']:.1f}\t{t['size']}\t{t['lh']}"
                f"\t{t['ls']}\t{t['weight']}\t{t['font']}\t{t['text']}\n"
            )

    report = compare(args.figma, out, args.threshold)
    print(json.dumps(report, ensure_ascii=False))
    if report["figma_size"] != report["impl_size"]:
        print("РАЗМЕР НЕ СОВПАДАЕТ — сначала найди, где набегает разница по высоте/ширине", file=sys.stderr)


if __name__ == "__main__":
    main()
