# Plan: Part 2 — 第二篇 打包 (DS-003)

Ship Part 2 (ch4–7) in one PR. 4-4 `layer-cache` already shipped in DS-001, so this PR
adds 21 new sections and Part 2 ends at 22 / 22.

Sources:

- The textbook: `Lesson/blackcat-class/docker/docker-container-guide.md` §4–§7, lines ~1030–2110
  in the Diary repo.
- K-Line practice (`k-line-practice.md`) ch1, ch3–8, for the `verify` field.
- `docs/outline.md` Part 2 slice — the section list below follows it.

## Sections

Questions use the app's three types: `choice`, `pick`, `order`. The outline's `reach-matrix`
questions become `pick` ("who can reach X") with a `table` scene.

### ch4 Dockerfile (5 new, + 4-4 shipped)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 4-1 | `dockerfile-instructions` | 指令逐行讀 | RUN runs at build time, CMD at start; RUN/COPY add file layers, ENV/EXPOSE/CMD are 0B metadata; EXPOSE opens nothing. | pick: lines that run at build time; choice: EXPOSE without `-p`; choice: ONBUILD fires in which generation |
| 4-2 | `cmd-vs-entrypoint` | CMD vs ENTRYPOINT | Args after the image replace CMD but are appended to ENTRYPOINT; prefer exec form. | choice: `ENTRYPOINT ["echo","hi"]` + `bye`; choice: `CMD ["echo","hi"]` + `bye` |
| 4-3 | `build-context-dockerignore` | build context 與 `.dockerignore` | `build .` ships the whole folder to the builder; `.dockerignore` filters it, last match wins, `.gitignore` is ignored. | pick: the line that breaks `COPY README.md`; choice: `.env` only in `.gitignore` |
| 4-5 | `multi-stage` | 多階段建置 | Build in one stage, `COPY --from` only the output into a clean final stage. | pick: layers in the final image; choice: `COPY --from=nginx:alpine` valid? |
| 4-6 | `buildx-multiplatform` | 一次建多平台 | Apple Silicon is arm64, most servers amd64; `--platform` picks, a multi-platform push is one index. | choice: arm64 image on x86; pick: the line that fails in an arm64 build |

### ch5 建置最佳化 (5)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 5-1 | `measure-then-optimize` | 先量，再依 ROI 排優先 | Measure with `images` / `history` first; do the cheap high-ROI moves first. | order: three priority tiers |
| 5-2 | `reorder-layers-ruby` | 調換層順序：80 倍 | Same instructions, reordered: a routine rebuild goes from a minute to under a second. | pick: the line that breaks the cache; choice: why it also speeds up deploys |
| 5-3 | `registry-mirror-proxy` | 縮短下載：本機 registry、mirror、proxy | Bring images and packages closer: local registry, Docker Hub mirror, package proxy. | choice: mirror and `ghcr.io`; choice: mirror vs package proxy |
| 5-4 | `ghost-files` | 層的大小不會是負的 | Deleting in a later layer hides files but keeps their bytes; install and clean in one RUN. | pick: the layer holding the space; choice: `COPY id_rsa` then `RUN rm id_rsa` |
| 5-5 | `go-scratch` | Go：500MB 到 5.6MB | Static build + `FROM scratch` leaves one file in the image. | choice: dynamic binary in scratch; choice: `exec sh` into scratch |

### ch6 Compose (6)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 6-1 | `compose-declarative` | 從一長串指令到一份檔案 | One `compose.yaml` declares the stack; `docker compose up` makes it so; one host only. | pick: the tab-indented line; choice: three hosts |
| 6-2 | `service-name-dns` | 用服務名互連，localhost 是自己 | Services on one project network resolve each other by name; `localhost` is the container itself. | pick: who can reach `redis:6379`; pick: the env line that can't reach db |
| 6-3 | `depends-on-healthcheck` | depends_on 只管順序，不管就緒 | Plain `depends_on` waits for *started*; `service_healthy` waits for the healthcheck. | choice: db needs 20s; pick: the line to change |
| 6-4 | `networks-expose-ports` | 分網路，資料庫不要對外 | Two networks split who talks to whom; `ports` opens a door on the host; `expose` controls nothing. | pick: who can reach db; choice: db without `expose` |
| 6-5 | `env-override-profiles` | .env、覆寫檔與 profiles | `${VAR}` from `.env`, `-f` layers files, `config` shows the merge, profiles are opt-in. | choice: two files both set `ports`; choice: `up` and a `debug` profile |
| 6-6 | `compose-lifecycle` | down 與 down -v、--scale | `down` keeps named volumes, `down -v` deletes them; a fixed host port can't scale. | choice: counter after `down -v`; choice: `--scale web=2` with `8000:8000` |

### ch7 Registry (5)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 7-1 | `registry-prefix` | image 名稱的前綴決定它去哪裡 | The name prefix is the address: registry host / account / repo:tag. | choice: `docker push myapp:1.0`; pick: the right name for the company registry |
| 7-2 | `push-login-layers` | login、push 與只傳缺少的層 | Log in with an access token; push skips layers the registry already has. | pick: layers uploaded after a code change; choice: public repo with secrets |
| 7-3 | `ci-gatekeeper` | CI 當守門員 | CI builds, tests, scans, then pushes; the token lives in CI secrets. | order: checkout → build → test → scan → push; pick: the insecure workflow line |
| 7-4 | `private-registry` | 自架 registry:3 | One line starts it; without a volume, images die with the container. | choice: `rm -f` without volume |
| 7-5 | `registry-tls-auth` | TLS 先，帳密後 | Auth without TLS sends the password in clear; then choose Harbor / cloud / GHCR. | pick: the missing config; choice: least-effort registry for a GitHub team |

## New scene primitive: `size-bar`

Part 2 is the first place where the *magnitude* is the lesson: 500MB → 5.6MB in 5-5, the
318MB ghost layer in 5-4, 1GB → a few MB of build context in 4-3. A `table` lists the
numbers but hides the gap.

```ts
{ kind: 'size-bar'; label?: string; items: { text: string; value: number; shown: string; tone?: Tone }[] }
```

- Bar width = `value / max(value)`, with a minimum sliver so a tiny item stays visible.
- `shown` is the printed size ("約 500 MB"), so the data stays in the textbook's units.
- `gate` and `reach-matrix` still wait: the CI pipeline in 7-3 is a `flow` with a cut
  arrow, and reach questions are `pick` over a `table`.

## Content rules (carried over)

- Every Docker fact is checked against the textbook; where it is outdated, follow current
  Docker and say so in `source`. Known cases in Part 2:
  - BuildKit output (`transferring context`, `[3/5]`, `CACHED`) instead of `Sending build
    context`, `Step 1/6`, `Using cache`.
  - "Go builds dynamic binaries by default" is only true when cgo is in play (e.g. `net`
    with `CGO_ENABLED=1`); pure-Go programs are already static.
  - `--load` of a multi-platform build works with the containerd image store.
  - Polipo (5.3) is unmaintained; only one proxy step is kept.
- `order` items must be strictly sequential: merge anything that happens at the same time.
- Diagrams must not imply paths Docker doesn't take.
- Wording stays consistent with Part 1: 主程式, 可寫層, 主機, 唯讀層, 快取.

## Work order

1. Add `size-bar` to `types.ts`, `Scene.tsx` and `app.css`.
2. Write ch4 (5), then `npm run typecheck && npm test && npm run build`.
3. Write ch5 (5), same checks.
4. Write ch6 (6), same checks.
5. Write ch7 (5), same checks.
6. Add `scripts/qa/part2.json`; run `node scripts/qa-ch.cjs scripts/qa/part2.json` against
   `vite preview` and look at the screenshots (light desktop, dark 375px).
7. Review subagent: Docker fact accuracy and question design. Fix what it finds, rerun the gate
   and QA.
8. Commit per chapter, push, open the PR, merge it (the user asked for merge this time).

## Acceptance

- Home shows ch4 6/6, ch5 5/5, ch6 6/6, ch7 5/5.
- `npm run typecheck`, `npm test` and `npm run build` pass.
- The Playwright pass over all 21 new sections: learn mode reaches the last step, every
  question is marked correct, no console errors, no horizontal overflow at 375px.
