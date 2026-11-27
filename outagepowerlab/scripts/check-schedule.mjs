// Build guard for scheduled releases. Fails the build if a guide links to another guide
// that is a draft or goes live later than it does, so a live page never links to a 404.
// Also prints the release calendar. Run automatically before `astro build`.
import { readdirSync, readFileSync } from 'node:fs';

const DIR = 'src/content/articles';
const cats = [...readFileSync('src/data/categories.ts', 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);
const pages = new Set(readdirSync('src/pages').map((f) => f.replace(/\.(astro|js|ts)$/, '')));
const arts = {};
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const src = readFileSync(`${DIR}/${f}`, 'utf8');
  const fm = src.split('---')[1];
  arts[f.replace(/\.md$/, '')] = {
    published: fm.match(/^published:\s*(\S+)/m)[1],
    draft: /^draft:\s*true/m.test(fm),
    body: src,
  };
}

const errors = [];
for (const [slug, a] of Object.entries(arts)) {
  for (const [, target] of a.body.matchAll(/(?<!!\[[^\]]*)\]\(\/([a-z0-9-]+)\/[^)]*\)/g)) {
    if (pages.has(target) || cats.includes(target)) continue;
    const t = arts[target];
    if (!t) errors.push(`${slug} links to /${target}/, which does not exist`);
    else if (!a.draft && t.draft) errors.push(`${slug} links to /${target}/, which is a draft`);
    else if (!a.draft && t.published > a.published)
      errors.push(`${slug} (${a.published}) links to /${target}/, which is not live until ${t.published}`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const upcoming = Object.entries(arts).filter(([, a]) => !a.draft && a.published > today).sort((x, y) => x[1].published.localeCompare(y[1].published));
if (upcoming.length) {
  console.log('Scheduled releases:');
  for (const [slug, a] of upcoming) console.log(`  ${a.published}  /${slug}/`);
}
if (errors.length) {
  console.error('Schedule check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
