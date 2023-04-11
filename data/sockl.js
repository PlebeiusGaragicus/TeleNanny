// const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';

(async () => {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  client.on('Network.webSocketCreated', ({requestId, url}) => {
    console.log(`WebSocket created: ${url}`);
  });

  client.on('Network.webSocketClosed', ({requestId, timestamp}) => {
    console.log(`WebSocket closed.`);
  });

  client.on('Network.webSocketFrameSent', async ({requestId, timestamp, response}) => {
    console.log(`WebSocket message sent: ${response.payloadData}`);
  });

  client.on('Network.webSocketFrameReceived', async ({requestId, timestamp, response}) => {
    console.log(`WebSocket message received: ${response.payloadData}`);
  });

  // Navigate to the login page
  await page.goto('https://apps.intterragroup.com');
  await page.waitForSelector('[name="username"]');

  // Fill in the login form and submit
  await page.type('[name="username"]', 'sta9');
  await page.type('[name="password"]', 'PFRsta9!');
  await page.click('button.primary');

  // Wait for navigation and network to be idle
//   await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Add any other scraping logic you need here.

  // Close the browser when done.
//   await browser.close();
})();
