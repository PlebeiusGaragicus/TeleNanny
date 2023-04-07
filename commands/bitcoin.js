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

    await ctx.reply('Bitcoin network:', inlineKeyboard);
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

    // await ctx.editMessageText(`Bitcoin tip height (mempool):\n<pre>${height}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
    await ctx.reply(`Bitcoin tip height (mempool):\n<pre>${height}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });

    bitcoin_TopLevelMenu(ctx);
}



// REFERENCE: https://mempool.space/docs/api/rest
async function price(ctx) {
    const price = Intl.NumberFormat('en-US').format(await getPrice());

    if (price == null) {
        console.log("Error: can't get price")
        ctx.reply("Error: can't get price");
        return;
    }

    const inlineKeyboard = [
        [
            Markup.button.callback('<-', 'bitcoin_TopLevelMenu'),
            Markup.button.callback('price ceiling', 'setCeiling'),
            Markup.button.callback('price floor', 'setFloor')
        ]
    ];

    const calert = priceCeiling == null ? "none" : Intl.NumberFormat('en-US').format(priceCeiling);
    const falert = priceFloor == null ? "none" : Intl.NumberFormat('en-US').format(priceFloor);

    // NOTE: we edit so that we can destory the prior text/menu title and keyboard
    // try {
    //     await ctx.editMessageText('Bitcoin price and alerts:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    // } catch (error) {
    //     console.log("MAYBE THIS WORKS???")
    //     /// NOTE: yes, this works... because we delete the message in setCeiling() and setFloor() (to keep the action items at the bottom, we have to reply instead of edit)
    //     await ctx.reply(':', { reply_markup: { inline_keyboard: inlineKeyboard } });
    // }
    // NOTE: ... then we reply so that it stays in the chat history.
    await ctx.reply(`<b>Coinbase spot price:</b>\n<pre>$${price}</pre>\nCeiling alert: ${calert}\nFloor alert: ${falert}`, { parse_mode: 'HTML' });
    await ctx.reply('Bitcoin price and alerts:', { reply_markup: { inline_keyboard: inlineKeyboard } });
}



async function setCeiling(ctx) {
    console.log("Set Ceiling button pressed")
    // await ctx.editMessageText('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });
    await ctx.reply('Enter price ceiling: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });
    setModeCallback(adjustCeiling);
}


async function setFloor(ctx) {
    console.log("Set Floor button pressed")
    await ctx.editMessageText('Enter price floor: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });
    // await ctx.reply('Enter price floor: (0 to cancel)', { reply_markup: { inline_keyboard: [] } });
    setModeCallback(adjustFloor);
}



async function adjustCeiling(ctx) {
    console.log("adjust price ceiling to: ", ctx.message.text)

    const ceiling = parseFloat(ctx.message.text);

    if (ceiling == 0) {
        console.log("Price ceiling cancelled");
        ctx.reply("Price ceiling cancelled");
        priceCeiling = null;
        clearInterval(priceCeilingIntervalID);

        price(ctx);
        return;
    }

    if (isNaN(ceiling)) {
        console.log("ERROR: Not a number");
        ctx.editMessageText("ERROR: Not a number");
        return;
    }

    // we have to do a reply here because we can't edit the message that triggered the callback (the user's message)
    ctx.deleteMessage();
    ctx.reply("Price ceiling set to: " + ceiling);

    setModeCallback(null);

    priceCeiling = ceiling;
    priceCeilingIntervalID = setInterval(checkPriceCeiling, priceCheckInterval);

    // bitcoin_TopLevelMenu(ctx);

    price(ctx);
    // setNotify(ctx); // THIS DOESN'T WORK!  It will cause an error
}



async function adjustFloor(ctx) {
    console.log("adjust price floor to: ", ctx.message.text)

    const floor = parseFloat(ctx.message.text);

    if (floor == 0) {
        console.log("Price floor cancelled");
        ctx.reply("Price floor cancelled");
        priceFloor = null;
        clearInterval(priceFloorIntervalID);

        price(ctx);
        return;
    }

    if (isNaN(floor)) {
        console.log("ERROR: Not a number");
        ctx.editMessageText("ERROR: Not a number");
        return;
    }

    // we have to do a reply here because we can't edit the message that triggered the callback (the user's message)
    ctx.deleteMessage();
    ctx.reply("Price floor set to: " + floor);

    setModeCallback(null);

    priceFloor = floor;
    priceFloorIntervalID = setInterval(checkPriceFloor, priceCheckInterval);

    bitcoin_TopLevelMenu(ctx);
}


// This is the ID of the last alert message
let lastCeilingAlertMessageId = null;

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
            [Markup.button.callback('Acknowledge', 'acknowledgeCeilingAlert')],
        ];

        // Delete the previous alert message if it exists
        if (lastCeilingAlertMessageId) {
            try {
                await bot.telegram.deleteMessage(process.env.CHAT_ID, lastCeilingAlertMessageId);
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

        lastCeilingAlertMessageId = sentMessage.message_id;
    }
}



// This is the ID of the last alert message
let lastFloorAlertMessageId = null;

async function checkPriceFloor() {
    const price = await getPrice();

    if (price == null) {
        console.log("checkPriceFloor() Error: can't get price");
        bot.telegram.sendMessage(process.env.CHAT_ID, "checkPriceFloor() Error: can't get price");
        return;
    }

    if (price < priceFloor) {
        console.log("Price floor hit: ", price);

        const acknowledgeKeyboard = [
            [Markup.button.callback('Acknowledge', 'acknowledgeFloorAlert')],
        ];

        // Delete the previous alert message if it exists
        if (lastFloorAlertMessageId) {
            try {
                await bot.telegram.deleteMessage(process.env.CHAT_ID, lastFloorAlertMessageId);
            } catch (error) {
                console.error("Error deleting previous alert message:", error);
            }
        }

        // Send the new alert message and store its ID
        const sentMessage = await bot.telegram.sendMessage(
            process.env.CHAT_ID,
            `⚡️📈  <b>Price floor hit: ${price}</b> 📈⚡️`,
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: acknowledgeKeyboard } }
        );

        lastFloorAlertMessageId = sentMessage.message_id;
    }
}



async function acknowledgeCeilingAlert(ctx) {
    // TODO: where do I need to answer the cb query...? I'm confused.
    // await ctx.answerCbQuery(); // Answer the callback query
    priceCeiling = null;
    clearInterval(priceCeilingIntervalID);
    await ctx.reply('Price ceiling alerts stopped.');
}


async function acknowledgeFloorAlert(ctx) {
    // await ctx.answerCbQuery(); // Answer the callback query
    priceFloor = null;
    clearInterval(priceFloorIntervalID);
    await ctx.reply('Price floor alerts stopped.');
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
        // ctx.deleteMessage();
        bitcoin_TopLevelMenu(ctx);
    });

    // SUBJECT
    bot.action('price', price);

    // SKILLS
    // bot.action('setNotify', setNotify);
    bot.action('setCeiling', setCeiling);
    bot.action('acknowledgeCeilingAlert', acknowledgeCeilingAlert);

    bot.action('setFloor', setFloor);
    bot.action('acknowledgeFloorAlert', acknowledgeFloorAlert);

    // SUBJECT
    bot.action('block_height', block_height);

    // SKILLS
    // ...
}
