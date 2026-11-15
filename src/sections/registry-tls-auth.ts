import type { Section } from '../core/types';

export const registryTlsAuth: Section = {
  id: 'registry-tls-auth',
  num: '7-5',
  chapter: 7,
  title: 'TLS 先，帳密後',
  concept: '私有 registry 要防被偷看、被亂推、被掉包；htpasswd 帳密必須建在 TLS 上，否則密碼明碼在網路上跑。',
  steps: [
    {
      scene: [
        {
          kind: 'table',
          label: '威脅與對策',
          head: ['威脅', '對策'],
          rows: [
            { cells: ['沒授權的人來 pull、push', '身分驗證（htpasswd）'] },
            { cells: ['傳輸途中被偷看、偷改', 'TLS 加密'] },
            { cells: ['image 被掉包', 'TLS 加上簽章（22-3）'] },
          ],
        },
      ],
      note: '7-4 那座 registry 誰都能推、內容也是明文傳。上線前要補上兩塊：TLS 和身分驗證，缺一不可。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '第一步：TLS',
          lines: [
            { text: '$ docker run -d -p 443:443 --name registry \\' },
            { text: '    -v "$PWD/certs:/certs" \\' },
            { text: '    -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \\' },
            { text: '    -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/server.crt \\', tone: 'good', note: '憑證' },
            { text: '    -e REGISTRY_HTTP_TLS_KEY=/certs/server.key \\', tone: 'good', note: '私鑰' },
            { text: '    registry:3' },
          ],
        },
      ],
      note: '把憑證和私鑰放進掛載的目錄，用兩個環境變數告訴 registry 在哪。憑證可以是公司內部簽發的，或用 Let’s Encrypt 這類免費 CA。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '第二步：在 TLS 上加帳密',
          lines: [
            { text: '$ docker run --rm --entrypoint htpasswd httpd:2 \\' },
            { text: '    -Bbn myuser mypassword > auth/htpasswd', note: 'bcrypt 雜湊' },
            { text: '$ docker run -d … \\' },
            { text: '    -e REGISTRY_AUTH=htpasswd \\', tone: 'focus' },
            { text: '    -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \\', tone: 'focus' },
            { text: '    -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \\', tone: 'focus' },
            { text: '    -e REGISTRY_HTTP_TLS_CERTIFICATE=… -e REGISTRY_HTTP_TLS_KEY=… \\' },
            { text: '    registry:3' },
          ],
        },
      ],
      note: '借 httpd image 裡的 htpasswd 工具產生帳密檔。之後要 push、pull 都得先 docker login 這台 registry。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '有帳密、沒有 TLS',
          nodes: [{ text: 'docker login' }, { text: '中間人', note: '看到 Authorization: Basic …', tone: 'bad' }, { text: 'registry' }],
          links: [{ text: '明文', tone: 'bad' }, { text: '明文', tone: 'bad' }],
        },
      ],
      note: 'Basic Auth 只是把帳密做 Base64 編碼，不是加密。沒有 TLS，路過的人都能解出你的密碼，驗證形同虛設。所以順序一定是先 TLS、再帳密。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '不想自己顧的話',
          head: ['需求', '選擇'],
          rows: [
            { cells: ['小團隊、簡單私有', 'registry:3 + TLS + htpasswd'] },
            { cells: ['企業級：掃描、簽章、權限、LDAP', 'Harbor（CNCF 開源，自架）'] },
            { cells: ['已經在用某一朵雲', 'ECR / GAR / ACR'] },
            { cells: ['程式碼都在 GitHub', 'GHCR'], tone: 'good' },
          ],
        },
      ],
      note: '先問兩件事：要不要公開？願不願意自己維護？不想顧伺服器，就用雲端或 GitHub 內建的 registry，權限直接和既有帳號整合。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '一座 registry 設了 REGISTRY_AUTH=htpasswd 和帳密檔，只開在 HTTP。少了什麼會讓密碼明碼在網路上傳？',
      options: ['REGISTRY_HTTP_TLS_CERTIFICATE 和 REGISTRY_HTTP_TLS_KEY', 'REGISTRY_AUTH_HTPASSWD_REALM', '--restart=always'],
      answer: 0,
      explain: '帳密走的是 Basic Auth，只有 Base64 編碼。沒有 TLS 憑證和私鑰，連線就沒有加密，密碼可以被直接看到。',
    },
    {
      type: 'choice',
      prompt: '五人團隊，程式碼和 CI 都在 GitHub，想要一個最省事的私有 registry。選哪個？',
      options: ['自架 Harbor', 'GHCR（GitHub Container Registry）', '自架 registry:3 加 TLS'],
      answer: 1,
      explain: 'GHCR 跟 GitHub 的帳號、權限和 Actions 直接整合，不用架伺服器、不用管憑證。Harbor 功能強，但要自己維護。',
    },
  ],
  source: '教材 §7.6、§7.8（DTR / UCP 已退場，只保留 Harbor 與雲端選項）',
};
