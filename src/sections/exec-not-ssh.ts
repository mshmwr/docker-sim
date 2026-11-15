import type { Section } from '../core/types';

export const execNotSsh: Section = {
  id: 'exec-not-ssh',
  num: '3-3',
  chapter: 3,
  title: '進容器用 exec，不用 SSH',
  concept: 'docker exec 在跑著的容器裡多開一個 process；離開它不影響主程式。不要用 attach，更不要在容器裡裝 SSH。',
  steps: [
    {
      scene: [
        {
          kind: 'layers',
          label: 'web 容器裡的 process',
          items: [
            { text: 'nginx（主程式）', note: '它結束，容器就停', tone: 'focus' },
            { text: 'bash', note: 'docker exec 多開的', tone: 'good' },
          ],
        },
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker exec -it web bash' },
            { text: 'root@9c1e7a3b5d:/# ls /usr/share/nginx/html' },
            { text: '50x.html  index.html', tone: 'dim' },
          ],
        },
      ],
      note: 'exec 在已經在跑的容器裡，旁邊多開一個 bash 給你。容器裡原本的主程式 nginx 照跑不誤。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: 'root@9c1e7a3b5d:/# exit' },
            { text: '$ docker ps' },
            { text: 'nginx   Up 10 minutes   web', tone: 'good', note: '容器還活著' },
          ],
        },
      ],
      note: 'exit 結束的只是你多開的那個 bash，不是容器的主程式，所以容器不會停。對照 3-1：run -it ubuntu bash 的 bash 就是主程式，exit 才會讓容器停。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'docker attach web',
          nodes: [
            { text: '你的終端機' },
            { text: '主程式的輸入輸出', tone: 'focus' },
            { text: '容器停了', tone: 'bad' },
          ],
          links: [{ text: '直接接上' }, { text: '手殘按 Ctrl+C', tone: 'bad' }],
        },
      ],
      note: 'attach 不是多開一個 process，而是直接接到主程式身上。一按 Ctrl+C 很容易把主程式一起殺掉，整個容器就停了。要進容器操作，一律用 exec。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '在容器裡裝 SSH 再連進去？',
          head: ['代價', '原因'],
          rows: [
            { cells: ['image 變肥', '多裝一個 openssh-server'], tone: 'bad' },
            { cells: ['多跑一個服務', '一個容器一個主程式的原則破功'], tone: 'bad' },
            { cells: ['攻擊面變大', '多開一個 SSH 埠就是多一個入口'], tone: 'bad' },
          ],
        },
      ],
      note: '這是把容器當 VM 用，完全搞錯方向。主機上已經有 docker exec，不需要另一條路。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '在 docker exec -it web bash 開的 shell 裡輸入 exit，web 容器會怎樣？',
      options: ['停止，因為你離開了容器', '繼續跑，主程式 nginx 還在', '被刪除'],
      answer: 1,
      explain: 'exec 開的 bash 只是旁邊多出來的 process。容器的生死只看主程式，nginx 還在跑，容器就還活著。',
    },
    {
      type: 'choice',
      prompt: '想看正在跑的 nginx 容器裡的設定檔，最合適的做法是？',
      options: ['在容器裡裝 openssh-server，再 ssh 進去', 'docker exec -it web sh', 'docker attach web'],
      answer: 1,
      explain: 'exec 安全又直觀。裝 SSH 會讓 image 變肥、攻擊面變大；attach 接的是主程式，Ctrl+C 可能把容器停掉。',
    },
  ],
  source: '教材 §3.5',
  verify: "K-Line 練習第 2 章：docker exec kline sh -c 'id; ls /app'，會看到容器內是 root。",
};
