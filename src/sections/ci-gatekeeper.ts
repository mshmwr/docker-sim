import type { Section } from '../core/types';

const WORKFLOW = [
  '- uses: docker/login-action@v4',
  '  with:',
  '    username: mycompany',
  '    password: mypass123',
  '- uses: docker/build-push-action@v7',
  '  with:',
  '    push: true',
];

export const ciGatekeeper: Section = {
  id: 'ci-gatekeeper',
  num: '7-3',
  chapter: 7,
  title: 'CI 當守門員',
  concept: '不要從自己的筆電 push；讓 CI 先 build，測試和掃描都通過才 push，登入 token 放在 CI 的 secrets。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: 'git push 之後，CI 自動跑',
          nodes: [{ text: 'build' }, { text: 'test + scan', note: '測試、docker scout，可並行' }, { text: 'push', tone: 'good' }, { text: 'registry' }],
          links: [{}, { text: '都通過' }, {}],
        },
        {
          kind: 'flow',
          label: '任何一關失敗',
          nodes: [{ text: 'build' }, { text: 'test + scan', note: '發現高風險漏洞', tone: 'bad' }, { text: 'push', tone: 'dim' }],
          links: [{}, { text: '✗ 停下', tone: 'bad' }],
        },
      ],
      note: '從筆電手動 push，沒人知道那個 image 是不是用乾淨的程式碼建的、有沒有跑過測試。交給 CI：每一關都過了才推上 registry，任何一關失敗就停。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: '.github/workflows/release.yml（節錄）',
          lines: [
            { text: '- uses: docker/login-action@v4' },
            { text: '  with:' },
            { text: '    username: ${{ vars.DOCKERHUB_USER }}' },
            { text: '    password: ${{ secrets.DOCKERHUB_TOKEN }}', tone: 'good', note: '從 CI secrets 讀' },
            { text: '- uses: docker/build-push-action@v7', note: '先建在 runner 上' },
            { text: '  with: { load: true, tags: app:ci }' },
            { text: '- run: pytest  # 用 app:ci 跑測試' },
            { text: '- uses: docker/scout-action@v1', tone: 'focus' },
            { text: '  with: { command: cves, image: app:ci,' },
            { text: '          only-severities: "critical,high", exit-code: true }', tone: 'focus', note: '有高風險就失敗' },
            { text: '- uses: docker/build-push-action@v7' },
            { text: '  with: { push: true, tags: user/app:1.0 }' },
          ],
        },
      ],
      note: 'workflow 檔會進 Git，所以密碼絕不能寫在裡面。token 存在 CI 的 secrets，執行時才注入，log 裡也會被遮掉。scout 的 exit-code 讓發現高風險漏洞時這一步失敗，pipeline 就停了，最後的 push 不會執行。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['誰', '對 registry 的權限'],
          rows: [
            { cells: ['開發者', '只能 pull'] },
            { cells: ['CI', '可以 push'], tone: 'good' },
          ],
        },
      ],
      note: '只讓 CI 有 push 權限，registry 上的每個 image 就都走過同一套檢查。想推新版，唯一的路是合併程式碼。',
    },
  ],
  questions: [
    {
      type: 'order',
      prompt: '依這一節的 pipeline，排出 CI 的步驟順序：',
      items: ['checkout 程式碼', 'build image', '跑測試、掃描漏洞', 'push 到 registry'],
      explain: '先拿到程式碼才能 build；有了 image 才能測試和掃描（這兩關互不依賴，可以並行）；push 一定放最後，前面任何一關失敗就不推。',
    },
    {
      type: 'pick',
      prompt: '這段 workflow 裡，哪一行有資安問題？',
      items: WORKFLOW,
      answer: [3],
      explain: '密碼明文寫在 workflow 裡，會跟著進 Git 歷史，有讀取權的人都看得到。改成 password: ${{ secrets.DOCKERHUB_TOKEN }}，並用 access token 而不是帳號密碼。',
    },
  ],
  source: '教材 §7.4（以 CI 取代 Docker Hub 自動建置的歷史段落；workflow 寫法依現行 GitHub Actions 與 docker/scout-action）',
};
