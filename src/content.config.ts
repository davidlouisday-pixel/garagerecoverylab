import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Products: one record per product, shared by every comparison table.
// Prices and commissions change; `checked` records the date they were verified.
const products = defineCollection({
  loader: file('src/data/products.json'),
  schema: z.object({
    name: z.string(),
    brand: z.string(),
    category: z.enum(['sauna', 'cold-plunge', 'hot-tub', 'swim-spa', 'massage-chair', 'red-light', 'garage-gym']),
    // Merchant URL. Swap for the tracked affiliate link once a program approves us.
    url: z.string().url(),
    affiliate: z.boolean().default(false),
    priceUsd: z.number().nullable().default(null),
    checked: z.string().nullable().default(null),
    specs: z.record(z.string(), z.string()).default({}),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    // Only licensed images: affiliate network creatives, a brand media kit, or our own photos.
    image: z.object({ src: z.string(), alt: z.string(), credit: z.string() }).nullable().default(null),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    type: z.enum(['roundup', 'review', 'versus', 'guide', 'tool']),
    category: z.string(),
    targetKeyword: z.string(),
    // Two-sentence direct answer shown at the top: what AI answer engines quote.
    quickAnswer: z.string(),
    products: z.array(reference('products')).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    author: z.string().default('Cole Garrison'),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    draft: z.boolean().default(true),
    // Header photo from Pexels (free commercial license). Mood shots only, never shown as a specific product.
    hero: z.object({ pexelsId: z.number(), alt: z.string() }).optional(),
  }),
});

export const collections = { products, articles };
