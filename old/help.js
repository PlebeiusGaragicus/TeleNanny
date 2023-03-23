// In this code snippet, we're using the fs.readdirSync() function to read the contents of
//  the commands folder and the path.join() function to generate the full path to the folder.
//  We then create a list of command names by removing the .js extension from the file
//  names and adding a / prefix.
// Save your changes and run your bot using node index.js
// Your bot should now respond to the /help command with a dynamically generated list of
//   available commands based on the files in the commands folder.
// Note that this implementation assumes all files in the commands folder are command
// handlers and their filenames correspond to the command names.
// If you want to add non-command files to the folder or use a different naming convention,
//  you'll need to adjust the code accordingly.

const fs = require('fs');
const path = require('path');

module.exports = function helpCommand(ctx) {
    console.log("Help command called")

    const commandsFolder = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsFolder);
    const commandList = commandFiles.map((file) => `/${file.slice(0, -3)}`).join('\n');

    const helpMessage = `List of available commands:\n${commandList}`;

    ctx.reply(helpMessage);
}
