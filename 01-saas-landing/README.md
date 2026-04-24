# FlowTask — SaaS Landing Page

A modern, responsive landing page for a fictional SaaS product (team task management).

## Preview

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What's inside

- **Semantic HTML5** — clean structure, accessible markup
- **Tailwind CSS** (via CDN) — utility-first styling with a custom brand palette
- **Vanilla JavaScript** — no framework dependencies
  - `IntersectionObserver`-based scroll reveal animations
  - Accordion FAQ (auto-closes siblings)
  - Smooth anchor scrolling with fixed-header offset
- **Fully responsive** — mobile-first design, works from 320px up

## Sections

1. Sticky translucent nav
2. Hero with gradient headline and product mockup (Kanban board)
3. Logo strip
4. Feature grid (6 cards with icons)
5. Testimonials
6. 3-tier pricing
7. FAQ accordion
8. CTA banner
9. Footer with socials

## Tech

- HTML / CSS / JS only — no build step
- Inter font via Google Fonts
- Inline SVG icons (no external icon library)
