import type { Section } from '../core/types';

export const measureThenOptimize: Section = {
  id: 'measure-then-optimize',
  num: '5-1',
  chapter: 5,
  title: '先量，再依 ROI 排優先',
  concept: '最佳化有三個目標：建得快、傳得快、image 小。先量出瓶頸，再從成本最低、效果最大的招式做起。',
  steps: [
    {
      scene: [
        {
          kind: 'table',
          head: ['目標', '痛在哪裡'],
          rows: [
            { cells: ['建得快', '每次 build 都重新下載、重裝套件'] },
            { cells: ['傳得快', '推一個大 image 上去、再拉到別台，要等十幾分鐘'] },
            { cells: ['體積小', 'image 不知不覺長到 1GB 以上，連攻擊面也一起變大'] },
          ],
        },
      ],
      note: 'image 慢慢變肥幾乎是每個團隊都會走的路：每加一個功能就多裝一點。重點不是永遠不變肥，而是在它拖累交付之前，有系統地瘦回來。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker images kline-lab' },
            { text: 'REPOSITORY   TAG   IMAGE ID       SIZE', tone: 'dim' },
            { text: 'kline-lab    v1    3f2a…          712MB', tone: 'focus' },
            { text: '$ docker history kline-lab:v1 --format "{{.Size}}  {{.CreatedBy}}"' },
            { text: '437MB   RUN /bin/sh -c pip install --no-cache-dir -r … # buildkit', tone: 'bad', note: '最肥的一層' },
            { text: '1.3MB   COPY /frontend/dist ./static # buildkit' },
            { text: '…' },
          ],
        },
      ],
      note: '先量再動手。docker images 看總大小，docker history 看是哪一行做出最肥的那一層。沒量就開始改，很容易花一天省下 5MB。（總大小為示意）',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '自己的電腦：層都在',
          nodes: [{ text: '改一行程式' }, { text: '只重做最後幾層', tone: 'good' }],
          links: [{ text: 'build' }],
        },
        {
          kind: 'flow',
          label: '全新的主機或 CI runner：什麼都沒有',
          nodes: [{ text: '同一個 image' }, { text: '每一層都要重抓', tone: 'bad' }],
          links: [{ text: 'pull' }],
        },
      ],
      note: '在自己電腦上感覺不到，是因為快取和舊層都在。換到新主機、擴展到 10 台，或 CI 每次從零開始，整疊層都要重新下載，肥 image 的成本就被放大。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '依投資報酬率排',
          head: ['順位', '招式', '成本'],
          rows: [
            { cells: ['1', '調層順序、加 .dockerignore', '極低，一律先做'], tone: 'good' },
            { cells: ['2', 'multi-stage、裝與清寫在同一個 RUN', '中低，image 肥到痛時'] },
            { cells: ['3', '自架 registry、registry 鏡像、套件快取代理', '中，要架伺服器；團隊與 CI 規模大時'] },
          ],
        },
      ],
      note: '前兩招只是改 Dockerfile，第三組是基礎設施等級的投資。單人小專案先別花一週去架快取代理。',
    },
  ],
  questions: [
    {
      type: 'order',
      prompt: '一個 build 又慢、image 又肥的專案，依投資報酬率排出下手順序：',
      items: ['調層順序、加 .dockerignore', 'multi-stage、裝與清寫在同一個 RUN', '自架 registry、鏡像、快取代理'],
      explain: '先做幾乎零成本、天天有感的兩招；體積開始痛時再拆階段、合併 RUN；團隊和 CI 規模大了，才值得架伺服器。',
    },
    {
      type: 'choice',
      prompt: 'image 有 1.2GB，想知道是哪一行 Dockerfile 讓它變肥。先下哪個指令？',
      options: ['docker images', 'docker history <image>', 'docker ps -s'],
      answer: 1,
      explain: 'docker history 列出每一層的大小和產生它的那一行指令。docker images 只看得到總大小。',
    },
  ],
  source: '教材 §5.1、§5.5（總大小為示意；437MB 為 K-Line 實測）',
  verify: "K-Line 練習第 5 章：docker history kline-lab:v1 --format '{{.Size}}\\t{{.CreatedBy}}'，找到約 437MB 的 pip 層。",
};
