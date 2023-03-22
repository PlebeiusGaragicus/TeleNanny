// helpers.js
const fs = require('fs');
const path = require('path');

const { Markup } = require('telegraf');

const getCommands = () => {
    const commandFiles = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js'));
    console.log(commandFiles)
    return commandFiles.map(file => file.slice(0, -3));
};

const generateCommandInlineKeyboard = () => {
    const commands = getCommands();
    const buttons = commands.map(command => Markup.button.callback(`/${command}`, `${command}_action`));
    return Markup.inlineKeyboard(buttons, { columns: 1 });
};

module.exports = {
    getCommands,
    generateCommandInlineKeyboard,
};
