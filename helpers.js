import { Markup } from 'telegraf';

import path from 'path';
import fs from 'fs';


export let mode_callback = null;


export function setModeCallback(mode) {
    mode_callback = mode;
}



export const ShowTopLevelCommands = async (ctx) => {
    const commandFiles = fs.readdirSync(path.join(process.cwd(), './commands')).filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => file.slice(0, -3));
    const buttons = commands.map(command => Markup.button.callback(`${command}`, `${command}_TopLevelMenu`));

    const commandInlineKeyboard = Markup.inlineKeyboard(buttons, { columns: 2 });
    // const commandInlineKeyboard = Markup.inlineKeyboard(buttons);

    // we have to reply becuase the context is a message from the user... and apparently we can't edit that message.
    await ctx.reply('Top level commands:', commandInlineKeyboard);
}
