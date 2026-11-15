# docker-sim section outline (MVP: Part 1 ch1–3, Part 2 ch4–7, Part 6 ch21–24)

> Section titles and quoted UI strings stay in Traditional Chinese because they are app text.

> Sources: `Lesson/blackcat-class/docker/docker-container-guide.md` ("the textbook") and
> `Lesson/blackcat-class/docker/k-line-practice.md` ("K-Line"). Both live in the Diary repo
> (`/Users/yclee/Diary`). Line numbers (`L…`) refer to the 2026-11-15 version.
>
> Two-minute shape per section: 3–6 walkthrough steps (one step = one scene + 1–3 sentences of
> narration) and 1–3 practice questions.
>
> Markers:
>
> - **(beyond the textbook)** — general knowledge the textbook does not cover.
> - **(textbook may be outdated: …)** — textbook content that no longer matches current Docker.
> - K-Line references are tagged **✅** = the step was actually run in K-Line, or **🔎** = derived,
>   not actually run (use 🔎 only as a supplement when there is no ✅ step).

> **Vocabulary note.** This outline was written before the app was built, so some scene and
> question names differ from `src/core/types.ts`. Map them when writing a section:
>
> | Outline name | What the app has |
> |---|---|
> | `boxes` | `flow` (nodes + labeled arrows), or `table` for side-by-side comparisons |
> | `network` | `flow` for now; add a `network` primitive only if a section truly needs it |
> | `states`, `timeline`, `terminal`, `file`, `layers`, `table` | same name, already built |
> | `predict`, `mcq` | `choice` |
> | `spot-line`, `layers-pick` | `pick` |
> | `order` | `order` |
> | `reach-matrix` | not built; use `table` + `choice`, or add the primitive (see CLAUDE.md) |

## Overview

| Part | Chapter | Sections |
|---|---|---|
| 第一篇 入門 (Part 1, Getting started) | ch1 為什麼是容器 | 6 |
| | ch2 安裝與權限 | 3 |
| | ch3 操作容器 | 6 |
| 第二篇 打包 (Part 2, Packaging) | ch4 Dockerfile | 6 |
| | ch5 建置最佳化 | 5 |
| | ch6 Compose | 6 |
| | ch7 Registry | 5 |
| 第六篇 守護 (Part 6, Defense) | ch21 主機與 daemon | 5 |
| | ch22 image 與供應鏈 | 4 |
| | ch23 核心強化與合規 | 3 |
| | ch24 偵測與持續關注 | 3 |
| **Total** | 11 chapters | **52 sections** |

### Scene primitive usage (count of appearances in walkthrough steps)

| primitive | count | Main use |
|---|---|---|
| `boxes` | 72 | Arrows between host / daemon / container / registry. The most used — and many of these are forcing state machines and gates into boxes (see "Wished-for primitives" below). |
| `terminal` | 54 | Command + output |
| `table` | 28 | Comparisons (VM vs container, save vs export, MAC vs traditional permissions, …) |
| `file` | 26 | Dockerfile, compose.yaml, .dockerignore, daemon.json |
| `layers` | 14 | Layering, cache hit / rebuild, ghost-file leaks |
| `network` | 9 | Compose DNS, frontend/backend networks, exposed 2375 |

Practice question type counts: `predict` 43, `spot-line` 18, `mcq` 17, `order` 10,
`layers-pick` 7, `reach-matrix` 4. There are a lot of `mcq` because ch21–24 have many purely
conceptual questions; when implementing, prefer turning those into `predict` or `order`.

### Wished-for primitives

1. **`states` (state machine)**: created / running / paused / exited / removed, with commands on
   the edges (start/stop/kill/pause/rm). Needed for the ch3 lifecycle and for healthcheck
   starting → healthy → unhealthy; today it can only be forced out of `boxes`.
2. **`timeline`**: `docker stop`'s SIGTERM → 10-second grace → SIGKILL, healthcheck
   start_period/interval/retries, and Cosign keyless short-lived certificate expiry all need a
   time scale.
3. **`gate` (flow gate)**: a pipeline with a decision point in the middle that splits two ways
   (CI scout blocks high-severity, admission controller verifies signatures, seccomp allow/deny,
   Falco alert/allow). Almost every diagram in textbook ch22–24 has this shape.
4. **`size-bar`**: image size comparisons (Go 500MB → 5.6MB, full/slim/alpine, K-Line pip layer
   437MB). A `table` can list the numbers but does not show the difference in magnitude.

---

## Part 1 (ch1–ch3) — shipped

Done: 15 / 15 sections (DS-001 + DS-002). The reference for this part is the shipped section
files in `src/sections/` plus `plan.md`; this outline no longer tracks them.

---

# 第二篇 打包 (Part 2, Packaging)

## ch4 Dockerfile

> Cuts / merges: MAINTAINER is mentioned once in 4-1 (use LABEL instead); ONBUILD keeps only one
> `mcq`; 4.9 workflow is merged into 4-1; the 4.10 Flask hands-on is split into 4-4 and 4-5.

### 4-1 `dockerfile-instructions` 指令逐行讀
- Core: one instruction roughly maps to one layer; FROM sets the foundation, RUN executes at
  build time, CMD only executes when the container starts.
- Walkthrough:
  - `file`: a Flask Dockerfile, highlighting FROM / WORKDIR / COPY / RUN / ENV / EXPOSE / USER /
    CMD line by line.
  - `layers`: each RUN / COPY line grows a layer; ENV / EXPOSE / CMD only change metadata, layer
    size 0B.
  - `boxes`: EXPOSE is only a "declaration"; actually opening the port needs `-p`.
  - `file`: `ADD` auto-extracts local tar files and can fetch URLs; for plain copying always use
    `COPY`.
  - `terminal`: `docker history` lists which line produced each layer.
- Practice:
  - `spot-line`: which line runs at build time and which at run time? → Answer: `RUN pip install`
    at build time, `CMD` at run time.
  - `predict`: only `EXPOSE 5000`, `docker run` without `-p` — can the host connect? → Answer: no.
  - `mcq`: in which generation does an ONBUILD instruction take effect? → Answer: it fires only in
    the next-generation build that uses this image as FROM; not in the generation after that.
- Textbook source: §4.1 L1033, §4.2 L1051-1091 (ONBUILD L1083-1091), §4.4 L1138-1158, §4.9
  L1254-1275
- K-Line: ch1 `docker build --platform linux/amd64 -t kline-lab:v1 .` + `docker history kline-lab:v1`
  ✅ (about 11 layers; the largest is `RUN pip install`, about 437MB)

### 4-2 `cmd-vs-entrypoint` CMD vs ENTRYPOINT
- Core: arguments after `docker run` *replace* CMD, but are *appended to* ENTRYPOINT.
- Walkthrough:
  - `file`: only `CMD ["ping","localhost"]` → `docker run img ping 8.8.8.8` replaces it entirely.
  - `file`: `ENTRYPOINT ["ping"]` + `CMD ["localhost"]` → `docker run img 8.8.8.8` becomes
    `ping 8.8.8.8`.
  - `terminal`: the cowsay example: `docker run cowsay "Hello"` — the cow says Hello.
  - `table`: exec form `["a","b"]` (the main program is PID 1 and receives SIGTERM) vs shell form
    `a b` (wrapped in an extra `/bin/sh -c`).
- Practice:
  - `predict`: `ENTRYPOINT ["echo","hi"]`, output of `docker run img bye`? → Answer: `hi bye`.
  - `predict`: only `CMD ["echo","hi"]`, output of `docker run img bye`? → Answer: error, the
    executable `bye` cannot be found (the whole CMD is replaced).
- Textbook source: §4.3 L1091-1136 (cowsay L1118-1132)
- K-Line: none

### 4-3 `build-context-dockerignore` build context 與 `.dockerignore`
- Core: `docker build .` sends the whole directory to the daemon; `.dockerignore` decides what is
  not sent, and `.env` and `.git` must always be excluded.
- Walkthrough:
  - `boxes`: the project folder (including a 1GB .git and node_modules) is sent as one big arrow
    to dockerd.
  - `terminal`: BuildKit output `transferring context: 1.02GB`; after adding .dockerignore it drops
    to a few MB.
  - `file`: `.dockerignore` contents `.git` / `node_modules` / `.env` / `*.md` / `!README.md`.
  - `boxes`: rules are matched top to bottom, later rules override earlier ones: `!README.md` must
    come after `*.md`.
- Practice:
  - `spot-line`: `COPY README.md /` fails — find the .dockerignore line causing it → Answer: `*.md`
    (missing a following `!README.md`).
  - `predict`: `.gitignore` has `.env` but `.dockerignore` does not — will `COPY . .` bring .env
    into the image? → Answer: yes, Docker does not read .gitignore.
- Textbook source: §4.5 L1158-1164, §4.7 L1222-1240, §5.3 context L1427-1443
- K-Line: ch3, removing `!README.md` makes the build fail (`"/README.md": not found`) ✅; 6-C
  `.env` gets COPYed into the image ✅

### 4-4 `layer-cache` 層快取黃金守則
- Core: when a layer changes, every layer after it must be rebuilt; put rarely-changing things at
  the top and frequently-changing things at the bottom.
- Walkthrough:
  - `file`: wrong order `COPY . .` → `RUN pip install`.
  - `layers`: change one line of code → COPY layer rebuilt → pip install layer rebuilt too (red).
  - `file`: right order `COPY requirements.txt` → `RUN pip install` → `COPY . .`.
  - `layers`: change code → only the last COPY is rebuilt, pip install shows cached (green).
  - `terminal`: BuildKit output `CACHED [3/5]`; `--no-cache` forces everything to rerun. (textbook
    may be outdated: the sample output at textbook L1164 and L1308 is the legacy builder's
    `Sending build context`, `Step 1/6`, `Using cache`; BuildKit is now the default, and what you
    actually see is `transferring context`, `[1/5]`, `CACHED`.)
- Practice:
  - `layers-pick`: after changing `app.py`, which layers rebuild in the correctly ordered
    Dockerfile? → Answer: only the last `COPY . .` (and any layers after it).
  - `order`: arrange 4 Dockerfile lines in the most cache-friendly order → Answer: FROM → COPY
    requirements.txt → RUN pip install → COPY . .
  - `predict`: `RUN apt-get update` on its own line, built again three months later — does it
    fetch a new package list? → Answer: no; the instruction string has not changed, so the cache
    is used and the package list is stale; that is why it must be in the same RUN as install.
    (textbook may be outdated: textbook L1194 says apt-get update invalidates all later RUNs, but
    RUN caching keys on the instruction string, and the real risk is caching a stale list; the
    textbook's own pattern near L1204 is the correct one, so it contradicts itself.)
- Textbook source: §4.5 L1158-1204 (golden rule L1170, invalidation rules L1190-1198,
  intermediate containers L1202), §5.3 L1396-1427
- K-Line: ch4 4-B fix for an out-of-sync lockfile (regenerate the lockfile with
  `node:20-alpine`) ✅; 4-A, changing frontend/backend and watching CACHED, is 🔎

### 4-5 `multi-stage` 多階段建置
- Core: compile in one stage and take only the build output into another clean stage; the
  toolchain never enters the final image.
- Walkthrough:
  - `file`: `FROM node AS build` … `FROM python:slim` … `COPY --from=build /dist ./dist`.
  - `layers`: of stage 1 (node_modules, hundreds of MB) only dist is copied over; the rest of the
    stack is thrown away.
  - `table`: base choice full > slim > alpine (alpine uses musl; some C extensions break).
  - `terminal`: `docker history` of the final image shows no `npm ci`, only `COPY --from`.
- Practice:
  - `layers-pick`: which layers are in the final image? → Answer: the python:slim base layers +
    the backend layers + the `COPY --from=build` layer; none of node's layers.
  - `predict`: is `COPY --from=nginx:alpine /etc/nginx/nginx.conf .` valid? → Answer: yes,
    `--from` can also name an external image directly.
- Textbook source: §4.6 L1204-1220
- K-Line: ch1 reference answer 3: `npm ci` and `npm run build` are not in the final history,
  only `COPY --from=frontend-build` at about 1.3MB remains ✅; ch5 `docker history kline-lab:v1` ✅

### 4-6 `buildx-multiplatform` 一次建多平台
- Core: Apple Silicon is arm64 and most clouds are amd64; `buildx --platform` can target one
  platform or build several at once.
- Walkthrough:
  - `boxes`: Mac (arm64) builds an arm64 image → pushed to amd64 Cloud Run → exec format error.
  - `terminal`: `docker buildx build --platform linux/amd64,linux/arm64 -t user/app --push .`.
  - `boxes`: a multi-platform result is a manifest list; on pull, each platform picks the right
    variant automatically.
  - `boxes`: `--load` can only load a single platform into the local machine (the containerd
    image store can hold multiple platforms).
- Practice:
  - `predict`: built on a Mac without `--platform`, pushed to and run on an x86 host — result? →
    Answer: architecture mismatch (exec format error).
  - `spot-line`: the Dockerfile hard-codes `@rollup/rollup-linux-x64-musl`; which line fails in an
    arm64 build? → Answer: that `npm install` line (EBADPLATFORM).
- Textbook source: §4.8 L1242-1254
- K-Line: ch1 `--platform linux/amd64` succeeds, without a platform it fails with `EBADPLATFORM` ✅

## ch5 建置最佳化 (Build optimization)

> Cuts / merges: the 5.3 list of apt-cacher-ng alternatives (including Polipo) is cut, keeping
> only one "proxy cache" step (textbook may be outdated: Polipo, mentioned at L1477, is no longer
> maintained); context and .git are already in 4-3; the 5.6 fat vs slim hands-on is merged into
> 5-4 (as written in the source outline; the fat vs slim table actually appears in 5-5).

### 5-1 `measure-then-optimize` 先量，再依 ROI 排優先
- Core: optimization runs on two tracks — build fast and keep the image small; do the
  highest-ROI moves first.
- Walkthrough:
  - `table`: the 5.5 priority table: .dockerignore, reorder layers, multi-stage, merge RUNs, pick
    the base, mirror / proxy.
  - `terminal`: `docker images` to see SIZE; `docker history` to find the fattest layer.
  - `boxes`: local machine with cache vs a fresh host (CI runner) that must re-pull every layer.
- Practice:
  - `order`: for the same project, which move first → Answer: .dockerignore and layer order
    (lowest cost, biggest effect) first; switching base and mirrors come last.
- Textbook source: §5.1 L1358, §5.5 L1545-1560
- K-Line: ch5 `docker history kline-lab:v1 --format ...` ✅ (finds the 437MB pip layer)

### 5-2 `reorder-layers-ruby` 調換層順序：80 倍
- Core: the same instructions in a different order turn a routine rebuild from minutes into
  seconds.
- Walkthrough:
  - `file`: a Ruby project with `COPY . .` before `bundle install` (highlighted).
  - `layers`: every code change rebuilds the bundle layer.
  - `file`: changed to `COPY Gemfile Gemfile.lock` first → `bundle install` → `COPY . .`.
  - `table`: build time before vs after reordering (about 80× difference, textbook figure).
- Practice:
  - `spot-line`: point to the line that breaks the cache → Answer: the `COPY . .` that appears too
    early.
- Textbook source: §5.3 L1396-1427
- K-Line: ch4 self-check 1 (why `COPY frontend/package*.json` before `npm ci`) — the reference
  answer is derived; the only actually-run ✅ step is the 4-B fix

### 5-3 `registry-mirror-proxy` 縮短下載：本機 registry、mirror、proxy
- Core: when the bottleneck is the network, put images and packages closer: a local registry, a
  registry mirror, a package proxy.
- Walkthrough:
  - `boxes`: many build hosts all pull from Docker Hub → switch to pulling from a registry in the
    same data center (push about 10× faster, pull about 30× faster, textbook figures).
  - `file`: `/etc/docker/daemon.json` with `"registry-mirrors": ["https://mirror.example"]`
    (highlighted).
  - `boxes`: `apt-get install` through an apt-cacher-ng proxy; from the second time on it hits the
    cache (about 6.5×).
  - `boxes`: registry-mirrors only proxies Docker Hub images; ghcr.io and private registries do
    not go through it (beyond the textbook).
- Practice:
  - `predict`: with registry-mirrors set, does `docker pull ghcr.io/x/y` go through the mirror? →
    Answer: no.
- Textbook source: §5.2 L1370-1394, §5.3 mirror L1443-1455, apt-cacher L1457-1477
- K-Line: none

### 5-4 `ghost-files` 層的大小不會是負的
- Core: `rm`-ing a file in a later layer does not shrink the image — the file still sits in the
  earlier layer; install and clean up in the same RUN with `&&`.
- Walkthrough:
  - `file`: `RUN apt-get install …` (one line), `RUN rm -rf /var/lib/apt/lists/*` (another line).
  - `layers`: install layer 318MB, rm layer 0B (not -xxMB): the deleted files become ghosts and
    still take space (leak marker).
  - `file`: merged into one line
    `RUN apt-get update && apt-get install -y … && rm -rf /var/lib/apt/lists/*`.
  - `layers`: after merging there is only one layer, and it is smaller.
  - `boxes`: the same principle leaks secrets too: an earlier layer COPYs a key, a later layer
    deletes it, and the key is still in the image (leads into 22-2).
- Practice:
  - `layers-pick`: which layer actually takes up the space? → Answer: the install layer (the rm
    layer is 0B).
  - `predict`: layer 3 `COPY id_rsa`, layer 4 `RUN rm id_rsa` — can someone who gets the image
    read the key? → Answer: yes, just unpack layer 3.
- Textbook source: §5.4 L1477-1505 (negative layers / ghost files L1489-1505)
- K-Line: ch6 6-B: `ENV TOKEN=abc123` can be found with `docker history --no-trunc` ✅ (same
  "once it is in a layer you cannot take it out" idea)

### 5-5 `go-scratch` Go：500MB 到 5.6MB
- Core: static compilation plus multi-stage `FROM scratch` leaves a final image containing only
  one executable.
- Walkthrough:
  - `layers`: single-stage golang base + source + build output, about 500MB.
  - `terminal`: the manual way: `ldd app` lists the dynamic libraries it needs, then copy them
    one by one into scratch — tedious.
  - `file`: `FROM golang AS build` → `CGO_ENABLED=0 go build` → `FROM scratch` →
    `COPY --from=build /app /app`.
  - `layers`: in the end only one layer of about 5.6MB.
  - `table`: fat vs slim comparison (the 5.6 hands-on): size, pull time, attack surface.
- Practice:
  - `predict`: put into scratch without setting `CGO_ENABLED=0` — what might happen? → Answer:
    missing dynamic libraries, startup fails (`no such file or directory`).
  - `layers-pick`: does the scratch image contain a shell? → Answer: no, so `exec sh` is not
    possible either.
- Textbook source: §5.4 Go L1505-1541, §5.6 L1562-1583
- K-Line: ch5 `du -sm site-packages/*` measures that scipy / sklearn (about 194MB) were pulled in
  by scikit-optimize ✅ (another kind of slimming: drop dependencies you do not need)

## ch6 Compose

> Cuts / merges: the 6.9 YAML syntax table keeps only one question, "indentation must use spaces,
> not tabs", placed in 6-1; `--link` is mentioned once in 6-2 as deprecated; 6.5 positioning
> (single host) is merged into 6-1.

### 6-1 `compose-declarative` 從一長串指令到一份檔案
- Core: Compose declares "what you want" in one compose.yaml and `docker compose up` makes it
  happen; it only manages a single host.
- Walkthrough:
  - `terminal`: three manual lines `docker network create` / `docker run db` / `docker run web …`
    (imperative).
  - `file`: the same thing as compose.yaml: `services:` web / db, build vs image, ports,
    environment (declarative).
  - `boxes`: the new syntax is `docker compose` (with a space), no `version:` needed, file name
    compose.yaml.
  - `boxes`: Compose manages only one host; multiple hosts need an orchestrator
    (Swarm / Kubernetes).
- Practice:
  - `spot-line`: which line in compose.yaml makes parsing fail? → Answer: the line indented with a
    tab.
  - `mcq`: to spread services across three hosts, is Compose enough? → Answer: no, you need an
    orchestrator.
- Textbook source: §6.1 L1631, §6.3 L1655, §6.5 L1696-1698, §6.9 L1789
- K-Line: ch8 `docker compose -f compose.lab.yaml up -d --build` (the stack comes up with
  ready-made images ✅)

### 6-2 `service-name-dns` 用服務名互連，localhost 是自己
- Core: services in the same Compose project share one network and can reach each other by
  service name; `localhost` inside a container means that container itself.
- Walkthrough:
  - `network`: web and redis are both on the `myproj_default` network; web → `redis:6379` works.
  - `network`: web → `localhost:6379` fails: localhost is the web container itself.
  - `terminal`: `docker compose ps`; container names carry the project-name prefix
    `myproj-web-1`.
  - `boxes`: the old `--link` is deprecated; the built-in DNS of user-defined networks replaces it.
- Practice:
  - `reach-matrix`: can web / redis / the host each reach redis via `redis:6379` → Answer: web ✅,
    redis itself ✅, host ❌ (the host is not in Compose's DNS).
  - `spot-line`: which environment line cannot reach the database? → Answer: `DB_HOST=localhost`;
    should be the service name `db`.
- Textbook source: §6.4 L1681-1696, §6.10 L1818
- K-Line: ch8 `FIRESTORE_EMULATOR_HOST: firestore:8080`; `/api/latest-prediction` 404 → seed data →
  200 ✅ (the DNS-resolution step itself is 🔎)

### 6-3 `depends-on-healthcheck` depends_on 只管順序，不管就緒
- Core: `depends_on` only guarantees start order, not that the dependency is ready to use; pair it
  with a healthcheck and `condition: service_healthy`.
- Walkthrough:
  - `boxes`: the db container is up but the database is still initializing → web's connection is
    refused, startup fails.
  - `file`: db gains `healthcheck: test / interval / retries / start_period`.
  - `file`: web's `depends_on: db: condition: service_healthy` (highlighted).
  - `boxes`: only after db goes starting → healthy does web start.
- Practice:
  - `predict`: only `depends_on: [db]`, db takes 20 seconds to be ready, web connects to db
    immediately on start — what happens? → Answer: connection fails.
  - `spot-line`: to make web wait for db to be ready, which line to change? → Answer: change
    `depends_on` to `condition: service_healthy`.
- Textbook source: §6.2 L1647, §6.6 healthcheck L1700
- K-Line: ch7 7-D `--health-cmd 'exit 1'` → `unhealthy` ✅ (ch8 self-check 1 asks about
  depends_on; the reference answer is derived)

### 6-4 `networks-expose-ports` 分網路，資料庫不要對外
- Core: split services with two networks, frontend / backend; `ports` is what opens a door to the
  host, and a database usually needs no `ports`.
- Walkthrough:
  - `file`: `networks: frontend, backend`; web joins both, db joins only backend.
  - `network`: proxy ↔ web ↔ db; no edge from proxy to db.
  - `table`: `expose` (declared only to other containers) vs `ports` (bound to the host's network
    interface).
  - `network`: `ports: "5432:5432"` → anyone on the same Wi-Fi can connect;
    `"127.0.0.1:5432:5432"` → only the local machine.
- Practice:
  - `reach-matrix`: connectivity matrix of proxy / web / db / external user → Answer: external
    reaches only proxy; proxy↔web; web↔db; proxy to db ❌.
  - `predict`: db has no `expose`; can web on the same network reach 5432? → Answer: yes. `expose`
    is not access control; containers on the same network can reach any listening port anyway
    (beyond the textbook).
- Textbook source: §6.6 networks L1706-1708, expose vs ports L1721
- K-Line: ch8 emulator bound to `127.0.0.1:8080:8080` (reference answer 3: remove 127.0.0.1 and
  anyone on the same subnet can read and write); the whole-stack up and curl ✅

### 6-5 `env-override-profiles` .env、覆寫檔與 profiles
- Core: `${VAR}` takes values from .env; `-f` stacks override files; `docker compose config` shows
  the merged result; profiles keep some services from starting by default.
- Walkthrough:
  - `file`: .env `TAG=1.4`; compose.yaml `image: myapp:${TAG}`.
  - `file`: `compose.override.yaml` changes only web's ports and environment.
  - `terminal`: `docker compose -f compose.yaml -f compose.prod.yaml config` prints the merged
    result.
  - `file`: adminer with `profiles: [debug]` — a normal up does not start it, only
    `--profile debug` does.
- Practice:
  - `predict`: both -f files define web's `ports` — result? → Answer: check with `config`;
    multi-value fields such as ports are merged.
  - `predict`: does `docker compose up` start a `profiles: [debug]` service? → Answer: no.
- Textbook source: §6.6 .env L1710, -f / config L1728-1736, profiles L1736
- K-Line: none

### 6-6 `compose-lifecycle` down 與 down -v、--scale
- Core: `down` removes containers and networks but keeps data; `down -v` also removes named
  volumes; a service with a fixed host port cannot `--scale`.
- Walkthrough:
  - `terminal`: Flask + Redis counter; refresh a few times until the count reaches 5.
  - `terminal`: `down` → `up -d` → count is still 5 (the volume survived).
  - `terminal`: `down -v` → `up -d` → count back to 1.
  - `terminal`: `up --scale web=3` → error `port is already allocated` (web hard-codes
    `8000:8000`).
- Practice:
  - `predict`: what does the counter show after `down -v`? → Answer: starts over from 1.
  - `predict`: a service with `ports: "8000:8000"`, `--scale web=2` — result? → Answer: the second
    container hits a port-binding conflict.
- Textbook source: §6.7 L1736-1744 (--scale L1742), §6.8 L1746-1789 (down vs down -v L1785-1787)
- K-Line: ch8 wrap-up `docker compose -f compose.lab.yaml down -v`; the ch2 `-p 8000:8000` port
  conflict is 🔎

## ch7 Registry

> Cuts / merges: the 7.4 history of Docker Hub automated builds is cut and replaced by CI as the
> gatekeeper; 7.7 storage backends keep only one step; 7.8 DTR / UCP are cut, keeping only a
> "Harbor / cloud-hosted" choice table.

### 7-1 `registry-prefix` image 名稱的前綴決定它去哪裡
- Core: the registry is the hub of the whole pipeline; the name prefix decides which registry and
  which account an image is pushed to.
- Walkthrough:
  - `boxes`: dev machine → push → registry → pull → test / production machines, with the registry
    in the middle.
  - `table`: `nginx` (Docker Hub official) / `user/x` (Docker Hub account) / `localhost:5000/x`
    (local registry) / `registry.company.com/team/app`.
  - `terminal`: `docker tag app:1.0 user/app:1.0` only adds a name; the image ID is the same.
- Practice:
  - `predict`: where does `docker push myapp:1.0` (no account prefix) go? → Answer: it tries
    `docker.io/library/myapp`, has no permission, and fails.
  - `spot-line`: to push to the company registry, which name is correct? → Answer:
    `registry.company.com/team/app:1.0`.
- Textbook source: §7.1 L1874, §7.3 L1914-1922
- K-Line: none

### 7-2 `push-login-layers` login、push 與只傳缺少的層
- Core: log in with an access token; on push, layers the registry already has are skipped;
  commercial images are always private.
- Walkthrough:
  - `terminal`: `docker login -u user`, paste an access token into the password prompt (not the
    account password).
  - `layers`: on push, 3 of 5 layers show `Layer already exists`; only 2 are uploaded.
  - `boxes`: Docker Hub public vs private repositories; an image containing business logic or
    secrets in a public repo is a leak.
- Practice:
  - `layers-pick`: only the code layer changed — which layers are uploaded on push? → Answer: only
    the changed layer (and any layers after it).
- Textbook source: §7.2 L1889-1914
- K-Line: none

### 7-3 `ci-gatekeeper` CI 當守門員
- Core: do not push from your own laptop; let CI do build → test → scan → push, with the token
  stored in CI secrets.
- Walkthrough:
  - `boxes`: git push → CI: build → test → `docker scout` → push to the registry; any failing stage
    stops the pipeline.
  - `file`: a GitHub Actions snippet `docker/login-action` + `docker/build-push-action`, password
    from `${{ secrets.DOCKERHUB_TOKEN }}` (highlighted).
  - `boxes`: only CI has push permission; developers do not.
- Practice:
  - `order`: order the CI steps → Answer: checkout → build → test → scan → push.
  - `spot-line`: which workflow line has a security problem? → Answer: the plaintext password line
    `password: mypass123`.
- Textbook source: §7.4 L1924-1939
- K-Line: none (K-Line's "after you finish" only suggests further reading in ch26)

### 7-4 `private-registry` 自架 registry:3
- Core: `registry:3` starts with one line; always mount a volume, or the images vanish when the
  container is removed; the storage backend can be swapped for S3, making the registry itself
  stateless.
- Walkthrough:
  - `terminal`:
    `docker run -d -p 5000:5000 --restart=always -v regdata:/var/lib/registry registry:3`.
  - `terminal`: `docker tag app localhost:5000/app` → `push`.
  - `boxes`: registry container → volume (/var/lib/registry); or → S3 storage backend, so the
    registry can be replaced and restarted at any time.
- Practice:
  - `predict`: no volume mounted, `docker rm -f` the registry and restart it — is the image just
    pushed still there? → Answer: no.
- Textbook source: §7.5 L1941-1959, §7.7 L2019-2025
- K-Line: none

### 7-5 `registry-tls-auth` TLS 先，帳密後
- Core: a private registry must guard against three things: being read, being pushed to by
  anyone, and being swapped; htpasswd credentials must sit on top of TLS, or the password travels
  in plaintext.
- Walkthrough:
  - `table`: threat model: unauthorized read → authentication; eavesdropping → TLS; swapping →
    TLS + signing (leads into 22-3).
  - `file`: `-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/server.crt -e REGISTRY_HTTP_TLS_KEY=...`.
  - `file`: `REGISTRY_AUTH=htpasswd`, `REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd`.
  - `network`: auth without TLS → a man in the middle sees the Basic Auth password (red).
  - `table`: choosing: Harbor (self-hosted, with scanning and RBAC) / ECR / GAR / ACR / GHCR
    (cloud-hosted).
- Practice:
  - `spot-line`: which missing piece of the config makes the password travel in plaintext? →
    Answer: missing `REGISTRY_HTTP_TLS_*`.
  - `mcq`: small team, everything on GitHub — the least-effort registry? → Answer: GHCR.
- Textbook source: §7.6 L1959-2019, §7.8 L2025-2054
- K-Line: none

---

# 第六篇 守護 (Part 6, Defense)

## ch21 主機與 daemon 安全 (Host and daemon security)

> Cuts / merges: 21.3 namespaces / cgroups are already in 1-4, here only one step of 21-4; 21.6
> reducing attack surface (host runs only Docker, sensitive containers placed separately) is
> merged into 21-5. Note: the headings of textbook 21.5 "least-privilege flags" and 22.3
> "docker scout" were lost in the PDF conversion; their body text is at L4727-4759 and
> L4864-4871.

### 21-1 `docker-equals-root` 能下 docker 指令 ≈ 主機 root
- Core: dockerd runs as root; anyone who can tell it what to do can mount any host directory or
  start a privileged container, so treat them as a system administrator.
- Walkthrough:
  - `boxes`: user → docker CLI → dockerd (root) → new container `-v /:/host` → reads the host's
    `/etc/shadow`.
  - `terminal`: `docker run -v /:/host alpine cat /host/etc/shadow` prints the contents.
  - `boxes`: defense in depth: four chapters, four layers (host, image, kernel, detection),
    assuming every layer will fall.
- Practice:
  - `mcq`: why should docker group members be treated as administrators? → Answer: through the
    root daemon they can read and write the whole host.
- Textbook source: §21.1 L4655-4686
- K-Line: none (Appendix C table: item 3 "daemon / docker.sock / rootless" is not practiced)

### 21-2 `docker-sock-escape` 掛 docker.sock = 交出 root
- Core: mount `/var/run/docker.sock` into a container, and once that container is compromised the
  attacker can tell the daemon to start a privileged container and take over the host.
- Walkthrough:
  - `boxes`: container A (with docker.sock mounted) is compromised.
  - `boxes`: A → docker.sock → dockerd: 「開一個 `-v /:/host --privileged` 的容器 B」 ("start a
    container B with `-v /:/host --privileged`").
  - `boxes`: B reads and writes the host file system and plants a backdoor → the host and all
    other containers fall (red spreading).
  - `table`: alternatives when you need to build images inside a container: BuildKit standalone
    mode / Kaniko / Buildah.
- Practice:
  - `order`: order the attack chain → Answer: compromise the app container → tell the daemon via
    docker.sock → start a privileged container mounting / → take over the host.
  - `spot-line`: the most dangerous line in compose.yaml? → Answer:
    `- /var/run/docker.sock:/var/run/docker.sock`.
- Textbook source: §21.2 L4688-4696
- K-Line: none

### 21-3 `rootless-userns` rootless 與 user namespace
- Core: run the daemon without root; root inside the container maps to an unprivileged user on
  the host, so in the worst case the attacker still does not get host root.
- Walkthrough:
  - `boxes`: normal mode: container root (UID 0) = host UID 0.
  - `boxes`: user namespace: container UID 0 → host UID 100000 (unprivileged).
  - `table`: the cost of rootless: ports below 1024, some network modes and some storage drivers
    are restricted; the compromise option is userns-remap.
- Practice:
  - `predict`: a container escape succeeds in rootless mode — who is the attacker on the host? →
    Answer: the ordinary user running Docker, not root.
- Textbook source: §21.4 L4715-4725; §2.7 L625-629
- K-Line: none

### 21-4 `least-privilege-flags` 最小權限的一組旗標
- Core: lock everything down by default and open the smallest hole only where truly needed:
  read-only, drop all capabilities, forbid privilege escalation, non-root, limit process count
  and resources.
- Walkthrough:
  - `terminal`:
    `docker run --read-only --cap-drop=ALL --cap-add=NET_BIND_SERVICE --security-opt no-new-privileges --user 1000:1000 --pids-limit 200 --memory 512m --cpus 1.0 myapp`,
    highlighting each flag in turn.
  - `table`: what each flag blocks (planting backdoors, root privileges, privilege escalation,
    fork bombs, resource exhaustion).
  - `boxes`: `--read-only` plus `--tmpfs /var/cache/nginx`: only that area is writable.
  - `boxes`: namespaces block lateral movement and cgroups block resource exhaustion — they were
    security defenses all along (ties back to 1-4).
  - `terminal`: `docker inspect -f '{{.HostConfig.ReadonlyRootfs}}' safe` → `true`.
- Practice:
  - `spot-line`: which flag in this run command tears down isolation entirely? → Answer:
    `--privileged`.
  - `predict`: `--read-only` without a tmpfs, and the program needs to write /tmp — what happens?
    → Answer: a Read-only file system error.
  - `predict`: K-Line as it stands, output of `docker run kline-lab:v1 id`? → Answer:
    `uid=0(root)`.
- Textbook source: §21.5 (heading lost) L4727-4759, §21.3 L4698-4713, §21.8 L4794-4811. (textbook
  may be wrong: 21.8 runs the official `nginx:alpine` with `--user 1000:1000` and adds
  `NET_BIND_SERVICE`, but a non-root process does not get an effective capability just from
  `--cap-add`; since Docker 20.10 the container's `ip_unprivileged_port_start` is set to 0, so
  non-root can bind low ports anyway; and the official nginx image often fails when run as
  non-root because of pid / cache path permissions. Recommend running it to confirm, or switching
  to `nginxinc/nginx-unprivileged`. This is derived, not actually run.)
- K-Line: ch7 7-A `id` → root ✅; 7-B
  `--read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges` still returns 200 ✅

### 21-5 `remote-daemon` 遠端 daemon：不要裸露 2375
- Core: 2375 is plaintext and 2376 is TLS; the best practice is to open no TCP port at all and use
  `docker context` over SSH.
- Walkthrough:
  - `network`: dockerd `0.0.0.0:2375` → scanners on the internet → get host root (red).
  - `network`: TLS 2376 + CA mutual certificates: anyone without a certificate cannot connect.
  - `terminal`: `docker context create prod --docker host=ssh://user@host` →
    `docker --context prod ps`.
  - `boxes`: reduce attack surface: the Docker host runs no other services; sensitive and ordinary
    containers go on different hosts with separate authorization.
- Practice:
  - `reach-matrix`: under three setups (2375 public / 2376 TLS / SSH context), can "an outsider
    with no credentials" and "an admin with an SSH key" control the daemon → Answer: 2375: both
    can; 2376: outsider ❌, certificate holder ✅; SSH: outsider ❌, admin ✅.
  - `predict`: you inherit a host running `dockerd -H tcp://0.0.0.0:2375` — the risk? → Answer:
    anyone can get host root; switch to an SSH context or TLS.
- Textbook source: §21.6 L4761-4771, §21.7 L4771-4794; §2.6 L623-625
- K-Line: none

## ch22 image 與供應鏈安全 (Image and supply-chain security)

> Cuts / merges: 22.1 pain points and 22.2 supply-chain definition become one section; 22.5
> signing principles (against forgery, replay, key leaks) and 22.6 tool generations become one
> section; DCT's offline root key and YubiKey details are cut, keeping only one sentence, "DCT is
> retired".

### 22-1 `supply-chain-scout` 供應鏈與 docker scout
- Core: your image inherits the risk of its base and every dependency; scan with `docker scout`,
  wire it into CI, and block on high-severity vulnerabilities.
- Walkthrough:
  - `boxes`: base image → third-party packages → your build → registry → deploy, with a possible
    breach marked at each stage.
  - `terminal`: `docker scout quickview myapp:1.0` → high / medium / low vulnerability counts.
  - `terminal`: `docker scout cves myapp:1.0` → which package, which version, whether a fixed
    version exists.
  - `boxes`: CI: build → scout → high-severity ❌ blocked / clean ✅ allowed.
- Practice:
  - `predict`: `quickview python:3.12` vs `python:3.12-slim` — which has fewer vulnerabilities? →
    Answer: slim.
  - `mcq`: should you still use `docker scan` or `docker sbom`? → Answer: no, they are deprecated;
    use `docker scout`.
- Textbook source: §22.1 L4847-4851, §22.2 L4851-4860, §22.3 (heading lost) L4864-4871, §22.9
  L4923-4937
- K-Line: ch7 7-E `docker scout quickview kline-lab:v1` is 🔎 (needs docker login); no ✅ step

### 22-2 `minimal-base-no-secrets` 從源頭減少風險：小基底、機密不進 image
- Core: the less you install, the fewer vulnerabilities (distroless, hardened); secrets live
  outside the image and are only borrowed in at run time.
- Walkthrough:
  - `table`: full / slim / distroless: size, vulnerability count, whether there is a shell.
  - `file`: `ENV API_KEY=abc123` in a Dockerfile (highlighted red).
  - `terminal`: `docker history --no-trunc leak | grep abc123` → found.
  - `terminal`: switched to `docker run -e API_KEY=...`: `docker history` no longer finds it, but
    `docker inspect` still shows it.
- Practice:
  - `spot-line`: which line put the secret into the image? → Answer: `ENV API_KEY=...` (or
    `COPY .env`).
  - `predict`: started with `-e JWT_SECRET=s3cret` — does `docker inspect` show it? → Answer: yes,
    which is why production must use a secrets mechanism.
- Textbook source: §22.4 L4873-4877
- K-Line: ch6 6-A `-e` does not enter the image but `inspect` shows it ✅, 6-B `ENV` enters
  history ✅, 6-C `.env` gets COPYed in ✅

### 22-3 `signing-cosign` 簽章：DCT 退場，Cosign 接手
- Core: a tag can be overwritten and swapped; a signature proves 「這份 image 是我發的、沒被改過」
  ("I published this image and it has not been modified"); DCT / Notary v1 are retired — today
  use Cosign keyless or Notation.
- Walkthrough:
  - `boxes`: an attacker breaks into the registry and replaces `myapp:1.0` with a backdoored image
    of the same name.
  - `boxes`: the publisher stamps with a private key → the deployer verifies with the public key →
    the swapped image fails verification.
  - `table`: DCT / Notary v1 (❌ retired, requires managing an offline root key) / Cosign keyless
    (✅ uses OIDC identity, short-lived keys) / Notation (✅ enterprise PKI).
  - `terminal`: `cosign sign myregistry/myapp@sha256:...` → `cosign verify ...`.
- Practice:
  - `mcq`: the main reason DCT failed? → Answer: key management was so painful that people simply
    stopped signing.
  - `predict`: an old tutorial tells you to `export DOCKER_CONTENT_TRUST=1` — what should you do
    now? → Answer: use Cosign (or Notation) instead.
- Textbook source: §22.5 L4877-4891, §22.6 L4891-4908
- K-Line: none

### 22-4 `verify-digest-sbom` 部署時驗章、釘 digest、SBOM
- Core: signing without verifying is the same as not signing; an admission controller blocks
  unsigned images before deploy; a digest pins the content; an SBOM is the ingredient list.
- Walkthrough:
  - `boxes`: deploy request → admission controller (Kyverno / Sigstore Policy Controller) →
    verified ✅ / unsigned ❌.
  - `file`: in a Deployment, `image: myapp:1.0` vs `image: myapp@sha256:...` (highlighted).
  - `boxes`: Log4Shell breaks → check the SBOM → immediately know which images use that version.
  - `boxes`: provenance / SLSA: proves which CI and which commit built the image.
- Practice:
  - `order`: order from release to deploy → Answer: build → scan → sign → push → admission verify
    → run.
  - `spot-line`: the line in a production config most easily swapped? → Answer: the `image:` line
    using a mutable tag.
- Textbook source: §22.7 L4908-4917, §22.8 L4917-4923
- K-Line: none

## ch23 核心強化與合規 (Kernel hardening and compliance)

> Cuts / merges: 23.1 shared kernel is merged into the first step of 23-1; 23.5 kernel-hardening
> history (SANS, Openwall, Exec Shield, PaX, Grsecurity) is cut, keeping only one sentence, "ASLR
> / NX are built in, just keep up to date"; 23.4 host-access hardening (PermitRootLogin, sudo) is
> merged into 23-3; Lynis is only one step of 23-3.

### 23-1 `mac-selinux-apparmor` 強制存取控制：連 root 都繞不過
- Core: the kernel is the shared weak point of every container; with SELinux / AppArmor the
  administrator sets a global policy that constrains even root inside a container — never turn
  it off.
- Walkthrough:
  - `boxes`: a VM is like a detached house, a container like a unit in an apartment building: if
    the foundation (the kernel) cracks, the whole building falls.
  - `table`: traditional permissions (the owner decides; root can bypass) vs MAC (the admin sets
    policy; even root cannot bypass).
  - `table`: RPM-based → SELinux; apt-based → AppArmor; Docker applies a basic profile by default.
  - `terminal`: `setenforce 0` marked red: it disables one line of defense yourself; keep
    enforcing and adjust the policy instead.
- Practice:
  - `predict`: the program in the container is root and the AppArmor policy forbids writing
    /proc/sys — can it write? → Answer: no.
  - `mcq`: which MAC does Docker use by default on an Ubuntu host? → Answer: AppArmor.
- Textbook source: §23.1 L4971-4979, §23.2 L4981-4998, §23.5 L5021-5025
- K-Line: none

### 23-2 `seccomp-three-layers` seccomp 與三層能力管束
- Core: seccomp limits which system calls a container can make; capabilities, seccomp and MAC
  constrain a container from three angles, and only stacked together are they thick enough.
- Walkthrough:
  - `boxes`: container program → syscall → seccomp guard → on the allowlist: kernel executes /
    dangerous: denied.
  - `terminal`: `--security-opt seccomp=unconfined` marked red: removes the guard, as dangerous as
    `--privileged`.
  - `table`: three rows: capabilities (root privileges) / seccomp (system calls) / MAC (files and
    resources).
- Practice:
  - `predict`: is Docker's default seccomp profile on or off? → Answer: on — you are protected
    without doing anything, as long as you do not use unconfined.
  - `reach-matrix`: which layer blocks "mounting a file system", "changing file ownership" and
    "calling an obscure syscall" → Answer: mount: capability (CAP_SYS_ADMIN) + seccomp; change
    owner: capability (CAP_CHOWN); obscure syscall: seccomp. (The mappings for the last two are
    beyond the textbook; the textbook only gives the three-layer division of labor.)
- Textbook source: §23.3 L4998-5011
- K-Line: ch7 7-B `--cap-drop ALL`, service still returns 200 ✅ (the capability layer)

### 23-3 `docker-bench-cis` Docker Bench 與 CIS：上線前總驗收
- Core: Docker Bench automatically checks against the CIS Docker Benchmark; nearly every WARN maps
  to a move learned earlier; compliance is the floor, not the ceiling.
- Walkthrough:
  - `terminal`:
    `docker run --rm --net host --pid host --userns host --cap-add audit_control -v /etc:/etc:ro -v /var/run/docker.sock:/var/run/docker.sock:ro ... docker/docker-bench-security`.
    (textbook may be outdated: the `docker/docker-bench-security` image on Docker Hub has not been
    updated in years, and the project README recommends cloning the repo and running
    `docker-bench-security.sh` directly. This is beyond-the-textbook information; recommend
    confirming.)
  - `terminal`: output is a series of `[PASS]` / `[INFO]` / `[WARN]`.
  - `table`: WARN mapping table: container runs as root (→ USER), no resource limits
    (→ -m / --cpus), not read-only (→ --read-only), dangerous capabilities added (→ cap-drop),
    SSH inside the container (→ exec), 2375 exposed (→ SSH context).
  - `boxes`: the host needs hardening too: `PermitRootLogin no`, use sudo for an audit trail,
    automatic patching; Lynis `lynis audit system` checks the host.
- Practice:
  - `predict`: Bench reports "Container running as root" — which ch21 move fixes it? → Answer:
    change `USER` / `--user` to non-root.
  - `mcq`: does passing the CIS benchmark mean the system is secure? → Answer: no, it only means
    the basics are not missing.
  - `spot-line`: the Bench run command mounts docker.sock — does that contradict 21-2? Which detail
    makes it controlled use? → Answer: `:ro` read-only + `--rm` thrown away after use.
- Textbook source: §23.4 L5013-5021, §23.6 L5025-5035, §23.7 L5035-5058, §23.8 L5060-5066, §23.9
  L5066-5092
- K-Line: none (Appendix B-8: no practice)

## ch24 偵測與持續關注 (Detection and staying current)

> Cuts / merges: 24.1 pain points ("if" → "when") is merged into the first step of 24-1; 24.4
> security-event monitoring (Loki, Prometheus, Alertmanager reused from Part 5) is only one step of
> 24-1, because Part 5 is not in the MVP; Summon is mentioned only as an idea, the tool is not
> taught; 24.7 Part 6 recap is merged into 24-3; old community info such as freenode IRC is cut.

### 24-1 `runtime-detection-falco` 執行期偵測：牆被翻過的那一刻
- Core: assume you will be breached sooner or later; Falco watches every container's system calls
  at the kernel level and alerts when they match a suspicious pattern.
- Walkthrough:
  - `boxes`: 「如果被攻破」 becomes 「當被攻破時」 ("if breached" → "when breached"): walls +
    patrols + response.
  - `boxes`: container behavior → syscall → Falco matches rules → suspicious 🚨 alert / normal
    allowed.
  - `terminal`: a sample Falco alert: someone opened `/bin/sh` in the web container and read
    `/etc/shadow`.
  - `boxes`: alert → centralized logs / Grafana / Alertmanager → on-call phone (reusing the
    monitoring infrastructure).
- Practice:
  - `mcq`: which behavior should most trigger a Falco alert? → Answer: an interactive shell
    suddenly appearing in an nginx container.
  - `predict`: with only the previous three chapters' defenses and no runtime detection, would an
    intruder lurking for months be found? → Answer: very likely not.
- Textbook source: §24.1 L5130-5146, §24.2 L5146-5172, §24.4 L5194-5209
- K-Line: none

### 24-2 `secrets-injection` 機密執行時才注入，而且會過期
- Core: secrets live in Vault / a cloud Secrets Manager and are issued only at run time to
  containers with permission; short-lived credentials automatically become invalid when they
  expire.
- Walkthrough:
  - `boxes`: vault → issued to the container at run time → when the process ends the secret
    disappears from memory; it never touches disk and never enters the image.
  - `table`: permanent keys (valid after a leak until manually rotated) vs short-lived credentials
    (expire within minutes to hours).
  - `table`: tools: HashiCorp Vault / K8s External Secrets, Secrets Store CSI / cloud Secrets
    Manager.
- Practice:
  - `predict`: an attacker steals a credential valid for 15 minutes and uses it an hour later —
    result? → Answer: it has already expired.
  - `order`: order of a secret from vault to container → Answer: stored in the vault → container
    requests it with its own identity at startup → vault verifies permission and issues it →
    process uses it → disappears on expiry / exit.
- Textbook source: §24.3 L5172-5194
- K-Line: ch6 reference answer 3 (Cloud Run can inject Secret Manager values as environment
  variables or files) — derived; the actually-run ✅ step is 6-A `--env-file` injection

### 24-3 `security-loop` 防 → 偵 → 應 → 修
- Core: security is a loop that keeps turning, not a one-time project; staying current =
  subscribe to advisories + automated scanning + keep things updated.
- Walkthrough:
  - `boxes`: four-box loop: 防 prevent (ch21-23) → 偵 detect (24-1) → 應 respond (alerts,
    handling, responsible disclosure) → 修 fix (update, patch defenses) → back to prevent.
  - `boxes`: three things for staying current: subscribe to advisories (Docker Advisory, GitHub
    Security Advisories / Dependabot, CVE) → `docker scout` to check whether you are affected →
    update the kernel, Docker and base images.
  - `table`: Part 6 recap: which layer each of the four chapters guards and which tools each uses.
  - `boxes`: responsible disclosure: find a vulnerability → privately report to the maintainers →
    fix released → only then publish details.
- Practice:
  - `order`: pair 「防 / 偵 / 應 / 修」 with four events and order them → Answer: cap-drop setting
    (防) → Falco alert (偵) → on-call handling (應) → upgrade the base image (修).
  - `mcq`: you found a Docker vulnerability yourself — what is the first step? → Answer: report it
    privately through the official security reporting channel; do not publish it directly.
- Textbook source: §24.5 L5209-5234, §24.6 L5236-5262, §24.7 L5262-5279, §24.8 L5279
- K-Line: none (Appendix B-9: K-Line could turn on Dependabot first — a suggestion, not a textbook
  quote)
