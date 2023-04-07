import fetch from 'node-fetch';
import { Markup } from 'telegraf';


// REFERENCE: https://help.braiins.com/en/support/solutions/articles/77000433512-api-configuration-guide#Worker-API

async function braiins_TopLevelMenu(ctx) {

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

            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`Braiins user info:\n<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });

            braiins_TopLevelMenu(ctx);
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

            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`Braiins worker info:\n<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });

            braiins_TopLevelMenu(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}

export function teachBraiins(bot) {
    bot.action('braiins_TopLevelMenu', async ctx => {
        braiins_TopLevelMenu(ctx);
    });

    bot.action('user_action', braiins_user);
    bot.action('workers_action', braiins_workers);
}
