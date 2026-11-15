import type { Section } from '../core/types';

const CMD = ['docker', 'run', '-d', '--rm', '--name', 'tmp', '-p', '8080:80', 'nginx'];

export const runFlags: Section = {
  id: 'run-flags',
  num: '3-1',
  chapter: 3,
  title: 'docker run 常用旗標',
  concept: '容器的生命跟它的主程式綁在一起；-d、-it、--name、-p、--rm、--restart、-m 決定它怎麼跑、怎麼收。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          label: '-it：進到容器裡面',
          lines: [
            { text: '$ docker run -it ubuntu bash' },
            { text: 'root@3f2a1b4c5d6e:/# ls', tone: 'focus', note: '主機名稱就是容器 ID' },
            { text: 'bin  etc  home  usr  var …', tone: 'dim' },
            { text: 'root@3f2a1b4c5d6e:/# exit' },
            { text: '$ docker ps -a' },
            { text: 'ubuntu   "bash"   Exited (0) 2 seconds ago', tone: 'bad' },
          ],
        },
      ],
      note: '-i 讓容器收得到鍵盤，-t 給一個像樣的終端機，兩個一起用才能在裡面打指令。這個容器的主程式是 bash，所以 exit 一離開，bash 結束，容器也停了。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['跑法', '適合'],
          rows: [
            { cells: ['前景（不加 -d）', '想看即時輸出、跑一次就結束的指令。Ctrl+C 通常會連容器一起停'] },
            { cells: ['背景（-d）', '網站、資料庫這類會一直待著的服務'], tone: 'good' },
          ],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d --name web -p 8080:80 nginx' },
            { text: '9c1e7a3b5d…', tone: 'dim', note: '馬上回傳容器 ID，終端機還給你' },
          ],
        },
      ],
      note: 'docker run ubuntu ls 印完就停，docker run nginx 會一直活著，差別只在主程式會不會自己結束。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run --rm alpine echo hi' },
            { text: 'hi' },
            { text: '$ docker ps -a | grep alpine' },
            { text: '（什麼都沒有）', tone: 'good', note: '一停就自動刪掉' },
          ],
        },
      ],
      note: '--rm 讓容器一停就自動刪除，測一下就丟的容器加上它，ps -a 才不會堆一堆殭屍。教材說它不能和 -d 並用，那是舊限制：Docker 1.13 起已經可以一起用。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '--restart：容器停了要不要自己爬起來',
          head: ['策略', '行為'],
          rows: [
            { cells: ['no（預設）', '不重啟'] },
            { cells: ['on-failure[:5]', '退出碼不是 0 才重啟，可設次數上限'] },
            { cells: ['always', '怎麼結束都重啟。手動 stop 的暫時不起，dockerd 重啟後會再起來'], tone: 'good' },
          ],
        },
        {
          kind: 'table',
          label: '資源上限',
          head: ['旗標', '作用'],
          rows: [
            { cells: ['-m 512m', '記憶體上限'] },
            { cells: ['--cpus 1.0', 'CPU 上限'] },
          ],
        },
      ],
      note: '正式服務常加 --restart always。沒設 -m，容器理論上能吃光整台主機的記憶體，正式環境記得設上限。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '已經有一個叫 web 的容器（就算它停了）。再執行一次 docker run -d --name web nginx，會怎樣？',
      options: ['自動把舊的 web 換掉', '報錯：名稱已被使用', '多開一個也叫 web 的容器'],
      answer: 1,
      explain: '容器名稱不能重複，停掉的容器也還佔著名字。先 docker rm web，或換個名字。',
    },
    {
      type: 'pick',
      prompt: '這行指令裡，哪個旗標讓容器一停就自動刪除？',
      items: CMD,
      answer: [3],
      explain: '--rm 讓容器停止後自動刪除。它和 -d 一起用沒問題（Docker 1.13 起）。',
    },
  ],
  source: '教材 §3.1、§3.2（教材說 --rm 不能和 -d 並用，Docker 1.13 起已可並用；always 遇手動 stop 的行為為教材外補充）',
  verify: 'K-Line 練習第 2 章：docker run -d --name kline --platform linux/amd64 -p 8000:8000 kline-lab:v1。',
};
