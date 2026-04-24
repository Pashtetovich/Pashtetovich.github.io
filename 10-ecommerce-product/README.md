# КЛЫК — Product Page

A production-quality e-commerce product page for a fictional Russian streetwear brand **КЛЫК** (Klyk), selling a winter sneaker model **Север · Зима** (North · Winter). Built as a freelance portfolio piece targeting the Russian market (Kwork, FL.ru, Хабр Фриланс).

All user-facing copy is in Russian, prices are in rubles, and the content/context is tailored to a Russian buyer (Москва / СПб / Екб, СДЭК, Boxberry, 2026 dates, etc.).

## What's inside

- `index.html` — semantic HTML5, `lang="ru"`, full product page
- `styles.css` — custom styles layered on top of Tailwind (focus rings, reveal animations, accordion transitions, add-to-cart success state)
- `script.js` — vanilla JS: gallery, size/color selection, quantity stepper, accordion, newsletter validation, `IntersectionObserver` reveals
- `README.md` — this file

No build step, no npm, no bundler. Just four files.

## How to run

Pick one:

```bash
# macOS / Linux
open index.html

# Or serve on a local port (recommended for IntersectionObserver / CORS)
python3 -m http.server 8000
# then visit http://localhost:8000/

# Or with Node
npx serve .
```

## Stack

- **HTML5** — semantic (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`), proper heading hierarchy, `aria-*` attributes for state
- **Tailwind CSS** via CDN with an inline `tailwind.config` extension for brand colors and fonts
- **Google Fonts**: Inter (body) + Unbounded (display) — both Cyrillic-friendly
- **Vanilla JavaScript** — no frameworks, no dependencies
- **Unsplash** photos for product imagery

## Design notes

### Palette

| Token    | Value     | Usage                          |
|----------|-----------|--------------------------------|
| `bg`     | `#fafafa` | Page background                |
| `ink`    | `#0a0a0a` | Text, primary buttons, borders |
| `muted`  | `#6b6b6b` | Secondary text                 |
| `line`   | `#e7e7e7` | Dividers, card borders         |
| `accent` | `#c03928` | Sale badge, discount chip      |

Deep red accent is used sparingly — only for discount indicators and the newsletter glow. The "primary" CTA stays near-black (Lamoda premium / Yandex Market feel rather than a loud discount store).

### Typography

- Display: **Unbounded** (500–800), tight tracking, tabular numerals for prices
- Body: **Inter** (400–700)
- Avoided Instrument Serif / Fraunces because they don't ship with Cyrillic glyphs

### Layout

- Mobile-first, fluid from 360px
- Gallery stacks above product info below `lg` breakpoint
- Sticky header with backdrop blur
- Generous whitespace, aspect-ratio-preserved product photography

## Interaction details

- **Gallery**: thumbnail click fades main image, arrow buttons cycle through, `←/→` keyboard navigation
- **Size picker**: real `<button>` elements with `aria-pressed`; disabled sizes (42, 44) are visually dimmed and unclickable
- **Color swatches**: `aria-pressed` radio-group behavior; selected state uses ring offset
- **Quantity stepper**: clamped 1–10
- **Add to cart**: validates size → success animation + toast + cart counter pulse
- **Accordion**: single-open (opening one closes siblings)
- **Newsletter**: regex-validated email, success/error messaging
- **Reveal animations**: `IntersectionObserver` triggers subtle fade-up (disabled under `prefers-reduced-motion`)

## Accessibility

- `<html lang="ru">`
- Semantic landmarks and headings
- Visible focus ring on all interactive elements
- `aria-pressed` on size/color buttons, `aria-expanded` on accordion heads, `aria-live` regions for size hint and newsletter feedback
- Disabled sizes marked with `aria-disabled="true"` and `disabled`
- Respects `prefers-reduced-motion`

## Browser support

Evergreen browsers (Chrome / Firefox / Safari / Edge). IntersectionObserver is the only modern API used and has universal support in 2024+.
