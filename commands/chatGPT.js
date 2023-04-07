import fetch from 'node-fetch';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { Markup } from 'telegraf';

import { setModeCallback, mode_callback } from '../helpers.js';

dotenv.config();


const openaiApiKey = process.env.OPENAI_KEY
OpenAI.apiKey = openaiApiKey;



async function generateResponse(prompt) {
    const openaiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
    };
    const body = JSON.stringify({
        prompt: prompt,
        max_tokens: 500,
        n: 1,
        stop: null,
        temperature: 0.5,
    });

    const response = await fetch(openaiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    const data = await response.json();
    console.log(data);
    // return data;
    return data.choices[0].text.trim();
}



export async function chatGPT_TopLevelMenu(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('run a prompt', 'run_prompt')
    ]);

    await ctx.reply('🦾 <b>chatGPT API:</b> 🤖', { parse_mode: 'HTML', reply_markup: inlineKeyboard });
}

async function ask_prompt(ctx) {
    // ctx.deleteMessage();
    setModeCallback(null);

    const prompt = ctx.message.text;

    if (prompt == '.') {
        await ctx.reply('Prompt cancelled');
        chatGPT_TopLevelMenu(ctx);
        return;
    }

    const ans = await generateResponse(prompt);
    await ctx.reply(`${ans}`);

    chatGPT_TopLevelMenu(ctx); //TODO: do I really have to send the context...?  can't I just do a bot.telegram.sendMessage()??!?!?!?
}




async function run_prompt(ctx) {
    setModeCallback(ask_prompt);

    await ctx.reply('Prompt for ChatGPT: (send a `.` to cancel)'); // Telegram won't allow a blank message apparently
}


export function teachChatGPT(bot) {
    bot.action('chatGPT_TopLevelMenu', async ctx => {
        chatGPT_TopLevelMenu(ctx);
    });

    bot.action('run_prompt', run_prompt);
}
