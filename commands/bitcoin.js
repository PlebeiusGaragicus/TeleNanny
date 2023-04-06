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

    await ctx.reply('Query bitcoin network', inlineKeyboard);
    // await ctx.editMessageText('Query bitcoin statistics', { reply_markup: { inline_keyboard: inlineKeyboard.keyboard } });
    // await ctx.editMessageReplyMarkup({ inline_keyboard: inlineKeyboard.keyboard });
}






async function block_height(ctx) {
    await ctx.answerCbQuery('You selected block height');
    console.log("Block height button pressed")

    const height = await getBlockHeight();

    if (height == null) {
        console.log("block_height() Error: can't get height")
        ctx.reply("block_height() Error: can't get height");
        return;
    }

    // await ctx.reply(`Bitcoin tip height (mempool):\n<pre>${height}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
    await ctx.editMessageText(`Bitcoin tip height (mempool):\n<pre>${height}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
    // await ctx.reply(`Bitcoin tip height (mempool):\n<pre>${height}</pre>`, { parse_mode: 'HTML' });

    bitcoin_TopLevelMenu(ctx);
}

// REFERENCE: https://mempool.space/docs/api/rest
async function price(ctx) {
    // await ctx.answerCbQuery('You selected price');

    // const price = await getPrice();
    const price = Intl.NumberFormat('en-US').format(await getPrice());

    if (price == null) {
        console.log("Error: can't get price")
        ctx.reply("Error: can't get price");
        return;
    }

    const inlineKeyboard = [
        [
            Markup.button.callback('<-', 'bitcoin_TopLevelMenu'),
            // Markup.button.callback('setup notifications', 'setNotify'),
            Markup.button.callback('price ceiling', 'setCeiling'),
            Markup.button.callback('price floor', 'setFloor')
        ]
    ];

    const calert = priceCeiling == null ? "none" : Intl.NumberFormat('en-US').format(priceCeiling);
    const falert = priceFloor == null ? "none" : Intl.NumberFormat('en-US').format(priceFloor);

    await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${price}</pre>\nCeiling alert: ${calert}\nFloor alert: ${falert}`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
    // await ctx.reply(`Bitcoin spot price (coinbase):\n<pre>$${price}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
    // await ctx.reply(`<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
}




// async function setNotify(ctx) {
//     console.log("Set Notify button pressed")

//     // REMOVE OLD INLINE KEYBOARD
//     // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
//     // await ctx.editMessageText("Bitcoin spot price (coinbase):", { reply_markup: { inline_keyboard: [] } });

//     const inlineKeyboard = Markup.inlineKeyboard([
//         Markup.button.callback('<-', 'price'),
//         Markup.button.callback('price ceiling', 'setCeiling'),
//         Markup.button.callback('price floor', 'setFloor'),
//     ]);
//     //TODO: GET CURRENT NOTIFICATION SETTINGS AND DISPLAY THEM
//     // await ctx.reply('set price notifications:', inlineKeyboard);
//     await ctx.editMessageText('set price notifications:', inlineKeyboard);
// }


async function setCeiling(ctx) {
    console.log("Set Ceiling button pressed")

    // REMOVE OLD INLINE KEYBOARD
    // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

    await ctx.editMessageText('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });
    // await ctx.reply('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });

    //TODO: SET MODE
    // mode_callback = adjustCeiling;
    setModeCallback(adjustCeiling);
}


async function setFloor(ctx) {
    console.log("Set Floor button pressed")

    // REMOVE OLD INLINE KEYBOARD
    // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

    // await ctx.reply('Enter price floor:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    // await ctx.editMessageText('Enter price floor: (0 to cancel)', { reply_markup: { inline_keyboard: inlineKeyboard } });
    await ctx.reply('Enter price floor: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });

    //TODO: SET MODE
    // mode_callback = adjustFloor;
    setModeCallback(adjustFloor);
}



async function adjustCeiling(ctx) {
    console.log("adjust price ceiling to: ", ctx.message.text)

    const ceiling = parseFloat(ctx.message.text);

    if (ceiling == 0) {
        console.log("Price ceiling cancelled");
        ctx.reply("Price ceiling cancelled");
        // ctx.editMessageText("Price ceiling cancelled");
        priceCeiling = null;
        clearInterval(priceCeilingIntervalID);

        // bitcoin_TopLevelMenu(ctx);
        price(ctx);
        return;
    }

    if (isNaN(ceiling)) {
        console.log("ERROR: Not a number");
        // ctx.reply("ERROR: Not a number");
        ctx.editMessageText("ERROR: Not a number");
        return;
    }

    // we have to do a reply here because we can't edit the message that triggered the callback (the user's message)
    ctx.deleteMessage();
    ctx.reply("Price ceiling set to: " + ceiling);
    // ctx.editMessageText("Price ceiling set to: " + ceiling);

    setModeCallback(null);

    priceCeiling = ceiling;
    priceCeilingIntervalID = setInterval(checkPriceCeiling, priceCheckInterval);

    bitcoin_TopLevelMenu(ctx);

    // price(a);
    // setNotify(ctx); // THIS DOESN'T WORK!  It will cause an error
}



async function adjustFloor(text) {
    console.log("adjust price floor to: ", text)

    setModeCallback(null);
}


// This is the ID of the last alert message
let lastAlertMessageId = null;

async function checkPriceCeiling() {
    const price = await getPrice();

    if (price == null) {
        console.log("checkPriceCeiling() Error: can't get price");
        bot.telegram.sendMessage(process.env.CHAT_ID, "checkPriceCeiling() Error: can't get price");
        return;
    }

    if (price > priceCeiling) {
        console.log("Price ceiling hit: ", price);

        const acknowledgeKeyboard = [
            [Markup.button.callback('Acknowledge', 'acknowledge_ceiling_alert')],
        ];

        // Delete the previous alert message if it exists
        if (lastAlertMessageId) {
            try {
                await bot.telegram.deleteMessage(process.env.CHAT_ID, lastAlertMessageId);
            } catch (error) {
                console.error("Error deleting previous alert message:", error);
            }
        }

        // Send the new alert message and store its ID
        const sentMessage = await bot.telegram.sendMessage(
            process.env.CHAT_ID,
            `⚡️📈  <b>Price ceiling hit: ${price}</b> 📈⚡️`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: acknowledgeKeyboard } }
        );

        lastAlertMessageId = sentMessage.message_id;
    }
}



async function checkPriceFloor() {
    // 📉
}




async function getPrice() {
    const url = 'https://api.coinbase.com/v2/prices/spot?currency=USD'
    const res = await fetch(url, { method: 'GET' })
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


async function getBlockHeight() {
    const url = `https://mempool.space/api/blocks/tip/height`
    const res = await fetch(url, { method: 'GET' })
        .then(res => res.json())
        .then(async json => { return json })
        .catch(err => {
            console.log(err);
            return null;
        });
    return res;
}







export function teachBitcoin(bot) {
    bot.action('bitcoin_TopLevelMenu', async ctx => {
        ctx.deleteMessage();
        bitcoin_TopLevelMenu(ctx);
    });

    bot.action('block_height', block_height);
    bot.action('price', price);

    // bot.action('setNotify', setNotify);
    bot.action('setCeiling', setCeiling);
    bot.action('setFloor', setFloor);

    bot.action('acknowledge_ceiling_alert', async (ctx) => {
        // await ctx.answerCbQuery(); // Answer the callback query
        priceCeiling = null;
        clearInterval(priceCeilingIntervalID);
        await ctx.reply('Price ceiling alerts stopped.');
    });


}






// THIS IS USING A REPLY KEYBOARD - WHICH IS NOT WHAT I'M AFTER
// export async function bitcoin_TopLevelMenu(ctx) {
//     const replyKeyboard = Markup.keyboard([
//         ['<-', 'price'],
//         ['block height']
//     ]).resize()

//     await ctx.reply('Query bitcoin statistics', replyKeyboard);

//     // TO REMOVE THE KEYBOARD
//     // const replyKeyboardRemove = Markup.removeKeyboard();
//     // await ctx.reply('The reply keyboard has been removed.', replyKeyboardRemove);
// }