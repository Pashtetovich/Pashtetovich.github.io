# Верба — Restaurant Landing Page

A production-quality landing page for a fictional upscale Moscow restaurant, **"Верба"** — modern European cuisine with Russian accents. Built as a freelance portfolio piece targeting Russian-speaking clients (Kwork, FL.ru, Хабр Фриланс).

All copy is in Russian, prices are in rubles, contact formats follow Russian conventions.

## Preview

No build step required — just serve the folder with any static server:

```bash
cd 06-restaurant-ru
python3 -m http.server 8000
# open http://localhost:8000
```

Or use any equivalent (`npx serve`, VS Code Live Server, etc.).

## Stack

- **HTML5** + semantic markup (`<html lang="ru">`)
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`) — configured inline with custom palette
- **Vanilla JavaScript** — no frameworks, no bundler
- **Google Fonts** — Playfair Display (serif, Cyrillic subset) + Inter (sans, Cyrillic subset)
- **Inline SVGs** — all icons
- **Unsplash** — direct image URLs for food/interior photography

## Files

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `index.html` | Markup, sections, Tailwind config, image/SVG assets        |
| `styles.css` | Custom CSS layered on Tailwind: reveal anims, form, header |
| `script.js`  | Header scroll state, reveal observer, form validation      |
| `README.md`  | This file                                                  |

## Sections

1. Fixed translucent header with nav and CTA
2. Hero — full-viewport image with overlay, serif headline, dual CTAs, scroll indicator
3. О нас — two-column intro with chef signature and stats strip
4. Коронные блюда — 6-card grid with image zoom on hover
5. Меню — two-column list (Закуски / Основные блюда) with dotted-leader prices
6. Галерея — asymmetric 6-image grid with zoom-on-hover
7. Бронирование — split: contact info + validated reservation form
8. Footer — logo, socials (Telegram, VK, Instagram), contacts, copyright

## Design notes

- **Palette**: deep forest green `#1f3a2e`, cream `#f5f1e8`, terracotta accent `#c0652d`
- **Typography**: `Playfair Display` for editorial serif headlines (Cyrillic-capable), `Inter` for UI/body
- **Motion**: IntersectionObserver reveal-on-scroll with staggered delays; smooth anchor scrolling with header offset
- **Accessibility**: semantic landmarks, labelled form fields, `:focus-visible` outlines, `prefers-reduced-motion` respected, Russian `alt` text on all imagery
- **Responsive**: mobile-first, fluid from 360px up; mobile hamburger menu

## Form validation

Client-side only (no backend). Rules:

- `name`, `phone`, `date`, `time`, `guests` — required
- `email` — optional but must be valid if provided
- `date` — must not be in the past (`min` = today)
- `phone` — accepts digits, spaces, `+`, `()`, `-`, min 7 chars

On successful submit: form is replaced with a success card ("Ваше бронирование отправлено — мы перезвоним в течение 15 минут"), auto-resets after 4 seconds.

## Production TODOs (out of scope for demo)

- Replace Tailwind CDN with a built CSS bundle (PurgeCSS)
- Swap Unsplash URLs for self-hosted, optimised WebP/AVIF
- Wire reservation form to a real backend (e.g., Telegram bot, CRM API, or SMTP)
- Add `robots.txt`, `sitemap.xml`, Open Graph / Twitter meta, favicon set
- Add analytics (Яндекс.Метрика) and a cookie-consent notice for 152-ФЗ compliance
