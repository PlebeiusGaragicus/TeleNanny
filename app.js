import express from 'express';
import path from 'path';

import { db, closeMongoDBConnection, connectToMongoDB } from "./server/database.js";
import { initBot, killBot } from './server/bot.js';


// SETUP THE DATABASE
await connectToMongoDB();


// let closingInProgress = false;

//NOTE: TODO: we have to ensure that every possible exception is covered in try{} blocks or else the app will not close...
async function closeApp() {
    // NOTE: there was once an uncaught exception that prevented the app from closing.  Next time I pressed Control-C this code prevented closeApp() from running...
    // if (closingInProgress) {
    //     console.log("App is already closing. Ignoring signal.");
    //     return;
    // }

    // closingInProgress = true;
    console.log("Closing app...");
    try {
        await killBot();
        await closeMongoDBConnection();
        console.log("Closed app successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error closing app: ", error);
        process.exit(1);
    }
}

// async function closeApp() {
//     console.log("Closing app...");
//     Promise.resolve()
//         .then(() => killBot())
//         .then(() => closeMongoDBConnection())
//         .then(() => {
//             console.log("Closed app successfully");
//             process.exit(0);
//         })
//         .catch((error) => {
//             console.error("Error closing app: ", error);
//             process.exit(1);
//         });
// }


process.on("SIGINT", closeApp);
process.on("SIGTERM", closeApp);

process.on('uncaughtException', (error) => {
    console.log(" ++++++++++ You done goofed ++++++++++ ");
    console.error(error);
});




const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


app.get("/settings", async (req, res) => {
    const collection = db.collection("tokens");

    const botToken = await collection.findOne({ name: "telegram_bot_token" });
    const chatId = await collection.findOne({ name: "chat_id" });
    const braiinsToken = await collection.findOne({ name: "braiins_token" });
    const openaiToken = await collection.findOne({ name: "openai_token" });

    res.json({
        botToken: botToken ? botToken.value : "",
        chatId: chatId ? chatId.value : "",
        braiinsToken: braiinsToken ? braiinsToken.value : "",
        openAIToken: openaiToken ? openaiToken.value : ""
    });
});


// app.post('/settings', async (req, res) => {
//     const { botToken, chatId, braiinsToken, openAIToken } = req.body;

//     try {
//         const collection = db.collection("tokens");

//         await collection.updateOne({}, {
//             $set: {
//                 botToken: botToken,
//                 chatId: chatId,
//                 braiinsToken: braiinsToken,
//                 openAIToken: openAIToken
//             }
//         }, { upsert: true });

//         res.status(200).send('Settings updated successfully.');
//     } catch (error) {
//         res.status(500).send('Failed to update settings: ' + error);
//     }
// });

app.post('/settings', async (req, res) => {
    const { botToken, chatId, braiinsToken, openAIToken } = req.body;

    try {
        const collection = db.collection("tokens");

        await collection.updateOne({ name: 'telegram_bot_token' }, {
            $set: { value: botToken, name: 'telegram_bot_token' }
        }, { upsert: true });

        await collection.updateOne({ name: 'chat_id' }, {
            $set: { value: chatId, name: 'chat_id' }
        }, { upsert: true });

        await collection.updateOne({ name: 'braiins_token' }, {
            $set: { value: braiinsToken, name: 'braiins_token' }
        }, { upsert: true });

        await collection.updateOne({ name: 'openai_token' }, {
            $set: { value: openAIToken, name: 'openai_token' }
        }, { upsert: true });

        res.status(200).send('Settings updated successfully.');
    } catch (error) {
        res.status(500).send('Failed to update settings: ' + error);
    }
});


// app.post('/settings', (req, res) => {
//     const { botToken, chatId, braiinsToken, openAIToken } = req.body;
//     const envContent = `TELEGRAM_BOT_TOKEN=${botToken}\nCHAT_ID=${chatId}\nBRAIINS_TOKEN=${braiinsToken}\nOPENAI_TOKEN=${openAIToken}`;

//     fs.writeFile(path.join(process.cwd(), '.env'), envContent, (err) => {
//         if (err) {
//             res.status(500).send('Failed to update settings.');
//         } else {
//             res.status(200).send('Settings updated successfully.');
//         }
//     });
// });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


////////////////// NOTE: MOVED TO BOT.JS
//// INIT THE BOT ////
// export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// async function clearPendingMessages() {
//     let updates = await bot.telegram.getUpdates();

//     for (const update of updates) {
//         console.log("ignoring updates while bot was offline:", update);
//         await bot.handleUpdate(update);
//     }
// }


initBot();

// clearPendingMessages().then(() => {
//     bot.launch();
//     setupBot(bot);
// });
