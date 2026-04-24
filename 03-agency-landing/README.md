# Kindred&Co — Creative Studio Landing Page

A single-page marketing site for a fictional independent creative studio. Built as a freelance portfolio piece to demonstrate editorial layout, typographic hierarchy, tasteful motion, and clean front-end code — without any build tooling.

## Preview

No build step. Serve the folder with any static server:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000.

## Stack

- **HTML5** — semantic sectioning, accessible landmarks, descriptive alt text
- **Tailwind CSS** via CDN (`<script src="https://cdn.tailwindcss.com"></script>`) — utility classes for layout + spacing
- **Custom CSS** in `styles.css` for the pieces Tailwind can't do elegantly (marquee keyframes, cursor, case-study hover reveals, pull-quote, reduced-motion overrides)
- **Vanilla JavaScript** — no frameworks, no dependencies
- **Google Fonts** — Fraunces (display serif), Space Grotesk (label / UI), Inter (body)
- **Unsplash** direct image URLs for all photography (case studies + team portraits)
- **Inline SVG** for the single icon (scroll arrow)

## What's inside

```
03-agency-landing/
├── index.html     # markup + Tailwind config + section structure
├── styles.css     # component CSS (marquee, cursor, hover states, motion)
├── script.js      # reveal observer, smooth scroll, cursor, live clock
└── README.md
```

### Sections

1. Fixed top bar with logo, nav, and CTA
2. Hero with oversized editorial headline + word-mask reveal
3. Services marquee (infinite CSS scroll, pauses on hover)
4. Selected work — 6 case studies in an asymmetric 12-column grid with accent-color reveal overlay
5. Manifesto with oversized pull-quote mark
6. Four-step process grid
7. Team (four members, grayscale → color on hover)
8. Clients marquee (slower)
9. Contact CTA with huge closing headline
10. Minimal footer with live New York clock (`Intl.DateTimeFormat`)

## Design notes

- **Palette**: near-black `#0a0a0a` (ink), off-white `#f5f5f0` (bone), electric lime `#d4ff3d` accent — used sparingly on CTAs, overlays, and a single pull-quote mark.
- **Type**: Fraunces handles all display work with heavy optical sizing (the italic variant is used for stressed words). Space Grotesk is reserved for labels, nav, and metadata. Inter handles body copy.
- **Scale**: Headlines push to `text-[9-10vw]` on desktop, collapsing gracefully via viewport units on mobile.
- **Motion**: Entry motion on every major block via `IntersectionObserver`. Marquees animate via pure CSS transform. A custom cursor replaces the default pointer on fine-pointer devices and scales up over case studies for emphasis.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables all animations, pauses marquees, hides the custom cursor, and restores the system pointer.

## Accessibility

- Semantic `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<ol>`, `<figure>`
- Alt text on every image describes the (fictional) subject
- `:focus-visible` outlines preserved on all interactive elements
- Color contrast: ink-on-bone and bone-on-ink both clear AAA thresholds
- Custom cursor does not replace native keyboard focus indicators
- Reduced-motion media query respected throughout

## Known trade-offs

- Tailwind is loaded via CDN JIT for simplicity — in a production build I'd compile it to a static stylesheet and purge unused utilities.
- Case study links are stubs (`href="#"`) — they'd route to detail pages in a full build.
- Unsplash images are hot-linked; a production site would host optimized versions.

---

Built by me as part of a freelance portfolio. Copy is fictional.
