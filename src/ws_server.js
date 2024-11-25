import { WebSocketServer } from "ws";
import { Subscribe, UnSubscribe } from "./market_functions.js";
import { GetInstrumentId } from "./master.js";
import socketIoClient from "socket.io-client"
import { Mutex } from "async-mutex";
import { dummy_missing_strikes_price, dummy_spot, dummy_strikes_price } from "./dummy_data.js";
import { stringify } from "csv-stringify";
import fs from 'fs';
import { finished } from "stream/promises";

let candle_log_stream,
    marketdepth_log_stream,
    sub_unsub_log_stream = null;

const handleExit = async () => {
    // Close the writable streams when done
    return new Promise(async (resolve, reject) => {
        candle_log_stream && candle_log_stream.end((err) => {
            if (err) {
                console.log(`Error closing log stream: ${err}`);
                reject()
            } else {
                console.log('candle_log_stream closed.');

            }
        });
        marketdepth_log_stream && marketdepth_log_stream.end((err) => {
            if (err) {
                console.log(`Error closing log stream: ${err}`);
                reject()
            } else {
                console.log('marketdepth_log_stream closed.');
            }

        });
        sub_unsub_log_stream && sub_unsub_log_stream.end((err) => {
            if (err) {
                console.log(`Error closing log stream: ${err}`);
                reject()
            } else {
                console.log('marketdepth_log_stream closed.');
            }

        });

        // Wait for all writable streams to finish
        if (marketdepth_log_stream && candle_log_stream && sub_unsub_logstream) await Promise.all([
            finished(candle_log_stream),
            finished(marketdepth_log_stream),
            finished(sub_unsub_log_stream)
        ]);
        resolve();
    })
}


process.on('SIGINT', async () => {
    console.log('Ctrl+C pressed.');
    await handleExit();
    process.exit(0); // Exit the process
});

process.on('uncaughtException', async (error) => {
    console.error('Unhandled Exception:', error);
    await handleExit();
    process.exit(1); // Exiting is often recommended after an uncaught exception
});

process.on('SIGUSR2', async function () {
    // Perform cleanup tasks here
    console.log('Cleaning up before nodemon restart...');

    // Example: close database connections or clear caches
    await handleExit();

    // After cleanup, exit the process
    process.kill(process.pid, 'SIGTERM');
});

const mutex = new Mutex();
const clients = new Map();
const InstrumentNameId = {}

// Create a stringifier with headers
const candle_stringifier = stringify({ header: true });
const marketdepth_stringifier = stringify({ header: true });
const sub_unsub_stringifier = stringify({ header: true });

export function setup_market_log_streams(today) {
    // Create a writable stream for logging
    candle_log_stream = fs.createWriteStream(`./src/logs/${today}/candle.csv`, { flags: 'a', encoding: 'utf8' });
    marketdepth_log_stream = fs.createWriteStream(`./src/logs/${today}/marketdepth.csv`, { flags: 'a', encoding: 'utf8' });
    sub_unsub_log_stream = fs.createWriteStream(`./src/logs/${today}/sub_unsub.csv`, { flags: 'a', encoding: 'utf8' });

    // Pipe the stringifier to the writable stream
    candle_stringifier.pipe(candle_log_stream);
    marketdepth_stringifier.pipe(marketdepth_log_stream);
    sub_unsub_stringifier.pipe(sub_unsub_log_stream);
}

export function ws_server_init(port) {

    console.log(`Setting Websocket Server ${port}`)

    const wss = new WebSocketServer({ port: port })

    wss.on('connection', (ws) => {

        if (process.env.NODE_ENV === 'development') {
            console.log('sending dummy data...')
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_spot }))
            }, 2000);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_strikes_price }))
            }, 3000);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_missing_strikes_price }))
            }, 4000);
        }
        // Handle incoming messages
        ws.on('message', async (message) => {
            const data = JSON.parse(message);
            const key = Object.keys(data)[0]
            const payload = data[key]

            // console.log(data, payload)

            switch (key) {
                case "clientId":
                    clients.set(payload["id"], { ws: ws })
                    break;
                case "subscribe":
                    // console.log('subscribing')
                    payload["list"].forEach((instrument) => {
                        // console.log(instrument)
                        GetInstrumentId(instrument).then((instrumentObjectFull) => {
                            // console.log('instrumentOjFull', instrumentObjectFull)
                            Subscribe(instrumentObjectFull).then((response) => {
                                console.log('subscribe', response.name, response.type)
                                sub_unsub_stringifier.write({ ...response, operation: 'Subscribe', error: null });

                                ws.send(JSON.stringify({ message: { ...response, operation: 'Subscribe' } }))
                                InstrumentNameId[response.exchangeInstrumentID] = response.name
                                // console.log(InstrumentNameId)
                            }).catch((errorObj) => {
                                console.log('Subscribe error', errorObj.name, errorObj.type)
                                sub_unsub_stringifier.write({ ...errorObj, operation: 'Subscribe' });
                                ws.send(JSON.stringify({ message: { ...errorObj, operation: 'Subscribe' } }))
                            })
                        })
                    })

                    break;
                case "unsubscribe":
                    // UnSubscribe(payload["list"])
                    payload["list"].forEach((instrument) => {
                        // console.log(instrument)
                        GetInstrumentId(instrument).then((instrumentObjectFull) => {
                            // console.log('instrumentOjFull', instrumentObjectFull)
                            UnSubscribe(instrumentObjectFull).then((response) => {
                                console.log('unsubscribe', response.name, response.type)
                                sub_unsub_stringifier.write({ ...response, operation: 'Unsubscribe', error: null });
                                ws.send(JSON.stringify({ message: { ...response, operation: 'Unsubscribe' } }))
                                delete InstrumentNameId[response.exchangeInstrumentID]
                                // console.log(InstrumentNameId)
                            }).catch((errorObj) => {
                                console.log('Unsubscribe error', errorObj.name, errorObj.type)
                                sub_unsub_stringifier.write({ ...errorObj, operation: 'Unsubscribe' });

                                ws.send(JSON.stringify({ message: { ...errorObj, operation: 'Unsubscribe' } }))
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
        // console.log("Touchline " + data);
    });

    process.env.NODE_ENV != 'development' && socket.on("1502-json-full", function (data) {
        // console.log("Market Depth" + data);

        const result = JSON.parse(data)

        marketdepth_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });

        incomingMessages.push(data); // Always add to incoming queue
    });

    process.env.NODE_ENV != 'development' && socket.on("1505-json-full", async function (data) {
        const result = JSON.parse(data)
        
        candle_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });
        // console.log(result.BarTime, ' ', InstrumentNameId[`${result["ExchangeInstrumentID"]}`], '  ', result.Close)
        incomingMessages.push(data); // Always add to incoming queue
    });

    // socket.on("1507-json-full", function (data) {
    //     console.log("Market Status" + data);
    // });

    socket.on("1510-json-full", function (data) {
        console.log("Open Interest" + data);
    });

    process.env.NODE_ENV != 'development' && socket.on("1512-json-full", function (data) {
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