
import { XtsMarketDataAPI } from "xts-marketdata-api";

import updateOrAddEnvVariable from "./updateENV.js";
import { configDotenv } from "dotenv";
import { WebSocketServer } from "ws";
configDotenv();


const xtsMarketDataAPI = new XtsMarketDataAPI("https://mtrade.arhamshare.com/apimarketdata");


const wss = new WebSocketServer({ port: 3000 })

const clients = new Map();


var loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

async function main(loginRequest) {
    let logIn = await xtsMarketDataAPI.logIn(loginRequest);
    // xtsMarketDataAPI.token=process.env.token
    console.log(logIn);
    updateOrAddEnvVariable("token", logIn.result.token)
    console.log(await xtsMarketDataAPI.getSubscriptionlist({ xtsMessageCode: 1512 }))

}

wss.on('connection', (ws) => {
    // Assign a unique ID to each client and store it in the Map
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(ws, { id: clientId });

    // Log connection
    console.log(`Client connected: ${clientId}`);

    // Handle incoming messages
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received message from ${clientId}:`, data);

        // You can access the client's metadata here
        const clientData = clients.get(ws);
        console.log(`Client Data:`, clientData);
    });
    // Handle disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected: ${clientId}`);
    });
})

main(loginRequest)
