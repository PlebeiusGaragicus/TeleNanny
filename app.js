import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Telegraf } from 'telegraf';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


// TODO: woah.. this is not safe... I need to fix this.
app.get('/settings', (req, res) => {
    res.json({
        BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        CHAT_ID: process.env.CHAT_ID,
        BRAIINS_TOKEN: process.env.BRAIINS_TOKEN,
    });
});


app.post('/settings', (req, res) => {
    const { botToken, chatId, braiinsToken } = req.body;
    const envContent = `TELEGRAM_BOT_TOKEN=${botToken}\nCHAT_ID=${chatId}\nBRAIINS_TOKEN=${braiinsToken}\n`;

    fs.writeFile(path.join(process.cwd(), '.env'), envContent, (err) => {
        if (err) {
            res.status(500).send('Failed to update settings.');
        } else {
            res.status(200).send('Settings updated successfully.');
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



//// INIT THE BOT ////
export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);


//// /START COMMAND ////
import { ShowTopLevelCommands } from './helpers.js';
bot.command('start', async ctx => {
    console.log("start command called - CHAT ID: ", ctx.chat.id, " - FROM: ", ctx.from.username, "User ID: ", ctx.from.id);
    ctx.deleteMessage();

    ShowTopLevelCommands(ctx)
});

import { mode_callback } from './helpers.js';

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



// THIS IS THE 'BACK BUTTON'
bot.action('show_commands', async ctx => {
    ctx.deleteMessage();
    ShowTopLevelCommands(ctx)
});


//// OLD WAY OF TEACHING THE BOT NEW COMMANDS ////
// require('./commands/braiins_API').activate(bot);
// require('./commands/bitcoin').activate(bot);


//// NEW WAY OF TEACHING THE BOT NEW COMMANDS - THAT KEEPS APP.JS TIDY ////
import { teachBitcoin } from './commands/bitcoin.js';
teachBitcoin(bot);

import { teachBraiins } from './commands/braiins.js';
teachBraiins(bot);

import { teachMiner } from './commands/miner.js';
teachMiner(bot);


// START THE BOT AND SAY HELLO
bot.launch();
console.log("Bot started");

async function getBotDetails() {
    try {
        const botInfo = await bot.telegram.getMe();
        console.log('Bot Details:', botInfo);
    } catch (error) {
        console.error('Error getting bot details:', error);
    }
}

getBotDetails();




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

    process.on('SIGINT', () => {
        console.log("SIGINT");
        bot.telegram.sendMessage(ALLOWED_USER_ID, `(X.X) I'M DYING - SIGINT!!!`)
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
