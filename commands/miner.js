import fetch from 'node-fetch';
import net from 'net';
import { Markup } from 'telegraf';



export async function miner_TopLevelMenu(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('temperature', 'miner_temp'),
    ]);

    await ctx.reply('Query miner status', inlineKeyboard);
}



async function miner_temp(ctx) {
    // TODO: we need to search for miners on the local network and return a list.. then just get the temps of all of them?
    const ip = '192.168.5.2';
    const port = 4028;
    const command = 'temps';
    const data = JSON.stringify({ command });

    console.log("checking miner temperature...")

    const client = new net.Socket();

    client.connect(port, ip, () => {
        client.write(data);
    });

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

        miner_TopLevelMenu(ctx);
        client.destroy(); // Close the connection after receiving the response
    });

    client.on('error', async (error) => {
        console.error('Error:', error);
        await ctx.editMessageText(`Error: ${error}`, { reply_markup: { inline_keyboard: [] } });
    });
}

export function teachMiner(bot) {
    // TODO: this needs to be thought out more... _action is not a good name
    bot.action('miner_TopLevelMenu', async ctx => {
        ctx.deleteMessage();
        miner_TopLevelMenu(ctx);
    });

    bot.action('miner_temp', miner_temp);
}
