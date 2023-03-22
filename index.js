require('dotenv').config();

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', ctx => {
    console.log("Start command called")
    ctx.reply('Hello, World!\nPlease use /help to see a list of commands.')
});

bot.on('message', message => {
    bot.telegram.sendMessage(message.chat.id, "WARNING: I only respond to commands.  Please use /help to see a list of commands.");
})

const helpCommand = require('./commands/help');
bot.command('help', helpCommand);

bot.launch();
console.log("Bot started");
