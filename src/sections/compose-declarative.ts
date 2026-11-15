import type { Section } from '../core/types';

export const composeDeclarative: Section = {
  id: 'compose-declarative',
  num: '6-1',
  chapter: 6,
  title: '從一長串指令到一份檔案',
  concept: 'Compose 把「想要什麼」寫在一份 compose.yaml，docker compose up 負責把它變成真的；它只管一台主機。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          label: '手動：一步一步下指令',
          lines: [
            { text: '$ docker network create myproj' },
            { text: '$ docker run -d --name db --network myproj \\' },
            { text: '    -e POSTGRES_PASSWORD=dev postgres:17' },
            { text: '$ docker build -t web .' },
            { text: '$ docker run -d --name web --network myproj \\' },
            { text: '    -p 8000:8000 -e DB_HOST=db web' },
          ],
        },
      ],
      note: '真實的應用通常是網頁程式、資料庫、快取一整組。手動要記得先建網路、誰先起、每個要帶哪些旗標，換個人就做不出一樣的環境。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'compose.yaml',
          lines: [
            { text: 'services:' },
            { text: '  web:' },
            { text: '    build: .', tone: 'focus', note: '從 Dockerfile 建' },
            { text: '    ports:' },
            { text: '      - "8000:8000"' },
            { text: '    environment:' },
            { text: '      DB_HOST: db' },
            { text: '  db:' },
            { text: '    image: postgres:17', tone: 'focus', note: '直接用現成 image' },
            { text: '    environment:' },
            { text: '      POSTGRES_PASSWORD: dev' },
          ],
        },
        { kind: 'terminal', lines: [{ text: '$ docker compose up -d', tone: 'good', note: '網路、build、啟動一次做完' }] },
      ],
      note: '同一件事寫成一份檔案：這是宣告式的，你寫要的結果，Compose 去比對現況、補上差的部分。網路也會自動建好。縮排一律用空格，YAML 不接受 Tab。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '網路上常見的舊寫法',
          head: ['舊', '現在'],
          rows: [
            { cells: ['docker-compose（有連字號，V1）', 'docker compose（空格，V2 外掛）'], tone: 'good' },
            { cells: ['開頭寫 version: "3.8"', '不用寫，寫了只會收到警告'], tone: 'good' },
            { cells: ['docker-compose.yml', 'compose.yaml'], tone: 'good' },
          ],
        },
      ],
      note: '教學文章很多還是舊版。V1 的 docker-compose 已經停止維護，現在一律用 docker compose。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'Compose 的範圍',
          nodes: [{ text: 'compose.yaml' }, { text: '一台主機', note: 'web、db、redis', tone: 'good' }],
          links: [{ text: 'docker compose up' }],
        },
        {
          kind: 'flow',
          label: '要分散到多台',
          nodes: [{ text: '3 台主機' }, { text: '編排工具', note: 'Swarm / Kubernetes', tone: 'focus' }],
          links: [{ text: '需要' }],
        },
      ],
      note: 'Compose 擅長在一台主機上管一整組容器，開發機和小型部署都很好用。跨主機排程、故障時搬到別台，是編排工具的工作（第 11 章起）。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: 'docker compose up 回報 YAML 解析錯誤。下面哪一行是問題所在？（⇥ 代表一個 Tab）',
      items: ['services:', '␣␣web:', '␣␣␣␣image: nginx', '⇥ports:', '␣␣␣␣␣␣- "8080:80"'],
      answer: [3],
      explain: 'YAML 的縮排只能用空格，出現 Tab 就解析失敗（found character that cannot start any token）。其他行都是用空格（␣）縮排。',
    },
    {
      type: 'choice',
      prompt: '想把 web、api、db 分散到三台主機上跑，並且某台壞掉時自動移到別台。只用 Compose 夠嗎？',
      options: ['夠，docker compose up 會自動分配', '不夠，要用 Swarm 或 Kubernetes 這類編排工具', '夠，只要寫三份 compose.yaml'],
      answer: 1,
      explain: 'Compose 只管它所在的那一台主機。跨主機排程和故障轉移要交給編排工具。',
    },
  ],
  source: '教材 §6.1、§6.3、§6.5、§6.9、§6.10',
  verify: 'K-Line 練習第 8 章：docker compose -f compose.lab.yaml up -d --build 一次起好後端和 Firestore emulator。',
};
