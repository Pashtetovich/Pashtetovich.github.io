# PULSE — Fitness App Landing Page

A production-quality landing page for a fictional fitness/workout mobile app called **Pulse**. Built as a freelance portfolio piece to demonstrate modern, athletic, dark-themed UI work with clean semantic markup and polished micro-interactions.

![stack](https://img.shields.io/badge/HTML5-orange) ![stack](https://img.shields.io/badge/TailwindCSS_CDN-38bdf8) ![stack](https://img.shields.io/badge/Vanilla_JS-yellow) ![stack](https://img.shields.io/badge/No_build-000)

---

## Preview

No build step. Open `index.html` directly, or run a local static server for best results (some browsers block certain features on `file://`):

```bash
# from this folder
python3 -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

---

## What's inside

| File          | Purpose                                                             |
| ------------- | ------------------------------------------------------------------- |
| `index.html`  | All markup. Sections, semantic HTML, inline SVG icons, Tailwind CDN |
| `styles.css`  | Custom layered styles, phone mockup, reveal animations, accents     |
| `script.js`   | Vanilla JS — reveal, count-up, parallax, smooth scroll, mobile menu |
| `README.md`   | This file                                                            |

Total: **4 files**. No dependencies to install, no build pipeline.

---

## Sections

1. **Sticky dark nav** — wordmark + primary nav + dual app store CTAs, mobile menu
2. **Hero** — giant Anton display headline, app badges, trust row, CSS-built iPhone mockup with animated progress rings, floating streak/HR badges, radial glow + subtle grid + noise texture
3. **Stats strip** — four big accent numbers with count-up animation
4. **Features** — six-card grid with icon chips and hover spotlight follow effect
5. **Workout programs** — three image cards (Unsplash fitness photography) with dark gradient overlays
6. **Transformations & press** — three testimonials with result callouts + "As seen in" press row
7. **Pricing** — Free vs. Pro tiers, Pro highlighted with accent glow and gradient border
8. **Download CTA** — full-width section with giant "READY?" headline and dual store badges
9. **Footer** — brand, nav columns, socials, system status

---

## JavaScript behaviors

- **`IntersectionObserver` reveal** — fade/translate on enter with slight stagger
- **Count-up stats** — eased (cubic) animation from 0 to target when the strip scrolls into view
- **Scroll-triggered parallax** on the hero phone mockup (up to 36 px, throttled via rAF)
- **Smooth anchor scrolling** with offset for the fixed nav
- **Sticky nav styling** — blurred/darkened background after a small scroll threshold
- **Mobile menu** toggle with `aria-expanded` state
- **Feature card spotlight** — pointer-follow radial highlight via CSS custom props
- **`prefers-reduced-motion` respected** throughout — disables parallax, reveal transitions, easing on count-up, and smooth scrolling

---

## Design notes

- **Palette** — pitch black `#0a0a0a`, coal `#151515`, neutral ash `#a1a1a1`, single accent: radioactive lime `#c7ff00`. Accent is used sparingly on numbers, CTAs, iconography, and selective highlight words. It reads athletic rather than candy.
- **Typography** — Anton for heroic all-caps display copy; Inter (300–900) for body and UI. Tight tracking on large display sizes, generous tracking on eyebrows/labels for an editorial feel.
- **Phone mockup** — fully CSS/SVG built: rounded frame with gradient bezel, notch with camera dot, side buttons, a status bar, an app header, a three-ring progress chart (animated via `stroke-dasharray`), stat row ("27 MIN · 4.2 MI · 412 KCAL"), a "Next up" card and a tab bar. Floating cards beside it show a 47-day streak and live BPM sparkline.
- **Photography** — Unsplash direct URLs (`?w=1200&q=80`) so the page is self-contained with no downloaded assets. IDs chosen for real gym/running/mobility vibes.
- **Accessibility** — semantic landmarks (`header`, `main`, `section`, `footer`), alt text for decorative vs. meaningful images, visible keyboard focus ring in accent, contrast tested on dark (lime-on-black is WCAG AAA for large text), `aria-hidden` on decorative SVGs, `aria-expanded` on menu toggle.
- **Responsiveness** — mobile first. The hero collapses to a single column with the phone below the copy on tablets and phones; stats strip becomes 2×2; programs go single column; floating badges reposition to stay on-screen.

---

## Credits

- Typography — [Google Fonts](https://fonts.google.com) (Anton, Inter)
- Utility styling — [Tailwind CSS](https://tailwindcss.com) via CDN
- Photography — [Unsplash](https://unsplash.com) (hotlinked)
- Icons — hand-rolled inline SVG (no icon library)

All product names, testimonials, and press logos are fictional.

---

## License

MIT — use freely as a reference or starter for your own work.
