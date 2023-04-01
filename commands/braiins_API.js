// const fetch = require('node-fetch');
import fetch from 'node-fetch';

// const { Markup } = require('telegraf');
import { Markup } from 'telegraf';

// REFERENCE: https://help.braiins.com/en/support/solutions/articles/77000433512-api-configuration-guide#Worker-API

export async function braiins_APICommand(ctx) {
    // console.log("Braiins command called")
    // ctx.answerCbQuery('Available Braiins API Commands:');

    const token = process.env.BRAIINS_TOKEN || undefined;

    if (token === undefined) {
        const PORT = process.env.PORT || 3000;
        ctx.reply(`Braiins token not set.\nThis needs to be set using http://localhost:${PORT} on the application server.`);
        return;
    }

    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('user stats', 'user_action'),
        Markup.button.callback('workers', 'workers_action'),
    ]);

    await ctx.reply('Query the Braiins API:', inlineKeyboard);
}


async function braiins_user(ctx) {
    // console.log("Braiins user button pressed")
    // ctx.answerCbQuery('Checking BraiinsPool API...');

    const coin = 'btc';
    const url = `https://pool.braiins.com/accounts/profile/json/${coin}/`
    await fetch(url, {
        method: 'GET',
        headers: {
            "SlushPool-Auth-Token": `${process.env.BRAIINS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(async json => {
            console.log(json);

            // Remove the inline keyboard buttons
            // await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            await ctx.editMessageText("Braiins user info:", { reply_markup: { inline_keyboard: [] } });
            // ctx.deleteMessage();

            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });

            // ShowTopLevelCommands(ctx);
            braiins_APICommand(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}


async function braiins_workers(ctx) {
    const coin = 'btc';
    const url = `https://pool.braiins.com/accounts/workers/json/${coin}/`

    await fetch(url, {
        method: 'GET',
        headers: {
            "SlushPool-Auth-Token": `${process.env.BRAIINS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(async json => {
            console.log(json);

            await ctx.editMessageText("Braiins worker info:", { reply_markup: { inline_keyboard: [] } });
            // ctx.deleteMessage();

            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });

            // ShowTopLevelCommands(ctx);
            braiins_APICommand(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}

export function teachBotBraiinsCommands(bot) {
    // bot.command('braiins', braiinsCommand);
    // bot.action('braiins_action', braiinsCommand);

    bot.action('braiins_API_action', async ctx => {
        ctx.deleteMessage();
        braiins_APICommand(ctx);
    });

    bot.action('user_action', braiins_user);
    bot.action('workers_action', braiins_workers);
}


// module.exports = {
//     braiinsCommand,
//     braiins_user,
//     braiins_workers
// }
// module.exports = {
//     braiins_APICommand,
//     activate
// }
