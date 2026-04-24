# Landing Page Portfolio

Five self-initiated landing pages across different industries. Built from scratch — no frameworks, no page builders, no templates.

## Projects

| # | Project | Industry | Live | Source |
|---|---------|----------|------|--------|
| 01 | **FlowTask** | SaaS / Team productivity | `./01-saas-landing/` | [01-saas-landing](./01-saas-landing/) |
| 02 | **Olivea** | Restaurant / Hospitality | `./02-restaurant-landing/` | [02-restaurant-landing](./02-restaurant-landing/) |
| 03 | **Kindred&Co** | Creative agency | `./03-agency-landing/` | [03-agency-landing](./03-agency-landing/) |
| 04 | **Pulse** | Fitness mobile app | `./04-fitness-landing/` | [04-fitness-landing](./04-fitness-landing/) |
| 05 | **Designing for Impact** | Online course | `./05-course-landing/` | [05-course-landing](./05-course-landing/) |

## Stack

Each landing uses the same minimalist stack:

- **HTML5** — semantic, accessible markup
- **Tailwind CSS** — via CDN, no build step
- **Vanilla JavaScript** — no frameworks, no dependencies

Every project is a fully static site that runs from `file://` or any static server.

## Preview locally

```bash
# From the repo root
python3 -m http.server 8000
# then visit http://localhost:8000
```

Or open `index.html` directly in a browser.

## Deploy

Each sub-folder is self-contained and ready for GitHub Pages as an individual repository, or all together from this repo.
