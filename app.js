import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { Telegraf } from 'telegraf';

import { setupBot } from './bot.js';

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

setupBot(bot);


// START THE BOT AND SAY HELLO
bot.launch();
console.log("Bot started");
