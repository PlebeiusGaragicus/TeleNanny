require('dotenv').config();

const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


app.get('/settings', (req, res) => {
    res.json({
        BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        BRAIINS_TOKEN: process.env.BRAIINS_TOKEN,
        SAMPLE_API_KEY: process.env.SAMPLE_API_KEY,
    });
});


app.post('/settings', (req, res) => {
    const { botToken, braiinsToken, sampleApiKey } = req.body;
    const envContent = `TELEGRAM_BOT_TOKEN=${botToken}\nBRAIINS_TOKEN=${braiinsToken}\nSAMPLE_API_KEY=${sampleApiKey}\n`;

    fs.writeFile(path.join(__dirname, '.env'), envContent, (err) => {
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
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// const { generateCommandInlineKeyboard } = require('./helpers');
const { showCommands } = require('./helpers');
const { braiinsCommand, braiins_user } = require('./commands/braiins');

// bot.command('start', ctx => ctx.reply('Hello, World!\nPlease use /help to see a list of commands.'));
// bot.command('start', async ctx => showCommands(ctx));
bot.command('start', async ctx => {
    ctx.deleteMessage();
    showCommands(ctx)
});
bot.command('help', require('./commands/help'));
bot.command('braiins', braiinsCommand);


// NOTE: THIS NEEDS TO BE LAST!!!
// This is a catch-all for any messages that are not commands.
bot.on('message', message => {
    bot.telegram.sendMessage(message.chat.id, "WARNING: I only respond to commands.  Please use /help to see a list of commands.");
})

bot.action('braiins_action', async ctx => {
    console.log("Braiins button pressed, running braiins_action action")
    ctx.deleteMessage();
    braiinsCommand(ctx);
});

bot.action('help_action', async ctx => {
    console.log("help button pressed")
    ctx.deleteMessage();
});

bot.action('user_action', braiins_user)
bot.action('show_commands', async ctx => {
    showCommands(ctx)
    ctx.deleteMessage();
});


bot.action('pool_action', async ctx => {
    console.log("Pool button pressed")
    ctx.deleteMessage();
    // ctx.answerCbQuery('Pool button pressed');
});

bot.launch();
console.log("Bot started");
