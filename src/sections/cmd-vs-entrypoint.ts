import type { Section } from '../core/types';

export const cmdVsEntrypoint: Section = {
  id: 'cmd-vs-entrypoint',
  num: '4-2',
  chapter: 4,
  title: 'CMD vs ENTRYPOINT',
  concept: 'docker run 在 image 名稱後面接的東西，會整個取代 CMD，但會接在 ENTRYPOINT 後面當參數。',
  steps: [
    {
      scene: [
        { kind: 'file', name: 'Dockerfile', lines: [{ text: 'FROM alpine' }, { text: 'CMD ["ping", "localhost"]', tone: 'focus' }] },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run img', note: '用預設的 CMD' },
            { text: '→ ping localhost', tone: 'good' },
            { text: '$ docker run img ping 8.8.8.8', note: '後面的字整個取代 CMD' },
            { text: '→ ping 8.8.8.8', tone: 'good' },
          ],
        },
      ],
      note: '只有 CMD 時，它就是一個可以被換掉的預設指令。docker run 後面接什麼，就整個換成什麼。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: [{ text: 'FROM alpine' }, { text: 'ENTRYPOINT ["ping"]', tone: 'good', note: '固定的主功能' }, { text: 'CMD ["localhost"]', tone: 'focus', note: '預設參數' }],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run img' },
            { text: '→ ping localhost', tone: 'good' },
            { text: '$ docker run img 8.8.8.8', note: '8.8.8.8 取代 CMD' },
            { text: '→ ping 8.8.8.8', tone: 'good', note: '接在 ENTRYPOINT 後面' },
          ],
        },
      ],
      note: '兩個一起用時，ENTRYPOINT 是「這台機器是做什麼的」，CMD 是「預設給它的參數」。run 後面接的字只換掉 CMD，ENTRYPOINT 留著。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: [
            { text: 'FROM ubuntu:24.04' },
            { text: 'RUN apt-get update && apt-get install -y cowsay' },
            { text: 'ENTRYPOINT ["/usr/games/cowsay"]', tone: 'good' },
            { text: 'CMD ["Docker is so awesome!"]', tone: 'focus' },
          ],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run cowsay "Hello"' },
            { text: ' _______' },
            { text: '< Hello >', tone: 'good', note: '牛改說你給的話' },
            { text: ' -------' },
            { text: '        \\   ^__^' },
            { text: '         \\  (oo)\\_______' },
          ],
        },
      ],
      note: '經典的 cowsay：不給參數，牛說 CMD 那句；給了 "Hello"，牛改說 Hello。你只能改牠說什麼，牠還是那隻牛。真要換掉 ENTRYPOINT，得明確寫 docker run --entrypoint（教材外補充）。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['寫法', '例子', '誰是 PID 1'],
          rows: [
            { cells: ['exec 形式', 'CMD ["python", "app.py"]', 'python 本身，收得到 SIGTERM'], tone: 'good' },
            { cells: ['shell 形式', 'CMD python app.py', '外面多包一層 /bin/sh -c，訊號可能傳不進去'], tone: 'bad' },
          ],
        },
      ],
      note: '兩種指令都優先用 JSON 陣列的 exec 形式。shell 形式會包一層 /bin/sh -c，主程式不一定是 PID 1，docker stop 送的 SIGTERM 可能傳不到它，只能等 10 秒後被 SIGKILL（3-4 講過）。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'Dockerfile 是 FROM alpine 加上一行 ENTRYPOINT ["echo", "hi"]。執行 docker run img bye，會印出什麼？',
      options: ['bye', 'hi bye', 'hi'],
      answer: 1,
      explain: 'run 後面的 bye 會接在 ENTRYPOINT 後面，實際執行的是 echo hi bye。',
    },
    {
      type: 'choice',
      prompt: 'Dockerfile 是 FROM alpine 加上一行 CMD ["echo", "hi"]。執行 docker run img bye，結果？',
      options: ['印出 hi bye', '印出 bye', '報錯：找不到 bye 這個執行檔'],
      answer: 2,
      explain: '後面的 bye 整個取代 CMD，Docker 試著執行一個叫 bye 的程式，找不到就報 executable file not found。',
    },
  ],
  source: '教材 §4.3（--entrypoint 旗標為教材外補充）',
};
