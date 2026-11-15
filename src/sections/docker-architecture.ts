import type { Section } from '../core/types';

const CHAIN = [
  { text: 'docker', note: 'CLI，只傳指令' },
  { text: 'dockerd', note: 'daemon，需 root' },
  { text: 'containerd', note: '管 image、開關容器' },
  { text: 'runc', note: '呼叫 kernel 開容器' },
  { text: 'Linux kernel', note: 'namespaces + cgroups' },
];

export const dockerArchitecture: Section = {
  id: 'docker-architecture',
  num: '1-5',
  chapter: 1,
  title: '一行指令經過誰',
  concept: 'docker 指令只是遙控器，真正做事的是 dockerd → containerd → runc → kernel 這條分工鏈。',
  steps: [
    {
      scene: [{ kind: 'flow', label: 'docker run nginx', nodes: CHAIN, links: [{ text: 'REST API' }, {}, {}, {}] }],
      note: '你打的 docker 只負責把指令包好，透過 REST API 交給背景的 dockerd。dockerd 是總管，交給 containerd 管 image 和容器，最底層的 runc 才真的去叫 kernel 開出隔離的 process。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker version' },
            { text: 'Client:', tone: 'focus' },
            { text: ' Version:   29.x.x' },
            { text: 'Server:', tone: 'focus' },
            { text: ' Engine:' },
            { text: '  Version:  29.x.x' },
            { text: ' containerd: …' },
            { text: ' runc: …' },
          ],
        },
      ],
      note: 'docker version 分成 Client 和 Server 兩段，證明這是兩支不同的程式。因為走 API，daemon 甚至可以在另一台機器上。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: 'daemon 沒在跑的時候',
          lines: [
            { text: '$ docker version' },
            { text: 'Client:', tone: 'good' },
            { text: ' Version:   29.x.x' },
            { text: 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock.', tone: 'bad' },
            { text: 'Is the docker daemon running?', tone: 'bad' },
          ],
        },
      ],
      note: 'Client 還在，Server 段出不來：代表 daemon 沒在跑（沒權限時訊息會是 permission denied，見 2-3）。這是初學者遇到的第一個經典坑。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '2026 的兩個變化',
          head: ['項目', '現在', '舊文章'],
          rows: [
            { cells: ['image 儲存', 'containerd image store（v29 起預設），原生支援多平台', '—'], tone: 'good' },
            { cells: ['檔案系統', 'overlayfs', 'AUFS（含「42 層上限」）'], tone: 'good' },
          ],
        },
      ],
      note: '同一個 tag 底下可以同時放 amd64 和 arm64，不同機器 pull 會拿到對的版本。讀到 AUFS 的舊文章，知道是歷史就好。',
    },
    {
      scene: [
        {
          kind: 'flow',
          nodes: [{ text: '任何能對 dockerd 下指令的人' }, { text: 'dockerd（root）', tone: 'bad' }, { text: '主機上幾乎任何事', tone: 'bad' }],
          links: [{}, { text: '代為執行', tone: 'bad' }],
        },
      ],
      note: '伏筆：dockerd 以 root 身分執行，所以誰能叫它做事，誰就差不多拿到主機 root。2-3 和第六篇會回來處理。',
    },
  ],
  questions: [
    {
      type: 'order',
      prompt: '執行 docker run nginx，指令依序經過哪些元件？',
      items: ['docker（CLI）', 'dockerd', 'containerd', 'runc', 'Linux kernel'],
      explain: 'CLI 透過 REST API 交給 dockerd → containerd 管 image 與容器 → runc 呼叫 kernel 開出隔離的 process。',
    },
    {
      type: 'choice',
      prompt: 'dockerd 沒有啟動時執行 docker version，會看到什麼？',
      options: ['整個指令找不到', 'Client 段正常顯示，接著報錯連不到 daemon', 'Client 和 Server 都正常，只是版本是空的'],
      answer: 1,
      explain: 'docker CLI 是獨立的程式，自己的版本照樣印得出來；Server 段要問 daemon，連不到就報 Cannot connect to the Docker daemon。',
    },
  ],
  source: '教材 §1.7、§1.11 第一步',
};
