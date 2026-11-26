// Reader-facing names for an article's `type`.
export const typeLabel: Record<string, string> = {
  roundup: 'Buying guide',
  review: 'Review',
  versus: 'Comparison',
  guide: 'Guide',
  tool: 'Calculator',
};
export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
