# Старт в продуктовом дизайне — Landing Page

A production-ready, conversion-focused landing page for a fictional 6-week Russian-language course in product design. Built as part of a freelance portfolio targeting Russian-speaking clients (Kwork, FL.ru, Хабр Фриланс).

## What this is

Single-page marketing site for an online course, fully localised for the Russian market:

- Copy in Russian, written in a native editorial tone (not translated).
- Prices in rubles (₽) with installment framing (рассрочка).
- Social proof from Russian tech companies: Яндекс, Т-Банк, Авито, ВКонтакте, Озон, Wildberries, Сбер, Самокат.
- Russian instructor persona (Мария Соколова, Senior Product Designer в Т-Банке, ex-Яндекс).
- Student testimonials with Russian names and roles at Russian companies.
- FAQ tuned to questions typical of the Russian e-learning market.

## Stack

- **HTML5** (`<html lang="ru">`) — semantic, accessible.
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`) with a small in-page config extending the palette.
- **Vanilla JavaScript** — no frameworks, no build step.
- **Google Fonts**: Lora (serif headings) + Inter (body). Both ship full Cyrillic glyph coverage.
- **Inline SVG** icons throughout (no icon font dependency).
- **Unsplash** for avatar imagery.

## How to preview

No build step — open `index.html` directly:

```bash
# macOS
open index.html

# Or spin up any static server:
python3 -m http.server 8000
# then visit http://localhost:8000
```

All external resources (Tailwind CDN, Google Fonts, Unsplash images) are loaded over HTTPS, so an internet connection is required for correct rendering.

## Files

| File         | Purpose                                                                 |
|--------------|-------------------------------------------------------------------------|
| `index.html` | Markup, semantic sections, inline SVGs, Tailwind utility classes.       |
| `styles.css` | Bespoke styles that Tailwind doesn't cover (reveal animation, details). |
| `script.js`  | Countdown, accordions, IntersectionObserver reveals, smooth scroll.     |
| `README.md`  | This file.                                                              |

## Sections

1. Announcement bar with live countdown + promo code `СТАРТ20`
2. Sticky navigation
3. Hero — editorial serif headline, dual CTAs, star rating, alumni companies
4. "Что вы освоите" — 6 learning outcomes in a 3x2 grid
5. Pull quote from the instructor
6. "Программа" — 6 expandable week-by-week modules
7. "Преподаватель" — split layout with photo and bio
8. "Отзывы" — 3 detailed testimonials + results row (87% / 2400+ / 4.9)
9. "Стоимость" — single pricing card with crossed-out old price, installment info, refund policy
10. FAQ — 8 accordion items, auto-close siblings
11. Final CTA — countdown + large button, cohort size note
12. Footer — navigation, socials (Telegram / ВКонтакте), legal

## JavaScript behaviours

- **Live countdown** to a deadline set ~6 days after page load (23:59:59). Renders in both the announcement bar (`Д : ЧЧ : ММ : СС`) and the final CTA (four labeled blocks). Updates every second.
- **Accordion auto-close** — FAQ and curriculum both close siblings when one opens (one-at-a-time pattern).
- **Reveal animation** via `IntersectionObserver` — elements with `.reveal` fade up on scroll.
- **Smooth anchor scrolling** with sticky-header offset.
- **Header scroll shadow** — subtle elevation after ~8px scroll.
- Respects `prefers-reduced-motion` — disables animations for users who opt out.

## Design notes

- Palette: warm cream `#fef9f3` surface, deep plum `#4a1d3d` ink/dark sections, soft peach `#f4a261` accent.
- Typography pairing — Lora (serif, Cyrillic-ready) for headlines and pull quotes, Inter for UI and body.
- Deliberately avoids the "заработай миллион из дома" infomarketing aesthetic in favour of a calm, editorial "премиальный онлайн-курс" register, closer to Bang Bang Education / Бюро Горбунова / Нетология.
- Generous whitespace, serif italic accents for rhythm, tabular numerals on prices and the countdown.

## Accessibility

- `lang="ru"` on the root.
- Russian `alt` text on all imagery.
- Semantic landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`).
- Keyboard focus styles via `:focus-visible`.
- `aria-hidden` on decorative SVGs; `aria-label` on star ratings and decorative backgrounds.
- `aria-live="polite"` on the final countdown.
- Reduced-motion support.

## Responsive

Mobile-first with Tailwind breakpoints. Tested widths: 375, 414, 768, 1024, 1280, 1440, 1920.

## License

Portfolio work. Content is fictional; company names are referenced as social proof placeholders only.
