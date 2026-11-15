import type { Section } from '../core/types';

export const installDockerCe: Section = {
  id: 'install-docker-ce',
  num: '2-2',
  chapter: 2,
  title: '裝對來源：docker-ce',
  concept: '在 Linux 上從 Docker 官方套件庫裝 docker-ce，不要裝發行版自帶的 docker.io；相關的五個套件要一起裝、一起升級。',
  steps: [
    {
      scene: [
        {
          kind: 'table',
          head: ['套件', '從哪來', '結果'],
          rows: [
            { cells: ['docker.io', 'Ubuntu / Debian 自己打包', '版本常常落後'], tone: 'bad' },
            { cells: ['docker-ce', 'Docker 官方套件庫', '最新、最正統'], tone: 'good' },
          ],
        },
      ],
      note: 'Google 到的舊文章常叫你 apt install docker.io。那是發行版自己打包的版本，更新慢。正解是先加入 Docker 官方的套件庫（附 GPG 金鑰驗證來源），再裝 docker-ce。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io \\' },
            { text: '    docker-buildx-plugin docker-compose-plugin' },
          ],
        },
        {
          kind: 'table',
          head: ['套件', '是誰'],
          rows: [
            { cells: ['docker-ce', '引擎，也就是 dockerd'] },
            { cells: ['docker-ce-cli', '你打的 docker 指令'] },
            { cells: ['containerd.io', '底層 runtime，管 image、開關容器'] },
            { cells: ['docker-buildx-plugin', '進階建置（多平台，第四章）'] },
            { cells: ['docker-compose-plugin', '一次管多個容器（第六章）'] },
          ],
        },
      ],
      note: '前三塊就是 1-5 那條分工鏈的 CLI、dockerd、containerd，後兩塊是外掛工具。五個是一組互相搭配的元件，要一起裝。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '只升級其中一個',
          nodes: [
            { text: 'docker-ce-cli', note: '新版', tone: 'focus' },
            { text: 'docker-ce', note: '舊版', tone: 'bad' },
          ],
          links: [{ text: 'API 版本對不上', tone: 'bad' }],
        },
      ],
      note: 'Client 和 Server 透過 REST API 講話。只升其中一個，兩邊的版本和 API version 就會對不上，出現詭異的相容問題。升級時重跑同一行 apt-get install，讓五個一起到同一版。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ sudo systemctl enable --now docker', note: '現在啟動，開機也自動啟動' },
            { text: '$ docker version' },
            { text: 'Client: Docker Engine - Community', tone: 'good' },
            { text: ' API version:  …', tone: 'dim' },
            { text: 'Server: Docker Engine - Community', tone: 'good' },
            { text: ' API version:  …', tone: 'dim' },
          ],
        },
      ],
      note: 'Client 和 Server 兩段都出現，才算真的裝好。只有 Client 代表 daemon 沒在跑（1-5 那個坑）。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '你只升級了 docker-ce-cli，沒升級 docker-ce。執行 docker version 最可能看到什麼？',
      options: [
        '只有 Client 段，Server 段消失',
        'Client 與 Server 的版本（含 API version）不一致',
        '兩段完全一樣，CLI 會自動帶著引擎一起升',
      ],
      answer: 1,
      explain: 'daemon 還在跑，所以 Server 段照樣出現，只是版本停在舊的，和新的 Client 對不上。五個套件要一起升級就是為了避免這種狀況。',
    },
    {
      type: 'choice',
      prompt: '一篇文章教你 sudo apt install docker.io。比較好的做法是？',
      options: ['照做，docker.io 就是官方版', '加入 Docker 官方套件庫，改裝 docker-ce', '從原始碼自己編譯 Docker'],
      answer: 1,
      explain: 'docker.io 是發行版自己打包、常常落後的版本。官方套件庫的 docker-ce 才是最新、最正統的。從原始碼編譯只有要替 Docker 貢獻程式碼的人才需要。',
    },
  ],
  source: '教材 §2.2、§2.3、§2.5 測法一、§2.10 坑一、坑三',
};
