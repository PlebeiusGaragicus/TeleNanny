import express from 'express';
import path from 'path';

import config from './server/config.js';
import { db, closeMongoDBConnection, connectToMongoDB } from "./server/database.js";
import { initBot, killBot } from './server/bot.js';
import { runIntterra } from './server/commands/intterra.js';


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
        await killIntterra();
        console.log("Closed app successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error closing app: ", error);
        process.exit(1);
    }
}



process.on("SIGINT", closeApp);
process.on("SIGTERM", closeApp);

process.on('uncaughtException', (error) => {
    console.log(" ++++++++++ You done goofed ++++++++++ ");
    console.error(error);
});




const app = express();
// const PORT = process.env.PORT || 3000
const PORT = config.port;

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


app.get("/settings", async (req, res) => {
    // TODO: should I just redo this whole function with getters?
    const collection = db.collection(config.DB_COLLECTION_NAME);

    const botToken = await collection.findOne({ name: "telegram_bot_token" });
    const chatId = await collection.findOne({ name: "chat_id" });
    const braiinsToken = await collection.findOne({ name: "braiins_token" });
    const openaiToken = await collection.findOne({ name: "openai_token" });
    // INTTERRA
    const intterraUnit = await collection.findOne({ name: "intterra_unit" });
    const intterraUnitPhonetic = await collection.findOne({ name: "intterra_unit_phonetic" });
    const intterraUsername = await collection.findOne({ name: "intterra_username" });
    const intterraPassword = await collection.findOne({ name: "intterra_password" });

    res.json({
        botToken: botToken ? botToken.value : "",
        chatId: chatId ? chatId.value : "",
        braiinsToken: braiinsToken ? braiinsToken.value : "",
        openAIToken: openaiToken ? openaiToken.value : "",
        intterraUnit: intterraUnit ? intterraUnit.value : "",
        intterraUnitPhonetic: intterraUnitPhonetic ? intterraUnitPhonetic.value : "",
        intterraUsername: intterraUsername ? intterraUsername.value : "",
        intterraPassword: intterraPassword ? intterraPassword.value : "",
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
    const { botToken, chatId, braiinsToken, openAIToken, intterraUnit, intterraUnitPhonetic, intterraUsername, intterraPassword } = req.body;

    // TODO: should I just redo this whole function with setters?
    try {
        const collection = db.collection(config.DB_COLLECTION_NAME);

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

        // INTTERRA
        await collection.updateOne({ name: 'intterra_unit' }, {
            $set: { value: intterraUnit, name: 'intterra_unit' }
        }, { upsert: true });

        await collection.updateOne({ name: 'intterra_unit_phonetic' }, {
            $set: { value: intterraUnitPhonetic, name: 'intterra_unit_phonetic' }
        }, { upsert: true });

        await collection.updateOne({ name: 'intterra_username' }, {
            $set: { value: intterraUsername, name: 'intterra_username' }
        }, { upsert: true });

        await collection.updateOne({ name: 'intterra_password' }, {
            $set: { value: intterraPassword, name: 'intterra_password' }
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

// TODO: change to check if the feature is enabled in the database
runIntterra();

// clearPendingMessages().then(() => {
//     bot.launch();
//     setupBot(bot);
// });
