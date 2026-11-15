import type { Section } from '../core/types';

export const whyContainers: Section = {
  id: 'why-containers',
  num: '1-1',
  chapter: 1,
  title: '「我電腦上明明可以跑」',
  concept: '容器把程式連同它需要的整套環境打包成一份，搬到哪台機器都用一模一樣的方式跑。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: '同一份程式碼，丟到另一台機器',
          nodes: [
            { text: '你的筆電', note: 'Python 3.12、函式庫 2.1' },
            { text: '公司伺服器', note: 'Python 3.9、函式庫 1.8', tone: 'bad' },
          ],
          links: [{ text: '複製程式碼 ✗', tone: 'bad' }],
        },
      ],
      note: '程式一個字都沒改，換台機器就壞了。原因只有一個：環境不一樣。寫一份安裝說明書也救不了，因為它總會漏寫一步、總會過時。',
    },
    {
      scene: [
        { kind: 'flow', label: '第一代：裸機', nodes: [{ text: '開發' }, { text: '維運' }, { text: '實體主機' }] },
        { kind: 'flow', label: '第二代：虛擬機', nodes: [{ text: '開發' }, { text: '維運' }, { text: '每台主機切 n 台 VM' }] },
        {
          kind: 'flow',
          label: '第三代：容器',
          nodes: [{ text: '開發' }, { text: '容器', tone: 'good' }, { text: '每台主機跑 n 個容器' }],
        },
      ],
      note: '部署一路從裸機、虛擬機演化到容器。VM 裡的環境還是會和開發機慢慢長歪；容器則讓開發機上那份，就是上線跑的那份。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '一個容器裡裝了什麼',
          items: [
            { text: '你的程式', tone: 'focus' },
            { text: '函式庫與執行環境（Python 3.12…）' },
            { text: '設定檔' },
          ],
        },
        {
          kind: 'flow',
          nodes: [
            { text: '筆電', tone: 'good' },
            { text: '測試機', tone: 'good' },
            { text: '雲端', tone: 'good' },
          ],
          links: [{ text: '同一份' }, { text: '同一份' }],
        },
      ],
      note: 'Docker 的想法很乾脆：與其教別人把環境裝成跟你一樣，不如直接把整個環境打包帶走。這一份放到哪都跑得一樣。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '該不該容器化？',
          head: ['情況', '建議'],
          rows: [
            { cells: ['十幾個彼此連接的服務', '值得'], tone: 'good' },
            { cells: ['主機要同時支援三種以上程式語言', '值得'], tone: 'good' },
            { cells: ['常因環境不同在部署時壞掉', '值得'], tone: 'good' },
            { cells: ['一台中型主機跑得很順、流量穩定', '先別急，先試換大一點的主機'] },
          ],
        },
      ],
      note: '容器不是萬靈丹。把部署平台容器化的前期成本不低；服務單純、沒有擴展壓力時，硬上通常不划算。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '下面哪一種情況，最不需要把部署容器化？',
      options: [
        '公司有 12 個彼此呼叫的微服務',
        '服務常常因為上線環境和開發機不同而壞掉',
        '一台中型主機就跑得很順、流量穩定的單一服務',
        '同一台主機要跑 Python、Node、Java 三種服務',
      ],
      answer: 2,
      explain: '單機跑得順又沒有擴展壓力時，容器化的成本通常大於好處。其他三個都是教材列出的「該排進議程」訊號。',
    },
  ],
  source: '教材 §1.1、§1.2、§1.3、§1.8',
};
