import fetch from 'node-fetch';
import { Markup } from 'telegraf';

import { setModeCallback, mode_callback } from '../helpers.js';


// TODO: add open ai API key

export async function chatGPT_TopLevelMenu(ctx) {
    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('run a prompt', 'run_prompt')
    ]);

    await ctx.reply('chatGPT API', inlineKeyboard);
}

async function ask_prompt(ctx) {
    ctx.deleteMessage();
    setModeCallback(null);

    const prompt = ctx.message.text;

    if (prompt == '.') {
        await ctx.reply('Prompt cancelled');
        chatGPT_TopLevelMenu(ctx);
        return;
    }

    await ctx.reply(`Prompt: ${prompt}`);

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
