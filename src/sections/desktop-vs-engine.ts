import type { Section } from '../core/types';

export const desktopVsEngine: Section = {
  id: 'desktop-vs-engine',
  num: '2-1',
  chapter: 2,
  title: 'Docker Desktop 其實是一台 VM',
  concept: 'Linux 容器需要 Linux kernel；Mac 和 Windows 的 Docker Desktop 會在背景開一台 Linux VM，容器其實跑在那台 VM 裡。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: 'Linux：裝 Docker Engine（docker-ce）',
          nodes: [{ text: 'docker CLI' }, { text: 'dockerd', tone: 'good' }, { text: '容器' }],
          links: [{ text: 'API' }, {}],
        },
        {
          kind: 'flow',
          label: 'Mac / Windows：裝 Docker Desktop',
          nodes: [
            { text: 'docker CLI', note: '在 macOS / Windows 上' },
            { text: 'Linux VM', note: '背景偷偷開的', tone: 'focus' },
            { text: 'dockerd' },
            { text: '容器' },
          ],
          links: [{ text: 'API' }, {}, {}],
        },
      ],
      note: '容器靠的是 Linux kernel 的 namespaces 和 cgroups，Mac 和 Windows 沒有這個 kernel。Docker Desktop 的解法是在背景開一台輕量 Linux VM，把引擎放進去，你的 CLI 再透過 API 遙控它。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: 'Apple Silicon Mac 上',
          lines: [
            { text: '$ docker version' },
            { text: 'Client:' },
            { text: ' OS/Arch:   darwin/arm64', tone: 'dim' },
            { text: 'Server: Docker Desktop' },
            { text: ' OS/Arch:   linux/arm64', tone: 'focus', note: 'Server 是 Linux' },
          ],
        },
      ],
      note: 'Client 是 macOS（darwin），Server 卻是 linux：證據確鑿，引擎跑在一台 Linux VM 裡。Windows 上這台 VM 通常跑在 WSL2 裡。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: 'Docker Desktop → Settings → Resources',
          items: [
            { text: '資料庫容器', tone: 'dim' },
            { text: '快取容器', tone: 'dim' },
            { text: 'API 容器', tone: 'dim' },
            { text: 'Linux VM：4 CPU、4 GB 記憶體', tone: 'focus', note: '所有容器的天花板' },
            { text: '你的 Mac：16 GB 記憶體' },
          ],
        },
      ],
      note: '所有容器共用那台 VM 的資源額度。在 Mac 上容器莫名很慢或一直被殺掉，第一個先查 Resources 是不是開太小。Linux 原生環境就沒有這層天花板。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '看到這些，代表文章過時了',
          head: ['舊做法', '現在'],
          rows: [
            { cells: ['裝 boot2docker ＋ VirtualBox', 'Docker Desktop'], tone: 'good' },
            { cells: ['export DOCKER_HOST=tcp://…', '不用設，設了反而連錯地方'], tone: 'good' },
            { cells: ['docker-machine create', '直接開一台雲端主機裝 docker-ce'], tone: 'good' },
          ],
        },
      ],
      note: '網路上一堆安裝文章還停在 boot2docker 時代。另外記一個不變的前提：Docker 需要 64 位元的作業系統。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '在 Apple Silicon（M 系列）Mac 上執行 docker run --rm alpine uname -m，會印出什麼？',
      options: ['arm64-darwin', 'aarch64', 'x86_64'],
      answer: 1,
      explain: '容器跑在 Docker Desktop 開的 Linux VM 裡，那台 VM 是 arm64 架構的 Linux，Linux 把這個架構叫 aarch64。印出來的不會是 macOS 的資訊。',
    },
    {
      type: 'choice',
      prompt: 'Docker Desktop 只分給 VM 4 GB 記憶體。你用 docker run -m 8g 開一個容器，它能真的用到 8 GB 嗎？',
      options: ['可以，-m 會直接向 Mac 要記憶體', '不能，整台 VM 就只有 4 GB', '可以，但只限一個容器'],
      answer: 1,
      explain: '容器跑在 VM 裡，-m 只是在 VM 內設上限。VM 本身只有 4 GB，所有容器加起來都超不過它。要更多就去 Resources 調大 VM。',
    },
  ],
  source: '教材 §2.1、§2.10 坑五、坑六',
  verify: 'K-Line 練習第 1 章：Apple Silicon 上 docker build -t kline-lab:native . 失敗（EBADPLATFORM），正是 VM 為 arm64 的直接後果。',
};
