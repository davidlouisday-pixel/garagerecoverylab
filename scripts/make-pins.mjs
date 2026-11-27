// Renders our own Pinterest graphics (1000x1500) to public/pins/*.png with Playwright.
// Run: node scripts/make-pins.mjs. Each pin's facts come from the guide it links to.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // uses the globally installed Playwright

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;background:oklch(97% 0.007 86);color:oklch(16% 0.012 280);font-family:"Source Serif 4",Georgia,serif;display:flex;flex-direction:column}
.bar{height:22px;background:linear-gradient(90deg,oklch(56% 0.175 42) 0 50%,oklch(52% 0.135 248) 50% 100%)}
.wrap{padding:70px 72px 0;flex:1;display:flex;flex-direction:column}
.kicker{font-family:"Bricolage Grotesque";font-weight:700;font-size:30px;letter-spacing:.06em;text-transform:uppercase;color:var(--c)}
h1{font-family:"Bricolage Grotesque";font-weight:800;font-variation-settings:"wdth" 75,"opsz" 96;font-size:108px;line-height:.92;letter-spacing:-.01em;margin-top:18px}
.sub{font-size:36px;line-height:1.3;margin-top:26px;max-width:30ch}
.rows{margin-top:44px;display:grid;gap:18px}
.row{display:grid;grid-template-columns:1fr auto;align-items:center;padding:26px 30px;background:var(--soft);border-left:14px solid var(--c)}
.row .n{font-family:"Bricolage Grotesque";font-weight:700;font-size:40px;line-height:1.1}
.row .d{font-size:26px;margin-top:6px;color:oklch(29% 0.011 280)}
.row .v{font-family:"Bricolage Grotesque";font-weight:800;font-variation-settings:"wdth" 75,"opsz" 96;font-size:66px;color:var(--deep);text-align:right;white-space:nowrap}
.note{font-size:25px;line-height:1.35;margin-top:32px;color:oklch(29% 0.011 280)}
.foot{margin-top:auto;padding:34px 72px 44px;display:flex;justify-content:space-between;align-items:baseline;font-family:"Bricolage Grotesque";font-weight:700}
.brand{font-variation-settings:"wdth" 75,"opsz" 48;font-size:46px}.brand b{color:oklch(56% 0.175 42)}.brand i{font-style:normal;color:oklch(52% 0.135 248)}
.url{font-size:26px;font-weight:500;color:oklch(48% 0.010 75)}
.heat{--c:oklch(56% 0.175 42);--deep:oklch(50% 0.165 40);--soft:oklch(94% 0.035 55)}
.cold{--c:oklch(52% 0.135 248);--deep:oklch(44% 0.12 250);--soft:oklch(94% 0.025 240)}`;

const pins = [
  {
    file: 'sauna-temperature-chart', temp: 'heat', kicker: 'Sauna temperature guide',
    title: 'How hot should a&nbsp;sauna be?', sub: 'Typical ranges, and what the Finnish heart study used.',
    rows: [
      ['Traditional sauna', 'Dry heat, under 20% humidity', '150–195°F'],
      ['Finnish study average', '2,315 men followed for 20 years', '174°F'],
      ['Infrared sauna', 'Panels warm you directly', '110–135°F'],
      ['Steam room', 'Close to 100% humidity', '110–122°F'],
      ['Beginner start', 'For 5 to 10 minutes', '150–160°F'],
    ],
    note: 'Sources: Cleveland Clinic; Laukkanen et al., JAMA Internal Medicine 2015; Columbia University. Not medical advice.',
  },
  {
    file: 'cold-plunge-chart', temp: 'cold', kicker: 'Cold plunge guide',
    title: 'How cold, how long?', sub: 'What the cold water research actually used.',
    rows: [
      ['Best for soreness', '9 trials, 169 people', '52–59°F'],
      ['Time in those trials', 'Longest immersions did worse', '11–15 min'],
      ['Winter swimmers', 'Total cold time per week', '11 min'],
      ['Starting out', 'Our suggestion, not a study dose', '1–3 min'],
      ['After lifting', 'Plunging right after cut muscle gains', 'Wait'],
    ],
    note: 'Sources: Machado et al., Sports Medicine 2016; Søberg et al., Cell Reports Medicine 2021; Roberts et al., J Physiol 2015. Never plunge alone.',
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
for (const p of pins) {
  const rows = p.rows.map(([n, d, v]) => `<div class="row"><div><div class="n">${n}</div><div class="d">${d}</div></div><div class="v">${v}</div></div>`).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${p.temp}">
    <div class="bar"></div><div class="wrap"><div class="kicker">${p.kicker}</div><h1>${p.title}</h1><p class="sub">${p.sub}</p>
    <div class="rows">${rows}</div><p class="note">${p.note}</p></div>
    <div class="foot"><span class="brand"><b>Garage</b><i>Recovery</i>Lab</span><span class="url">garagerecoverylab.com</span></div></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/pins/${p.file}.png` });
  console.log('wrote', p.file);
}
await browser.close();
