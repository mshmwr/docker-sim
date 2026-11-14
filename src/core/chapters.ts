import type { Chapter } from './types';

/** MVP scope: parts 1, 2 and 6 of the course. `total` is the planned section count per chapter. */
export const CHAPTERS: Chapter[] = [
  { num: 1, part: '第一篇 入門', title: '為什麼是容器', total: 6 },
  { num: 2, part: '第一篇 入門', title: '安裝與權限', total: 3 },
  { num: 3, part: '第一篇 入門', title: '操作容器', total: 6 },
  { num: 4, part: '第二篇 打包', title: 'Dockerfile', total: 6 },
  { num: 5, part: '第二篇 打包', title: '建置最佳化', total: 5 },
  { num: 6, part: '第二篇 打包', title: 'Compose', total: 6 },
  { num: 7, part: '第二篇 打包', title: 'Registry', total: 5 },
  { num: 21, part: '第六篇 守護', title: '主機與 daemon 安全', total: 5 },
  { num: 22, part: '第六篇 守護', title: 'image 與供應鏈安全', total: 4 },
  { num: 23, part: '第六篇 守護', title: '核心強化與合規', total: 3 },
  { num: 24, part: '第六篇 守護', title: '偵測與持續關注', total: 3 },
];

export const PARTS = [...new Set(CHAPTERS.map((c) => c.part))];
