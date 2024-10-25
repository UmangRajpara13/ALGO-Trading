
import { XtsMarketDataAPI } from "xts-marketdata-api"
import updateOrAddEnvVariable from "./updateENV.js";
import { configDotenv } from "dotenv";
configDotenv();


const xtsMarketDataAPI = new XtsMarketDataAPI("https://mtrade.arhamshare.com/apimarketdata");

var loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

async function main(loginRequest) {
    // let logIn = await xtsMarketDataAPI.logIn();
    xtsMarketDataAPI.token=process.env.token
    // console.log(logIn);
    // updateOrAddEnvVariable("token", logIn.result.token)


    console.log(await xtsMarketDataAPI.getSubscriptionlist({xtsMessageCode:1512}))
}

main(loginRequest)
