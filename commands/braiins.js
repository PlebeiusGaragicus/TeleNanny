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

const { Markup } = require('telegraf');


module.exports = braiinsCommand = async (ctx) => {
    console.log("Braiins command called")
    token = process.env.BRAIINS_TOKEN || undefined;

    if (token === undefined) {
        const PORT = process.env.PORT || 3000;
        ctx.reply(`Braiins token not set.\nThis needs to be set using http://localhost:${PORT} on the application server.`);
        return;
    }

    const inlineKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('user', 'user_action'),
        Markup.button.callback('pool', 'pool_action'),
    ]);

    await ctx.reply('Query the Braiins API:', inlineKeyboard);
}




// const braiins = async (ctx) => {
//     const inlineKeyboard = Markup.inlineKeyboard([
//         Markup.button.callback('user', 'user_action'),
//         Markup.button.callback('pool', 'pool_action'),
//     ]);

//     await ctx.reply('Choose an option:', inlineKeyboard);
// };
