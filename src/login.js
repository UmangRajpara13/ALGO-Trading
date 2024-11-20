import { XtsMarketDataAPI } from "xts-marketdata-api";
import updateOrAddEnvVariable from "./update_env.js";

import { configDotenv } from "dotenv";
configDotenv();


const xtsMarketDataAPI = new XtsMarketDataAPI("https://mtrade.arhamshare.com/apimarketdata");


export async function Login(user) {
    return new Promise(async (resolve, reject) => {
        let logIn = await xtsMarketDataAPI.logIn(user)
        // console.log(logIn)
        if (logIn["type"] === `success`) {
            console.log('Login Successful!')
            await updateOrAddEnvVariable("token", logIn.result.token)
                .then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                }) 
        }
    })

}