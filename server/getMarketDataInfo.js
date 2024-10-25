
import { XtsMarketDataAPI } from "xts-marketdata-api";
import { configDotenv } from "dotenv";
configDotenv()



var xtsMarketDataWS = new XtsMarketDataAPI('https://mtrade.arhamshare.com/apimarketdata');

var socketInitRequest = {
    token: process.env.token,
    userID: process.env.userID,
    publishFormat: "JSON",
    broadcastMode: "Full"
};

const response = xtsMarketDataWS.logIn(socketInitRequest);
console.log(response)