# Designing for Impact — Course Landing Page

A production-ready, conversion-focused landing page for a fictional 6-week cohort course for product designers. Built as a freelance portfolio piece to demonstrate care with both visual polish and front-end code quality.

## What this is

A single-page marketing site featuring:

- Announcement bar with a live countdown to cohort enrollment close
- Sticky nav with wordmark and CTA
- Editorial hero with social-proof strip
- "What you'll learn" — six outcomes in a responsive grid
- Curriculum — 6 expandable week modules (custom accordion, one-open-at-a-time)
- Instructor bio with photo and credentials
- Three long-form testimonials plus a results stat strip
- Pricing card with original/discounted price, feature list, Pay-in-3, and a money-back guarantee
- FAQ — 8 questions as a native `<details>` accordion with sibling auto-close
- Final CTA with a second countdown display
- Minimal footer

## How to preview

No build step. Any static server will work:

```bash
# From this directory
python3 -m http.server 8000
# then open http://localhost:8000
```

Or simply open `index.html` directly in a browser.

## What's inside

```
05-course-landing/
├── index.html   # All markup + Tailwind theme config inline
├── styles.css   # Focus states, reveal animation, accordion behavior
├── script.js    # Countdown, accordions, IntersectionObserver reveals, smooth scroll
└── README.md
```

## Stack

- Plain HTML5, CSS, vanilla JS — no framework, no build tooling
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`) with an inline theme extension for the custom palette and fonts
- **Google Fonts**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (serif headings) + [Inter](https://fonts.google.com/specimen/Inter) (body)
- Inline SVG for all icons
- Unsplash direct URLs for photography (`images.unsplash.com`)

## Design notes

**Palette.** Warm cream background (`#fef9f3`) with a deep plum primary (`#4a1d3d`) and a soft peach accent (`#f4a261`). The tone aims for "premium cohort course" rather than infomarketing — editorial, confident, a little warm.

**Typography.** Fraunces for headlines leans into the editorial feel; its optical-size axis is tuned for display use at large sizes. Inter handles UI and body copy.

**Conversion cues without being shouty.**
- Two countdown surfaces (top bar and final CTA) create mild urgency
- Pricing uses strikethrough + visible savings, money-back guarantee, and a Pay-in-3 option
- Social proof is specific (company names, stats) rather than generic
- The instructor section emphasizes credentials in an "about you, not us" tone

**Accessibility.**
- Semantic HTML5 landmarks (`header`, `nav`, `main` via sections, `footer`)
- Every decorative SVG is marked `aria-hidden="true"`; every image has meaningful or empty `alt`
- Custom accordions set `aria-expanded` and auto-close siblings
- FAQ uses native `<details>` for keyboard-free behavior
- Visible focus states in brand colors
- `prefers-reduced-motion` disables reveal animations and smooth scroll

**Responsive.** Mobile-first throughout. Grid collapses at `sm`/`md` breakpoints, countdown tile sizes scale down, instructor layout stacks below `md`.

**Performance.**
- All images lazy-loaded
- Single external stylesheet (Google Fonts) + Tailwind CDN + 1 local CSS + 1 local JS
- IntersectionObserver unobserves elements after reveal
- Countdown runs once per second with minimal DOM touches
