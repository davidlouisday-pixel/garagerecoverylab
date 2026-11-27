// One RSS feed per Pinterest board, connected under Pinterest > Settings > Bulk create Pins > Auto-publish.
// Each item is one rotation pin (see src/data/pins.ts); Pinterest makes a new pin for each new item.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { BOARDS, airedFor, pinImage, pinTitle } from '../../data/pins';

export const getStaticPaths = () => Object.keys(BOARDS).map((board) => ({ params: { board } }));

export async function GET(context) {
  const { board } = context.params;
  const articles = await getCollection('articles');
  const items = airedFor(board, articles).slice(0, 30);
  return rss({
    title: `GarageRecoveryLab: ${BOARDS[board].name}`,
    description: `Pins for the ${BOARDS[board].name} board.`,
    site: context.site,
    items: items.map(({ a, v, airs }) => ({
      title: pinTitle(a, v),
      description: a.data.description,
      // Distinct link per pin so Pinterest treats each as new, and so Analytics can tell them apart.
      link: `/${a.id}/?utm_source=pinterest&utm_medium=social&utm_campaign=rotation&utm_content=pin-${v}`,
      pubDate: airs,
      enclosure: { url: new URL(pinImage(a.id, v), context.site).toString(), length: 0, type: 'image/jpeg' },
    })),
  });
}
