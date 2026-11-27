// Pinterest rotation: every guide gets 3 extra pins, each with its own design, aired over the
// weeks after it goes live, one feed per Pinterest board (src/pages/pins/[board].xml.js).
// Images are rendered by scripts/make-auto-pins.mjs (run daily by .github/workflows/release.yml)
// into public/pins/auto/<slug>-<variant>.jpg. A pin only airs once its image exists.
import fs from 'node:fs';
import { isLive } from './live';

export const VARIANTS = [1, 2, 3] as const;
// Days after a guide goes live that each variant airs (before the daily cap below).
const OFFSET_DAYS: Record<number, number> = { 1: 1, 2: 8, 3: 20 };
// At most this many rotation pins air per day across all boards, so the account never floods.
const DAILY_CAP = 4;
// Backlog starts airing from this day (the day the rotation launched), not all at once.
const LAUNCH = Date.UTC(2026, 10, 28);
const DAY = 86_400_000;

// Each Pinterest board gets its own feed. Article categories map to a board.
export const BOARDS: Record<string, { name: string; categories: string[] }> = {
  sauna: { name: 'Home Sauna Ideas', categories: ['sauna'] },
  'cold-plunge': { name: 'Cold Plunge at Home', categories: ['cold-plunge'] },
  'hot-tub': { name: 'Hot Tub Ideas and Costs', categories: ['hot-tub', 'swim-spa'] },
  'garage-gym': { name: 'Garage Gym Ideas', categories: ['garage-gym'] },
  'massage-chairs': { name: 'Massage Chair Guides', categories: ['massage-chair', 'red-light'] },
};

type Article = { id: string; data: any };

export const pinImage = (slug: string, v: number) => `/pins/auto/${slug}-${v}.jpg`;

const firstSentence = (s: string) => (s.match(/[^.?!]+[.?!]+(\s|$)/)?.[0] ?? s).trim();
const mainTitle = (t: string) => t.match(/^(.+?)[?:]\s/)?.[1] ?? t;
const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Pin title per variant: different words for each pin, all true to the guide.
export function pinTitle(a: Article, v: number) {
  if (v === 1) return clip(a.data.title, 100);
  if (v === 2) {
    const f = firstSentence(a.data.quickAnswer);
    return f.length <= 95 ? f : clip(mainTitle(a.data.title), 100);
  }
  return clip(`${cap(a.data.targetKeyword)}: the short answer`, 100);
}

// Every rotation pin for every non-draft guide (scheduled ones too), with the day it airs.
// Deterministic: the same articles always give the same schedule, so aired pins never move.
export function schedule(articles: Article[]) {
  const items = articles
    .filter((a) => !a.data.draft && !a.id.startsWith('_') && a.data.hero)
    .flatMap((a) =>
      VARIANTS.map((v) => {
        const natural = Math.max(a.data.published.getTime() + OFFSET_DAYS[v] * DAY, LAUNCH);
        return { a, v, natural: Math.floor(natural / DAY) * DAY };
      }),
    )
    .sort((x, y) => x.natural - y.natural || x.v - y.v || x.a.id.localeCompare(y.a.id));
  const perDay = new Map<number, number>();
  return items.map((it) => {
    let day = it.natural;
    while ((perDay.get(day) ?? 0) >= DAILY_CAP) day += DAY;
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
    return { ...it, airs: new Date(day) };
  });
}

// Pins that should be in a board's feed right now: aired, guide live, image rendered.
export function airedFor(board: string, articles: Article[], now = Date.now()) {
  const cats = BOARDS[board].categories;
  return schedule(articles)
    .filter(({ a, v, airs }) =>
      cats.includes(a.data.category) &&
      airs.getTime() <= now &&
      isLive(a.data) &&
      fs.existsSync(`public${pinImage(a.id, v)}`),
    )
    .sort((x, y) => y.airs.getTime() - x.airs.getTime() || y.v - x.v);
}
