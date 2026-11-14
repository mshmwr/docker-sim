import type { Section } from '../core/types';

const STATES = ['created', 'running', 'exited', '（已刪除）'];

export const lifecycleStopKill: Section = {
  id: 'lifecycle-stop-kill',
  num: '3-4',
  chapter: 3,
  title: '主程式決定生死：stop vs kill',
  concept: '容器活多久，由裡面的主程式（PID 1）決定；stop 給它收尾的時間，kill 不給。',
  steps: [
    {
      scene: [{ kind: 'states', label: '容器的狀態', states: STATES, current: null }],
      note: '一個容器從建立到刪除，主線會經過這幾個狀態（刪除後就不在列表裡了）。關鍵問題是：什麼時候從 running 變成 exited？',
    },
    {
      scene: [
        { kind: 'states', states: STATES, current: 'exited' },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d ubuntu' },
            { text: '3f2a9c1e7b44…', tone: 'dim' },
            { text: '$ docker ps -a' },
            { text: 'IMAGE    STATUS', tone: 'dim' },
            { text: 'ubuntu   Exited (0) 2 seconds ago', tone: 'bad' },
          ],
        },
      ],
      note: 'ubuntu image 的主程式是 bash。在背景跑、沒有終端機可以讀指令，bash 立刻結束，容器也跟著 Exited。',
    },
    {
      scene: [
        { kind: 'states', states: STATES, current: 'running' },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d nginx' },
            { text: '$ docker ps' },
            { text: 'IMAGE   STATUS', tone: 'dim' },
            { text: 'nginx   Up 5 seconds', tone: 'good' },
          ],
        },
      ],
      note: 'nginx 的主程式是長駐的伺服器，只要它不結束，容器就一直 running。容器不是 VM，沒有「開機」，主程式就是它的命。',
    },
    {
      scene: [
        {
          kind: 'timeline',
          label: 'docker stop',
          events: [
            { at: '0 秒', text: '送 SIGTERM 給 PID 1', tone: 'focus' },
            { at: '0～10 秒', text: '程式收尾：寫完資料、關連線', tone: 'good' },
            { at: '10 秒', text: '還沒結束？送 SIGKILL 強制終止', tone: 'bad' },
          ],
        },
      ],
      note: 'stop 先禮後兵：先送 SIGTERM 讓程式自己收尾，預設等 10 秒（可用 -t 調整），時間到還沒結束才強制終止。',
    },
    {
      scene: [
        {
          kind: 'timeline',
          label: 'docker kill',
          events: [{ at: '0 秒', text: '直接送 SIGKILL，程式來不及做任何事', tone: 'bad' }],
        },
      ],
      note: 'kill 跳過收尾直接送 SIGKILL。資料庫這類需要把資料寫回硬碟的程式，被 kill 可能留下損壞的檔案。',
    },
    {
      scene: [
        { kind: 'states', states: STATES, current: '（已刪除）' },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker start web   # exited → running' },
            { text: '$ docker stop web    # running → exited' },
            { text: '$ docker rm web      # exited → 刪除', tone: 'focus' },
          ],
        },
      ],
      note: 'exited 不等於刪除：容器還在，可寫層的資料也還在，可以再 start。要 docker rm 才真的消失。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '執行完下面這行後，馬上下 docker ps（不加 -a），會看到這個容器嗎？',
      scene: [{ kind: 'terminal', lines: [{ text: '$ docker run -d ubuntu' }] }],
      options: ['會，狀態是 Up', '不會，它已經 Exited，要加 -a 才看得到', '不會，背景執行的容器不會列出來'],
      answer: 1,
      explain: 'bash 沒有輸入就立刻結束，主程式一結束容器就 Exited。docker ps 只列 running 的容器，加 -a 才會列出所有容器。',
    },
    {
      type: 'choice',
      prompt: '資料庫容器要停機維護，應該用哪個指令？',
      options: ['docker stop db', 'docker kill db', 'docker rm -f db'],
      answer: 0,
      explain: 'stop 先送 SIGTERM，給資料庫時間把資料寫回硬碟再結束。kill 和 rm -f 都直接送 SIGKILL，有資料損壞的風險。',
    },
    {
      type: 'order',
      prompt: '依時間順序排出 docker stop 會發生的事：',
      items: ['送 SIGTERM 給 PID 1', '寬限期內程式自己收尾（預設 10 秒）', '仍未結束就送 SIGKILL'],
      explain: '先禮後兵：SIGTERM → 寬限期內收尾 → SIGKILL。程式在寬限期內結束就不會走到最後一步。',
    },
  ],
  source: '教材 §3.1、§3.6（10 秒寬限期為教材外補充）',
};
