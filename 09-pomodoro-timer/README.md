# Pomodoro Timer + Task Tracker

A calm, focus-oriented single-page Pomodoro app. Timer, task list, and daily
stats — all in one screen, all persisted to your browser's `localStorage`.

No backend, no build step, no frameworks. Just `index.html`, `styles.css`,
and `script.js`.

## Run it

Open `index.html` in a modern browser. That's it.

For best results (so the browser honors `Notification`, `localStorage` origin,
etc.), serve it locally:

```bash
# Python 3
python3 -m http.server 8000

# Node (any static server)
npx serve .
```

Then open `http://localhost:8000`.

## Features

### Timer
- Three modes: **Focus** (default 25 min), **Short Break** (5 min), **Long Break** (15 min)
- Large tabular-numeric countdown with a smooth SVG progress ring
- Play / Pause / Reset / Skip controls
- Keyboard: `Space` toggles play/pause, `R` resets, `Esc` closes settings
- **Auto-advance** — focus finishes → short break; every 4 focus sessions → long break
- **Accurate when backgrounded** — countdown is derived from `Date.now()` and a stored end timestamp, not an interval, so it stays correct when the tab is throttled
- **Programmatic chime** on session end via the Web Audio API (no audio file dependency)
- **Browser notifications** when permission is granted (off by default)
- **Document title** reflects the remaining time: `⏱ 14:32 · Focus`
- **Favicon** changes color to match the active mode

### Tasks
- Add, complete, delete, and clear completed tasks
- Click a task to mark it as the current focus ("Now working on: ...")
- Completed pomodoros increment the active task's tomato counter
- Stored in `localStorage` between sessions

### Today's stats
- Total focus minutes, completed pomodoros, and tasks completed
- Automatically resets at midnight (new date key)

### Settings (gear icon)
- Custom durations (focus 1–60, short break 1–30, long break 1–60)
- Toggle auto-advance
- Toggle sound chime
- Toggle browser notifications (requests permission on enable)
- Toggle dark mode (follows system preference until toggled)
- Reset all data (with confirmation)

### Design
- Palette shifts per mode — rose/slate (focus), teal (short break), amber (long break)
- Full dark mode using slate-900/950 tones — not a simple invert
- Google Fonts `Inter` (with Cyrillic subset loaded, so Russian users render correctly)
- Fully responsive: two-column on desktop, stacked on mobile
- Respects `prefers-reduced-motion`

## Storage keys

All data is kept in `localStorage` under these keys:

| Key | Contents |
| --- | --- |
| `pomodoro.settings.v1` | Settings object (durations, toggles, dark mode) |
| `pomodoro.tasks.v1` | Array of task objects `{id, title, pomos, completed, active}` |
| `pomodoro.stats.v1` | Today's stats `{date, minutes, pomodoros, tasksCompleted}` — resets on date change |
| `pomodoro.session.v1` | Active timer session, so a page reload mid-session picks up where it left off |

Clear them via **Settings → Reset all data**, or your browser devtools.

## Architecture notes

- **Single state object** (`state`) holds all in-memory data
- **`render()`** is the single top-level DOM update path; individual pieces
  (`updateTimeDisplay`, `updateRing`, `renderTasks`, etc.) are called from it
  or directly from the high-frequency tick loop
- **Event handlers** mutate state, persist the relevant slice, and call
  `render()` (or a targeted subset)
- **Timer loop**: `requestAnimationFrame` drives smooth ring updates, while
  a 1-second `setInterval` provides a backgrounded-tab fallback. Both compute
  remaining time from the stored `endTimestamp`, so neither drifts
- **localStorage writes** are minimal and scoped — one key per concern

## Tech

- HTML5 + semantic markup, ARIA live on the timer
- Vanilla JavaScript (ES2020+), no dependencies
- [Tailwind CSS](https://tailwindcss.com/) via CDN for utilities
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) (Cyrillic + Latin)
- Inline SVG icons; programmatic Web Audio API chime

## Browser support

Any modern evergreen browser (Chrome, Edge, Firefox, Safari 14+).

## License

MIT — use it, fork it, ship it.
