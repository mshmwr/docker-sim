import type { Section } from '../core/types';

const WRONG = ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY . .', 'RUN pip install -r requirements.txt'];
const RIGHT = ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY . .'];

export const layerCache: Section = {
  id: 'layer-cache',
  num: '4-4',
  chapter: 4,
  title: '層快取黃金守則',
  concept: '快取由上往下比對，一層失效、下面全部重做；所以常變的東西放越下面越好。',
  steps: [
    {
      scene: [{ kind: 'file', name: 'Dockerfile', lines: WRONG.map((text) => ({ text })) }],
      note: 'Dockerfile 每個指令對應一個建置步驟（RUN、COPY 這類會產生檔案層）。重新 build 時，Docker 從第一行往下檢查：這一層的輸入有沒有變？沒變就直接用快取。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '改了 app.py 之後重新 build',
          items: [
            { text: 'FROM python:3.12-slim', tone: 'good', note: '快取' },
            { text: 'WORKDIR /app', tone: 'good', note: '快取' },
            { text: 'COPY . .', tone: 'bad', note: '檔案變了 → 重做' },
            { text: 'RUN pip install -r requirements.txt', tone: 'bad', note: '上一層變了 → 跟著重做' },
          ],
        },
      ],
      note: '只改了一行程式碼，COPY . . 的內容變了，這層失效。它下面的 pip install 也跟著重做，即使套件清單根本沒變。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: RIGHT.map((text, i) => ({ text, tone: i === 2 || i === 4 ? 'focus' : undefined })),
        },
      ],
      note: '調換順序：先只複製 requirements.txt、裝套件，最後才複製全部程式碼。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '同樣改了 app.py',
          items: [
            { text: 'FROM python:3.12-slim', tone: 'good', note: '快取' },
            { text: 'WORKDIR /app', tone: 'good', note: '快取' },
            { text: 'COPY requirements.txt .', tone: 'good', note: '快取' },
            { text: 'RUN pip install -r requirements.txt', tone: 'good', note: '快取' },
            { text: 'COPY . .', tone: 'bad', note: '重做（只有這層）' },
          ],
        },
      ],
      note: 'requirements.txt 沒變，裝套件那層整個走快取。最慢的步驟被保住，只重做最後一層複製。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker build -t app .' },
            { text: '=> CACHED [2/5] WORKDIR /app', tone: 'good' },
            { text: '=> CACHED [3/5] COPY requirements.txt .', tone: 'good' },
            { text: '=> CACHED [4/5] RUN pip install -r requirements.txt', tone: 'good' },
            { text: '=> [5/5] COPY . .', tone: 'bad' },
          ],
        },
      ],
      note: 'build 的輸出會直接告訴你哪幾層走了快取（CACHED）。教材裡的「Using cache」是舊版 builder 的輸出，現在預設的 BuildKit 顯示 CACHED。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: [
            { text: 'RUN apt-get update', tone: 'bad', note: '指令字串不變 → 永遠用舊快取' },
            { text: 'RUN apt-get install -y curl' },
            { text: '' },
            { text: 'RUN apt-get update && apt-get install -y curl', tone: 'good', note: '寫在同一個 RUN' },
          ],
        },
      ],
      note: '陷阱：RUN 的快取只看指令字串，不看外面的世界。單獨一行 apt-get update 會一直用舊的套件清單，所以要和 install 寫在同一個 RUN。真的要全部重來就用 docker build --no-cache。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '用這份 Dockerfile，只改了 app.py 重新 build。哪幾層會重做？（選出全部）',
      items: WRONG,
      answer: [2, 3],
      explain: 'COPY . . 帶進了改過的 app.py，這層失效；它下面的 pip install 跟著重做。上面兩層的輸入沒變，走快取。',
    },
    {
      type: 'order',
      prompt: '依「改程式碼時重建最少」的順序排出 Dockerfile：',
      items: RIGHT,
      explain: '越少變動的放越上面：基底 → 工作目錄 → 套件清單 → 裝套件 → 程式碼。',
    },
    {
      type: 'choice',
      prompt: 'Dockerfile 裡單獨一行 RUN apt-get update。三個月後重新 build（沒有加 --no-cache），它會去抓新的套件清單嗎？',
      options: ['會，RUN 每次都會重新執行', '不會，指令字串沒變就用快取，清單停在三個月前', '看網路有沒有通'],
      answer: 1,
      explain: 'RUN 的快取以指令字串比對，不知道外面的套件更新了。把 update 和 install 寫在同一個 RUN，改 install 清單時 update 也會一起重跑。',
    },
  ],
  source: '教材 §4.5、§5.3',
  verify: 'K-Line 練習 ch4 4-B：改一行程式碼後重新 build，看哪幾層顯示 CACHED。',
};
