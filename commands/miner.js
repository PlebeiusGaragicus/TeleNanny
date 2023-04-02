// const fetch = require('node-fetch');
import fetch from 'node-fetch';

// const { Markup } = require('telegraf');
import { Markup } from 'telegraf';


// const net = require('net');
import net from 'net';



export async function minerCommand(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('temperature', 'miner_temp'),
        // Markup.button.callback('block height', 'block_height')
    ]);

    await ctx.reply('Query miner status', inlineKeyboard);
}


// async function miner_temp(ctx) {
//     console.log("miner temperature")
//     const url = `https://mempool.space/api/blocks/tip/height`
//     await fetch(url, {
//         method: 'GET',
//     })
//         .then(res => res.json())
//         .then(async json => {
//             await ctx.editMessageText("Bitcoin tip height (mempool):", { reply_markup: { inline_keyboard: [] } });
//             await ctx.reply(`<pre>${json}</pre>`, { parse_mode: 'HTML' });
//             // ShowTopLevelCommands(ctx);
//             bitcoinCommand(ctx);
//         })
//         .catch(err => {
//             console.log(err);
//             ctx.reply("Error: " + err);
//         });
// }

// const ip = '192.168.5.2';
// const port = 4028;
// const command = 'version+config';
// const url = `http://${ip}:${port}`;
// const body = JSON.stringify({ command });

// try {
//     const response = await fetch(url, {
//         method: 'POST',
//         // headers: {
//         //     'Content-Type': 'application/json',
//         // },
//         body,
//     })

//     if (!response.ok) {
//         throw new Error(`Network response was not ok: ${response.statusText}`);
//     }

//     const jsonResponse = await response.json();
//     console.log(jsonResponse);

//     await ctx.editMessageText("Bitcoin tip height (mempool):", { reply_markup: { inline_keyboard: [] } });
//     await ctx.reply(`<pre>${json}</pre>`, { parse_mode: 'HTML' });
//     // ShowTopLevelCommands(ctx);
//     bitcoinCommand(ctx);
// } catch (error) {
//     console.error('Error:', error);
// }
async function miner_temp(ctx) {
    const ip = '192.168.5.2';
    const port = 4028;
    const command = 'temps';
    const data = JSON.stringify({ command });

    console.log("checking miner temperature...")

    const client = new net.Socket();

    client.connect(port, ip, () => {
        client.write(data);
    });

    // client.on('data', async (response) => {
    //     const cleanedResponse = response.toString().trim().replace(/\0/g, '');
    //     const jsonResponse = JSON.parse(cleanedResponse);
    //     console.log(jsonResponse);

    //     await ctx.editMessageText("temperature:", { reply_markup: { inline_keyboard: [] } });
    //     await ctx.reply(`<pre>${jsonResponse}</pre>`, { parse_mode: 'HTML' });
    //     minerCommand(ctx);

    //     client.destroy(); // Close the connection after receiving the response
    // });
    client.on('data', async (response) => {
        const cleanedResponse = response.toString().trim().replace(/\0/g, '');
        const jsonResponse = JSON.parse(cleanedResponse);
        console.log(jsonResponse);

        await ctx.editMessageText("temperature:", { reply_markup: { inline_keyboard: [] } });

        let maxTemp = -1;
        jsonResponse.TEMPS.forEach(async (dev) => {
            if (dev.Chip > maxTemp) {
                maxTemp = dev.Chip;
            }
        });


        // Convert the JSON object to a formatted string
        // const formattedJsonResponse = JSON.stringify(jsonResponse, null, 2);
        await ctx.reply(`<pre>${maxTemp} Celcius</pre>`, { parse_mode: 'HTML' });

        minerCommand(ctx);
        client.destroy(); // Close the connection after receiving the response
    });

    client.on('error', (error) => {
        console.error('Error:', error);
    });
}

export function teachBotMinerCommands(bot) {
    // TODO: this needs to be thought out more... _action is not a good name
    bot.action('miner_action', async ctx => {
        ctx.deleteMessage();
        minerCommand(ctx);
    });

    bot.action('miner_temp', miner_temp);
}
