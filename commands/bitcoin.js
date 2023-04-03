import fetch from 'node-fetch';
import { Markup } from 'telegraf';

// REFERENCE: https://mempool.space/docs/api/rest

import { setModeCallback } from '../helpers.js';


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


async function adjustCeiling(message) {
    console.log("adjust price ceiling to: ", message.text)

    mode_callback = null;
}

async function adjustFloor(message) {
    console.log("adjust price floor to: ", message.text)

    mode_callback = null;
}


async function setCeiling(ctx) {
    console.log("Set Ceiling button pressed")

    // REMOVE OLD INLINE KEYBOARD
    // await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

    const inlineKeyboard = [
        [
            Markup.button.callback('Done', 'bitcoin_TopLevelMenu'),
        ]
    ];
    // await ctx.reply('Enter price ceiling:', { reply_markup: { inline_keyboard: inlineKeyboard } });
    await ctx.editMessageText('Enter price ceiling:', { reply_markup: { inline_keyboard: inlineKeyboard } });

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
    await ctx.editMessageText('Enter price floor:', { reply_markup: { inline_keyboard: inlineKeyboard } });

    

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


async function price(ctx) {
    const url = 'https://api.coinbase.com/v2/prices/spot?currency=USD'
    await fetch(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(async json => {
            // await ctx.editMessageText("Bitcoin spot price (coinbase):", { reply_markup: { inline_keyboard: [] } });
            const amnt = json.data.amount;

            // bitcoin_TopLevelMenu(ctx);
            const inlineKeyboard = [
                [
                    Markup.button.callback('<-', 'bitcoin_TopLevelMenu'),
                    Markup.button.callback('setup notifications', 'setNotify'),
                ]
            ];
            // await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
            await ctx.editMessageText(`Bitcoin spot price (coinbase):\n<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
            await ctx.reply(`<pre>$${amnt}</pre>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: inlineKeyboard } });
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}
