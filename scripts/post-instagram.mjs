// Posts each given guide's carousel (rendered by make-carousels.mjs, live on the site under /ig/<slug>/)
// to Instagram through the Instagram API with Instagram Login. Needs IG_TOKEN (a long-lived token for the
// account). Skips quietly when IG_TOKEN is unset, so the release job works before the account exists.
// A guide whose path already appears in a recent caption is not posted again, so reruns are safe.
// Run: IG_TOKEN=... node scripts/post-instagram.mjs --slugs a,b [--site https://garagerecoverylab.com] [--dry-run]
//      IG_TOKEN=... node scripts/post-instagram.mjs --refresh   (prints a renewed 60-day token)
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const SITE = (opt('--site') ?? 'https://garagerecoverylab.com').replace(/\/$/, '');
const DRY = args.includes('--dry-run');
const API = 'https://graph.instagram.com/v24.0';
const TOKEN = process.env.IG_TOKEN;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!TOKEN) { console.log('IG_TOKEN not set; skipping Instagram.'); process.exit(0); }

async function call(method, path, params = {}) {
  const url = new URL(API + path);
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = method === 'GET'
    ? await fetch(url + '?' + body)
    : await fetch(url, { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${path}: ${JSON.stringify(json.error ?? json)}`);
  return json;
}

if (args.includes('--refresh')) {
  // Long-lived tokens last 60 days and can be renewed once they are at least 24 hours old.
  const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${TOKEN}`);
  const j = await r.json();
  if (!j.access_token) { console.error('Token refresh failed:', JSON.stringify(j.error ?? j)); process.exit(1); }
  console.log(`::add-mask::${j.access_token}`);
  fs.writeFileSync(process.env.GITHUB_OUTPUT ?? '/dev/stdout', `token=${j.access_token}\n`, { flag: 'a' });
  console.log(`Token renewed, expires in ${Math.round(j.expires_in / 86400)} days.`);
  process.exit(0);
}

const slugs = (opt('--slugs') ?? '').split(',').filter(Boolean);
if (!slugs.length) { console.log('No guides to post.'); process.exit(0); }

const recent = await call('GET', '/me/media', { fields: 'caption', limit: '25' });
const host = new URL(SITE).host;
let failed = 0;
for (const slug of slugs) {
  try {
    const file = `public/ig/${slug}/slides.json`;
    if (!fs.existsSync(file)) { console.log(`${slug}: no carousel rendered, skipped.`); continue; }
    const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (recent.data.some((m) => m.caption?.includes(`${host}/${slug}/`))) { console.log(`${slug}: already posted.`); continue; }
    // The plain-text path (not clickable on Instagram) also marks the post so it is never posted twice.
    const caption = meta.caption.replace(/\n\n(#.*)$/, `\n\n${host}/${slug}/\n\n$1`);
    const urls = Array.from({ length: meta.count }, (_, i) => `${SITE}/ig/${slug}/${i + 1}.jpg`);
    for (const u of urls) { const r = await fetch(u, { method: 'HEAD' }); if (!r.ok) throw new Error(`slide not live: ${u} (${r.status})`); }
    if (DRY) { console.log(`${slug}: would post ${urls.length} slides.\n${caption}`); continue; }
    const children = [];
    for (const image_url of urls) children.push((await call('POST', '/me/media', { image_url, is_carousel_item: 'true' })).id);
    const { id } = await call('POST', '/me/media', { media_type: 'CAROUSEL', children: children.join(','), caption });
    for (let i = 0; i < 30; i++) {
      const { status_code } = await call('GET', `/${id}`, { fields: 'status_code' });
      if (status_code === 'FINISHED') break;
      if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${status_code}`);
      await sleep(5000);
    }
    const post = await call('POST', '/me/media_publish', { creation_id: id });
    console.log(`${slug}: posted ${urls.length} slides, media ${post.id}.`);
  } catch (e) {
    console.error(`${slug}: ${e.message}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
