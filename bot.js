import { ShowTopLevelCommands, mode_callback } from './helpers.js';


//// OLD WAY OF TEACHING THE BOT NEW COMMANDS ////
// require('./commands/braiins_API').activate(bot);
// require('./commands/bitcoin').activate(bot);
import { teachBitcoin } from './commands/bitcoin.js';
import { teachBraiins } from './commands/braiins.js';
import { teachMiner } from './commands/miner.js';






export async function setupBot(bot) {

    try {
        const botInfo = await bot.telegram.getMe();
        console.log('Bot Details:', botInfo);
    } catch (error) {
        console.error('Error getting bot details:', error);
    }


    bot.command('start', async ctx => {
        console.log("start command called - CHAT ID: ", ctx.chat.id, " - FROM: ", ctx.from.username, "User ID: ", ctx.from.id);
        ctx.deleteMessage();

        ShowTopLevelCommands(ctx)
    });

    bot.action('show_commands', async ctx => {
        ctx.deleteMessage();
        ShowTopLevelCommands(ctx)
    });


    // TEACH THE BOT EACH `SKILL`
    teachBitcoin(bot);
    teachBraiins(bot);
    teachMiner(bot);


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







    //// TODO: I'm not sure this is needed...
    //// Send a message to the chat id that the bot is running on
    //// ... it ensures the bot will only chat with the 
    // const targetChatId = process.env.CHAT_ID || undefined
    // if (targetChatId === undefined) {
    //     console.error("CHAT ID is not setup in .env\nuse \/get_chat_id then use the web portal to save it.")
    //     // process.exit(1)
    // }
    // else

    //// 'MIDDLEWARE' THAT RESTRICTS WHICH USER THE BOT WILL RESPOND TO ////
    // TODO: I NEED TO TEST THIS!!!
    const ALLOWED_USER_ID = process.env.CHAT_ID || undefined
    if (ALLOWED_USER_ID === undefined) {
        console.log(">>> WARNING!!!\n>>>\tCHAT_ID not set.  Please set this in the .env file.\n>>>\tThis is the Telegram user ID that will be allowed to use this bot.\n>>>\tYou can find your user ID by sending a message to @userinfobot\n>>>\n");
    } else {
        bot.use((ctx, next) => {
            if (ctx.from.id.toString() === ALLOWED_USER_ID) {
                return next();
            } else {
                console.log(`Unauthorized access attempt by user ID: ${ctx.from.id}`);
                // ctx.reply(`Sorry, you are not authorized to use this bot.`);
            }
        });
        //// SAY HELLO
        bot.telegram.sendMessage(ALLOWED_USER_ID, `Hello,\nI'm awake and ready to /start`);

        let sigintHandled = false;

        process.on('SIGINT', () => {
            console.log("SIGINT");

            if (sigintHandled) {
                return; // Exit early if SIGINT has already been handled
            } else {
                sigintHandled = true;
            }

            bot.telegram.sendMessage(ALLOWED_USER_ID, `⚠️ *SIGINT: ⚰️☠️🪦 I'M DYING\\!* ⚠️`, { parse_mode: 'MarkdownV2' })
                .then(() => {
                    console.log("process exiting...");
                    process.exit(0);
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1); // exit with error status
                });
        });
    }
}
