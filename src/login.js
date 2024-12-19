import { XtsMarketDataAPI } from "xts-marketdata-api";
import { Interactive } from "xts-interactive-api";
import updateOrAddEnvVariable from "./update_env.js";

import { configDotenv } from "dotenv";
configDotenv();


const xtsMarketDataAPI = new XtsMarketDataAPI("https://mtrade.arhamshare.com/apimarketdata");


export async function Login(user) {
    return new Promise(async (resolve, reject) => {
        const logIn = await xtsMarketDataAPI.logIn(user)
        // console.log(logIn)
        if (logIn["type"] === `success`) {
            console.log('Marketdata Login Successful!')
            await updateOrAddEnvVariable("token", logIn.result.token)
                .then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                }) 
        }
    })

}

const xtsInteractive = new Interactive("https://mtrade.arhamshare.com");

export async function LoginInteractive(user) {
    return new Promise(async (resolve, reject) => {
        const logIn = await xtsInteractive.logIn(user)
        // console.log(logIn)
        if (logIn["type"] === `success`) {
            console.log('Interactive Login Successful!')
            await updateOrAddEnvVariable("interactive_token", logIn.result.token)
                .then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                }) 
        }
    })

}