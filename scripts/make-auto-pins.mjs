// Renders the 3 rotation pins (1000x1500 JPEG) for every guide into public/pins/auto/<slug>-<v>.jpg.
// Only missing images are rendered unless --force. Runs in the daily release workflow, which has the
// network access to load the Pexels hero photos; the feeds in src/pages/pins/ air them on a schedule.
// Run: node scripts/make-auto-pins.mjs [--force] [--only slug,slug] [--out dir]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const YAML = require('yaml');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const OUT = opt('--out') ?? 'public/pins/auto';
const ONLY = opt('--only')?.split(',');
// For layout checks where Pexels is unreachable: draw a gradient instead of the photo.
const FAKE_PHOTO = flag('--fake-photo');

const LABEL = {
  sauna: 'Home sauna guide', 'cold-plunge': 'Cold plunge guide', 'hot-tub': 'Hot tub guide',
  'swim-spa': 'Swim spa guide', 'garage-gym': 'Garage gym guide', 'massage-chair': 'Massage chair guide',
  'red-light': 'Red light guide',
};
const COLD = new Set(['cold-plunge', 'massage-chair']);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
const photo = (id, w, h) => FAKE_PHOTO
  ? 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a44"/><stop offset="1" stop-color="#2d2a33"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
  : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
// Split "Main title: subtitle" or "Question? More" into a headline and the rest.
const headline = (t) => { const m = t.match(/^(.+?[?:])\s+(.+)$/); return m ? [m[1].replace(/:$/, ''), m[2]] : [t, '']; };

const sents = (s) => s.match(/[^.?!]+[.?!]+(\s|$)/g)?.map((x) => x.trim()) ?? [s];
// Whole sentences up to n characters, so a pin never cuts a claim in half.
const sentences = (s, n) => { let out = ''; for (const x of sents(s)) { if ((out + ' ' + x).trim().length > n) break; out = (out + ' ' + x).trim(); } return out || clip(s, n); };
// v2 headline: the guide's first answer sentence when short enough, else the title's main part.
// Keep in step with pinTitle() in src/data/pins.ts.
const answerHook = (d) => { const f = sents(d.quickAnswer)[0]; return f.length <= 95 ? f : headline(d.title)[0]; };
const question = (k) => { const q = k.charAt(0).toUpperCase() + k.slice(1); return /^(how|what|does|do|is|are|can|should|why|when|which)\b/i.test(k) ? q + '?' : q; };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;overflow:hidden;background:oklch(97% 0.007 86);color:oklch(16% 0.012 280);font-family:"Source Serif 4",Georgia,serif;position:relative}
.heat{--c:oklch(56% 0.175 42);--deep:oklch(38% 0.11 40);--soft:oklch(94% 0.035 55)}
.cold{--c:oklch(52% 0.135 248);--deep:oklch(34% 0.09 250);--soft:oklch(94% 0.025 240)}
.disp{font-family:"Bricolage Grotesque";font-weight:800;font-variation-settings:"wdth" 75,"opsz" 96;letter-spacing:-.01em;line-height:.95}
.kick{font-family:"Bricolage Grotesque";font-weight:700;font-size:30px;letter-spacing:.06em;text-transform:uppercase}
.brand{font-family:"Bricolage Grotesque";font-weight:700;font-variation-settings:"wdth" 75,"opsz" 48;font-size:44px}
.url{font-family:"Bricolage Grotesque";font-weight:500;font-size:26px}
.foot{position:absolute;left:72px;right:72px;bottom:46px;display:flex;justify-content:space-between;align-items:baseline}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
/* v1: full photo, dark fade, title over it */
.v1 .fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.55) 55%,rgba(0,0,0,.88) 100%)}
.v1 .txt{position:absolute;left:72px;right:72px;bottom:170px;color:#fff}
.v1 .pill{display:inline-block;background:var(--c);color:#fff;padding:10px 20px;font-size:26px}
.v1 h1{font-size:112px;margin-top:26px;text-wrap:balance}
.v1 p{font-size:36px;line-height:1.3;margin-top:24px;color:rgba(255,255,255,.9);text-wrap:pretty}
.v1 .foot{color:#fff}.v1 .url{color:rgba(255,255,255,.8)}
/* v2: photo on top, colour panel with the guide's direct answer */
.v2 .top{position:absolute;left:0;right:0;top:0;height:760px;width:100%;object-fit:cover}
.v2 .panel{position:absolute;left:0;right:0;top:760px;bottom:0;background:var(--deep);color:#fff;padding:60px 72px}
.v2 .kick{color:var(--soft)}
.v2 h1{font-size:76px;margin-top:20px;text-wrap:balance}
.v2 .sub{font-size:36px;line-height:1.3;margin-top:22px;color:rgba(255,255,255,.88)}
.v2 .cta{display:inline-block;margin-top:36px;font-family:"Bricolage Grotesque";font-weight:700;font-size:32px;border-bottom:4px solid var(--c);padding-bottom:6px}
.v2 .foot{color:#fff}.v2 .url{color:rgba(255,255,255,.75)}
/* v3: type-led card with the short answer, photo strip at the bottom */
.v3 .bar{height:22px;background:linear-gradient(90deg,oklch(56% 0.175 42) 0 50%,oklch(52% 0.135 248) 50% 100%)}
.v3 .wrap{padding:70px 72px 0}
.v3 .kick{color:var(--c)}
.v3 h1{font-size:118px;margin-top:18px;text-wrap:balance}
.v3 .ans{margin-top:40px;background:var(--soft);border-left:14px solid var(--c);padding:34px 36px;font-size:38px;line-height:1.35;text-wrap:pretty}
.v3 .ans b{font-family:"Bricolage Grotesque";font-weight:700;display:block;font-size:30px;letter-spacing:.04em;text-transform:uppercase;color:var(--deep);margin-bottom:10px}
.v3 .strip{position:absolute;left:0;right:0;bottom:0;height:400px;width:100%;object-fit:cover}
.v3 .foot{bottom:430px}.v3 .brand b{color:oklch(56% 0.175 42)}.v3 .brand i{font-style:normal;color:oklch(52% 0.135 248)}.v3 .url{color:oklch(48% 0.010 75)}`;

const brand = '<span class="brand"><b>Garage</b><i>Recovery</i>Lab</span><span class="url">garagerecoverylab.com</span>';

function render(v, d) {
  const [h, rest] = headline(d.title);
  const label = LABEL[d.category] ?? 'Buying guide';
  const id = d.hero.pexelsId;
  if (v === 1) return `<div class="v1"><img class="bg" src="${photo(id, 1000, 1500)}"><div class="fade"></div>
    <div class="txt"><span class="pill kick">${esc(label)}</span><h1 class="disp">${esc(clip(h, 70))}</h1>${rest ? `<p>${esc(clip(rest, 90))}</p>` : ''}</div>
    <div class="foot">${brand}</div></div>`;
  if (v === 2) return `<div class="v2"><img class="top" src="${photo(id, 1000, 760)}"><div class="panel">
    <div class="kick">${esc(label)}</div><h1 class="disp">${esc(answerHook(d))}</h1>${sents(d.quickAnswer)[0].length > 95 && rest ? `<p class="sub">${esc(clip(rest, 90))}</p>` : ''}<span class="cta">Read the full guide</span></div>
    <div class="foot">${brand}</div></div>`;
  return `<div class="v3"><div class="bar"></div><div class="wrap"><div class="kick">${esc(label)}</div>
    <h1 class="disp">${esc(clip(question(d.targetKeyword), 44))}</h1><div class="ans"><b>The short answer</b>${esc(sentences(d.quickAnswer, 260))}</div></div>
    <div class="foot">${brand}</div><img class="strip" src="${photo(id, 1000, 400)}"></div>`;
}

const dir = 'src/content/articles';
const guides = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => {
  const fm = fs.readFileSync(path.join(dir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  return { slug: f.replace(/\.md$/, ''), d: YAML.parse(fm) };
}).filter(({ slug, d }) => d.hero && d.draft === false && (!ONLY || ONLY.includes(slug)));

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
let made = 0, failed = 0;
for (const { slug, d } of guides) {
  for (const v of [1, 2, 3]) {
    const file = path.join(OUT, `${slug}-${v}.jpg`);
    if (fs.existsSync(file) && !flag('--force')) continue;
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
      <body class="${COLD.has(d.category) ? 'cold' : 'heat'}">${render(v, d)}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Never publish a pin whose photo failed to load.
    const broken = await page.evaluate(() => [...document.images].some((i) => !i.complete || i.naturalWidth === 0));
    if (broken) { console.log('photo failed, skipped', slug, v); failed++; continue; }
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    made++;
  }
}
await browser.close();
console.log(`rendered ${made} pins, ${failed} skipped`);
