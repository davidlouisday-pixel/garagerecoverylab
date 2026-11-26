// Pings IndexNow (Bing, Yandex, Seznam, Naver and others) with pages changed in the last push.
// Run by .github/workflows/indexnow.yml after Cloudflare has deployed main.
// Usage: node scripts/indexnow.mjs <before-sha> <after-sha>
import { execSync } from 'node:child_process';

const HOST = 'garagerecoverylab.com';
const KEY = 'bc844c292c669645ae2f7aa42385154f'; // served at https://garagerecoverylab.com/bc844c292c669645ae2f7aa42385154f.txt
const SITE = `https://${HOST}`;
const [before, after] = process.argv.slice(2);

async function sitemapUrls() {
  const xml = await (await fetch(`${SITE}/sitemap-0.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

let changed = [];
try {
  if (!before || /^0+$/.test(before)) throw new Error('no base commit');
  changed = execSync(`git diff --name-only ${before} ${after}`).toString().trim().split('\n').filter(Boolean);
} catch {
  changed = ['src/'];
}

const all = await sitemapUrls();
let urls;
const siteWide = changed.some((f) => /^src\/(layouts|components|styles|pages|data)\//.test(f) || f === 'src/');
if (siteWide) {
  urls = all; // a template or shared data changed, so every page changed
} else {
  const slugs = changed
    .filter((f) => f.startsWith('src/content/articles/') && !f.includes('/_'))
    .map((f) => f.replace('src/content/articles/', '').replace(/\.md$/, ''));
  urls = all.filter((u) => slugs.some((s) => u === `${SITE}/${s}/`));
  if (urls.length) urls.push(`${SITE}/`); // the home page lists the latest guides
}

if (!urls.length) {
  console.log('No page changes to submit.');
  process.exit(0);
}

// Only submit pages that are live now, so a draft or a failed deploy is never pinged.
const live = [];
for (const u of urls) {
  const r = await fetch(u, { method: 'HEAD' });
  if (r.ok) live.push(u);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: live }),
});
console.log(`IndexNow: HTTP ${res.status} for ${live.length} URLs`);
live.forEach((u) => console.log(' ', u));
if (res.status >= 400) process.exit(1);
