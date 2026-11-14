# DockerSim

Learn Docker concepts two minutes at a time. Each section first walks you through an
animated scene with narration (**learn** mode), then asks one to three questions where
you predict what Docker will do (**practice** mode). Nothing runs a real Docker daemon;
the point is to build the mental model before you touch a terminal.

The UI is Traditional Chinese. Content is adapted from the author's Docker course notes
(the Diary repo's `Lesson/blackcat-class/docker/`), organised as part → chapter → section.

Sibling project: [algo-sim](https://github.com/mshmwr/algo-sim), which uses the same shell.

## Status

MVP: 3 sample sections are live, out of 52 planned across three parts:

| Part | Chapters |
|------|----------|
| 第一篇 入門 | ch1–3 |
| 第二篇 打包 | ch4–7 |
| 第六篇 守護 | ch21–24 |

Empty chapters show 「即將推出」 on the home page.

## Run

```bash
npm install
npm run dev        # local dev server
npm test           # section data + judge tests (vitest)
npm run typecheck
npm run build
npm run deploy     # test → build → force-push dist/ to the gh-pages branch
```

## Routing and progress

- `#<section-id>` opens learn mode; `#<section-id>--practice` opens practice mode.
- Progress lives only in this browser, under the localStorage key `dockersim.progress.v1`.

## Adding a section

1. Create `src/sections/<id>.ts` exporting a `Section` (types in `src/core/types.ts`).
2. Register it in `src/sections/index.ts`.
3. Keep the two-minute shape: 3–6 steps, 1–3 questions. `npm test` enforces it, and
   checks that every answer key is valid.

Scene layers: `states`, `timeline`, `terminal`, `file`, `layers`, `table`. Each line or
row can take a tone: `good`, `bad`, `focus`, `dim`.

Question types:

- `choice`: one correct option (prediction or multiple choice).
- `pick`: select exactly the correct set, then confirm.
- `order`: tap items in the right sequence. Write them in correct order; the UI shuffles them.

## Layout

```
src/
  core/        types, chapter outline, answer judging
  sections/    one .ts file per section + data tests
  components/  Home, SectionPage, LearnMode, PracticeMode, Scene
  styles/      app.css (tokens, light/dark)
```
