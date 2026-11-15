import type { Section } from '../core/types';

export const composeLifecycle: Section = {
  id: 'compose-lifecycle',
  num: '6-6',
  chapter: 6,
  title: 'down 與 down -v、--scale',
  concept: 'down 移除容器和網路，但留著具名 volume；down -v 連 volume 一起刪；寫死主機埠的服務不能 --scale。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml',
          lines: [
            { text: 'services:' },
            { text: '  web:' },
            { text: '    build: .', note: 'Flask 計數器' },
            { text: '    ports: ["8000:8000"]', tone: 'focus' },
            { text: '  redis:' },
            { text: '    image: redis:7' },
            { text: '    volumes: [redisdata:/data]', tone: 'good', note: '資料放在 volume' },
            { text: 'volumes:' },
            { text: '  redisdata:' },
          ],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose up -d' },
            { text: '$ curl localhost:8000', note: '重新整理幾次' },
            { text: '這個頁面被看了 5 次', tone: 'good' },
          ],
        },
      ],
      note: '經典的 Flask + Redis 計數器：每次打開頁面，Redis 裡的數字加一。Redis 的資料存在具名 volume redisdata。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose down', note: '移除容器、網路' },
            { text: '$ docker compose up -d' },
            { text: '$ curl localhost:8000' },
            { text: '這個頁面被看了 6 次', tone: 'good', note: '接著算' },
          ],
        },
      ],
      note: 'down 把容器和網路都移除了，但 volume 還在。新的 redis 容器掛上同一個 volume，數字接著上次繼續。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose down -v', tone: 'bad', note: '連 volume 一起刪' },
            { text: '$ docker compose up -d' },
            { text: '$ curl localhost:8000' },
            { text: '這個頁面被看了 1 次', tone: 'bad', note: '從頭開始' },
          ],
        },
      ],
      note: '-v 會把 compose.yaml 宣告的具名 volume 和匿名 volume 一起刪掉，資料就沒了。資料庫在跑的專案，下 -v 之前先想三秒。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose up -d --scale web=3' },
            { text: 'Container myproj-web-1  Started', tone: 'good' },
            { text: 'Error response from daemon: … Bind for 0.0.0.0:8000 failed:', tone: 'bad' },
            { text: 'port is already allocated', tone: 'bad' },
          ],
        },
      ],
      note: '--scale 一次開好幾份同一個服務。但 web 寫死了主機的 8000，第一份佔走之後，第二份就綁不上。要擴展的服務別寫死主機埠，前面放一個負載平衡器。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '計數器到了 5，執行 docker compose down -v 再 up -d，打開頁面會顯示幾次？',
      options: ['6 次', '1 次', '5 次'],
      answer: 1,
      explain: 'down -v 把存著計數的 volume 刪了，新的 redis 是空的，重新從 1 開始。只用 down 的話會顯示 6。',
    },
    {
      type: 'choice',
      prompt: 'web 寫了 ports: ["8000:8000"]，執行 docker compose up -d --scale web=2。結果？',
      options: ['兩份都起來，Compose 會自動錯開埠', '第二份因為主機的 8000 已被佔用而失敗', '兩份共用 8000，自動分流'],
      answer: 1,
      explain: '主機的一個埠只能給一個容器。第二份 web 要綁同一個 8000，會出現 port is already allocated。',
    },
  ],
  source: '教材 §6.7、§6.8（down 與 down -v 為教材範例）',
  verify: 'K-Line 練習第 8 章收尾：docker compose -f compose.lab.yaml down -v。',
};
