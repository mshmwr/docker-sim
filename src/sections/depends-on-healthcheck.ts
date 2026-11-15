import type { Section } from '../core/types';

const WEB = ['web:', 'build: .', 'depends_on:', '- db', 'ports:', '- "8000:8000"'];

export const dependsOnHealthcheck: Section = {
  id: 'depends-on-healthcheck',
  num: '6-3',
  chapter: 6,
  title: 'depends_on 只管順序，不管就緒',
  concept: 'depends_on 只保證啟動順序，不保證對方已經能用；要搭配 healthcheck 和 condition: service_healthy。',
  steps: [
    {
      scene: [
        {
          kind: 'timeline',
          label: 'web 只寫 depends_on: [db]',
          events: [
            { at: '0s', text: 'db 容器啟動，資料庫開始初始化' },
            { at: '1s', text: 'web 容器啟動（db 已啟動，條件滿足）' },
            { at: '2s', text: 'web 連 db:5432 → connection refused，啟動失敗', tone: 'bad' },
            { at: '20s', text: 'db 終於可以接受連線', tone: 'dim' },
          ],
        },
      ],
      note: '「容器起來了」不等於「裡面的資料庫準備好了」。簡寫的 depends_on 只等 db 容器啟動就放行 web。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml（db）',
          lines: [
            { text: '  db:' },
            { text: '    image: postgres:17' },
            { text: '    healthcheck:', tone: 'focus' },
            { text: '      test: ["CMD-SHELL", "pg_isready -U postgres"]', note: '怎麼算健康' },
            { text: '      interval: 5s', note: '多久檢查一次' },
            { text: '      retries: 5', note: '連續失敗幾次算 unhealthy' },
            { text: '      start_period: 10s', note: '啟動寬限期' },
          ],
        },
      ],
      note: '先讓 Docker 知道怎麼判斷 db 好了沒。start_period 內的失敗不計入 retries，給慢吞吞的資料庫時間初始化。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml（web）',
          lines: [
            { text: '  web:' },
            { text: '    build: .' },
            { text: '    depends_on:' },
            { text: '      db:', tone: 'good' },
            { text: '        condition: service_healthy', tone: 'good', note: '等到健康才啟動' },
          ],
        },
      ],
      note: '再把 web 的 depends_on 改成完整寫法，條件設成 service_healthy。',
    },
    {
      scene: [
        {
          kind: 'timeline',
          label: '改好之後',
          events: [
            { at: '0s', text: 'db 容器啟動，健康狀態 starting' },
            { at: '20s', text: 'pg_isready 通過，db 變成 healthy', tone: 'good' },
            { at: '20s+', text: 'web 才啟動，第一次連線就成功', tone: 'good' },
          ],
        },
      ],
      note: 'healthcheck 本身只會標記狀態、不會重啟容器。會照它行動的是 Compose 的 condition、編排工具這類上層。程式裡加上連線重試，仍然是好習慣。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'web 只寫了 depends_on: [db]。db 要 20 秒才能接受連線，web 一啟動就連資料庫且不重試。結果？',
      options: ['web 會等 db 準備好才連', 'web 連線失敗', 'Compose 會自動重試到成功'],
      answer: 1,
      explain: '簡寫的 depends_on 只保證 db 容器先啟動。web 啟動時資料庫還在初始化，連線被拒。',
    },
    {
      type: 'pick',
      prompt: '要讓 web 等到 db 健康才啟動（db 已經有 healthcheck），要改 web 的哪一行？',
      items: WEB,
      answer: [3],
      explain: '把 - db 這種簡寫改成 db: 底下加 condition: service_healthy。簡寫的意思是 service_started，只等容器啟動。',
    },
  ],
  source: '教材 §6.2、§6.6 healthcheck',
  verify: "K-Line 練習第 7 章 7-D：docker run --health-cmd 'exit 1' 後，docker inspect 看到 unhealthy。",
};
