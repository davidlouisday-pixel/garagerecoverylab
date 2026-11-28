// Renders an Instagram carousel (1080x1350 JPEG slides, 4:5) for each guide into public/ig/<slug>/<n>.jpg,
// plus public/ig/<slug>/slides.json (slide count + caption). Text comes only from the guide itself:
// title, quickAnswer, FAQ and the Sources section, so every claim on a slide is already sourced on the page.
// Only missing carousels are rendered unless --force. Runs in the daily release workflow next to the pins.
// Run: node scripts/make-carousels.mjs [--force] [--only slug,slug] [--out dir] [--fake-photo] [--sheet]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const YAML = require('yaml');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const OUT = opt('--out') ?? 'public/ig';
const ONLY = opt('--only')?.split(',');
const FAKE_PHOTO = flag('--fake-photo');
const SITE = 'garagerecoverylab.com';
const W = 1080, H = 1350;

const LABEL = {
  sauna: 'Home sauna', 'cold-plunge': 'Cold plunge', 'hot-tub': 'Hot tub', 'swim-spa': 'Swim spa',
  'garage-gym': 'Garage gym', 'massage-chair': 'Massage chair', 'red-light': 'Red light',
};
const TAGS = {
  sauna: '#sauna #homesauna #saunalife #recovery', 'cold-plunge': '#coldplunge #coldtherapy #recovery',
  'hot-tub': '#hottub #backyard #recovery', 'swim-spa': '#swimspa #backyard', 'garage-gym': '#garagegym #homegym #fitness',
  'massage-chair': '#massagechair #recovery', 'red-light': '#redlighttherapy #recovery',
};
// Product and price answers go stale and a posted image can't be edited, so priced guides skip them.
const PRICED = new Set(['roundup', 'review', 'versus']);
const COLD = new Set(['cold-plunge', 'massage-chair']);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Sentence split that keeps "U.S.", "e.g.", "FoodSafety.gov" and decimals like "2.5" inside their sentence.
const sents = (s) => s.match(/(?:\bU\.S\.(?!\s*$)|\b[A-Z]\.(?=[A-Z]\.|[,;]|\s+[a-z0-9])|\b(?:e\.g|i\.e|vs|approx|Dr|Mr|Ms|St|No)\.|\.(?=[a-z0-9])|[^.?!])+[.?!]+(?=\s|$)/g)?.map((x) => x.trim()) ?? [s];
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
// Whole sentences up to n characters, so a slide never cuts a claim in half.
const sentences = (s, n) => { let out = ''; for (const x of sents(s)) { if ((out + ' ' + x).trim().length > n) break; out = (out + ' ' + x).trim(); } return out || clip(s, n); };
const headline = (t) => { const m = t.match(/^(.+?[?:])\s+(.+)$/); return m ? [m[1].replace(/:$/, ''), m[2]] : [t, '']; };
const photo = (id, w, h) => FAKE_PHOTO
  ? 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a44"/><stop offset="1" stop-color="#2d2a33"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
  : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
const plain = (md) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '');

// "Laukkanen et al., 2015: Long title" (*Journal*) -> "Laukkanen et al., 2015, Journal"
function citations(body) {
  const sec = body.split(/^## Sources\s*$/m)[1];
  if (!sec) return [];
  return sec.split('\n').filter((l) => l.startsWith('- ')).map((l) => {
    const name = l.match(/\[([^\]]+)\]/)?.[1] ?? plain(l.slice(2));
    const journal = l.match(/\(\*([^*]+)\*\)/)?.[1];
    const who = name.split(':')[0].trim();
    return journal ? `${who}, ${journal}` : clip(who, 80);
  });
}

function slidesFor(d, body) {
  const [h, rest] = headline(d.title);
  const label = LABEL[d.category] ?? 'Guide';
  const id = d.hero.pexelsId;
  const s = [];
  s.push(`<div class="cover"><img class="bg" src="${photo(id, W, H)}"><div class="fade"></div><div class="txt">
    <span class="pill kick">${esc(label)} guide</span><h1 class="disp">${esc(clip(h, 70))}</h1>${rest ? `<p>${esc(clip(rest, 90))}</p>` : ''}
    <div class="swipe kick">Swipe →</div></div><div class="foot">${brand}</div></div>`);
  const answer = sentences(PRICED.has(d.type) ? d.description : d.quickAnswer, 420);
  s.push(card('The short answer', '', answer));
  const faqs = (d.faq ?? []).filter((f) => !(PRICED.has(d.type) && /\$\d/.test(f.a))).slice(0, 4);
  for (const f of faqs) s.push(card('Q&amp;A', f.q, sentences(f.a, 300)));
  const cites = citations(body);
  if (cites.length) s.push(`<div class="card"><div class="bar"></div><div class="wrap"><div class="kick">Where this comes from</div>
    <h2 class="disp">${cites.length} sources, linked in the guide</h2><ul>${cites.slice(0, 5).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    ${cites.length > 5 ? `<p class="more">+ ${cites.length - 5} more in the full guide</p>` : ''}</div><div class="foot">${brand}</div></div>`);
  s.push(`<div class="cta"><img class="bg" src="${photo(id, W, H)}"><div class="fade full"></div><div class="mid">
    <div class="kick">Want the full guide?</div><h1 class="disp">Link in bio</h1>
    <p>Every number, and the studies behind it.</p><div class="path">${SITE}/${esc(d.slug)}/</div></div>
    <div class="foot">${brand}</div></div>`);
  return s.slice(0, 10); // API limit: 10 items per carousel
}
const card = (kick, q, a) => `<div class="card"><div class="bar"></div><div class="wrap"><div class="kick">${kick}</div>
  ${q ? `<h2 class="disp">${esc(clip(q, 90))}</h2>` : ''}<div class="ans${q ? '' : ' big'}">${esc(a)}</div></div><div class="foot">${brand}</div></div>`;

const brand = '<span class="brand"><b>Garage</b><i>Recovery</i>Lab</span><span class="url">@garagerecoverylab</span>';
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:oklch(97% 0.007 86);color:oklch(16% 0.012 280);font-family:"Source Serif 4",Georgia,serif;position:relative}
.heat{--c:oklch(56% 0.175 42);--deep:oklch(38% 0.11 40);--soft:oklch(94% 0.035 55)}
.cold{--c:oklch(52% 0.135 248);--deep:oklch(34% 0.09 250);--soft:oklch(94% 0.025 240)}
.disp{font-family:"Bricolage Grotesque";font-weight:800;font-variation-settings:"wdth" 75,"opsz" 96;letter-spacing:-.01em;line-height:.98;text-wrap:balance}
.kick{font-family:"Bricolage Grotesque";font-weight:700;font-size:30px;letter-spacing:.06em;text-transform:uppercase}
.brand{font-family:"Bricolage Grotesque";font-weight:700;font-variation-settings:"wdth" 75,"opsz" 48;font-size:42px}
.brand b{color:oklch(56% 0.175 42)}.brand i{font-style:normal;color:oklch(52% 0.135 248)}
.url{font-family:"Bricolage Grotesque";font-weight:500;font-size:26px;color:oklch(48% 0.010 75)}
.foot{position:absolute;left:80px;right:80px;bottom:52px;display:flex;justify-content:space-between;align-items:baseline}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.55) 55%,rgba(0,0,0,.9) 100%)}
.fade.full{background:rgba(0,0,0,.62)}
.cover .txt{position:absolute;left:80px;right:80px;bottom:180px;color:#fff}
.cover .pill{display:inline-block;background:var(--c);color:#fff;padding:10px 20px;font-size:26px}
.cover h1{font-size:118px;margin-top:26px}
.cover p{font-size:38px;line-height:1.3;margin-top:24px;color:rgba(255,255,255,.9);text-wrap:pretty}
.cover .swipe{margin-top:40px;color:var(--soft)}
.cover .brand b,.cta .brand b{color:#fff}.cover .brand i,.cta .brand i{color:var(--soft)}
.cover .url,.cta .url{color:rgba(255,255,255,.8)}.cover .brand,.cta .brand{color:#fff}
.card .bar{height:22px;background:linear-gradient(90deg,oklch(56% 0.175 42) 0 50%,oklch(52% 0.135 248) 50% 100%)}
.card .wrap{position:absolute;top:22px;bottom:150px;left:0;right:0;padding:40px 80px;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
.card .kick{color:var(--c)}
.card h2{font-size:100px;margin-top:22px}
.card .ans{margin-top:44px;background:var(--soft);border-left:14px solid var(--c);padding:44px 46px;font-size:50px;line-height:1.36;text-wrap:pretty}
.card .ans.big{font-size:56px}
.card ul{margin-top:44px;list-style:none;font-size:44px;line-height:1.3}
.card li{border-left:10px solid var(--c);padding:6px 0 6px 28px;margin-bottom:26px}
.tight .card h2{font-size:84px}.tight .card .ans,.tight .card .ans.big{font-size:42px;padding:36px 40px}
.card .more{font-size:38px;color:oklch(48% 0.010 75)}
.cta .mid{position:absolute;left:80px;right:80px;top:330px;color:#fff}
.cta .kick{color:var(--soft)}
.cta h1{font-size:170px;margin-top:20px}
.cta p{font-size:42px;line-height:1.3;margin-top:30px;text-wrap:pretty}
.cta .path{margin-top:44px;font-family:"Bricolage Grotesque";font-weight:600;font-size:34px;border-bottom:4px solid var(--c);display:inline-block;padding-bottom:6px}`;

function caption(d) {
  const [h] = headline(d.title);
  const answer = sentences(PRICED.has(d.type) ? d.description : d.quickAnswer, 600);
  const tags = TAGS[d.category] ?? '#recovery';
  // Instagram: 2,200 characters and 30 hashtags at most; links in captions are not clickable.
  return clip(`${h}\n\n${answer}\n\nSwipe for the details. The full guide, with every source linked, is at the link in bio.\n\nBy Cole Garrison, GarageRecoveryLab\n\n${tags}`, 2200);
}

const dir = 'src/content/articles';
const guides = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const slug = f.replace(/\.md$/, '');
  return { slug, d: { ...YAML.parse(fm), slug }, body };
}).filter(({ slug, d }) => d.hero && d.draft === false && (!ONLY || ONLY.includes(slug)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
let made = 0, failed = 0;
for (const { slug, d, body } of guides) {
  const gdir = path.join(OUT, slug);
  if (fs.existsSync(path.join(gdir, 'slides.json')) && !flag('--force')) continue;
  const slides = slidesFor(d, body);
  const tmp = gdir + '.tmp';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  let ok = true;
  for (const [i, html] of slides.entries()) {
   // A long answer first gets a smaller type size; only if that still overflows is the guide skipped.
   for (const tight of [false, true]) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
      <body class="${COLD.has(d.category) ? 'cold' : 'heat'}${tight ? ' tight' : ''}">${html}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.evaluate(() => [...document.images].some((im) => !im.complete || im.naturalWidth === 0));
    // Text running past the footer means a slide would be cut off; never post that.
    const overflow = await page.evaluate(() => { const c = document.querySelector('.card .wrap');
      if (c) return c.scrollHeight > c.clientHeight + 2;
      const w = document.querySelector('.txt,.mid'); const f = document.querySelector('.foot');
      return w && f ? w.getBoundingClientRect().bottom > f.getBoundingClientRect().top - 10 : false; });
    if (overflow && !tight) continue;
    if (broken || overflow) { console.log(`${broken ? 'photo failed' : 'text overflow'}, skipped`, slug, i + 1); ok = false; break; }
    await page.screenshot({ path: path.join(tmp, `${i + 1}.jpg`), type: 'jpeg', quality: 85 });
    break;
   }
   if (!ok) break;
  }
  if (!ok) { fs.rmSync(tmp, { recursive: true, force: true }); failed++; continue; }
  fs.writeFileSync(path.join(tmp, 'slides.json'), JSON.stringify({ slug, published: String(d.published).slice(0, 10), count: slides.length, caption: caption(d) }, null, 2) + '\n');
  fs.rmSync(gdir, { recursive: true, force: true });
  fs.renameSync(tmp, gdir);
  made++;
}
if (flag('--sheet')) {
  for (const { slug } of guides) {
    const gdir = path.join(OUT, slug);
    if (!fs.existsSync(gdir)) continue;
    const files = fs.readdirSync(gdir).filter((f) => f.endsWith('.jpg')).sort((a, b) => parseInt(a) - parseInt(b));
    await page.setViewportSize({ width: 270 * 5, height: 338 * Math.ceil(files.length / 5) });
    await page.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(5,270px)">${files.map((f) =>
      `<img style="width:270px;height:338px" src="data:image/jpeg;base64,${fs.readFileSync(path.join(gdir, f)).toString('base64')}">`).join('')}</body>`);
    await page.screenshot({ path: path.join(OUT, `${slug}-sheet.png`) });
  }
}
await browser.close();
console.log(`rendered ${made} carousels, ${failed} skipped`);
