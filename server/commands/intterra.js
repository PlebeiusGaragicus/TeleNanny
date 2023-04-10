import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

// TODO: the path to the units: https://dc.intterragroup.com/v1/sitstat/data/units
// https://developers.google.com/maps/documentation/urls/get-started

import { getValue } from '../database.js';
import { bot } from '../bot.js';

let browser = null;
let currentCallID = null;


export async function runIntterra() {

    // TODO: if intterra is enbled...

    const user = await getValue('intterra_username');
    const pass = await getValue('intterra_password');
    // console.log("user: ", user, " pass: ", pass);
    if (!user || !pass) {
        console.error("Intterra username or password not set in database");
        return;
    }

    const unit = await getValue('intterra_unit');
    if (!unit) {
        console.error("Intterra unit not set in database");
        return;
    }

    console.log("Interra is watching unit: ", unit);

    // const { browser, page } = await openPage();
    // const browser = await puppeteer.launch({ headless: false });
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://apps.intterragroup.com');
    // TODO: should actually wait for the DOM to load...
    // await page.waitForTimeout(2000);
    await page.waitForNetworkIdle();

    page.on('response', async (response) => {
        const url = response.url();
        const status = response.status();

        // Check if the response is related to the data you want to parse
        if (status === 200 && url.includes('/v1/sitstat/data/incidents')) {
            const data = await response.json();
            parseNewCalls(data);
        }
    });

    // LOG IN
    await page.type('[name="username"]', user);
    await page.type('[name="password"]', pass);
    await page.click('button.primary');
}

async function parseNewCalls(data) {
    const unit = await getValue('intterra_unit');

    console.log("Intterra: NEW INCIDENT LIST!!!!");
    for (const incident of data) {
        const units = incident.assignedUnits.split(', ');
        if (!units.includes(unit))
            continue;

        if (incident.id === currentCallID) {
            // console.log("Skipping call because it's the same as the last one:")
            return;
        }

        currentCallID = incident.id;

        console.log("TAPOUT TAPOUT TAPOUT TAPOUT TAPOUT TAPOUT!")
        const call = {
            // id: incident.id,
            cadCode: incident.cadCode,
            cadDescription: incident.cadDescription,
            address: incident.fullAddress,
            lat: incident.latitude,
            lon: incident.longitude,
            narrative: incident.narrative,
            // units: units
        }

        alertUser(call);
    }
}



async function alertUser(call) {
    const google_URL = `https://www.google.com/maps/search/?api=1&query=${call.lat}%2C${call.lon}`
    const where = `\n${call.address}\n\n${google_URL}`
    const what = `\n<b>${call.cadCode} ${call.cadDescription}</b>\n${call.narrative}\n\n`

    const msg = `🚨 🚒💨\n${what}${where}`;

    const chatID = await getValue('chat_id');
    await bot.telegram.sendMessage(chatID, msg, { parse_mode: 'HTML' });
}




// async function openPage() {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.goto('https://apps.intterragroup.com');
//     // TODO: should actually wait for the DOM to load...
//     // await page.waitForTimeout(2000);
//     await page.waitForNetworkIdle();

//     return { browser, page };
// }

// async function login(page) {
//     console.log("Logging in to Intterra...");
//     const user = await getValue('intterra_username');
//     const pass = await getValue('intterra_password');

//     console.log("user: ", user, " pass: ", pass);
//     if (!user || !pass) {
//         console.error("Intterra username or password not set in database");
//         return;
//     }

//     await page.type('[name="username"]', user);
//     await page.type('[name="password"]', pass);
//     await page.click('button.primary');
//     // await page.waitForTimeout(5000);
//     // console.log("Survived 5 second login timeout");
// }










// page.on('websocket', async (websocket) => {
//     websocket.on('message', async (message) => {
//         // Process the received WebSocket message
//         const data = JSON.parse(message);

//         // Perform the required actions with the received data
//         console.log(data);
//     });
// });


export async function killIntterra() {
    if (browser) {
        console.log("Closing Intterra browser");
        await browser.close();
    }
}
