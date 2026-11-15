import type { Section } from '../core/types';

export const vmVsContainer: Section = {
  id: 'vm-vs-container',
  num: '1-4',
  chapter: 1,
  title: 'VM 與容器：共用核心',
  concept: '每台 VM 各帶一套作業系統；容器共用主機的核心（kernel），所以又小又快，代價是隔離比較薄。',
  steps: [
    {
      scene: [
        {
          kind: 'layers',
          label: '虛擬機',
          items: [
            { text: 'App A ＋ 函式庫 ＋ 客體 OS', tone: 'bad' },
            { text: 'App B ＋ 函式庫 ＋ 客體 OS', tone: 'bad' },
            { text: 'Hypervisor' },
            { text: '實體硬體' },
          ],
        },
        {
          kind: 'layers',
          label: '容器',
          items: [
            { text: 'App A ＋ 依賴', tone: 'good' },
            { text: 'App B ＋ 依賴', tone: 'good' },
            { text: 'Docker 引擎' },
            { text: '主機 OS（一份 kernel，大家共用）', tone: 'focus' },
            { text: '實體硬體' },
          ],
        },
      ],
      note: 'VM 把整台電腦虛擬化，每台都扛一套完整的客體 OS。容器不裝自己的 OS，大家共用主機那一份 kernel，只隔離應用程式那一層。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['', '虛擬機', '容器'],
          rows: [
            { cells: ['大小', '數 GB', '數十 MB'] },
            { cells: ['啟動', '數十秒到數分鐘', '約一兩秒'] },
            { cells: ['一台主機能跑', '數個到數十個', '數十到數百個'] },
            { cells: ['隔離', '連 OS 都隔開，較安全', '只到 process 層級'], tone: 'focus' },
          ],
        },
      ],
      note: '容器輕，是因為它借用主機的 kernel，不用自己開機。兩者是互補：要強隔離或不同 OS 用 VM，實務上也常在 VM 裡跑一堆容器。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '隔離靠 kernel 的兩個機制',
          head: ['機制', '負責', '一句話'],
          rows: [
            { cells: ['namespaces', '隔離 process、網路、檔案系統、使用者', '你看不到別人'] },
            { cells: ['cgroups', '限制 CPU、記憶體用量', '你不能吃太多'] },
          ],
        },
      ],
      note: '容器裡的程式「以為」自己有一整台機器，其實它還是主機上的一個 process，只是被 namespaces 圍起來、被 cgroups 限量。',
    },
    {
      scene: [
        {
          kind: 'flow',
          nodes: [
            { text: '容器 A 被攻破', tone: 'bad' },
            { text: '共用的 kernel 有漏洞', tone: 'bad' },
            { text: '主機和其他容器', tone: 'bad' },
          ],
          links: [{}, { text: '一起受影響', tone: 'bad' }],
        },
      ],
      note: '共用 kernel 的代價：牆比 VM 薄。kernel 一旦被突破，影響的是整台主機。這是第六篇「守護」要處理的問題，先記著。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '在一台 Linux 主機上執行 docker run --rm ubuntu uname -r，印出的是誰的 kernel 版本？',
      options: ['ubuntu image 內建的 kernel', '主機的 kernel', 'Docker 自己模擬的 kernel'],
      answer: 1,
      explain: '容器沒有自己的 kernel，所有容器共用主機那一份，所以看到的是主機的 kernel 版本。image 裡只有檔案系統，沒有 kernel。',
    },
    {
      type: 'choice',
      prompt: '「這個容器最多只能用 512MB 記憶體」靠的是哪個機制？',
      options: ['namespaces', 'cgroups', 'hypervisor'],
      answer: 1,
      explain: 'cgroups 負責限量（CPU、記憶體）；namespaces 負責隔離視野；hypervisor 是 VM 用的，容器沒有。',
    },
  ],
  source: '教材 §1.6',
};
