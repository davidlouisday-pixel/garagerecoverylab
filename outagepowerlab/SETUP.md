# OutagePowerLab setup, step by step

Steps marked **David** need your account or password. Everything else Claude does.

1. **David: buy the domain** on Cloudflare (Domain Registration > Register Domains). If it is not `outagepowerlab.com`, tell Claude; it is a one-line change in `src/site.config.mjs`.
2. **David: create an empty GitHub repository** named `outagepowerlab` at https://github.com/new (no README, no .gitignore). Private is fine.
3. **David: add the repository to the Claude project** (Project settings > Resources), so Claude can push to it.
4. **Claude:** push this folder to the new repository's `main` branch.
5. **David: connect Cloudflare.** Workers & Pages > Create > Import a repository > pick `outagepowerlab`. Build command `npm run build`, deploy command `npx wrangler deploy` (the default). Save and deploy.
6. **David: add the custom domain.** In the new Worker: Settings > Domains & Routes > Add > Custom domain > `outagepowerlab.com`, then the same for `www.outagepowerlab.com`.
7. **David: create the leads database.** Storage & Databases > D1 > Create > name `outagepowerlab-leads`. Send Claude the database ID.
8. **Claude:** add the D1 binding to `wrangler.jsonc` and push. The quote form goes live.
9. **David: email.** Domain > Email > Email Routing > enable. Add `hello@` forwarding to your Gmail and verify it. Claude then turns on lead notification emails (`send_email` binding plus two vars).
10. **Claude:** add the site to Google Search Console and Bing Webmaster Tools in your browser, submit the sitemap, request indexing for the launch pages, and confirm IndexNow works.
11. **Later, David:** before charging any installer for a lead, have a lawyer review `src/data/consent.mjs`, the privacy policy and the terms, and check your state's rules for home improvement referral services.

Launch pages: home, 4 hubs, find an installer, 2 calculators, 3 guides, about, how we research, disclosure, privacy, terms, contact.
Scheduled: Dec 3 home battery cost, Dec 6 generator sizing, Dec 10 power station fridge runtime, Dec 13 generator vs battery. Push the dates if launch slips.
