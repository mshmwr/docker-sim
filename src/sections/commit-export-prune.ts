import type { Section } from '../core/types';

export const commitExportPrune: Section = {
  id: 'commit-export-prune',
  num: '3-6',
  chapter: 3,
  title: '把容器帶走與清理',
  concept: 'commit 能把容器存成 image，但沒人知道裡面做了什麼，正解是寫 Dockerfile；save 保留分層，export 會壓平；system prune 回收空間。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -it --name temp ubuntu bash' },
            { text: 'root@…:/# apt-get update && apt-get install -y wget' },
            { text: 'root@…:/# rm /root/.profile' },
            { text: 'root@…:/# exit' },
            { text: '$ docker diff temp', note: '節錄，實際會列很多行' },
            { text: 'C /usr/bin', tone: 'focus', note: 'C = 修改' },
            { text: 'A /usr/bin/wget', tone: 'good', note: 'A = 新增' },
            { text: 'C /root', tone: 'focus' },
            { text: 'D /root/.profile', tone: 'bad', note: 'D = 刪除' },
          ],
        },
      ],
      note: 'docker diff 列出容器跟它的 image 比起來改了哪些檔案。這些改動全在 1-3 講的可寫層裡。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: 'docker commit temp my-ubuntu-wget',
          items: [
            { text: '新的唯讀層：???', note: '沒人知道裡面做了什麼', tone: 'bad' },
            { text: 'ubuntu 的層', tone: 'dim' },
          ],
        },
      ],
      note: 'commit 把可寫層凍結成一層新的唯讀層。問題是它沒有紀錄：三個月後沒人說得出這層怎麼來的，也重做不出來，越改越肥。正式做 image 要寫 Dockerfile（第四章），commit 只適合臨時快照。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['指令', '對象', '分層與歷史'],
          rows: [
            { cells: ['save / load', 'image', '完整保留'], tone: 'good' },
            { cells: ['export / import', '容器的檔案系統', '壓平成一層，歷史丟掉'], tone: 'bad' },
          ],
        },
      ],
      note: '要把 image 拷到沒網路的機器，用 docker save -o app.tar 再 docker load -i app.tar。export 拿的是容器的檔案系統快照，import 回來只剩一層，連 CMD、ENV 這些設定也沒了（教材外補充）。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker system df', note: '先看清楚佔了多少' },
            { text: 'TYPE         SIZE      RECLAIMABLE', tone: 'dim' },
            { text: 'Images       4.2GB     2.9GB (69%)', tone: 'focus' },
            { text: 'Containers   120MB     118MB', tone: 'focus' },
            { text: '$ docker system prune', note: '停掉的容器、沒用的網路、懸空 image' },
            { text: 'Total reclaimed space: 1.1GB', tone: 'good' },
          ],
        },
      ],
      note: 'prune 清掉停掉的容器、沒用的網路和懸空的 image，也會清掉沒在用的建置快取；volume 預設不刪（教材外補充）。加 -a 會連「沒有容器在用」的 image 也刪，下手前想一下還要不要。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: 'docker diff 輸出一行 C /etc，代表什麼？',
      options: ['/etc 被刪除了', '/etc 底下有東西被修改了', '/etc 是新建的目錄'],
      answer: 1,
      explain: 'A 是新增、C 是修改、D 是刪除。C /etc 代表 /etc 這個目錄裡有東西變了，通常下面還會列出真正被改的檔案。',
    },
    {
      type: 'choice',
      prompt: '一個由 5 層組成的 image 跑成容器，把容器 docker export 再 docker import 成新 image。新 image 有幾層？',
      options: ['1 層', '5 層', '6 層（原本 5 層加上可寫層）'],
      answer: 0,
      explain: 'export 把容器的整個檔案系統打包成一個 tar，import 回來就是壓平的一層，原本的分層歷史都沒了。要保留分層得用 save / load。',
    },
  ],
  source: '教材 §3.8、§3.9、§3.10、§3.11（export/import 會丟失 CMD、ENV，以及 prune 清建置快取、不刪 volume，為教材外補充）',
};
