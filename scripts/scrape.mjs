import fetch from 'node-fetch';
import http from 'https';
import {promises as fs} from 'fs';
import {dirname} from 'path';
import dateFns from 'date-fns';

const fileUrl = new URL(import.meta.url);
const fileDir = dirname(fileUrl.pathname);
const projectDir = dirname(fileDir);

async function main() {
  const text = await getHttpText(
    'https://www.sfdph.org/dph/alerts/coronavirus.asp',
  );
  const match = text.match(/Total Positive Cases: (\d+)/);

  if (match) {
    const total = parseInt(match[1]);

    const dataFile = projectDir + '/data/sf.json';
    const data = JSON.parse(await fs.readFile(dataFile));

    const currentDay = dateFns.startOfDay(new Date()).toISOString();
    let day = data.find(day => day.date === currentDay);

    if (!day) {
      day = {date: currentDay, total};
      data.push(day);
    } else {
      day.total = total;
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
