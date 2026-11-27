// Cloudflare Worker in front of the static site. Static files are served from ./dist (the ASSETS binding);
// this script only handles POST /api/quote, the find-an-installer form.
//
// Bindings (wrangler.jsonc):
//   DB     D1 database. Leads are stored here with the exact consent text the person agreed to.
//   NOTIFY optional send_email binding (Cloudflare Email Routing) to email each new lead to the owner.
// Vars: LEAD_NOTIFY_TO (verified Email Routing destination), LEAD_NOTIFY_FROM (an address on the domain).
import { CONSENT_TEXT, CONSENT_VERSION } from '../src/data/consent.mjs';
import { SITE_NAME } from '../src/site.config.mjs';

const PROJECTS = ['standby-generator', 'transfer-switch', 'home-battery', 'solar-battery', 'not-sure'];
const TIMEFRAMES = ['asap', '1-3-months', '3-12-months', 'researching'];

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  project TEXT, zip TEXT, owner TEXT, timeframe TEXT,
  name TEXT, email TEXT, phone TEXT, notes TEXT,
  consent INTEGER NOT NULL, consent_version TEXT NOT NULL, consent_text TEXT NOT NULL,
  ip TEXT, user_agent TEXT, page TEXT,
  status TEXT NOT NULL DEFAULT 'new', sent_to TEXT, opted_out INTEGER NOT NULL DEFAULT 0
)`;

const wantsJson = (req) => (req.headers.get('Accept') || '').includes('application/json');
const reply = (req, status, body) =>
  wantsJson(req)
    ? Response.json(body, { status })
    : status < 300
      ? Response.redirect(new URL('/quote-sent/', req.url).toString(), 303)
      : new Response(body.error, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

async function handleQuote(req, env) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  let f;
  try { f = await req.formData(); } catch { return reply(req, 400, { error: 'Could not read the form.' }); }
  const get = (k, max = 200) => String(f.get(k) ?? '').trim().slice(0, max);

  // Bots fill the hidden field; pretend success so they move on.
  if (get('website')) return reply(req, 200, { ok: true });

  const lead = {
    project: get('project', 40), zip: get('zip', 5), owner: get('owner', 10), timeframe: get('timeframe', 20),
    name: get('name', 100), email: get('email', 200), phone: get('phone', 20).replace(/[^\d+]/g, ''), notes: get('notes', 1000),
    page: get('page', 200),
  };
  const errors = [];
  if (!PROJECTS.includes(lead.project)) errors.push('choose a project');
  if (!/^\d{5}$/.test(lead.zip)) errors.push('enter a 5-digit ZIP code');
  if (!['own', 'rent'].includes(lead.owner)) errors.push('tell us if you own the home');
  if (!TIMEFRAMES.includes(lead.timeframe)) errors.push('choose a timeframe');
  if (lead.name.length < 2) errors.push('enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.push('enter a valid email');
  if (lead.phone.replace(/\D/g, '').length < 10) errors.push('enter a 10-digit phone number');
  // Consent must be an affirmative, unchecked-by-default box, and must match the text we currently show.
  if (get('consent') !== 'yes') errors.push('check the consent box');
  if (get('consent_version') !== CONSENT_VERSION) errors.push('reload the page and try again');
  if (errors.length) return reply(req, 400, { error: `Please ${errors.join(', ')}.` });

  if (!env.DB) return reply(req, 503, { error: 'Quote requests are not open yet. Please email us instead.' });
  await env.DB.prepare(SCHEMA).run();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO leads (created_at, project, zip, owner, timeframe, name, email, phone, notes, consent, consent_version, consent_text, ip, user_agent, page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
  ).bind(now, lead.project, lead.zip, lead.owner, lead.timeframe, lead.name, lead.email, lead.phone, lead.notes,
    CONSENT_VERSION, CONSENT_TEXT, req.headers.get('CF-Connecting-IP') || '', (req.headers.get('User-Agent') || '').slice(0, 300), lead.page).run();

  // Email the owner. A failed email must never lose the lead, which is already saved.
  if (env.NOTIFY && env.LEAD_NOTIFY_TO && env.LEAD_NOTIFY_FROM) {
    try {
      const { EmailMessage } = await import('cloudflare:email');
      const body = Object.entries({ ...lead, received: now }).map(([k, v]) => `${k}: ${v}`).join('\r\n');
      const raw = [
        `From: ${SITE_NAME} <${env.LEAD_NOTIFY_FROM}>`, `To: ${env.LEAD_NOTIFY_TO}`,
        `Subject: New ${lead.project} lead, ZIP ${lead.zip}`, `Message-ID: <${crypto.randomUUID()}@${new URL(req.url).hostname}>`,
        `Date: ${new Date().toUTCString()}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', '', body,
      ].join('\r\n');
      await env.NOTIFY.send(new EmailMessage(env.LEAD_NOTIFY_FROM, env.LEAD_NOTIFY_TO, raw));
    } catch (e) { console.log('lead email failed', e && e.message); }
  }
  return reply(req, 200, { ok: true });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/quote') return handleQuote(req, env);
    return env.ASSETS.fetch(req);
  },
};
