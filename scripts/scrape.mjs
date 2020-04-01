import fetch from 'node-fetch';
import http from 'https';
import {promises as fs} from 'fs';
import {dirname} from 'path';
import dateFns from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';

const fileUrl = new URL(import.meta.url);
const fileDir = dirname(fileUrl.pathname);
const projectDir = dirname(fileDir);

async function main() {
  const text = await getHttpText(
    'https://www.sfdph.org/dph/alerts/coronavirus.asp',
  );
  const casesMatch = text.match(/Total Positive Cases: (\d+)/);
  const deathsMatch = text.match(/Deaths: (\d+)/);

  if (casesMatch) {
    const total = parseInt(casesMatch[1]);
    const deaths = deathsMatch ? parseInt(deathsMatch[1]) : 0;

    const dataFile = projectDir + '/data/sf.json';
    const data = JSON.parse(await fs.readFile(dataFile));

    const currentDay = dateFns.startOfDay(utcToZonedTime(new Date(), 'America/Los Angeles')).toISOString();
    let day = data.find(day => day.date === currentDay);

    if (!day) {
      day = {date: currentDay, total, deaths};
      data.push(day);
    } else {
      day.total = total;
      day.deaths = deaths;
    }

    await fs.writeFile(dataFile, JSON.stringify(data, undefined, ' '));
  }


  /*
  let response;
  try {
    response = await fetch('https://www.sfdph.org/dph/alerts/coronavirus.asp');
  } catch (error) {
    if (error.name === 'FetchError') {
      console.log('error', error);
      // pass
    } else {
      throw error;
    }
  }

  const match = (await response.text()).match(/Total Positive Cases: (\d+)/);

  console.log('hio', match);
   */
}

main();

function getHttp(...params) {
  return new Promise((resolve, reject) => {
    http.get(...params, response => {
      if (response.statusCode >= 300) {
        reject(new HttpError(response));
      }
      resolve(response);
    });
  });
}

async function getHttpText(...params) {
  const response = await getHttp(...params);

  response.setEncoding('utf8');
  let rawData = '';
  response.on('data', chunk => {
    rawData += chunk;
  });

  return new Promise(resolve => {
    response.on('end', () => {
      resolve(rawData);
    });
  });
}

class HttpError extends Error {
  constructor(message) {
    this.incomingMessage = message;
  }
}
