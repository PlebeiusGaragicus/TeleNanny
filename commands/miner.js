import net from 'net';
import { Markup } from 'telegraf';


const MINER_IP = '192.168.5.2';

const MAX_SAFE_TEMP = 75;

const TEMP_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes


export async function miner_TopLevelMenu(ctx) {
    // const inlineKeyboard = Markup.inlineKeyboard([
    //     Markup.button.callback('<-', 'show_commands'),
    //     Markup.button.callback('temperature', 'miner_temp')
    // ]);
    const inlineKeyboard = [
        [Markup.button.callback('<-', 'show_commands')],
        [Markup.button.callback('temperature', 'miner_temp')]
    ];

    await ctx.reply('<b>🎛️ Miner status</b>', { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
}



// TODO: we need to search for miners on the local network and return a list.. then just get the temps of all of them?
// async function getTemp(ip) {
//     const port = 4028;
//     const command = 'temps';
//     const data = JSON.stringify({ command });

//     console.log(`getting temp for miner ${ip}`)

//     return new Promise((resolve, reject) => {
//         const client = new net.Socket();

//         client.connect(port, ip, () => {
//             client.write(data);
//         });

//         client.on('data', async (response) => {
//             const cleanedResponse = response.toString().trim().replace(/\0/g, '');
//             const jsonResponse = JSON.parse(cleanedResponse);
//             console.log(jsonResponse);

//             let maxTemp = -1;
//             jsonResponse.TEMPS.forEach(async (dev) => {
//                 if (dev.Chip > maxTemp) {
//                     maxTemp = dev.Chip;
//                 }
//             });

//             client.destroy(); // Close the connection after receiving the response

//             resolve(maxTemp);
//         });

//         client.on('error', async (error) => {
//             console.error('Error:', error);
//             reject(error);
//         });
//     });
// }

async function getTemp(ip) {
    const port = 4028;
    const command = 'temps';
    const data = JSON.stringify({ command });

    console.log(`getting temp for miner ${ip}`);

    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeoutDuration = 5000; // Set a timeout duration (e.g., 5 seconds)

        // Set a timeout to handle connection issues
        const timeout = setTimeout(() => {
            client.destroy(); // Close the connection after the timeout
            console.log(`Connection timed out for ${ip}`);
            resolve(-1); // Return a default value when the connection fails
        }, timeoutDuration);

        client.connect(port, ip, () => {
            clearTimeout(timeout); // Clear the timeout when the connection is established
            client.write(data);
        });

        client.on('data', async (response) => {
            clearTimeout(timeout); // Clear the timeout when data is received

            const cleanedResponse = response.toString().trim().replace(/\0/g, '');
            const jsonResponse = JSON.parse(cleanedResponse);
            console.log(jsonResponse);

            let maxTemp = -1;
            jsonResponse.TEMPS.forEach(async (dev) => {
                if (dev.Chip > maxTemp) {
                    maxTemp = dev.Chip;
                }
            });

            client.destroy(); // Close the connection after receiving the response

            resolve(maxTemp);
        });

        client.on('error', async (error) => {
            clearTimeout(timeout); // Clear the timeout when an error occurs
            console.error('Error:', error);
            reject(error);
        });
    });
}



async function miner_temp(ctx) {
    const maxTemp = await getTemp(MINER_IP);

    await ctx.reply(`temperature:\n<pre>${maxTemp} Celcius</pre>`, { parse_mode: 'HTML' });

    miner_TopLevelMenu(ctx);
}


async function checkTemps(bot) {
    const maxTemp = await getTemp(MINER_IP);

    if (maxTemp > MAX_SAFE_TEMP) {
        bot.telegram.sendMessage(process.env.CHAT_ID, `⚠️🔥 <b>TEMP ALERT</b> 🔥⚠️\n<pre>${maxTemp} Celcius</pre>`, { parse_mode: 'HTML' });
    } else {
        console.log(`temp is ${maxTemp} Celcius`);
    }
}


export function teachMiner(bot) {
    bot.action('miner_TopLevelMenu', async ctx => {
        miner_TopLevelMenu(ctx);
    });

    bot.action('miner_temp', miner_temp);

    checkTemps(bot); // run once immediately
    setInterval(checkTemps, TEMP_CHECK_INTERVAL, bot);
}
