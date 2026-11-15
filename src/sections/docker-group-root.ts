import type { Section } from '../core/types';

export const dockerGroupRoot: Section = {
  id: 'docker-group-root',
  num: '2-3',
  chapter: 2,
  title: 'docker 群組 ≈ root',
  concept: '把自己加進 docker 群組就能免 sudo，但這幾乎等於拿到主機的 root；加完要重新登入才會生效。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker ps' },
            { text: 'permission denied while trying to connect to the Docker daemon socket', tone: 'bad' },
            { text: '$ ls -l /var/run/docker.sock' },
            { text: 'srw-rw---- 1 root docker … /var/run/docker.sock', tone: 'focus', note: '只有 root 和 docker 群組能讀寫' },
          ],
        },
      ],
      note: 'CLI 透過 /var/run/docker.sock 這個 socket 和 dockerd 講話。它預設只開放給 root 和 docker 群組，一般使用者就被擋在門外。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ sudo usermod -aG docker $USER' },
            { text: '$ docker ps' },
            { text: 'permission denied while trying to connect…', tone: 'bad', note: '還沒重新登入' },
            { text: '（登出再登入）', tone: 'dim' },
            { text: '$ docker ps' },
            { text: 'CONTAINER ID   IMAGE   …', tone: 'good' },
          ],
        },
      ],
      note: '加進群組後，要登出再登入才會生效（或在目前的 shell 執行 newgrp docker 暫時生效）。這是初學者最常忘的一步：繼續 permission denied，就以為自己裝壞了。',
    },
    {
      scene: [
        {
          kind: 'flow',
          nodes: [
            { text: 'docker 群組成員', note: '不用 sudo' },
            { text: 'dockerd', note: '以 root 身分執行', tone: 'bad' },
            { text: '主機任何目錄', note: '例：-v /:/host', tone: 'bad' },
          ],
          links: [{ text: '下指令' }, { text: '掛進容器讀寫', tone: 'bad' }],
        },
      ],
      note: '為什麼說等於 root？dockerd 本身是 root，而它能把主機上任何目錄掛進容器（第八章教掛載）。誰能叫它做事，誰就能讀寫主機所有檔案。群組成員要當系統管理員看待。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '把 daemon 開在 tcp://0.0.0.0:2375',
          nodes: [
            { text: '網際網路上任何人', tone: 'bad' },
            { text: ':2375', note: '沒加密、沒驗證', tone: 'bad' },
            { text: 'dockerd（root）', tone: 'bad' },
          ],
          links: [{}, {}],
        },
      ],
      note: '同一個道理放大到網路上：2375 是明碼埠，開出去等於把主機 root 掛在網路上給人撿。真要遠端遙控得走加密＋憑證（21-5）。另一條路是 rootless 模式，讓 daemon 本身不用 root 跑（21-3）。',
    },
  ],
  questions: [
    {
      type: 'order',
      prompt: '讓自己不用 sudo 就能跑 docker，正確的步驟是：',
      items: ['sudo usermod -aG docker $USER', '登出再登入', 'docker ps 確認可以用'],
      explain: '加進群組 → 重新登入讓群組生效 → 再驗證。少了中間那步，docker ps 會繼續 permission denied。',
    },
    {
      type: 'choice',
      prompt: '同事說「我只是懶得打 sudo」，請你把他加進主機的 docker 群組。主要風險是什麼？',
      options: [
        '沒什麼風險，docker 群組只能看容器列表',
        '他等於拿到主機的 root，能透過容器讀寫主機任何檔案',
        '會讓其他人的容器變慢',
      ],
      answer: 1,
      explain: '群組成員能指揮以 root 執行的 dockerd，把主機任何目錄掛進容器。所以 docker 群組要當系統管理員權限來管。',
    },
  ],
  source: '教材 §2.4、§2.6、§2.7、§2.10 坑二（newgrp 為教材外補充）',
};
