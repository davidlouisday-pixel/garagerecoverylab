// RSS feed of published guides. Pinterest can auto-publish pins from it; each item carries a tall photo.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isLive } from '../data/live';

const tall = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000&h=1500&fit=crop`;

export async function GET(context) {
  const articles = (await getCollection('articles', ({ data }) => isLive(data)))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
  return rss({
    title: 'GarageRecoveryLab',
    description: 'Independent buying guides for home saunas, cold plunges, hot tubs and garage gym gear.',
    site: context.site,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      link: `/${a.id}/`,
      pubDate: a.data.published,
      // Prefer our own pin graphic; fall back to the tall crop of the Pexels hero photo.
      ...(a.data.pin
        ? { enclosure: { url: new URL(a.data.pin, context.site).toString(), length: 0, type: 'image/png' } }
        : a.data.hero && { enclosure: { url: tall(a.data.hero.pexelsId), length: 0, type: 'image/jpeg' } }),
    })),
  });
}
