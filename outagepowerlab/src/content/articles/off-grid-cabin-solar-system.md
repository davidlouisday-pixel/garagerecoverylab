---
# Sizing guide. Penn State AE 868 sizing method, NMSU CR671 derate, SunDanzer DC fridge specs, ENERGY STAR, Honda. Read 2026-11-27. Scheduled.
title: "Off-Grid Cabin Solar System: How Big Does It Need to Be?"
description: "A weekend cabin can run on about 300 W of panels and a 4 kWh battery; a full-time cabin needs 1,300 W and 17 kWh or more. Here is the sizing math, step by step."
type: guide
category: off-grid
targetKeyword: off grid cabin solar system
quickAnswer: "Size an off-grid cabin solar system from your daily energy use. A weekend cabin using about 1,000 Wh a day needs roughly a 3.75 kWh battery bank for three cloudy days and about 300 watts of panels at 4 peak sun hours. A full-time cabin with a standard fridge, washer and TV, about 4,500 Wh a day, needs roughly 17 kWh of battery and 1,300 watts of panels."
faq:
  - q: "How many solar panels do I need for an off-grid cabin?"
    a: "Divide your daily energy use by your peak sun hours, then by about 0.85 for real-world losses. A cabin using 1,000 Wh a day at 4 peak sun hours needs about 300 watts, or three 100 W panels. Plan on more for winter, when peak sun hours drop."
  - q: "How big a battery does an off-grid cabin need?"
    a: "Daily energy times the number of cloudy days you want to ride through, divided by the battery's usable depth of discharge. At 1,000 Wh a day, three days and 80 percent usable depth, that is about 3,750 Wh."
  - q: "Can a cabin run a regular refrigerator on solar?"
    a: "Yes, but it is usually the biggest load. A standard fridge using 450 kWh a year averages about 1,230 Wh a day. An efficient DC fridge such as SunDanzer's DC160 is rated at 150 Wh a day at 90°F, about one eighth as much."
  - q: "Do I need a generator with off-grid solar?"
    a: "Not strictly, but it lets you buy a smaller battery bank. Penn State's sizing course ties days of autonomy to how reliable the system must be, and a generator is the usual way to cover long cloudy stretches without paying for many days of battery."
author: Cole Garrison
published: 2026-12-17
updated: 2026-12-17
hero:
  pexelsId: 749231
  alt: "A snow-covered wooden cabin in a forest"
draft: false
---

I am researching power for an off-grid cabin I plan to build, and this is the sizing math I wish I had found in one place. It follows the stand-alone sizing method taught in Penn State's solar design course, with published appliance figures. I have not built this system yet, so treat it as a planning estimate. Wiring, charge controller sizing and code compliance belong to a qualified installer.

Want to skip the math? The [off-grid solar calculator](/off-grid-solar-calculator/) does every step below for your own list.

## Step 1: add up daily energy

List everything you will run, with watts and hours per day. Watts times hours is watt-hours (Wh). Two shortcuts:

- **Fridges cycle on and off.** For a standard fridge, take the kWh per year from its EnergyGuide label and divide by 8.76 to get average watts, then multiply by 24. For a DC fridge, use the maker's Wh-per-day rating.
- **Big loads that run briefly** (microwave, washer) still count. A 1,500 W microwave for 15 minutes is 375 Wh.

Then divide by inverter efficiency, because converting battery power to household AC loses some energy. We use 85 percent as a planning assumption.

## Step 2: size the battery bank

**Battery Wh = daily Wh x days of autonomy / usable depth of discharge**

- **Days of autonomy** is how many days with little sun the battery must cover. Penn State's example pairs three days with about 95 percent availability at 5 peak sun hours, and ten days for critical loads at 4 peak sun hours.
- **Usable depth of discharge** is how much of the battery you can use. Penn State says it "ranges from 20%-80% depending on battery type." Use your battery maker's figure.

## Step 3: size the solar panels

**Panel watts = daily Wh / peak sun hours / derate**

- **Peak sun hours** are the equivalent hours of full sun per day at your site. NREL's free PVWatts tool gives monthly values for any U.S. address. Use your worst month, which is usually winter. Penn State sizes for the "critical month".
- **Derate** covers heat, dust and wiring losses. New Mexico State's solar design guide uses 85 percent of a panel's rated power.

## Example 1: weekend cabin, about 1,000 Wh a day

| Load | Watts | Hours a day | Wh a day |
| --- | --- | --- | --- |
| 8 LED bulbs | 80 | 5 | 400 |
| DC fridge (SunDanzer DC160 rating) | | | 150 |
| 2 phones charging | 20 | 3 | 60 |
| Laptop | 60 | 4 | 240 |
| **Total** | | | **850** |

The bulb and laptop watts are typical examples, not measured figures; use your own. Through an 85 percent inverter, 850 Wh becomes about **1,000 Wh** from the battery.

- **Battery:** 1,000 x 3 days / 0.80 = **3,750 Wh**, about 310 Ah at 12 volts or 78 Ah at 48 volts.
- **Panels:** 1,000 / 4 peak sun hours / 0.85 = **about 300 W**.

## Example 2: full-time cabin, about 4,500 Wh a day

| Load | Watts | Hours a day | Wh a day |
| --- | --- | --- | --- |
| Standard fridge, 450 kWh a year | 51 average | 24 | 1,233 |
| 8 LED bulbs | 80 | 5 | 400 |
| Internet equipment | 15 | 24 | 360 |
| Laptop and phones | | | 300 |
| 46 inch TV (Honda estimate) | 190 | 3 | 570 |
| 1,000 W microwave (Honda estimate) | 1,500 | 0.25 | 375 |
| Washing machine (Honda estimate) | 1,200 | 0.5 | 600 |
| **Total** | | | **3,838** |

Through the inverter, that is about **4,500 Wh** a day.

- **Battery:** 4,500 x 3 / 0.80 = **about 17 kWh**.
- **Panels:** 4,500 / 4 / 0.85 = **about 1,300 W**.

The fridge alone is a third of the load. Swapping it for an efficient DC fridge is often the cheapest way to shrink the whole system.

## What this leaves out

- **Heating, cooking and hot water.** Electric resistance heat is rarely practical on off-grid solar. Most cabins use wood, propane or both.
- **Well pumps.** A deep well pump can be the biggest single load. Many off-grid properties use a dedicated solar pump that fills a storage tank instead.
- **Winter.** If you will use the cabin in winter, peak sun hours can fall sharply, and snow covers panels. Size for that month or plan on a generator.

## Sources

- Penn State, AE 868, [Stand-alone system sizing](https://courses.ems.psu.edu/ae868/node/924), read November 27, 2026.
- New Mexico State University, [Circular 671, Solar-Powered Water Pump Design](https://pubs.nmsu.edu/_circulars/CR671.pdf), revised September 2014.
- NREL, [PVWatts calculator](https://pvwatts.nrel.gov/), read November 27, 2026.
- SunDanzer, [DCR160/DCF160 specifications](https://sundanzer.com/product/dcr160-dcf160/), updated October 21, 2026.
- Honda Power Equipment, [Generator Wattage Estimation Guide](https://powerequipment.honda.com/generators/generator-wattage-estimation-guide), read November 27, 2026.
