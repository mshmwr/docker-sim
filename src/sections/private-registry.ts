import type { Section } from '../core/types';

export const privateRegistry: Section = {
  id: 'private-registry',
  num: '7-4',
  chapter: 7,
  title: '自架 registry:3',
  concept: 'registry:3 一行就能跑起來；一定要掛 volume，不然容器刪掉 image 就沒了；儲存後端換成 S3，registry 本身就沒有狀態。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d -p 5000:5000 --restart=always --name registry \\' },
            { text: '    -v regdata:/var/lib/registry \\', tone: 'good', note: 'image 存在 volume' },
            { text: '    registry:3' },
          ],
        },
      ],
      note: '官方的 registry image 就是一座私有倉庫。舊教學用 registry:2，現在用穩定的 registry:3。image 存在 /var/lib/registry，掛一個具名 volume，容器重建時才接得回同一份資料。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker tag app:1.0 localhost:5000/app:1.0', note: '前綴指向自己的 registry' },
            { text: '$ docker push localhost:5000/app:1.0' },
            { text: '$ curl localhost:5000/v2/_catalog' },
            { text: '{"repositories":["app"]}', tone: 'good' },
          ],
        },
      ],
      note: '照 7-1 的規則，名字前面貼上 localhost:5000，push 就會送到這座 registry。/v2/_catalog 列出裡面有哪些 repository。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '有掛 volume',
          nodes: [{ text: 'registry 容器' }, { text: 'volume regdata', tone: 'good' }],
          links: [{ text: '/var/lib/registry' }],
        },
        {
          kind: 'flow',
          label: '儲存後端換成 S3',
          nodes: [{ text: 'registry 容器', note: '隨時可換、可重啟' }, { text: 'S3 bucket', tone: 'good' }],
          links: [{ text: 'storage driver' }],
        },
      ],
      note: '資料活在容器外面，registry 容器刪掉重建都沒關係。再進一步，把儲存後端設成 S3 這類物件儲存，registry 本身沒有狀態，要跑幾份都行。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '從另一台主機推',
          lines: [
            { text: '$ docker push 192.168.1.10:5000/app:1.0' },
            { text: 'http: server gave HTTP response to HTTPS client', tone: 'bad' },
          ],
        },
      ],
      note: '在本機用 localhost 可以，換成別台主機用 IP 連就被拒絕：Docker 預設只信任 HTTPS 的 registry（localhost 例外）。開放給其他主機前，得先設好 TLS，下一節講。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'registry:3 沒有掛 volume。push 了一個 image 之後 docker rm -f registry，再重新 docker run 一座。剛才的 image 還在嗎？',
      options: ['還在，registry 會自動備份', '不在了，新容器拿到的是另一個全新的匿名 volume', '還在，只是要重新 login'],
      answer: 1,
      explain: 'registry image 宣告了 VOLUME /var/lib/registry，沒掛 volume 時 Docker 會自動建一個匿名 volume。rm -f 之後那個 volume 變成孤兒（沒被刪，但也沒人接手），新容器又拿到一個全新的空 volume，所以看起來 image 都不見了。用具名 volume 才接得回來。',
    },
    {
      type: 'choice',
      prompt: '同事從自己的電腦 docker push 192.168.1.10:5000/app:1.0，這台 registry 沒有設 TLS。結果？',
      options: ['推送成功', '被 Docker 拒絕，因為 registry 只回 HTTP', '自動降級成 HTTP 推送'],
      answer: 1,
      explain: 'Docker 預設要求 registry 走 HTTPS，只有 localhost 例外。可以把它加進 insecure-registries 繞過，但正解是設好 TLS。',
    },
  ],
  source: '教材 §7.5、§7.7（匿名 volume 行為、HTTPS 預設要求與 insecure-registries 為教材外補充）',
};
