# Currency Converter

A clean, fast, single-page currency converter. Fetches live exchange rates for
27 currencies and converts between any pair on the client side.

Built as part of a freelance portfolio to complement static landing pages with
a working example of vanilla JS + REST API integration.

![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-0ea5e9)
![No build](https://img.shields.io/badge/build-none-10b981)

## Features

- **Live rates** from [open.er-api.com](https://www.exchangerate-api.com/docs/free) (free, no API key).
- **27 currencies** — USD, EUR, GBP, JPY, CNY, RUB, CHF, CAD, AUD, NZD, SGD,
  HKD, KRW, INR, BRL, MXN, TRY, SEK, NOK, PLN, CZK, HUF, ZAR, AED, ILS, KZT, UAH.
- **Searchable dropdowns** — filter by code or name.
- **Live conversion** — debounced 150 ms as you type, with tabular-nums typography.
- **Swap button** — circular toggle between the two selectors, with a 180° rotate animation.
- **Conversion history** — last 5 conversions, persisted in `localStorage`.
  Click an entry to restore it.
- **Dark mode** — respects system preference on first load, toggled via icon
  button, persisted across reloads. No FOUC on hard refresh.
- **Rate info line** — "1 USD = 93.50 RUB" below the result.
- **Offline-friendly** — falls back to the last cached rates if the network
  request fails, with a visible note.
- **Accessible** — keyboard navigable, `aria-live` result region, visible focus
  rings, respects `prefers-reduced-motion`.
- **Responsive** — mobile-first, tested from 360 px up.

## Stack

- Plain **HTML5 + CSS3 + vanilla JavaScript** (no framework, no bundler).
- **Tailwind CSS** via CDN for utilities + dark-mode variants.
- **Google Fonts — Inter** (Latin + Cyrillic subsets).
- **Inline SVGs** for all icons (no icon fonts, no external requests).

## How to run

No build step, no `npm install`. Just serve the folder.

```bash
# From the project root:
python3 -m http.server 8000
# Then open http://localhost:8000
```

Any static server works equally well (`npx serve`, `php -S`, VSCode Live Server,
GitHub Pages, Netlify drop, etc.).

## API

Endpoint: `https://open.er-api.com/v6/latest/USD`

Sample response:

```json
{
  "result": "success",
  "base_code": "USD",
  "rates": { "USD": 1, "EUR": 0.9123, "RUB": 93.50, ... }
}
```

All rates are USD-based. To convert `amount` from currency `A` to currency `B`,
we use a simple cross-division on the client:

```
amount_in_B = (amount / rates[A]) * rates[B]
```

## Caching strategy

Rates are fetched once on page load and stored in `localStorage` under
`cc.rates.v1` with a timestamp.

- **Fresh cache (< 10 min)**: used directly, no network request.
- **Stale cache**: a background refresh is attempted; if the request fails,
  the stale cache is still shown with a "Showing cached rates" note.
- **Manual refresh**: the Refresh button (and the Retry button in the error
  banner) force a fresh fetch, bypassing the cache.

A small "Rates updated Xm ago" line keeps the user informed; it self-updates
every 30 s.

## File layout

```
.
├── index.html     # Markup + Tailwind CDN setup + anti-FOUC theme script
├── styles.css     # Animations, emoji-font fallback, scrollbar styling
├── script.js      # All app logic (state, API, render, events)
└── README.md
```

## Code organization

`script.js` is structured in numbered sections:

1. Currency catalog
2. Constants (API URL, cache TTL, storage keys)
3. State
4. `storage` — `localStorage` helpers
5. `fetchRates` — API + cache layer
6. `convert` / `crossRate` — pure math
7. Formatting helpers (`formatMoney`, `parseAmount`, `timeAgo`, `escapeHtml`)
8. DOM refs (single `el` object)
9. `render*` — one function per UI region, all read state and write DOM
10. Dropdown (open/close/filter/select)
11. History (push, restore, clear) with debounce
12. Theme
13. Event wiring (`wire*` per concern)
14. `init`

State and DOM are cleanly separated — render functions never read from inputs,
and event handlers never mutate the DOM directly outside `render*` helpers.
User-supplied content is rendered with `textContent` (never `innerHTML`) and
escaped through a small helper where interpolation is unavoidable.

## Browser support

Tested in current Chrome, Firefox, Safari, and Edge. Uses only widely-supported
ES2019+ features (async/await, optional chaining, `Intl.NumberFormat`).

## License

MIT — feel free to use this as a template.
