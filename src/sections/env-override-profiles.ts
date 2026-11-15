import type { Section } from '../core/types';

export const envOverrideProfiles: Section = {
  id: 'env-override-profiles',
  num: '6-5',
  chapter: 6,
  title: '.env、覆寫檔與 profiles',
  concept: '${VAR} 從 .env 取值；-f 疊加多份檔案，docker compose config 看合併結果；profiles 讓某些服務預設不啟動。',
  steps: [
    {
      scene: [
        { kind: 'file', name: '.env', lines: [{ text: 'TAG=1.4', tone: 'focus' }] },
        {
          kind: 'file',
          name: 'compose.yaml',
          lines: [{ text: 'services:' }, { text: '  web:' }, { text: '    image: myapp:${TAG}', tone: 'focus', note: '→ myapp:1.4' }],
        },
      ],
      note: 'Compose 會讀同一個資料夾的 .env，把 ${TAG} 換成 1.4。改版本只要改 .env，不用動 compose.yaml。終端機裡已經設好的同名環境變數會優先於 .env。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.override.yaml',
          lines: [
            { text: 'services:' },
            { text: '  web:' },
            { text: '    ports: ["8000:8000"]', tone: 'focus' },
            { text: '    environment:' },
            { text: '      DEBUG: "1"', tone: 'focus' },
          ],
        },
      ],
      note: '覆寫檔只寫要改的部分。docker compose up 會自動讀 compose.yaml 再疊上 compose.override.yaml，適合放開發機專用的設定。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose -f compose.yaml -f compose.prod.yaml config' },
            { text: 'services:', tone: 'dim' },
            { text: '  web:', tone: 'dim' },
            { text: '    image: myapp:1.4', tone: 'good', note: '變數已代入' },
            { text: '    restart: always', tone: 'good', note: '來自 compose.prod.yaml' },
          ],
        },
      ],
      note: '用 -f 指定多份檔案，後面的疊在前面上面。config 印出最後真正生效的設定，「我以為設了卻沒生效」先跑它。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml',
          lines: [
            { text: '  adminer:' },
            { text: '    image: adminer' },
            { text: '    profiles: [debug]', tone: 'focus', note: '預設不啟動' },
          ],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker compose up -d', note: '只起 web、db' },
            { text: '$ docker compose --profile debug up -d', tone: 'good', note: '連 adminer 一起起' },
          ],
        },
      ],
      note: '除錯工具、測試用的資料庫這類不是每次都要的服務，掛上 profiles。沒指定 profile 時，它們不會啟動。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'compose.yaml 的 web 有 ports: ["8000:8000"]，compose.override.yaml 的 web 有 ports: ["9000:8000"]。docker compose up 之後？',
      options: ['只剩 9000:8000，後面的檔案取代前面的', '兩個埠都發布，ports 這類多值欄位會合併', '啟動失敗'],
      answer: 1,
      explain: 'image 這類單值欄位是後面蓋前面；ports、expose、dns 這類多值欄位則是合併。不確定時跑 docker compose config 看最終結果。真要取代可以用 !override 標記（教材外補充）。',
    },
    {
      type: 'choice',
      prompt: 'adminer 設了 profiles: [debug]。只執行 docker compose up -d，adminer 會啟動嗎？',
      options: ['會', '不會，要加 --profile debug', '只有第一次會'],
      answer: 1,
      explain: '掛了 profiles 的服務預設不啟動，要用 --profile debug（或設 COMPOSE_PROFILES=debug）才會跟著起來。',
    },
  ],
  source: '教材 §6.6 .env、-f 與 config、profiles（多值欄位合併規則與 !override 依現行 Compose 文件補充）',
};
