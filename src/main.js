
import { configDotenv } from "dotenv";
import { Login } from "./login.js";
import { ws_server_init, initializeWebSocket, setup_log_streams } from "./ws_server.js";
import { master, masterRead } from "./master.js";
import updateOrAddEnvVariable from "./update_env.js";
import fs from 'fs';
import { stringify } from "csv-stringify";
import { finished } from "stream/promises";

configDotenv();

const loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format

const port = 3000
// const code_activity_log_stream = fs.createWriteStream(`./src/logs/${today}/activity.txt`, { flags: 'a', encoding: 'utf8' });


// const handleExit = async () => {
//     // Close the writable streams when done
//     return new Promise(async (resolve, reject) => {

//         code_activity_log_stream && code_activity_log_stream.end((err) => {
//             if (err) {
//                 console.log(`Error closing log stream: ${err}`);
//                 reject()
//             } else {
//                 console.log('code_activity_log_stream closed.');
//             }

//         });

//         // Wait for all writable streams to finish
//         if (code_activity_log_stream) await Promise.all([
//             finished(code_activity_log_stream)
//         ]);
//         resolve();
//     })
// }


// process.on('SIGINT', async () => {
//     console.log('Ctrl+C pressed.');
//     await handleExit();
//     process.exit(0); // Exit the process
// });

// process.on('uncaughtException', async (error) => {
//     console.error('Unhandled Exception:', error);
//     await handleExit();
//     process.exit(1); // Exiting is often recommended after an uncaught exception
// });

async function main(loginRequest) {
    console.log('Environment :', process.env.NODE_ENV)
    // Get today's date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set time to midnight for today's date

    // Get the last date from the environment variable
    const lastDateStr = process.env.master_update_day;
    const lastDateParts = lastDateStr.split('-'); // Split the date string into parts
    const lastDate = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]); // Create a Date object (month is 0-indexed)
    lastDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    // Compare dates to check if midnight has passed
    if (now > lastDate) {
        console.log("Midnight has passed, Fetching Master...");
        await master();
        await updateOrAddEnvVariable("master_update_day", today)
    } else {
        console.log("It is still before midnight wrt the stored date.");
    }

    await masterRead('index')
    await masterRead('nsecm')
    await masterRead('nsecd')
    await masterRead('nsefo')

    const init_log_folders = async () => {
        return new Promise((resolve, reject) => {
            fs.mkdir(`./src/logs/${today}`, { recursive: true }, (err) => {
                if (err) {
                    console.error(`Error creating directory: ${err.message}`);
                    // reject()
                    process.exit(1)
                } else {
                    console.log(`Directory ./logs/${today} created or already exists.`);
                    setup_log_streams(today);
                    // const code_activity_log_stream = fs.createWriteStream(`./src/logs/${today}/activity.txt`, { flags: 'a', encoding: 'utf8' });

                    resolve();
                }
            });
        })
    }

    await init_log_folders().then(() => {
        ws_server_init(port);
    })

    Login(loginRequest).then(() => {
        configDotenv({ override: true });
        initializeWebSocket(process.env.token, process.env.userID);
    }).catch(err => {
        console.log(err)
    });

}

main(loginRequest)
