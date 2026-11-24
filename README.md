# GarageRecoveryLab.com

Independent reviews of saunas, cold plunges, hot tubs, massage chairs and garage gym gear.
Built with [Astro](https://astro.build) as a static site and deployed on Cloudflare.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321, drafts visible
npm run build    # production build into dist/, drafts excluded
```

## How content works

- **Articles** live in `src/content/articles/*.md`. Each one's front matter sets its title, target keyword, quick answer, products, FAQ and dates. See `_template-roundup.md`.
  - `draft: true` keeps an article out of production. Set `draft: false` only after first-hand evidence is added.
  - The URL is the file name: `best-home-sauna.md` becomes `/best-home-sauna/`.
- **Products** live in `src/data/products.json`. Every comparison table reads from it, so a price change updates every page.
  - `url` is the merchant link. When a program approves us, replace it with the tracked affiliate link and set `affiliate: true`, which adds `rel="sponsored"`.
  - `checked` is the date the price was last verified.
- **Category hubs** (`/saunas/`, `/cold-plunges/` and so on) are defined in `src/data/categories.ts`.

Every article automatically gets the affiliate disclosure, a dated quick-answer box, Article and FAQ schema, and an author box.

## Deploy on Cloudflare (one-time setup)

1. In the Cloudflare dashboard, open **Workers & Pages** and choose **Create**, then the **Pages** tab, then **Connect to Git**.
2. Authorize GitHub and pick `davidlouisday-pixel/garagerecoverylab`.
3. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`. Production branch: `main`.
4. Save and deploy. You get a `*.pages.dev` preview URL.
5. In the project's **Custom domains** tab, add `garagerecoverylab.com` and `www.garagerecoverylab.com`. The domain is already on Cloudflare, so DNS is set automatically.

After that, every merge to `main` deploys to production and every pull request gets its own preview URL.

## Owner to-dos

Search the code for `TODO(owner)`: real author identity on the About page, Cloudflare Email Routing for the contact address, and a review of the privacy policy before collecting emails or running ads.
