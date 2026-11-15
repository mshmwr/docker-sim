import type { Section } from '../core/types';

export const observeContainers: Section = {
  id: 'observe-containers',
  num: '3-2',
  chapter: 3,
  title: '看容器在做什麼',
  concept: 'ps -a 看全部容器、logs 看它印了什麼、stats 看資源、inspect -f 撈單一欄位、port 查埠對應。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run --name job ubuntu ls' },
            { text: '$ docker ps' },
            { text: 'CONTAINER ID   IMAGE   STATUS   NAMES', tone: 'dim' },
            { text: '（空的）', tone: 'bad', note: '「我的容器不見了！」' },
            { text: '$ docker ps -a' },
            { text: 'a1b2c3   ubuntu   Exited (0) 5 seconds ago   job', tone: 'good' },
          ],
        },
      ],
      note: 'docker ps 只列正在跑的。主程式 ls 印完就結束，容器已經停了，要加 -a 才看得到。這是初學者最常問的「容器不見了」。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker logs -f web' },
            { text: '172.17.0.1 - "GET / HTTP/1.1" 200', tone: 'dim' },
            { text: '172.17.0.1 - "GET /favicon.ico HTTP/1.1" 404', tone: 'dim' },
            { text: '…（持續滾動）', tone: 'focus' },
          ],
        },
      ],
      note: 'logs 是除錯第一站：容器起不來、壞掉，先看它印了什麼。-f 即時跟著看，--tail 50 只看最後 50 行，--since 10m 只看最近 10 分鐘。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker stats --no-stream' },
            { text: 'NAME   CPU %   MEM USAGE / LIMIT', tone: 'dim' },
            { text: 'web    0.01%   8MiB / 512MiB', tone: 'good', note: '有設 -m 512m' },
            { text: 'db     2.30%   300MiB / 15.6GiB', tone: 'bad', note: '沒設上限：LIMIT 是整台主機' },
          ],
        },
      ],
      note: 'stats 看每個容器吃多少 CPU、記憶體。LIMIT 顯示整台主機的記憶體，代表這個容器沒設上限，理論上能吃光整台機器。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker inspect web', note: '一大包 JSON' },
            { text: "$ docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web" },
            { text: '172.17.0.2', tone: 'good' },
            { text: '$ docker port web 80' },
            { text: '0.0.0.0:8080', tone: 'good', note: '容器 80 → 主機 8080' },
          ],
        },
      ],
      note: 'inspect 把容器的完整設定倒成 JSON，搭 -f 只挑要的欄位。port 查某個容器埠被接到主機哪個埠，用隨機埠的時候特別好用。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '執行 docker run --name job ubuntu ls 之後，馬上打 docker ps。看得到 job 嗎？',
      options: ['看得到，狀態是 Up', '看不到，它已經結束，要用 docker ps -a', '看不到，它已經被自動刪除'],
      answer: 1,
      explain: '主程式 ls 印完就結束，容器變成 Exited。docker ps 只列正在跑的，要 -a 才看得到。沒加 --rm，所以它還在。',
    },
    {
      type: 'choice',
      prompt: '容器一啟動就馬上停掉，第一個該下的指令是？',
      options: ['docker inspect <容器>', 'docker logs <容器>', 'docker stats'],
      answer: 1,
      explain: '先看容器印了什麼，九成的線索都在 log 裡（設定錯、找不到檔案、埠被佔用…）。stats 只看得到正在跑的容器。',
    },
  ],
  source: '教材 §3.4',
  verify: 'K-Line 練習第 2 章：docker stats --no-stream kline、docker logs kline。',
};
