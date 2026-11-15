# Plan: Part 1 — 第一篇 入門 (DS-002)

Ship the remaining 14 sections of Part 1 (ch1–3) in one PR. 3-4 `lifecycle-stop-kill`
already shipped in DS-001, so Part 1 ends at 15 / 15.

Sources:

- The textbook: `Lesson/blackcat-class/docker/docker-container-guide.md` §1–§3, lines ~52–965 in the
  Diary repo.
- K-Line practice (`k-line-practice.md`) ch1–2, for the `verify` field.

## Sections

The "Questions" column uses the app's three question types: `choice`, `pick` and `order`.

### ch1 為什麼是容器 (6)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 1-1 | `why-containers` | 「我電腦上明明可以跑」 | A container packs the program *and* its whole environment, so it runs the same everywhere. | choice: which case least needs containers |
| 1-2 | `image-container-registry` | 三個名詞與一條鏈 | image = read-only template, container = running instance, registry = where images live. | order: pull → run → commit → push; choice: run one image 3× → 3 containers |
| 1-3 | `image-layers-cow` | 分層與寫時複製 | An image is a stack of read-only layers; a container adds one writable layer that dies with `rm`. | pick: which layer a modified base file is written to; choice: file survives `rm` + new `run`? |
| 1-4 | `vm-vs-container` | VM 與容器：共用核心 | VMs each carry a kernel; containers share the host's. Lighter and faster, but a thinner wall. | choice: `uname -r` inside a container; choice: 512MB limit → cgroups |
| 1-5 | `docker-architecture` | 一行指令經過誰 | The CLI is a remote; dockerd → containerd → runc → kernel do the work. | order: the component chain; choice: daemon down → which half of `docker version` fails |
| 1-6 | `first-container` | 第一個容器與 `-p` | `run` pulls if missing; only `-p host:container` lets the host reach it. | choice: nginx without `-p`; choice: which number in `-p 8080:80` is the container port |

### ch2 安裝與權限 (3)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 2-1 | `desktop-vs-engine` | Docker Desktop 其實是一台 VM | On Mac/Windows, containers run inside a hidden Linux VM whose resources are the ceiling. | choice: `uname -m` on Apple Silicon; choice: `-m 8g` with a 4GB VM |
| 2-2 | `install-docker-ce` | 裝對來源：docker-ce | Install the official five packages, not the distro `docker.io`, and upgrade them together. | choice: CLI upgraded, engine not → version mismatch |
| 2-3 | `docker-group-root` | docker 群組 ≈ root | Joining the `docker` group skips sudo but is effectively root; it needs a re-login to apply. | order: usermod → re-login → `docker ps`; choice: why not add coworkers freely |

### ch3 操作容器 (5 new, + 3-4 shipped)

| # | id | Title | Core idea | Questions |
|---|----|-------|-----------|-----------|
| 3-1 | `run-flags` | `docker run` 常用旗標 | `-d` `-it` `-p` `--name` `--rm` `--restart` `-m`/`--cpus`. | choice: same `--name` twice; pick: the flag that auto-removes |
| 3-2 | `observe-containers` | 看容器在做什麼 | `ps -a`, `logs -f`, `stats`, `inspect -f`, `port`. | choice: container exits at once, does `ps` show it; choice: first command when it won't start |
| 3-3 | `exec-not-ssh` | 進容器用 exec，不用 SSH | `exec` adds a process beside PID 1; `attach` hooks into PID 1 itself. | choice: `exit` from an exec shell; choice: how to read nginx config |
| 3-5 | `tags-and-digest` | tag 會變，digest 不會 | No tag means `latest`, which is not "newest"; pin a version or a digest. | choice: two pulls of `latest` a month apart; pick: the compose line unfit for production |
| 3-6 | `commit-export-prune` | 把容器帶走與清理 | `commit` works but is opaque; `save` keeps layers, `export` flattens; prune reclaims space. | choice: `C /etc` in `docker diff`; choice: layers after export + import |

## New scene primitive: `flow`

The outline's `boxes` and `network` diagrams in Part 1 are all one shape: a row of nodes
joined by arrows. Some arrows carry a label (`pull`, `REST API`, `8080 → 80`), and some
are cut (✗).

```ts
{ kind: 'flow'; label?: string; nodes: { text: string; sub?: string; tone?: Tone }[];
  links?: { text?: string; tone?: Tone }[] }   // links[i] joins nodes[i] → nodes[i+1]
```

- It wraps onto new lines on a phone, so the order stays readable.
- Two diagrams need a side-by-side comparison: 1-4 VM vs container, and 2-1 Mac vs Linux.
  Each uses two stacked `layers` layers with labels. No grid primitive is needed.
- `gate`, `size-bar` and `reach-matrix` wait for Parts 2 and 6, where they are needed.

## Content rules (from DS-001 review)

- Every Docker fact must be checked against the textbook. Where the textbook is outdated,
  follow current Docker and say so in `source`. Known cases:
  - `--rm` works with `-d` (since 1.13).
  - BuildKit output differs from the textbook.
- `order` items must be strictly sequential: merge anything that happens at the same time.
- Diagrams must not imply paths Docker doesn't take.
- Wording is consistent across sections. Each term has one fixed translation, e.g. 主程式, 可寫層, 主機.

## Work order

1. Add `flow` to `types.ts`, `Scene.tsx` and `app.css`. Check it in a browser: light,
   dark, and 375px.
2. Write ch1 (6 sections), then run `npm test` and walk through every section in a browser.
3. Write ch2 (3), then the same checks.
4. Write ch3 (5), then the same checks.
5. Self-review subagent covering content accuracy and Simplicity First, then fix what it finds.
6. Commit, push, open the PR, and stop for the user. Deploy only after the merge, and only
   when the user asks.

## Acceptance

- Home shows ch1 6/6, ch2 3/3, ch3 6/6.
- `npm run typecheck`, `npm test` and `npm run build` pass.
- A Playwright pass over all 15 Part 1 sections:
  - learn mode reaches the last step;
  - every question can be solved;
  - there are no console errors;
  - there is no horizontal overflow at 375px.
