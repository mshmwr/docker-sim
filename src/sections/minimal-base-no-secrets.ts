import type { Section } from '../core/types';

const LEAKY = ['FROM python:3.12-slim', 'WORKDIR /app', 'ENV API_KEY=abc123', 'COPY . .', 'RUN rm -f .env', 'CMD ["python", "app.py"]'];

export const minimalBaseNoSecrets: Section = {
  id: 'minimal-base-no-secrets',
  num: '22-2',
  chapter: 22,
  title: '從源頭減少風險：小基底、機密不進 image',
  concept: 'image 裡的東西越少，能被利用的就越少；寫進 image 的機密，拿到 image 的人都看得到。',
  steps: [
    {
      scene: [
        {
          kind: 'table',
          label: '同一個 Python 程式的三種基底（大小為約略值，隨版本變動）',
          head: ['基底', '大小', '裡面有什麼'],
          rows: [
            { cells: ['python:3.12', '約 1 GB', 'shell、apt、編譯器、大量工具'], tone: 'bad' },
            { cells: ['python:3.12-slim', '約 150 MB', 'shell、apt，少了編譯工具'] },
            { cells: ['distroless', '約 50 MB', '只有執行程式需要的檔案，沒有 shell'], tone: 'good' },
          ],
        },
      ],
      note: '每多一個套件就多一份可能的漏洞。攻擊者進到容器後，沒有 shell、沒有 apt，能做的事也少很多。',
    },
    {
      scene: [{ kind: 'file', name: 'Dockerfile', lines: LEAKY.map((text, i) => ({ text, tone: i === 2 ? 'bad' : undefined })) }],
      note: '再看機密。把 API 金鑰用 ENV 寫在 Dockerfile 裡，它會成為 image 設定的一部分，跟著 image 走到哪裡都在。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker history --no-trunc leak | grep abc123' },
            { text: 'ENV API_KEY=abc123', tone: 'bad' },
            { text: "$ docker inspect leak --format '{{.Config.Env}}'" },
            { text: '[PATH=… API_KEY=abc123]', tone: 'bad' },
          ],
        },
      ],
      note: '任何拿到這個 image 的人，一行指令就能撈出金鑰。之後刪掉那行重新 build，也收不回已經推出去的舊 image。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: 'COPY . . 時目錄裡有 .env',
          items: [
            { text: 'COPY . .', tone: 'bad', note: '.env 被寫進這一層' },
            { text: 'RUN rm -f .env', tone: 'dim', note: '只在新的一層標記刪除' },
          ],
        },
        { kind: 'file', name: '.dockerignore', lines: [{ text: '.env', tone: 'good' }, { text: '**/.env', tone: 'good' }] },
      ],
      note: '檔案也一樣。.env 被 COPY 進某一層後，後面的 rm 只是在新的一層蓋掉它，舊層裡的檔案還在。正解是用 .dockerignore 讓它一開始就進不來。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d --name app1 -e API_KEY=abc123 app' },
            { text: '$ docker history --no-trunc app | grep abc123' },
            { text: '（沒有結果）', tone: 'good' },
            { text: "$ docker inspect app1 --format '{{.Config.Env}}'" },
            { text: '[PATH=… API_KEY=abc123]', tone: 'bad' },
          ],
        },
      ],
      note: '改成執行時用 -e 注入，image 本身就乾淨了。但這不是保密：能下 docker 指令的人照樣看得到。更好的做法是 Docker secrets 這類專門的機密管理。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '建置目錄裡有 .env，而且沒有 .dockerignore。這份 Dockerfile 中，哪幾行讓機密留在 image 裡？（選出全部）',
      items: LEAKY,
      answer: [2, 3],
      explain: 'ENV 把金鑰寫進 image 設定；COPY . . 把 .env 寫進一層。RUN rm 只在新的一層蓋掉檔案，舊層裡還在，所以救不回來。',
    },
    {
      type: 'choice',
      prompt: '用 docker run -e JWT_SECRET=s3cret 啟動容器後，執行 docker inspect 看得到 s3cret 嗎？',
      options: ['看不到，-e 的值只存在記憶體裡', '看得到，明文列在 Config.Env 裡', '看不到，Docker 會自動遮蔽 SECRET 結尾的變數'],
      answer: 1,
      explain: '-e 注入的值以明文存在容器設定裡，任何能下 docker 指令的人都看得到。它比寫進 image 好，但不是保密機制。',
    },
  ],
  source: '教材 §22.4',
  verify: 'K-Line 練習 ch6 6-A～6-C：用 docker history 與 docker inspect 檢查機密有沒有進到 image。',
};
