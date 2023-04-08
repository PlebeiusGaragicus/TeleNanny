import { Telegraf } from 'telegraf';

import { getValue } from './database.js';
import { ShowTopLevelCommands, mode_callback } from './helpers.js';

import { teachBitcoin } from './commands/bitcoin.js';
import { teachBraiins } from './commands/braiins.js';
import { teachMiner } from './commands/miner.js';
import { teachChatGPT } from './commands/chatGPT.js';

// export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
export let bot = null;

// TODO: unsure of this.  I don't want multiple menus up and running.  So, I don't want the user to do /start again and again.
let justLaunched = true;


export async function setupBot(bot) {

    try {
        const botInfo = await bot.telegram.getMe();
        console.log('Bot Details:', botInfo);
    } catch (error) {
        console.error('Error getting bot details:', error);
    }


    bot.command('start', async ctx => {

        if (!justLaunched) {
            // ctx.deleteMessage();
            return;
        }

        if (justLaunched)
            justLaunched = false;

        console.log("start command called - CHAT ID: ", ctx.chat.id, " - FROM: ", ctx.from.username, "User ID: ", ctx.from.id);

        ShowTopLevelCommands(ctx)
    });

    bot.command('restart', async ctx => {
        console.log("not yet implemented");
        ctx.reply("not yet implemented");
    });



    bot.on('callback_query', async (ctx, next) => {

        // const callbackData = ctx.callbackQuery.data; //NOTE: this is the callback function's name

        ctx.deleteMessage().catch((error) => {
            console.error("CAUGHT: Error deleting message:", error);
        });

        await next();
        await ctx.answerCbQuery('topic/skill button pressed');
    });

    bot.action('show_commands', async ctx => {
        ShowTopLevelCommands(ctx)
    });



    // TEACH THE BOT EACH `SKILL`
    teachBitcoin(bot);
    teachBraiins(bot);
    teachMiner(bot);
    teachChatGPT(bot);



    // NOTE: THIS NEEDS TO BE LAST!!!
    // TODO: turn this into a modal kind of thing... where the user can enter messages (that will be deleted).. but the context is whatever inline keyboard is currently showing.  Easy to set a global where the bot keeps track of which "mode" it is in.
    // This is a catch-all for any messages that are not commands.
    bot.on('message', ctx => {
        if (mode_callback == null) {
            // bot.telegram.sendMessage(ctx.message.chat.id, "WARNING: I only respond to commands.  Please use /help to see a list of commands.");
            ctx.reply("WARNING: I only respond to commands.  You can always /start again if you need.");
            return;
        }

        mode_callback(ctx);

    })


    //// 'MIDDLEWARE' THAT RESTRICTS WHICH USER THE BOT WILL RESPOND TO ////
    const chatID = getValue("tokens", "chat_id");
    if (chatID === null) {
        console.log(">>> WARNING!!!\n>>>\tCHAT_ID not set.  Please set this in the .env file.\n>>>\tThis is the Telegram user ID that will be allowed to use this bot.\n>>>\tYou can find your user ID by sending a message to @userinfobot\n>>>\n");
    } else {
        bot.use((ctx, next) => {
            if (ctx.from.id.toString() === chatID) {
                return next();
            } else {
                console.log(`Unauthorized access attempt by user ID: ${ctx.from.id}`);
                // ctx.reply(`Sorry, you are not authorized to use this bot.`);
            }
        });
        //// SAY HELLO
        bot.telegram.sendMessage(chatID, `Hello,\nI'm awake and ready to /start`);
    }
}


export async function killBot() {
    return new Promise(async (resolve, reject) => {
        console.log("killing bot...");

        if (bot === null) {
            console.log("bot is null - nevermind...");
            resolve();
            return;
            // } else {
            // console.log(bot);
        }

        bot
        try {
            await bot.stop();
        } catch (error) {
            console.error("ERROR: bot.stop() failed:", error);
        }

        const id = getValue("tokens", "chat_id")
        bot.telegram.sendMessage(id, `⚠️ *BOT SHUTDOWN\\!* ⚠️`, { parse_mode: 'MarkdownV2' })
            .then(() => {
                console.log("process exiting...");
                resolve();
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    });
};


export async function initBot() {
    console.log("Starting bot...");

    const token = getValue("tokens", "telegram_bot_token");
    console.log("bot token:", token);

    if (token == null) {
        console.error("ERROR: Telegram bot token is not set.");
        return;
    }

    const id = getValue("tokens", "chat_id");
    console.log("chat id:", id);

    if (id == null) {
        console.error("ERROR: Telegram chat id is not set.");
        return;
    }

    bot = new Telegraf(token);

    await clearPendingMessages();

    bot.launch();
    setupBot(bot);
}



export async function clearPendingMessages() {
    let updates = await bot.telegram.getUpdates();

    for (const update of updates) {
        console.log("ignoring updates while bot was offline:", update);
        await bot.handleUpdate(update);
    }
}

// clearPendingMessages().then(() => {
//     bot.launch();
//     setupBot(bot);
// });
