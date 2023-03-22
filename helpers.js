// helpers.js
const fs = require('fs');
const path = require('path');

const { Markup } = require('telegraf');

const getCommands = () => {
    const commandFiles = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js'));
    console.log(commandFiles)
    return commandFiles.map(file => file.slice(0, -3));
};

const showCommands = async (ctx) => {
    const commands = getCommands();
    const buttons = commands.map(command => Markup.button.callback(`/${command}`, `${command}_action`));

    // const commandInlineKeyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
    const commandInlineKeyboard = Markup.inlineKeyboard(buttons);
    await ctx.reply('Available commands:', commandInlineKeyboard);
}

// const generateCommandInlineKeyboard = () => {
//     const commands = getCommands();
//     const buttons = commands.map(command => Markup.button.callback(`/${command}`, `${command}_action`));
//     return Markup.inlineKeyboard(buttons, { columns: 1 });
// };

// module.exports = {
//     getCommands,
//     generateCommandInlineKeyboard,
// };

module.exports = {
    getCommands,
    showCommands
};
