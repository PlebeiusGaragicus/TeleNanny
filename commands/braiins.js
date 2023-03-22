// module.exports = function braiinsCommand(ctx) {
//     console.log("Braiins command called")
//     token = process.env.BRAIINS_TOKEN || undefined;

//     if (token === undefined) {
//         const PORT = process.env.PORT || 3000;
//         ctx.reply(`Braiins token not set.\nThis needs to be set using http://localhost:${PORT} on the application server.`);
//         return;
//     }

//     const Message = 'Braiins command run';

//     ctx.reply(Message);
// }

const fetch = require('node-fetch');

const { Markup } = require('telegraf');

// const { getCommands } = require('../helpers');
const { showCommands } = require('../helpers');



// module.exports = braiinsCommand = async (ctx) => {
async function braiinsCommand(ctx) {
    console.log("Braiins command called")
    token = process.env.BRAIINS_TOKEN || undefined;

    if (token === undefined) {
        const PORT = process.env.PORT || 3000;
        ctx.reply(`Braiins token not set.\nThis needs to be set using http://localhost:${PORT} on the application server.`);
        return;
    }

    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('<-', 'show_commands'),
        Markup.button.callback('user', 'user_action'),
        Markup.button.callback('pool', 'pool_action'),
    ]);

    await ctx.reply('Query the Braiins API:', inlineKeyboard);
}

async function braiins_user(ctx) {
    console.log("Braiins user button pressed")
    // ctx.answerCbQuery('User button pressed');

    const coin = 'btc';
    const url = `https://pool.braiins.com/accounts/profile/json/${coin}/`
    await fetch(url, {
        method: 'GET',
        headers: {
            "SlushPool-Auth-Token": `${process.env.BRAIINS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(async json => {
            console.log(json);


            // Remove the inline keyboard buttons
            // await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            // Remove the 'Choose an option:' text and the inline keyboard buttons
            // await ctx.editMessageText('✓ Option selected', { reply_markup: { inline_keyboard: [] } });
            await ctx.editMessageText("Braiins user info", { reply_markup: { inline_keyboard: [] } });
            // ctx.deleteMessage();


            // ctx.reply(JSON.stringify(json));
            const prettyData = JSON.stringify(json, null, 2);
            await ctx.reply(`<pre>${prettyData}</pre>`, { parse_mode: 'HTML' });

            showCommands(ctx);
        })
        .catch(err => {
            console.log(err);
            ctx.reply("Error: " + err);
        });
}

module.exports = {
    braiinsCommand,
    braiins_user
}




// const braiins = async (ctx) => {
//     const inlineKeyboard = Markup.inlineKeyboard([
//         Markup.button.callback('user', 'user_action'),
//         Markup.button.callback('pool', 'pool_action'),
//     ]);

//     await ctx.reply('Choose an option:', inlineKeyboard);
// };
