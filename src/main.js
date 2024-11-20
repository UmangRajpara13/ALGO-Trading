
import { configDotenv } from "dotenv";
import { Login } from "./login.js";
import { ws_server_init, initializeWebSocket } from "./ws_server.js";
import { master, masterRead } from "./master.js";
configDotenv();

var loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

const port = 3000

async function main(loginRequest) {

    // Get today's date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set time to midnight for today's date
    console.log(now.getHours())

    // Get the last date from the environment variable
    const lastDateStr = process.env.master_update_day;
    const lastDateParts = lastDateStr.split('-'); // Split the date string into parts
    const lastDate = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]); // Create a Date object (month is 0-indexed)
    lastDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    // Compare dates to check if midnight has passed
    if (now > lastDate) {
        console.log("Midnight has passed, Fetching Master...");
        await master() ;
        const today = now.toISOString().split('T')[0]; // Get yyyy-mm-dd format
        await updateOrAddEnvVariable("master_update_day", today)
    } else {
        console.log("It is still before midnight wrt the stored date.");
    }

    await masterRead('index')
    await masterRead('nsecm')
    await masterRead('nsecd')
    await masterRead('nsefo')

    ws_server_init(port);

    Login(loginRequest).then(() => {
        configDotenv({ override: true });
        initializeWebSocket(process.env.token, process.env.userID);
    }).catch(err => {
        console.log(err)
    });

}



main(loginRequest)
