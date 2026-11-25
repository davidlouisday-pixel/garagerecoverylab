// Hub pages. `slug` is the URL; `key` matches an article's `category` field.
export const categories = [
  { slug: 'saunas', key: 'sauna', title: 'Saunas', blurb: 'Infrared, traditional, barrel and outdoor saunas, compared on heat-up time, running cost and build quality.' },
  { slug: 'cold-plunges', key: 'cold-plunge', title: 'Cold Plunges', blurb: 'Chilled tubs, budget ice baths and chillers, compared on temperature hold, filtration and real running cost.' },
  { slug: 'hot-tubs', key: 'hot-tub', title: 'Hot Tubs and Swim Spas', blurb: 'Plug-and-play spas to full swim spas, with honest purchase, install and monthly cost numbers.' },
  { slug: 'massage-chairs', key: 'massage-chair', title: 'Massage Chairs', blurb: 'Premium and mid-range massage chairs, compared on track length, fit and warranty.' },
  { slug: 'recovery-tech', key: 'recovery-tech', title: 'Recovery Tech', blurb: 'Red light panels, PEMF mats, sauna blankets and other home recovery gear.' },
  { slug: 'garage-gym', key: 'garage-gym', title: 'Garage Gym', blurb: 'Racks, smart gyms and conditioning gear for the space next to your sauna.' },
] as const;

export type CategoryKey = (typeof categories)[number]['key'];
