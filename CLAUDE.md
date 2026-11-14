# CLAUDE.md — docker-sim

Concept-learning web app for Docker (React 19 + Vite + TypeScript, no backend). Global
rules live in `~/.claude/CLAUDE.md`; this file only adds project specifics.

## Content source of record

- Sections are adapted from the Diary repo:
  `Lesson/blackcat-class/docker/docker-container-guide.md` (the textbook) and
  `Lesson/blackcat-class/docker/k-line-practice.md` (hands-on companion).
- Each section's `source` field cites the textbook § it comes from. Anything added beyond
  the textbook must say so in `source` (e.g. "教材外補充").
- `verify` (optional) points the learner to a K-Line practice step where they can confirm
  the concept in a real terminal.

## Section rules

- One file per section in `src/sections/`, registered in `src/sections/index.ts`.
- Two-minute shape: 3–6 steps, 1–3 questions. `src/sections/sections.test.ts` enforces it.
- UI text is Traditional Chinese (Taiwan terminology). No i18n.
- Docker facts must be correct; when unsure, check the official docs before writing.
- `order` questions: each adjacent pair must be strictly "A finishes before B starts".
  Merge events that happen at the same time (e.g. cleanup *during* the stop grace period)
  into one item, or a learner who understands it correctly gets marked wrong.
- Scene diagrams must not imply a path Docker doesn't take (e.g. `paused` is a side state
  off `running`, not a step on the way to `exited`).
- Add a new scene primitive only when a section needs it. Planned primitives:
  `boxes`, `network`, `gate`, `size-bar`, `reach-matrix`.

## Workflow

- Branch slug: `DS-NNN-<title-kebab>`. One PR per part (篇) when adding sections.
- Commit gate: `npm run typecheck && npm test && npm run build`. For UI changes, also check
  the page in a browser (light, dark, and phone width).
- Deploy: `npm run deploy` publishes to the `gh-pages` branch (GitHub Pages).
