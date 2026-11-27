// Hub pages. `slug` is the URL; `key` matches an article's `category` field.
// `hero` is an optional Pexels mood photo (free commercial license).
type Hero = { pexelsId: number; alt: string };
type Category = { slug: string; key: string; title: string; blurb: string; hero?: Hero; temp?: 'heat' | 'cold' };

export const categories: readonly Category[] = [
  { slug: 'saunas', key: 'sauna', title: 'Saunas', temp: 'heat', blurb: 'Infrared, traditional, barrel and outdoor saunas, compared on heat-up time, running cost and build quality.', hero: { pexelsId: 39912941, alt: 'Warm light on the wooden walls and benches of a modern sauna' } },
  { slug: 'cold-plunges', key: 'cold-plunge', title: 'Cold Plunges', temp: 'cold', blurb: 'Chilled tubs, budget ice baths and chillers, compared on temperature hold, filtration and real running cost.', hero: { pexelsId: 35874553, alt: 'A group taking an ice bath outdoors at sunrise' } },
  { slug: 'hot-tubs', key: 'hot-tub', title: 'Hot Tubs and Swim Spas', temp: 'heat', blurb: 'Plug-and-play spas to full swim spas, with honest purchase, install and monthly cost numbers.', hero: { pexelsId: 9899878, alt: 'A wooden hot tub on a deck overlooking a forest lake' } },
  { slug: 'massage-chairs', key: 'massage-chair', title: 'Massage Chairs', blurb: 'Premium and mid-range massage chairs, compared on track length, fit and warranty.', hero: { pexelsId: 9146381, alt: 'A massage therapist working on a client in a calm spa room' } },
  { slug: 'recovery-tech', key: 'recovery-tech', title: 'Recovery Tech', blurb: 'Red light panels, PEMF mats, sauna blankets and other home recovery gear.' },
  { slug: 'garage-gym', key: 'garage-gym', title: 'Garage Gym', blurb: 'Racks, smart gyms and conditioning gear for the space next to your sauna.', hero: { pexelsId: 7174396, alt: 'A garage converted into a home gym with a rack and weights' } },
];

export type CategoryKey = (typeof categories)[number]['key'];

// 'heat' or 'cold' for an article's category, used for the orange and blue accents.
export const tempOf = (key: string) => categories.find((c) => c.key === key)?.temp;
