// Walk every step and solve every question of the given sections, in light desktop and dark phone width.
// Usage: npm run build && npx vite preview --port 4317, then
//        node scripts/qa-ch.cjs scripts/qa/<answers>.json [screenshot dir, default qa-shots]
// Answers file: [{ "id", "steps", "q": [{ "choice": n } | { "pick": [texts] } | { "order": [texts] }] }]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const OUT = path.resolve(process.argv[3] || 'qa-shots');
const BASE = process.env.BASE || 'http://localhost:4317/';
const SECTIONS = require(path.resolve(process.argv[2]));
const exact = (t) => new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const errors = [];
  const watch = (p) => {
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  };
  const d = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const m = await b.newPage({ viewport: { width: 375, height: 800 }, colorScheme: 'dark' });
  watch(d); watch(m);

  for (const s of SECTIONS) {
    for (const [p, tag] of [[d, 'd'], [m, 'm']]) {
      await p.goto(BASE + '#' + s.id);
      await p.reload();
      for (let i = 0; i < s.steps; i++) {
        if (i > 0) await p.getByLabel('下一步').click();
        await p.waitForTimeout(450);
        const over = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        if (over) errors.push(`${s.id} step ${i + 1} ${tag}: horizontal overflow`);
        await p.screenshot({ path: `${OUT}/${s.id}-${tag}-${i + 1}.png`, fullPage: true });
      }
    }
    // Practice on desktop.
    await d.goto(BASE + '#' + s.id + '--practice');
    for (let qi = 0; qi < s.q.length; qi++) {
      const q = s.q[qi];
      if (q.choice !== undefined) await d.locator('.option').nth(q.choice).click();
      else if (q.pick) {
        for (const t of q.pick) await d.locator('.pick-item').filter({ hasText: exact(t) }).click();
        await d.getByText('確認').click();
      } else for (const t of q.order) await d.locator('.pick-list .pick-item').filter({ hasText: exact(t) }).click();
      await d.waitForTimeout(450);
      const ok = await d.locator('.feedback.ok').isVisible();
      if (!ok) errors.push(`${s.id} q${qi + 1}: not marked correct`);
      await d.screenshot({ path: `${OUT}/${s.id}-q${qi + 1}.png`, fullPage: true });
      await d.getByText(qi === s.q.length - 1 ? '完成' : '下一題').click();
    }
    console.log(s.id, 'done card:', await d.locator('.done-card').isVisible());
  }
  await d.goto(BASE);
  await d.screenshot({ path: `${OUT}/home.png`, fullPage: true });
  console.log('progress:', await d.evaluate(() => localStorage.getItem('dockersim.progress.v1')));
  console.log('errors:', errors);
  await b.close();
})();
