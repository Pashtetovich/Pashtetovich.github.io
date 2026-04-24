# Web Portfolio

Self-initiated landing pages and small apps across different industries. Built from scratch — no frameworks, no page builders, no templates.

**Live hub:** https://pashtetovich.github.io/

## Projects

| # | Project | Kind | Source |
|---|---------|------|--------|
| 01 | **FlowTask** | SaaS landing (EN) | [01-saas-landing](./01-saas-landing/) |
| 02 | **Olivea** | Restaurant landing (EN) | [02-restaurant-landing](./02-restaurant-landing/) |
| 03 | **Kindred&Co** | Creative agency landing (EN) | [03-agency-landing](./03-agency-landing/) |
| 04 | **Pulse** | Fitness app landing (EN) | [04-fitness-landing](./04-fitness-landing/) |
| 05 | **Designing for Impact** | Online course landing (EN) | [05-course-landing](./05-course-landing/) |
| 06 | **Верба** | Ресторан · Лендинг (RU) | [06-restaurant-ru](./06-restaurant-ru/) |
| 07 | **Старт в продуктовом дизайне** | Онлайн-курс · Лендинг (RU) | [07-course-ru](./07-course-ru/) |

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
