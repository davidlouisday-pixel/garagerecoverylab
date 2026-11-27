# OutagePowerLab

Plain-numbers guides to home backup power: standby and portable generators, home batteries and portable power stations.
Built with [Astro](https://astro.build) as a static site, deployed as a Cloudflare Worker that also handles the installer quote form.
Same structure as GarageRecoveryLab (staged releases, IndexNow, RSS for Pinterest).

## Change the domain or brand

Everything reads from `src/site.config.mjs`: domain, site name, email, author and IndexNow key.
If you change `INDEXNOW_KEY`, rename the matching file in `public/`.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321, drafts visible
npm run build    # production build into dist/, future-dated guides excluded
```

## How content works

- **Guides** live in `src/content/articles/*.md`. The file name is the URL.
  - A future `published:` date hides the guide until that day; `.github/workflows/release.yml` rebuilds the site each morning and pings IndexNow.
  - `scripts/check-schedule.mjs` fails the build if a live guide links to a guide that is not live yet.
  - `installerCta: true` adds the "Need this installed?" box that links to the quote form.
  - Every guide ends with a Sources list. Claims need a real, checked source.
- **Hubs** (`/generators/`, `/home-batteries/`, `/power-stations/`, `/outage-prep/`) are in `src/data/categories.ts`.
- **Calculators** are pages: `src/pages/generator-size-calculator.astro`, `src/pages/power-station-runtime-calculator.astro`.
- **Products** (`src/data/products.json`) stay empty until affiliate programs approve us. No product links before then.

## Installer quote form

- Page: `src/pages/find-an-installer.astro`. Handler: `worker/index.js` (POST `/api/quote`).
- Leads are stored in a Cloudflare D1 database with the exact consent text and version (`src/data/consent.mjs`), IP, user agent and time.
- If the D1 binding is missing, the form answers "not open yet, please email us", so nothing is lost silently.
- Optional: email each lead to the owner with Cloudflare Email Routing (`send_email` binding). See `SETUP.md`.
- Change the consent text => bump `CONSENT_VERSION`. Have a lawyer review before selling any lead.

## Setup

See `SETUP.md`.
