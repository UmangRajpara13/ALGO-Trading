import { XtsMarketDataAPI } from "xts-marketdata-api";
import updateOrAddEnvVariable from "./update_env.js";

import { configDotenv } from "dotenv";
configDotenv();


const xtsMarketDataAPI = new XtsMarketDataAPI("https://mtrade.arhamshare.com/apimarketdata");


export async function Login(user) {
    let logIn = await xtsMarketDataAPI.logIn(user);
    // xtsMarketDataAPI.token=process.env.token
    console.log(logIn);
    updateOrAddEnvVariable("token", logIn.result.token)
}