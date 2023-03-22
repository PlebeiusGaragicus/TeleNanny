const fs = require('fs');
const path = require('path');


function helpCommand(ctx) {
    console.log("Help command called")

    const commandsFolder = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsFolder);
    const commandList = commandFiles.map((file) => `/${file.slice(0, -3)}`).join('\n');

    const helpMessage = `List of available commands:\n${commandList}`;

    ctx.reply(helpMessage);
}

module.exports = helpCommand;
