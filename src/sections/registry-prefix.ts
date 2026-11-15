import type { Section } from '../core/types';

export const registryPrefix: Section = {
  id: 'registry-prefix',
  num: '7-1',
  chapter: 7,
  title: 'image 名稱的前綴決定它去哪裡',
  concept: 'registry 是整條交付鏈的樞紐；image 名稱的前綴就是地址，決定推到哪一台 registry、哪個帳號底下。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          nodes: [{ text: '開發機' }, { text: 'registry', tone: 'focus' }, { text: '測試機、正式機' }],
          links: [{ text: 'push' }, { text: 'pull' }],
        },
      ],
      note: 'image 建好之後，要靠 registry 交給別的機器。開發、測試、正式環境都從同一個地方拿，才能確定跑的是同一個 image。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['image 名稱', '實際去哪裡'],
          rows: [
            { cells: ['nginx', 'docker.io/library/nginx（Docker Hub 官方）'] },
            { cells: ['user/app:1.0', 'docker.io/user/app（Docker Hub 的 user 帳號）'] },
            { cells: ['localhost:5000/app:1.0', '這台主機 5000 埠上的 registry'] },
            { cells: ['registry.company.com/team/app:1.0', '公司的 registry，team 底下'], tone: 'focus' },
          ],
        },
      ],
      note: '規則很簡單：第一段有 . 或 : 或是 localhost，就是 registry 的位址；沒有的話一律當成 Docker Hub。只有一段名字時，前面還會補上 library/。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker tag app:1.0 user/app:1.0' },
            { text: '$ docker images' },
            { text: 'REPOSITORY   TAG   IMAGE ID', tone: 'dim' },
            { text: 'app          1.0   7d3c1f0a9b2e', tone: 'focus' },
            { text: 'user/app     1.0   7d3c1f0a9b2e', tone: 'focus', note: '同一個 ID' },
            { text: '$ docker push user/app:1.0' },
          ],
        },
      ],
      note: 'docker tag 不會複製 image，只是多貼一個名字，所以 IMAGE ID 一樣。要推到哪裡，就先貼上帶那個前綴的名字，再 push。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '執行 docker push myapp:1.0（沒有任何前綴），會發生什麼？',
      options: [
        '推到自己的 Docker Hub 帳號底下',
        '嘗試推到 docker.io/library/myapp，沒有權限而失敗',
        '推到本機的 registry',
      ],
      answer: 1,
      explain: '沒有前綴就被補成 docker.io/library/myapp，那是 Docker 官方 image 的空間，你沒有權限，會收到 requested access to the resource is denied。要推到自己帳號，名字得是 你的帳號/myapp。',
    },
    {
      type: 'pick',
      prompt: '要把 app 推到公司 registry.company.com 的 team 專案底下，下面哪個名字是對的？',
      items: ['team/app:1.0', 'registry.company.com/team/app:1.0', 'app:1.0@registry.company.com', 'docker.io/registry.company.com/app:1.0'],
      answer: [1],
      explain: '格式是 registry 位址/路徑/名稱:tag。只寫 team/app 會被當成 Docker Hub 的 team 帳號。',
    },
  ],
  source: '教材 §7.1、§7.3（名稱解析規則為教材外補充）',
};
