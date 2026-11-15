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

## Part 2 (ch4–ch7) — shipped

Done: 22 / 22 sections (4-4 in DS-001, the rest in DS-003). The reference for this part is the
shipped section files in `src/sections/` plus `plan.md`; this outline no longer tracks them.

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
