import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import { getValue } from '../database.js';
import { bot } from '../bot.js';


async function alertUser(msg) {
    const chatID = await getValue('chat_id');
    await bot.telegram.sendMessage(chatID, msg);
}

function phoneticAddress(address) {
    address = address.replace(" NW ", "northwest ");
    address = address.replace(" NE ", "northeast ");
    address = address.replace(" SW ", "southwest ");
    address = address.replace(" SE ", "southeast ");
    address = address.replace(" N ", "north ");
    address = address.replace(" S ", "south ");

    address = address.replace(" AVE", " avenue");
    address = address.replace(" ST", "street ");
    address = address.replace(" RD", "road ");
    address = address.replace(" PKWY", "parkway ");
    address = address.replace(" BLVD", " boulevard");
    address = address.replace(" CT", " court");

    return address;
}

async function speak(call, address, latlon) {
    console.log(`CALL: ${call} at ${address}`);
    // Replace this line with the appropriate text-to-speech library or API call for your system
    // const phonetic_unit = await getValue('intterra_unit_phonetic');
    // console.log(`say ${phonetic_unit} has a ${call} at ${phoneticAddress(address)}`);
    // sendSMS(`${call}\n${address}\nhttps://www.google.com/maps/place/${latlon}`);
    alertUser(`${call}\n\n${address}`);
}



async function openPage() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://apps.intterragroup.com');
    // TODO
    // https://stackoverflow.com/a/39914235
    await page.waitForTimeout(2000);

    return { browser, page };
}


async function login(page) {
    console.log("Logging in to Intterra...")
    const user = await getValue('intterra_username');
    const pass = await getValue('intterra_password');

    console.log("user: ", user, " pass: ", pass)
    if (!user || !pass) {
        console.error("Intterra username or password not set in database");
        return;
    }

    await page.type('[name="username"]', user);
    await page.type('[name="password"]', pass);
    await page.click('button.primary');
    await page.waitForTimeout(5000);
    console.log("Survived 5 second login timeout")
}


async function alertLoop(page) {
    let lastCall = null;
    let allCalls = null;

    const unit = await getValue('intterra_unit');
    console.log("Interra is watching unit: ", unit);

    while (true) {
        const html = await page.content();
        const $ = cheerio.load(html);

        const calls = [];

        const rows = $('section.table-row-section');

        if (rows.length === 0) {
            await page.reload();
        }

        rows.each((_, row) => {
            try {
                const call = $(row).find('h3.can-notify-highlight').text().trim();
                const unitsAddr = $(row).find('label.description').text().trim();

                const [_unit, addr] = unitsAddr.split('●').slice(1).map(s => s.trim());
                const units = _unit.split(' ');

                if (units.includes(unit)) {
                    if (!lastCall || (call !== lastCall[0] || addr !== lastCall[1])) {
                        console.log(`NEW CALL!!!! ${unit} - ${call} - ${addr}`);

                        // Add any additional logic for clicking elements, refreshing the page, etc.

                        const latlon = 'LAT,LON'; // Replace this line with the appropriate logic to extract the latitude and longitude
                        speak(call, addr, latlon);
                        lastCall = [call, addr];
                    }
                }

                calls.push([call, addr, units]);
            } catch (e) {
                console.error('PARSING ERROR - EXCEPTION HANDLED', e);
                page.reload();
                sleep(2000);
            }
        });

        if (!arraysEqual(allCalls, calls)) {
            allCalls = calls;
            // console.log('\n\n\n\n');
            // calls.forEach((call) => {
            //     console.log(call);
            // });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

// https://stackoverflow.com/a/14853974
// CoPilot
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// chatGPT-4
// function arraysEqual(a, b) {
//     if (a.length !== b.length) return false;

//     for (let i = 0; i < a.length; i++) {
//         if (Array.isArray(a[i]) && Array.isArray(b[i])) {
//             if (!arraysEqual(a[i], b[i])) return false;
//         } else if (a[i] !== b[i]) {
//             return false;
//         }
//     }

//     return true;
// }

export async function runIntterra() {
    console.log("Starting Intterra Alert Listener")
    const { browser, page } = await openPage();
    await login(page);
    try {
        await alertLoop(page);
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
