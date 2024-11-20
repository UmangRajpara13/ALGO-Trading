import { WebSocketServer } from "ws";
import { Subscribe, UnSubscribe } from "./market_functions.js";
import { GetInstrumentId } from "./master.js";
import socketIoClient from "socket.io-client"
import { Mutex } from "async-mutex";

const mutex = new Mutex();
const clients = new Map();
const InstrumentNameId = {}

export function ws_server_init(port) {

    console.log(`Setting Websocket Server ${port}`)

    const wss = new WebSocketServer({ port: port })

    wss.on('connection', (ws) => {

        // Handle incoming messages
        ws.on('message', async (message) => {
            const data = JSON.parse(message);
            const key = Object.keys(data)[0]
            const payload = data[key]

            console.log(data, payload)

            switch (key) {
                case "clientId":
                    clients.set(payload["id"], { ws: ws })
                    break;
                case "subscribe":
                    // const instruments = await GetInstrumentIds(payload["list"])
                    // console.log(instruments)
                    console.log('subscribing')
                    payload["list"].forEach((instrument) => {
                        console.log(instrument)
                        GetInstrumentId(instrument).then((instrumentObjectFull) => {
                            // console.log('instrumentOjFull', instrumentObjectFull)
                            Subscribe(instrumentObjectFull).then((response) => {
                                console.log('sub res', response)
                                ws.send(JSON.stringify({ message: response }))
                                InstrumentNameId[response.exchangeInstrumentID] = response.name
                                console.log(InstrumentNameId)
                            }).catch((error) => {
                                console.log('sub err', error); ws.send(JSON.stringify({ message: error }))
                            })

                        })
                    })

                    break;
                case "unsubscribe":
                    // UnSubscribe(payload["list"])
                    payload["list"].forEach((instrument) => {
                        console.log(instrument)
                        GetInstrumentId(instrument).then((instrumentObjectFull) => {
                            // console.log('instrumentOjFull', instrumentObjectFull)
                            UnSubscribe(instrumentObjectFull).then((response) => {
                                console.log('unsub res', response)
                                ws.send(JSON.stringify({ message: response }))
                                delete InstrumentNameId[response.exchangeInstrumentID]
                                console.log(InstrumentNameId)
                            }).catch((error) => {
                                console.log('sub err', error); ws.send(JSON.stringify({ message: error }))
                            })
                        })
                    })
                    break;
                default:
                    break;
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            // clients.delete(ws); 
            console.log(`Client disconnected: `);
        });
    })
}

const apiUrl = 'https://mtrade.arhamshare.com/';
let publishFormat = 'JSON';
let broadcastMode = 'Full';

let incomingMessages = [];
let processingMessages = [];
const PROCESSING_INTERVAL = 50; // milliseconds

// Function to initialize the WebSocket connection
export function initializeWebSocket(token, userID) {

    console.log('Connecting socket with broker...')
    const socket = socketIoClient(apiUrl, {
        path: "/apimarketdata/socket.io",
        reconnectionDelayMax: 10000,
        reconnection: true,
        query: {
            token: token,
            userID: userID,
            publishFormat: publishFormat,
            broadcastMode: broadcastMode,
            transports: ["websocket"],
            EIO: 3,
        }
    });

    socket.on('connect', () => {
        console.log('Connection with broker established!', Date.now());
    });

    // socket.on('message', (data) => {
    //     console.log('Message received:', data);
    // });

    socket.on("1501-json-full", function (data) {
        console.log("Touchline " + data);
    });

    socket.on("1502-json-full", function (data) {
        console.log("Market Depth" + data);
    });

    socket.on("1505-json-full", async function (data) {
        const result = JSON.parse(data)
        console.log(result.BarTime, ' ', InstrumentNameId[`${result["ExchangeInstrumentID"]}`], '  ', result.Close)
        incomingMessages.push(data); // Always add to incoming queue
    });

    // socket.on("1507-json-full", function (data) {
    //     console.log("Market Status" + data);
    // });

    socket.on("1510-json-full", function (data) {
        console.log("Open Interest" + data);
    });

    socket.on("1512-json-full", function (data) {
        // console.log("LTP" + data);
    });

    // socket.on("1105-json-partial", function (data) {
    //     console.log("Instrument Change " + data);
    // });

    socket.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });

    socket.on('joined', (data) => {
        console.log('Joined event:', data);
    });

    socket.on('disconnect', () => {
        console.log('WebSocket Disconnected', Date.now());
    });

};

setInterval(async () => {
    const release = await mutex.acquire();
    try {
        // Move messages from incoming to processing queue
        while (incomingMessages.length > 0) {
            processingMessages.push(incomingMessages.shift());
        }

        if (processingMessages.length > 0) {
            let payloads = processingMessages.map(data => {
                let payload = JSON.parse(data);
                return { ...payload, name: InstrumentNameId[`${payload["ExchangeInstrumentID"]}`] };
            });
            clients.forEach((value, key) => {
                clients.get(key)["ws"].send(JSON.stringify({ marketdata: payloads })); // sending array as payload instead on object
            });
            processingMessages = []; // Clear after processing
        }
    } finally {
        release();
    }
}, PROCESSING_INTERVAL);