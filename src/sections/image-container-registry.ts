import type { Section } from '../core/types';

export const imageContainerRegistry: Section = {
  id: 'image-container-registry',
  num: '1-2',
  chapter: 1,
  title: '三個名詞與一條鏈',
  concept: 'image 是唯讀的模板，container 是把它跑起來的實例，registry 是存放 image 的倉庫。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          nodes: [{ text: 'registry', note: '例：Docker Hub' }, { text: 'image', note: '唯讀的打包檔', tone: 'focus' }],
          links: [{ text: 'docker pull' }],
        },
      ],
      note: 'image 像一包封好的冷凍調理包：程式和它需要的一切都在裡面，封好就不再變。registry 是放調理包的市集，最有名的是 Docker Hub。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker pull nginx' },
            { text: 'latest: Pulling from library/nginx', tone: 'dim' },
            { text: '$ docker images' },
            { text: 'REPOSITORY   TAG      IMAGE ID', tone: 'dim' },
            { text: 'nginx        latest   a1b2c3d4e5f6', tone: 'good' },
          ],
        },
      ],
      note: 'pull 把 image 從 registry 抓到本機。官方 image 沒有前綴（nginx、postgres），一般使用者的會帶帳號前綴（someuser/myapp）。',
    },
    {
      scene: [
        {
          kind: 'flow',
          nodes: [
            { text: 'image', note: 'nginx' },
            { text: 'container 1', tone: 'good' },
          ],
          links: [{ text: 'docker run' }],
        },
        {
          kind: 'flow',
          nodes: [
            { text: 'image', note: 'nginx' },
            { text: 'container 2', tone: 'good' },
          ],
          links: [{ text: 'docker run' }],
        },
      ],
      note: 'container 是照著 image 煮出來、正在冒煙的那道菜。同一個 image 可以同時跑很多個 container，彼此互不干擾。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '完整的一圈',
          nodes: [{ text: 'registry' }, { text: 'image' }, { text: 'container' }, { text: '新 image' }, { text: 'registry' }],
          links: [{ text: 'pull' }, { text: 'run' }, { text: 'commit' }, { text: 'push' }],
        },
      ],
      note: '把容器的現況拍成新 image 叫 commit，再 push 回 registry 分享。實務上新 image 多半用 Dockerfile 建（第四章），commit 的問題留到 3-6。',
    },
  ],
  questions: [
    {
      type: 'order',
      prompt: '從別人的 image 出發，做出自己的版本再分享出去，依序是：',
      items: ['docker pull', 'docker run', 'docker commit', 'docker push'],
      explain: 'pull 抓 image → run 跑成容器 → commit 把容器拍成新 image → push 傳回 registry。',
    },
    {
      type: 'choice',
      prompt: '同一個 nginx image 執行三次 docker run -d nginx，docker ps 會列出幾個容器？',
      options: ['1 個，同一個 image 只能有一個容器', '3 個，各自有自己的容器 ID', '0 個，要先 docker create'],
      answer: 1,
      explain: '每次 run 都從同一個 image 開出一個新的容器，各有自己的 ID 和可寫層。',
    },
  ],
  source: '教材 §1.4',
};
