import fetch from 'node-fetch';
import { Markup } from 'telegraf';

import { bot } from '../app.js';
import { setModeCallback } from '../helpers.js';


// const priceCheckInterval = 1000 * 60 * 5; // 5 minutes
const priceCheckInterval = 1000 * 3; // 3 seconds

let priceCeiling = null;
let priceCeilingIntervalID = null;

let priceFloor = null;
let priceFloorIntervalID = null;



export async function bitcoin_TopLevelMenu(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('price', 'price'),
        Markup.button.callback('block height', 'block_height')
    ]);

    await ctx.reply('Query bitcoin statistics', inlineKeyboard);
}


export function teachBitcoin(bot) {
    bot.action('bitcoin_TopLevelMenu', async ctx => {
        ctx.deleteMessage();
        bitcoin_TopLevelMenu(ctx);
    });

    bot.action('block_height', block_height);
    bot.action('price', price);

    bot.action('setNotify', setNotify);
    bot.action('setCeiling', setCeiling);
    bot.action('setFloor', setFloor);
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

            bitcoin_TopLevelMenu(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}


async function checkPriceCeiling() {
    const price = await getPrice();

    if (price == null) {
        console.log("checkPriceCeiling() Error: can't get price")
        ctx.reply("checkPriceCeiling() Error: can't get price");
        return;
    }

    if (price > priceCeiling) {
        console.log("Price ceiling hit: ", price);
        bot.telegram.sendMessage(process.env.CHAT_ID, "Price ceiling hit: " + price);
        clearInterval(priceCeilingIntervalID);
    }
}



async function adjustCeiling(ctx) {
    console.log("adjust price ceiling to: ", ctx.message.text)

    const ceiling = parseFloat(ctx.message.text);

    if (ceiling == 0) {
        console.log("Price ceiling cancelled");
        ctx.reply("Price ceiling cancelled");
        priceCeiling = null;
        clearInterval(priceCeilingIntervalID);

        bitcoin_TopLevelMenu(ctx);
        return;
    }

    if (isNaN(ceiling)) {
        console.log("ERROR: Not a number");
        ctx.reply("ERROR: Not a number");
        return;
    }

    ctx.reply("Price ceiling set to: " + ceiling);

    setModeCallback(null);

    priceCeiling = ceiling;
    priceCeilingIntervalID = setInterval(checkPriceCeiling, priceCheckInterval);

    bitcoin_TopLevelMenu(ctx);
    // setNotify(ctx); // THIS DOESN'T WORK!  It will cause an error
}

async function adjustFloor(text) {
    console.log("adjust price floor to: ", text)

    setModeCallback(null);
}


async function setCeiling(ctx) {
    console.log("Set Ceiling button pressed")

    // REMOVE OLD INLINE KEYBOARD
    // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

    // await ctx.reply('Enter price ceiling:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    await ctx.editMessageText('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });

    // OLD WAY WITH DONE BUTTON
    // const inlineKeyboard = [
    //     [
    //         Markup.button.callback('Done', 'bitcoin_TopLevelMenu'),
    //     ]
    // ];
    // // await ctx.reply('Enter price ceiling:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    // await ctx.editMessageText('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: inlineKeyboard } });

    //TODO: SET MODE
    // mode_callback = adjustCeiling;
    setModeCallback(adjustCeiling);
}


async function setFloor(ctx) {
    console.log("Set Floor button pressed")

    // REMOVE OLD INLINE KEYBOARD
    // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

    const inlineKeyboard = [
        [
            Markup.button.callback('Done', 'bitcoin_TopLevelMenu'),
        ]
    ];
    // await ctx.reply('Enter price floor:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    await ctx.editMessageText('Enter price floor: (0 to cancel)', { reply_markup: { inline_keyboard: inlineKeyboard } });

    //TODO: SET MODE
    // mode_callback = adjustFloor;
    setModeCallback(adjustFloor);
}


async function setNotify(ctx) {
    console.log("Set Notify button pressed")

    // REMOVE OLD INLINE KEYBOARD
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    // await ctx.editMessageText("Bitcoin spot price (coinbase):", { reply_markup: { inline_keyboard: [] } });

    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'price'),
        Markup.button.callback('price ceiling', 'setCeiling'),
        Markup.button.callback('price floor', 'setFloor'),
    ]);
    //TODO: GET CURRENT NOTIFICATION SETTINGS AND DISPLAY THEM
    await ctx.reply('set price notifications:', inlineKeyboard);
}


async function getPrice() {
    const url = 'https://api.coinbase.com/v2/prices/spot?currency=USD'
    const res = await fetch(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(async json => {
            return json.data.amount;
        })
        .catch(err => {
            console.log(err);
            return null;
        });

    return res;
}

// REFERENCE: https://mempool.space/docs/api/rest
async function price(ctx) {
    const price = await getPrice();

    if (price == null) {
        console.log("Error: can't get price")
        ctx.reply("Error: can't get price");
        return;
    }

    const inlineKeyboard = [
        [
            Markup.button.callback('<-', 'bitcoin_TopLevelMenu'),
            Markup.button.callback('setup notifications', 'setNotify'),
        ]
    ];
    // await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
    await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${price}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
    // await ctx.reply(`<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
}
// async function price(ctx) {
//     const url = 'https://api.coinbase.com/v2/prices/spot?currency=USD'
//     await fetch(url, {
//         method: 'GET',
//     })
//         .then(res => res.json())
//         .then(async json => {
//             // await ctx.editMessageText("Bitcoin spot price (coinbase):", { reply_markup: { inline_keyboard: [] } });
//             const amnt = json.data.amount;

//             // bitcoin_TopLevelMenu(ctx);
//             const inlineKeyboard = [
//                 [
//                     Markup.button.callback('<-', 'bitcoin_TopLevelMenu'),
//                     Markup.button.callback('setup notifications', 'setNotify'),
//                 ]
//             ];
//             // await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
//             await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
//             // await ctx.reply(`<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
//         })
//         .catch(err => {
//             console.log(err);
//             ctx.reply("Error: " + err);
//         });
// }
