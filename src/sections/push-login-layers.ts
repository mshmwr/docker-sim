import type { Section } from '../core/types';

const LAYERS = ['debian 基底層', 'python 本體層', 'RUN pip install 層', 'COPY . . 程式碼層'];

export const pushLoginLayers: Section = {
  id: 'push-login-layers',
  num: '7-2',
  chapter: 7,
  title: 'login、push 與只傳缺少的層',
  concept: '用 access token 登入；push 時 registry 已經有的層會直接跳過；有商業邏輯或機密的 image 一律放私有倉庫。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker login -u user' },
            { text: 'Password:', note: '貼上 access token，不是帳號密碼', tone: 'focus' },
            { text: 'Login Succeeded', tone: 'good' },
          ],
        },
      ],
      note: '在 Docker Hub 帳號設定裡產生 access token 來登入。token 外洩可以單獨撤銷，也能只給讀取權限，不會牽連整個帳號。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '只改了程式碼，push user/app:1.1',
          items: [
            { text: 'COPY . . 程式碼層', tone: 'focus', note: '上傳' },
            { text: 'RUN pip install 層', tone: 'good', note: '已存在，跳過' },
            { text: 'python 本體層', tone: 'good', note: '已存在，跳過' },
            { text: 'debian 基底層', tone: 'good', note: '已存在，跳過' },
          ],
        },
      ],
      note: 'registry 用每一層的 digest 辨認內容。上一版已經推過的層，這次不用再傳。層順序排得好（5-2），每次推的就只有最上面那一小層。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker push user/app:1.1' },
            { text: '4f1a2b3c4d5e: Pushed', tone: 'focus' },
            { text: '9a8b7c6d5e4f: Layer already exists', tone: 'good' },
            { text: '1c2d3e4f5a6b: Layer already exists', tone: 'good' },
            { text: '7e6d5c4b3a29: Layer already exists', tone: 'good' },
            { text: '1.1: digest: sha256:3b9f… size: 1785' },
          ],
        },
      ],
      note: '輸出直接寫出哪幾層真的上傳（Pushed）、哪幾層跳過（Layer already exists）。最後一行的 digest 就是 3-5 講的不可變指紋。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['倉庫', '誰能 pull', '適合'],
          rows: [
            { cells: ['公開（public）', '任何人', '開源專案、想分享的工具'] },
            { cells: ['私有（private）', '你授權的人', '公司產品、含商業邏輯的 image'], tone: 'good' },
          ],
        },
      ],
      note: '公開倉庫的 image 誰都能 pull 下來一層層解開。含商業邏輯的程式碼放上去，就等於公開原始碼；含機密就等於外洩。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: 'user/app:1.0 已經推過。改了程式碼重新 build 成 1.1（層順序是對的），push 時哪些層會真的上傳？（選出全部）',
      items: LAYERS,
      answer: [3],
      explain: '只有內容變了的層才有新的 digest。基底、python、pip install 這幾層和 1.0 一模一樣，registry 已經有了，直接跳過。',
    },
    {
      type: 'choice',
      prompt: '公司的後端 image 裡有計費邏輯，同事想推到 Docker Hub 的公開倉庫方便部署。問題是？',
      options: ['沒問題，image 只有執行檔', '任何人都能 pull 下來解開，程式碼和裡面的設定都外流', '公開倉庫推不上去'],
      answer: 1,
      explain: 'image 的每一層都能被解開來看。含商業邏輯或任何機密的 image，一律放私有倉庫或公司的 registry。',
    },
  ],
  source: '教材 §7.2（push 輸出的 digest 為示意）',
};
