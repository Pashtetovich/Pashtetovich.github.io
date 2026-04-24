# Olivea — Mediterranean Restaurant Landing Page

A single-page, fully responsive landing for a fictional upscale Mediterranean
restaurant. Part of a freelance portfolio — built to demonstrate visual
polish, semantic markup, and small-but-thoughtful interaction details without
a build step or framework overhead.

## Preview

No install required. From this directory:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

It also runs directly from the filesystem — just double-click `index.html`.

## What's inside

```
02-restaurant-landing/
├── index.html   # Semantic markup and all section content
├── styles.css   # Custom styles layered on top of Tailwind
├── script.js    # Vanilla JS: reveal-on-scroll, smooth anchors, form
└── README.md    # This file
```

## Tech stack

- **HTML5** — semantic `<header>`, `<main>`, `<section>`, `<footer>`,
  proper heading hierarchy, labelled form fields, alt text on every image
- **Tailwind CSS via CDN** — no bundler, no build; utility-first with a
  small custom theme (`forest`, `cream`, `terracotta`, serif font family)
- **Vanilla JavaScript** — no frameworks, no dependencies
- **Google Fonts** — Cormorant Garamond (serif, headings), Inter (body),
  Dancing Script (chef's signature accent)
- **Unsplash** direct image URLs for photography
- **Inline SVG** for every icon (no icon library)

## Sections

1. Fixed translucent header with nav + "Book a Table" CTA
2. Full-viewport hero with overlay, headline, dual CTAs, scroll indicator
3. About / story — interior image, chef bio, stat row (est. / Michelin / seats)
4. Signature dishes — 6-card grid with hover zoom and lift
5. Menu highlights — 2-column list (Starters / Mains) with dotted leaders
6. Gallery — asymmetric 5-image grid with hover zoom
7. Reservations — contact info + validated booking form with success state
8. Footer — logo, social, address, hours, copyright

## Interactions

- `IntersectionObserver`-powered reveal-on-scroll (`.reveal` → `.is-visible`)
- Smooth anchor scrolling that respects the fixed header height
- Header gains a translucent forest-green background once the page is scrolled
- Client-side form validation: required fields, email regex, no past dates.
  On valid submit → success card shown → form resets after 4s
- Mobile hamburger menu with animated disclosure

## Design notes

- **Palette**: deep forest green `#1f3a2e` / cream `#f5f1e8` / terracotta
  accent `#c0652d`. Restrained, editorial, warm.
- **Type**: big confident Cormorant Garamond italics for headings, Inter for
  body, Dancing Script used sparingly as a chef-signature accent.
- **Spacing**: 24–32 `rem` section padding on desktop to let imagery breathe.
- **Motion**: every transform/opacity transition uses the same easing
  (`cubic-bezier(0.22, 1, 0.36, 1)`) for a consistent feel.
- **Accessibility**: focus-visible outlines on all interactive elements,
  `prefers-reduced-motion` respected, `aria-invalid` / `aria-live` on the
  reservation form, labelled fields, decorative-only SVGs.

## Browser support

Modern evergreens (Chrome, Safari, Firefox, Edge). Uses `IntersectionObserver`,
`aspect-ratio`, CSS grid, and backdrop-filter — all widely supported.
