# SF COVID Chart
This project was an effort to relieve a small amount of my anxiety about local numbers of reported cases of COVID-19 in San Francisco.

## Installation
Requires `yarn` and `node`.
1. `yarn`
1. `yarn build`
Static files are served out of the `public/` directory.

## Scraping
There is a simple script that scrapes the latest data from the SF Department of Public Health website. https://www.sfdph.org/dph/alerts/coronavirus.asp
```
node scripts/scrape.mjs
```
This will update the relevant data file at `data/sf.json`. I recommend running this and `yarn build` in a cronjob.
