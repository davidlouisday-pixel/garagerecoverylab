// Hub pages. `slug` is the URL; `key` matches an article's `category` field.
// `hero` is an optional Pexels mood photo (free commercial license). `tone` picks the accent color.
type Hero = { pexelsId: number; alt: string };
type Category = { slug: string; key: string; title: string; blurb: string; hero?: Hero; tone?: 'amber' | 'teal' };

export const categories: readonly Category[] = [
  { slug: 'generators', key: 'generator', title: 'Generators', tone: 'amber', blurb: 'Standby and portable generators: what size you need, what installation really costs, and how to run one without hurting anyone.', hero: { pexelsId: 3702685, alt: 'A wooden utility pole and power lines against the sky' } },
  { slug: 'home-batteries', key: 'home-battery', title: 'Home Batteries', tone: 'teal', blurb: 'Whole-home and essential-load battery backup, with installed prices, sizing and how long a battery really lasts in an outage.', hero: { pexelsId: 17762230, alt: 'Solar panels on the roof of a house' } },
  { slug: 'power-stations', key: 'power-station', title: 'Power Stations', tone: 'teal', blurb: 'Portable power stations and solar generators: runtime math for fridges, CPAPs, sump pumps and phones.', hero: { pexelsId: 6233727, alt: 'A row of houses with solar panels on their roofs' } },
  { slug: 'outage-prep', key: 'outage-prep', title: 'Outage Safety', tone: 'amber', blurb: 'Carbon monoxide, transfer switches, backfeeding and the other things that turn a power outage into an emergency.', hero: { pexelsId: 5843608, alt: 'A single lit candle in a dark room' } },
];

export type CategoryKey = (typeof categories)[number]['key'];

// 'amber' or 'teal' for an article's category, used for the accent color.
export const toneOf = (key: string) => categories.find((c) => c.key === key)?.tone;
