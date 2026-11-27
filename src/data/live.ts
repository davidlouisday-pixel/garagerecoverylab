// An article is live when it is not a draft and its publish date has arrived.
// Future-dated articles are built nowhere (pages, home, categories, RSS, sitemap) until that date;
// .github/workflows/release.yml rebuilds the site each morning so they appear on schedule.
export const isLive = (data: { draft: boolean; published: Date }) =>
  !data.draft && data.published.getTime() <= Date.now();
