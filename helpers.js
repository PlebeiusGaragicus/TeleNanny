// const fs = require('fs');
// const path = require('path');
import path from 'path';
import fs from 'fs';

// const { Markup } = require('telegraf');
import { Markup } from 'telegraf';



export const ShowTopLevelCommands = async (ctx) => {
    const commandFiles = fs.readdirSync(path.join(process.cwd(), './commands')).filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => file.slice(0, -3));
    // commandsNoUnderscore = commands.map(command => command.replace(/_/g, ' '));
    const buttons = commands.map(command => Markup.button.callback(`${command}`, `${command}_action`));

    // const commandInlineKeyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
    const commandInlineKeyboard = Markup.inlineKeyboard(buttons);

    await ctx.reply('Top level commands:', commandInlineKeyboard);
}


// module.exports = {
//     ShowTopLevelCommands
// };
