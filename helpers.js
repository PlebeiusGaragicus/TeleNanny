const fs = require('fs');
const path = require('path');

const { Markup } = require('telegraf');


const ShowTopLevelCommands = async (ctx) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => file.slice(0, -3));
    // commandsNoUnderscore = commands.map(command => command.replace(/_/g, ' '));
    const buttons = commands.map(command => Markup.button.callback(`${command}`, `${command}_action`));

    // const commandInlineKeyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
    const commandInlineKeyboard = Markup.inlineKeyboard(buttons);

    await ctx.reply('Top level commands:', commandInlineKeyboard);
}


module.exports = {
    ShowTopLevelCommands
};
