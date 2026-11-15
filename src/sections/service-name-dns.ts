import type { Section } from '../core/types';

const ENV = ['DB_HOST=localhost', 'DB_PORT=5432', 'REDIS_HOST=redis', 'REDIS_PORT=6379'];

export const serviceNameDns: Section = {
  id: 'service-name-dns',
  num: '6-2',
  chapter: 6,
  title: '用服務名互連，localhost 是自己',
  concept: '同一個 Compose 專案的服務在同一個網路上，用服務名就能互連；容器裡的 localhost 指的是容器自己。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml（專案名 myproj）',
          lines: [
            { text: 'services:' },
            { text: '  web:' },
            { text: '    build: .' },
            { text: '    environment:' },
            { text: '      REDIS_HOST: redis', tone: 'good', note: '寫服務名' },
            { text: '  redis:', tone: 'focus' },
            { text: '    image: redis:7' },
          ],
        },
      ],
      note: 'docker compose up 會建一個 myproj_default 網路，把所有服務接上去。Docker 內建的 DNS 會把服務名 redis 解析成 redis 容器的 IP；接在這個網路上的每個容器（包括 redis 自己）都查得到這個名字。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'web 連 redis:6379',
          nodes: [{ text: 'web 容器' }, { text: 'Docker DNS', note: 'redis → 172.18.0.3' }, { text: 'redis 容器 :6379', tone: 'good' }],
          links: [{ text: '問 redis 在哪' }, { text: '連上', tone: 'good' }],
        },
      ],
      note: '不用寫死 IP，容器重建、IP 變了也沒關係。舊教學裡的 --link 已經棄用，使用者自訂網路的內建 DNS 取代了它。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'web 連 localhost:6379',
          nodes: [{ text: 'web 容器' }, { text: 'web 容器自己 :6379', note: '沒有人在聽', tone: 'bad' }],
          links: [{ text: 'localhost', tone: 'bad' }],
        },
      ],
      note: '每個容器有自己的網路空間，localhost 就是它自己。在自己電腦上把 redis 跑在 localhost 習慣了，搬進 Compose 最常在這裡踩坑。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose ps' },
            { text: 'NAME             SERVICE   STATUS', tone: 'dim' },
            { text: 'myproj-redis-1   redis     Up', note: '專案名-服務名-編號' },
            { text: 'myproj-web-1     web       Up' },
          ],
        },
      ],
      note: '容器名字會加上專案名前綴和編號，專案名預設是資料夾名稱。程式裡用服務名 redis 連，不要用容器名。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '在這一節的 myproj 專案裡，誰能用 redis:6379 這個名字連到 redis？（選出全部）',
      scene: [
        {
          kind: 'table',
          head: ['在哪裡', '跑在什麼上面'],
          rows: [{ cells: ['web 容器', 'Compose 服務'] }, { cells: ['redis 容器自己', 'Compose 服務'] }, { cells: ['主機（你的終端機）', '你的電腦本身'] }],
        },
      ],
      items: ['web 容器', 'redis 容器自己', '主機（你的終端機）'],
      answer: [0, 1],
      explain: '服務名靠 Docker 網路內建的 DNS 解析，只有接在這個網路上的容器查得到。主機不在這個網路上，查不到 redis 這個名字；要從主機連得靠 ports 發布埠。',
    },
    {
      type: 'pick',
      prompt: 'web 服務的這幾個環境變數裡，哪一個會讓 web 連不到資料庫服務 db？',
      items: ENV,
      answer: [0],
      explain: 'DB_HOST=localhost 指的是 web 容器自己，資料庫在另一個容器裡。改成服務名 DB_HOST=db。',
    },
  ],
  source: '教材 §6.4、§6.10',
  verify: 'K-Line 練習第 8 章：FIRESTORE_EMULATOR_HOST 設成 firestore:8080，塞資料後 /api/latest-prediction 從 404 變成 200。',
};
