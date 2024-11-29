
import { configDotenv } from "dotenv";
import { Login } from "./login.js";
import { ws_server_init, initializeWebSocket, setup_market_log_streams } from "./ws_server.js";
import { master, masterRead } from "./master.js";
import updateOrAddEnvVariable from "./update_env.js";
import fs from 'fs';

configDotenv();

const loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format

const port = 3000

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
                    process.exit(1)
                } else {
                    console.log(`Directory ./logs/${today} created or already exists.`);                   
                    setup_market_log_streams(today);
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
