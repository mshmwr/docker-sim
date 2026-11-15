import type { Section } from '../core/types';

const STACK = ['容器可寫層', '第 3 層：複製網頁內容', '第 2 層：複製設定檔', '第 1 層：apt 安裝 nginx', '第 0 層：基礎 OS（ubuntu）'];

export const imageLayersCow: Section = {
  id: 'image-layers-cow',
  num: '1-3',
  chapter: 1,
  title: '分層與寫時複製',
  concept: 'image 是一疊唯讀層；容器只在最上面加一層可寫層，容器刪掉，這層就跟著消失。',
  steps: [
    {
      scene: [
        {
          kind: 'layers',
          label: 'nginx 網站 image',
          items: [
            { text: '第 3 層：複製網頁內容', note: '唯讀' },
            { text: '第 2 層：複製設定檔', note: '唯讀' },
            { text: '第 1 層：apt 安裝 nginx', note: '唯讀' },
            { text: '第 0 層：基礎 OS（ubuntu）', note: '唯讀' },
          ],
        },
      ],
      note: 'image 不是一個大檔案，而是一疊唯讀的層。每一層只記錄「相對於下面那層，新增、修改、刪除了哪些檔案」，疊起來就是完整的檔案系統。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '跑起來變成容器',
          items: [
            { text: '容器可寫層', note: '可讀寫', tone: 'focus' },
            { text: '第 3 層：複製網頁內容', note: '唯讀', tone: 'dim' },
            { text: '第 2 層：複製設定檔', note: '唯讀', tone: 'dim' },
            { text: '第 1 層：apt 安裝 nginx', note: '唯讀', tone: 'dim' },
            { text: '第 0 層：基礎 OS（ubuntu）', note: '唯讀', tone: 'dim' },
          ],
        },
      ],
      note: '容器就是在 image 頂上加一層薄薄的可寫層。同一個 image 開十個容器，底下的唯讀層只存一份，各容器只多自己那層可寫層。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '容器修改 /etc/nginx/nginx.conf',
          items: [
            { text: '容器可寫層', note: '複製上來再改', tone: 'good' },
            { text: '第 3 層：複製網頁內容', tone: 'dim' },
            { text: '第 2 層：複製設定檔', note: '原檔不變', tone: 'focus' },
            { text: '第 1 層：apt 安裝 nginx', tone: 'dim' },
            { text: '第 0 層：基礎 OS（ubuntu）', tone: 'dim' },
          ],
        },
      ],
      note: '這叫寫時複製（copy-on-write）：要改底層的檔案時，先把它複製到可寫層再改，底層永遠不動。這也是為什麼底層可以被很多容器、很多 image 共用。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run --name box ubuntu touch /notes.txt' },
            { text: '$ docker rm box' },
            { text: '$ docker run --name box ubuntu ls /notes.txt' },
            { text: "ls: cannot access '/notes.txt': No such file or directory", tone: 'bad' },
          ],
        },
      ],
      note: '改動只寫在可寫層，容器一刪，這層就沒了。新容器從同一個 image 開出來，拿到的是一層全新的可寫層。要保留資料得用 volume。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '容器執行時修改了第 2 層裡的設定檔。實際被寫入的是哪一層？',
      items: STACK,
      answer: [0],
      explain: '底下的層全是唯讀的。檔案會先被複製到最上面的容器可寫層再修改，第 2 層裡的原檔完全不變。',
    },
    {
      type: 'choice',
      prompt: '在容器裡建了一個檔案，docker rm 之後，再用同一個 image docker run 一個新容器。那個檔案還在嗎？',
      options: ['在，檔案存在 image 裡', '不在，它只存在舊容器的可寫層', '在，只要容器名稱相同就會沿用'],
      answer: 1,
      explain: '檔案只寫進舊容器的可寫層，rm 時跟著刪掉了。新容器拿到全新的可寫層。要留住資料得用 volume。',
    },
  ],
  source: '教材 §1.4（layer、copy-on-write）、§1.12 坑三',
};
