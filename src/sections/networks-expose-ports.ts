import type { Section } from '../core/types';

export const networksExposePorts: Section = {
  id: 'networks-expose-ports',
  num: '6-4',
  chapter: 6,
  title: '分網路，資料庫不要對外',
  concept: '用 frontend、backend 兩個網路切開誰能跟誰說話；ports 才是在主機上開門，資料庫通常不需要 ports。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml',
          lines: [
            { text: 'services:' },
            { text: '  proxy:' },
            { text: '    ports: ["443:443"]', note: '唯一對外的門' },
            { text: '    networks: [frontend]', tone: 'focus' },
            { text: '  web:' },
            { text: '    networks: [frontend, backend]', tone: 'focus', note: '兩邊都接' },
            { text: '  db:' },
            { text: '    networks: [backend]', tone: 'focus', note: '沒有 ports' },
            { text: 'networks:' },
            { text: '  frontend:' },
            { text: '  backend:' },
          ],
        },
      ],
      note: '預設所有服務都在同一個網路上，誰都連得到誰。把它拆成兩個：proxy 只在 frontend，db 只在 backend，web 兩邊都接，負責中轉。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '一般的請求路線',
          nodes: [{ text: '外部使用者' }, { text: 'proxy' }, { text: 'web' }, { text: 'db', tone: 'good' }],
          links: [{ text: ':443' }, { text: 'frontend' }, { text: 'backend' }],
        },
        {
          kind: 'flow',
          label: 'proxy 直接連 db',
          nodes: [{ text: 'proxy' }, { text: 'db', tone: 'dim' }],
          links: [{ text: '✗ 不在同一個網路', tone: 'bad' }],
        },
      ],
      note: '就算 proxy 被攻破，它也碰不到資料庫，中間還隔著 web。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['寫法', '作用'],
          rows: [
            { cells: ['expose: ["5432"]', '只是宣告，跟 Dockerfile 的 EXPOSE 一樣，不開任何門'] },
            { cells: ['ports: ["5432:5432"]', '把容器埠綁到主機的網路介面上，主機外面也連得到'], tone: 'bad' },
            { cells: ['ports: ["127.0.0.1:5432:5432"]', '只綁主機的 127.0.0.1，只有主機自己連得到'], tone: 'good' },
          ],
        },
      ],
      note: '同一個網路上的容器本來就互通，不需要 ports。ports 是給主機和主機外面用的。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'db 寫了 ports: "5432:5432"',
          nodes: [{ text: '同一個 Wi-Fi 的陌生人' }, { text: '主機 0.0.0.0:5432' }, { text: 'db', tone: 'bad' }],
          links: [{ text: '連得到', tone: 'bad' }, {}],
        },
        {
          kind: 'flow',
          label: '改成 "127.0.0.1:5432:5432"',
          nodes: [{ text: '同一個 Wi-Fi 的陌生人' }, { text: '主機 127.0.0.1:5432' }],
          links: [{ text: '✗', tone: 'bad' }],
        },
      ],
      note: '只寫 5432:5432 會綁在主機的所有介面上。開發時想用本機工具連資料庫，就綁 127.0.0.1；上線時資料庫乾脆不要 ports。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '用這一節的 compose.yaml（db 沒有 ports），誰能連到 db 的 5432？（選出全部）',
      scene: [
        {
          kind: 'table',
          head: ['服務', 'frontend', 'backend'],
          rows: [{ cells: ['proxy', '✓', ''] }, { cells: ['web', '✓', '✓'] }, { cells: ['db', '', '✓'] }],
        },
      ],
      items: ['proxy', 'web', '外部使用者'],
      answer: [1],
      explain: '只有和 db 同在 backend 網路的 web 連得到。proxy 只在 frontend；外部使用者只能從 proxy 的 443 進來，db 沒有發布任何埠。',
    },
    {
      type: 'choice',
      prompt: 'db 沒寫 expose。和它在同一個網路上的 web，能連到 db 的 5432 嗎？',
      options: ['不能，要先 expose 5432', '能，同一個網路上的容器本來就互通', '要加 ports 才行'],
      answer: 1,
      explain: 'expose 不是存取控制，同一個網路上的容器能連到對方任何正在聽的埠。真正擋得住的是「不在同一個網路」（教材外補充）。',
    },
  ],
  source: '教材 §6.6 networks、expose 與 ports（expose 不做存取控制為教材外補充）',
  verify: 'K-Line 練習第 8 章：emulator 綁在 127.0.0.1:8080:8080，拿掉 127.0.0.1 同網段的人就能讀寫。',
};
