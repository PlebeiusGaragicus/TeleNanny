const fetch = require('node-fetch');

const { Markup } = require('telegraf');

// REFERENCE: https://mempool.space/docs/api/rest


async function bitcoinCommand(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('price', 'price'),
        Markup.button.callback('block height', 'block_height')
    ]);

    await ctx.reply('Query bitcoin statistics', inlineKeyboard);
}


async function block_height(ctx) {
    console.log("Block height button pressed")
    const url = `https://mempool.space/api/blocks/tip/height`
    await fetch(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(async json => {
            await ctx.editMessageText("Bitcoin tip height (mempool):", { reply_markup: { inline_keyboard: [] } });
            await ctx.reply(`<pre>${json}</pre>`, { parse_mode: 'HTML' });
            // ShowTopLevelCommands(ctx);
            bitcoinCommand(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}



async function price(ctx) {
    const url = 'https://api.coinbase.com/v2/prices/spot?currency=USD'
    await fetch(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(async json => {
            await ctx.editMessageText("Bitcoin spot price (coinbase):", { reply_markup: { inline_keyboard: [] } });
            amnt = json.data.amount;
            await ctx.reply(`<pre>$${amnt}</pre>`, { parse_mode: 'HTML' });
            // ShowTopLevelCommands(ctx);
            bitcoinCommand(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}


function activate(bot) {
    // TODO: this needs to be thought out more... _action is not a good name
    bot.action('bitcoin_action', async ctx => {
        ctx.deleteMessage();
        bitcoinCommand(ctx);
    });

    bot.action('block_height', block_height);
    bot.action('price', price);
}


module.exports = {
    bitcoinCommand,
    activate
}
