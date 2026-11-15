import type { Section } from '../core/types';

export const goScratch: Section = {
  id: 'go-scratch',
  num: '5-5',
  chapter: 5,
  title: 'Go：500MB 到 5.6MB',
  concept: '靜態編譯加上 multi-stage 的 FROM scratch，最終 image 裡只剩一個執行檔。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile（單階段）',
          lines: [{ text: 'FROM golang:1.22' }, { text: 'COPY hello.go .' }, { text: 'RUN go build hello.go' }, { text: 'ENTRYPOINT ["./hello"]' }],
        },
        {
          kind: 'size-bar',
          items: [
            { text: '整個 image', value: 500, shown: '500 多 MB', tone: 'bad' },
            { text: '真正要執行的 hello', value: 5.6, shown: '5.6 MB', tone: 'good' },
          ],
        },
      ],
      note: '直接用 golang 當基底建，image 有 500 多 MB，但真正要跑的執行檔只有 5.6MB。其餘全是執行時用不到的編譯工具鏈。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '舊書的手動做法',
          lines: [
            { text: '$ docker cp build:/go/hello .' },
            { text: '$ ldd hello' },
            { text: 'libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6', tone: 'focus' },
            { text: '/lib64/ld-linux-x86-64.so.2', tone: 'focus' },
            { text: '# 再把這些 .so 一個個 ADD 進 FROM scratch', tone: 'dim' },
          ],
        },
      ],
      note: '舊書的做法是把執行檔 docker cp 出來，用 ldd 查它要哪些動態函式庫，再一個個塞進空白的 scratch 基底。可以做到 8MB 以下，但很繁瑣，也很難重現。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile（多階段）',
          lines: [
            { text: 'FROM golang:1.22 AS build' },
            { text: 'WORKDIR /src' },
            { text: 'COPY hello.go .' },
            { text: 'RUN CGO_ENABLED=0 go build -o /hello hello.go', tone: 'focus', note: '編成靜態執行檔' },
            { text: '' },
            { text: 'FROM scratch', tone: 'good', note: '完全空白的基底' },
            { text: 'COPY --from=build /hello /hello', tone: 'good' },
            { text: 'ENTRYPOINT ["/hello"]' },
          ],
        },
      ],
      note: '現代做法是 multi-stage：在 golang 階段編好，scratch 階段只放執行檔。CGO_ENABLED=0 讓它不依賴 libc，一個檔案就能跑，不用再找函式庫。',
    },
    {
      scene: [
        {
          kind: 'size-bar',
          label: '同一支程式的 image 大小',
          items: [
            { text: '單階段 golang', value: 500, shown: '500 多 MB', tone: 'bad' },
            { text: '手動 scratch + .so', value: 8, shown: '不到 8 MB' },
            { text: 'multi-stage + scratch', value: 5.6, shown: '約 5.6 MB', tone: 'good' },
          ],
        },
      ],
      note: '小將近百倍。pull 更快、部署更快，而且 image 裡沒有 shell、沒有套件管理器，攻擊者進來也找不到工具。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '一支用了 net/http 的 Go 程式，在 golang 階段沒設 CGO_ENABLED=0 就 go build，再放進 FROM scratch 執行。可能會發生什麼？',
      options: ['正常執行，Go 一定是靜態的', '啟動失敗，訊息是 no such file or directory', 'image 變大但能跑'],
      answer: 1,
      explain: 'golang image 裡有 C 編譯器，cgo 預設開啟，用到 net 套件時執行檔會動態連結 libc。scratch 裡沒有 libc 和動態載入器，就會回 exec /hello: no such file or directory，即使 /hello 明明在那裡。',
    },
    {
      type: 'choice',
      prompt: '對 FROM scratch 做出來的容器執行 docker exec -it app sh，會怎樣？',
      options: ['進到 shell', '失敗，image 裡沒有 sh', '自動改用 bash'],
      answer: 1,
      explain: 'scratch 是完全空白的基底，裡面只有你 COPY 進去的執行檔，沒有 sh。這讓除錯麻煩一點，但也讓攻擊者無工具可用。',
    },
  ],
  source: '教材 §5.4 第二招、§5.6（教材說 Go 預設編出動態執行檔；實際上純 Go 程式本來就是靜態的，用到 net、os/user 且 cgo 開著時才會動態連結 libc）',
};
