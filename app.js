require('dotenv').config();

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

bot.command('start', ctx => ctx.reply('Hello, World!\nPlease use /help to see a list of commands.'));
bot.command('help', require('./commands/help'));
bot.command('braiins', require('./commands/braiins'));

// NOTE: THIS NEEDS TO BE LAST!!!
// This is a catch-all for any messages that are not commands.
bot.on('message', message => {
    bot.telegram.sendMessage(message.chat.id, "WARNING: I only respond to commands.  Please use /help to see a list of commands.");
})

bot.action('user_action', async ctx => {
    console.log("User button pressed")
    // ctx.answerCbQuery('User button pressed');

    const coin = 'btc';
    const url = `https://pool.braiins.com/accounts/profile/json/${coin}/`
    await fetch(url, {
        method: 'GET',
        headers: {
            "SlushPool-Auth-Token": `${process.env.BRAIINS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(async json => {
            console.log(json);
            // ctx.reply(JSON.stringify(json));
            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
});

bot.action('pool_action', async ctx => {
    console.log("Pool button pressed")
    // ctx.answerCbQuery('Pool button pressed');
});

bot.launch();
console.log("Bot started");
