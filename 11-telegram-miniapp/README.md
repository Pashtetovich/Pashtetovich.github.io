# Поток — Telegram Mini App Landing

A production-quality single-page landing for a fictional Telegram Mini App called **Поток** ("Potok", i.e. "Flow") — a productivity and habits tracker that lives inside Telegram. Built as a freelance portfolio piece targeting the Russian market.

All user-facing copy is in Russian. The page is mobile-first and self-contained in four files.

## What it is

A conversion-focused marketing page whose single job is to drive visitors to tap **"Открыть в Telegram"** — i.e. open the mini-app inside Telegram. The narrative emphasises the Mini-App advantages over standalone apps: nothing to install, no account, seamless sharing, reminders that arrive as ordinary bot messages.

## Run instructions

No build step. Just open `index.html` in any modern browser:

```bash
# from the project folder
open index.html        # macOS
# or serve locally (any static server works)
python3 -m http.server 8080
# then visit http://localhost:8080
```

You need an internet connection on first load so Tailwind CDN and Google Fonts can be fetched.

## File structure

```
11-telegram-miniapp/
├── index.html   # All markup + inline SVG icons
├── styles.css   # Custom CSS (phone mockups, cards, accordion, etc.)
├── script.js    # FAQ accordion, smooth scroll, reveal-on-scroll, mock clock
└── README.md    # You are here
```

## Stack

- Plain HTML5, CSS, vanilla JavaScript (no frameworks, no build tools)
- Tailwind CSS via CDN (with a small inline config extending colours and fonts)
- Google Fonts: **Inter** (body) + **Unbounded** (display headings) — both Cyrillic-capable
- Inline SVGs for every icon (including the official Telegram paper-plane glyph)
- `<html lang="ru">` for correct language detection and screen readers

No dependencies beyond the two CDN links.

## Sections

1. Sticky header with wordmark and CTA
2. Hero — split layout, phone mockup on the right showing the mini-app inside a Telegram chat
3. Social proof strip (user count, rating, platforms)
4. How it works — 3 steps connected with arrows on desktop
5. Why a Mini App — 4 cards on the core advantages
6. What's inside — 6 feature cards
7. Demo — three simpler phone screenshots (habits / stats / leaderboard)
8. Pricing — free and Pro tiers (the Pro card is highlighted)
9. Testimonials — 3 Russian bios from beta testers
10. FAQ — 8 accordion items
11. Final CTA — gradient block with the primary button
12. Footer — wordmark, nav, Telegram + VK socials, copyright

## Design notes

- **Palette**: white (`#ffffff`) background, deep slate (`#0f172a`) text, Telegram blue (`#2AABEE`) accent, and a soft blue (`#e9f5fc`) used for the eyebrow, secondary section backgrounds, and feature-card icon wells. The Pro pricing card and the final CTA are the only places where the brand blue dominates.
- **Typography pairing**: Unbounded for display text (headlines, plan names, stats) gives the page a subtle modern-geometric feel; Inter handles body copy for clean reading at all sizes.
- **Phone mockup**: pure HTML/CSS — no raster images. The frame is a rounded rectangle with a notch and home indicator; inside it we render a realistic Telegram chat header (back arrow, avatar, name, menu) on top of the mini-app UI. The hero mockup shows habit cards with conic-gradient progress rings, a streak meta line, and the "Отметить выполнение" CTA. A live JS clock updates the status bar time.
- **Animations**: IntersectionObserver fades in content blocks as they scroll into view; reduced-motion users get instant content. Hover states are subtle (1–2px lift + border highlight).
- **Russian market specifics**: social links are Telegram + VK (no Twitter/Facebook). Prices are in rubles (₽). Copy deliberately addresses ВПН concerns in the FAQ since that is a common question for Russian users about Telegram-adjacent products.
- **A11y**: semantic landmarks (`header`, `nav`, `section`, `footer`), visible focus rings, `aria-expanded` / `aria-controls` on accordion buttons, aria labels on icon-only buttons, alt/role text on the phone mockup.
- **Responsive**: fully mobile-first down to 360px. The hero stacks, the "3-step" arrows hide on mobile, the pricing grid collapses to one column, and the phone mockups scale down slightly on narrow viewports.

## CTAs

All "Открыть в Telegram" buttons link to `https://t.me/potok_bot` (placeholder — it is expected that this 404s, since this is a portfolio demo). Swap the URL in `index.html` to point the page at a real bot.

## License

Fictional product, created as a portfolio piece. Feel free to fork and adapt.
