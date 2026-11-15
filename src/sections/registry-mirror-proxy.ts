import type { Section } from '../core/types';

export const registryMirrorProxy: Section = {
  id: 'registry-mirror-proxy',
  num: '5-3',
  chapter: 5,
  title: '縮短下載：自架 registry、mirror、proxy',
  concept: '瓶頸在網路時，就把 image 和套件放近一點：機房內的 registry、Docker Hub 鏡像、套件快取代理。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: '每台主機都對外連 Docker Hub',
          nodes: [{ text: '10 台主機' }, { text: 'Docker Hub', note: '外網', tone: 'bad' }],
          links: [{ text: 'push / pull 整包', tone: 'bad' }],
        },
        {
          kind: 'flow',
          label: '改用機房內的 registry',
          nodes: [{ text: '10 台主機' }, { text: '自架 registry', note: '同一個機房區網', tone: 'good' }],
          links: [{ text: 'push 約快 10 倍、pull 約快 30 倍', tone: 'good' }],
        },
      ],
      note: '部署慢通常卡在 Docker Hub：外網慢、又要看它的臉色。自架 registry 把傳輸搬進區網，Docker Hub 掛了也照樣能部署（數字為教材估計）。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: '/etc/docker/daemon.json',
          lines: [{ text: '{' }, { text: '  "registry-mirrors": ["https://mirror.example.com"]', tone: 'focus' }, { text: '}' }],
        },
        { kind: 'terminal', lines: [{ text: '$ sudo systemctl restart docker', note: '重啟 daemon 才生效' }] },
      ],
      note: 'registry 鏡像（pull-through cache）是被動代理：第一次有人要某個 Docker Hub image，它去抓一次並存起來，之後全公司都從它拿。寫在 daemon.json，別再照舊書去改 systemd 加 --registry-mirror。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '第一台主機 pull nginx',
          nodes: [{ text: '主機 A' }, { text: '鏡像', note: '沒有，去抓並存起來' }, { text: 'Docker Hub' }],
          links: [{}, { text: '只抓這一次', tone: 'focus' }],
        },
        {
          kind: 'flow',
          label: '之後其他主機 pull nginx',
          nodes: [{ text: '主機 B…J' }, { text: '鏡像', note: '直接給', tone: 'good' }],
          links: [{ text: '內網', tone: 'good' }],
        },
      ],
      note: '十人團隊沒有鏡像，基底 image 一改版，十個人各自對外抓十次。有了鏡像，全公司對外只抓一次。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'apt-get install 改走快取代理',
          nodes: [{ text: 'RUN apt-get install …' }, { text: 'apt-cacher-ng :3142', note: '第二次起命中快取', tone: 'good' }, { text: 'Debian 套件庫' }],
          links: [{}, { text: '只有沒看過的才對外抓' }],
        },
      ],
      note: '鏡像管 image，快取代理管套件。apt、pip、npm 下載過的套件存在代理上，CI 每次重 build 都從它拿，教材量到約快 6.5 倍。就算 build 加了 --no-cache，代理照樣有效。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '設了 registry-mirrors 之後，誰會走鏡像？',
          head: ['pull 的 image', '走鏡像？'],
          rows: [
            { cells: ['nginx（Docker Hub）', '會'], tone: 'good' },
            { cells: ['user/app（Docker Hub）', '會'], tone: 'good' },
            { cells: ['ghcr.io/x/y', '不會，直接連 ghcr.io'], tone: 'bad' },
            { cells: ['registry.company.com/app', '不會'], tone: 'bad' },
          ],
        },
      ],
      note: 'daemon.json 的 registry-mirrors 只替 Docker Hub 的 image 代理。名字帶了其他 registry 主機的 image，還是直接去那台抓（教材外補充）。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'daemon.json 已經設好 registry-mirrors。執行 docker pull ghcr.io/x/y，會經過鏡像嗎？',
      options: ['會，所有 pull 都走鏡像', '不會，registry-mirrors 只代理 Docker Hub', '只有第一次會'],
      answer: 1,
      explain: 'registry-mirrors 只對 Docker Hub（docker.io）的 image 生效。ghcr.io 的 image 會直接連 ghcr.io。',
    },
    {
      type: 'choice',
      prompt: 'CI 每次 build 都卡在 RUN pip install 下載套件。架哪一個最對症？',
      options: ['registry 鏡像', '套件快取代理（例如 Nexus 的 PyPI 代理）', '自架 registry'],
      answer: 1,
      explain: 'registry 鏡像和自架 registry 處理的是 image；pip 下載的是套件，要靠套件快取代理。兩者可以一起用。',
    },
  ],
  source: '教材 §5.2、§5.3 第三招與第四招（registry-mirrors 只代理 Docker Hub 為教材外補充；Polipo 已停止維護，不列入）',
};
