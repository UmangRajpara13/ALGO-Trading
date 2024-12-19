import { WebSocketServer } from "ws";
import { Subscribe, UnSubscribe } from "./market_functions.js";
import { GetInstrumentId } from "./master.js";
import socketIoClient from "socket.io-client"
import { Mutex } from "async-mutex";
import { dummy_missing_strikes_price, dummy_nearest_future_change, dummy_spot, dummy_spot_nearest_future_change, dummy_strikes_price } from "./dummy_data.js";
import { stringify } from "csv-stringify";
import fs from 'fs';
import { finished } from "stream/promises";
import axios from 'axios';

let candle_log_stream,
    ltp_log_stream,
    marketdepth_log_stream,
    sub_unsub_log_stream = null;

const clients = new Map();
const InstrumentNameId = {}

// Create a stringifier with headers
const candle_stringifier = stringify({ header: true });
const ltp_stringifier = stringify({ header: true });
const marketdepth_stringifier = stringify({ header: true });
const sub_unsub_stringifier = stringify({ header: true });

const apiUrl = 'https://mtrade.arhamshare.com/';
let publishFormat = 'JSON';
let broadcastMode = 'Full';

const handleExit = async () => {
    // Close the writable streams when done
    try {
        if (!candle_log_stream || !marketdepth_log_stream || !sub_unsub_log_stream || !ltp_log_stream) {
            console.error("One or more log streams are not defined.");
            return; // Exit early if any stream is undefined
        }
        const closeStream = (stream) => {
            return new Promise((resolve, reject) => {
                stream.end((err) => {
                    if (err) {
                        console.log(`Error closing log stream: ${err}`);
                        reject(err);
                    } else {
                        console.log(`${stream.name} closed.`);
                        resolve();
                    }
                });
            });
        };

        await Promise.all([
            closeStream(candle_log_stream),
            closeStream(marketdepth_log_stream),
            closeStream(sub_unsub_log_stream),
            closeStream(ltp_log_stream)
        ]);

        // Wait for all writable streams to finish
        // Check if all streams have finished
        await Promise.all([
            finished(candle_log_stream),
            finished(marketdepth_log_stream),
            finished(sub_unsub_log_stream),
            finished(ltp_log_stream)
        ]);
    } catch (error) {
        console.log(error)
    }

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

export function setup_market_log_streams(today) {
    // Create a writable stream for logging
    candle_log_stream = fs.createWriteStream(`./src/logs/${today}/candle.csv`, { flags: 'a', encoding: 'utf8' });
    marketdepth_log_stream = fs.createWriteStream(`./src/logs/${today}/marketdepth.csv`, { flags: 'a', encoding: 'utf8' });
    sub_unsub_log_stream = fs.createWriteStream(`./src/logs/${today}/sub_unsub.csv`, { flags: 'a', encoding: 'utf8' });
    ltp_log_stream = fs.createWriteStream(`./src/logs/${today}/ltp.csv`, { flags: 'a', encoding: 'utf8' });

    // Pipe the stringifier to the writable stream
    candle_stringifier.pipe(candle_log_stream);
    marketdepth_stringifier.pipe(marketdepth_log_stream);
    sub_unsub_stringifier.pipe(sub_unsub_log_stream);
    ltp_stringifier.pipe(ltp_log_stream);

}

// export function ws_server_init(port) {

//     console.log(`Setting Websocket Server ${port}`)

//     const wss = new WebSocketServer({ port: port })

//     wss.on('connection', (ws) => {

//         if (process.env.NODE_ENV === 'development') {
//             console.log('sending dummy data...')
//             setTimeout(() => {
//                 ws.send(JSON.stringify({ marketdata: dummy_spot }))
//             }, 9990);
//             setTimeout(() => {
//                 ws.send(JSON.stringify({ marketdata: dummy_strikes_price }))
//             }, 14990);
//             setTimeout(() => {
//                 ws.send(JSON.stringify({ marketdata: dummy_missing_strikes_price }))
//             }, 19990);
//             setTimeout(() => {
//                 ws.send(JSON.stringify({ marketdata: dummy_spot_nearest_future_change }))
//             }, 24990);
//             setTimeout(() => {
//                 ws.send(JSON.stringify({ marketdata: dummy_nearest_future_change }))
//             }, 29990);
//         }
//         // Handle incoming messages
//         ws.on('message', async (message) => {
//             const data = JSON.parse(message);
//             const key = Object.keys(data)[0]
//             const payload = data[key]

//             // console.log(data, payload)

//             switch (key) {
//                 case "clientId":
//                     clients.set(payload["id"], { ws: ws })
//                     break;
//                 case "subscribe":
//                     // console.log('subscribing')
//                     payload["list"].forEach((instrument) => {
//                         // console.log(instrument)
//                         GetInstrumentId(instrument).then((instrumentObjectFull) => {
//                             // console.log('instrumentOjFull', instrumentObjectFull)
//                             Subscribe(instrumentObjectFull).then((response) => {
//                                 console.log('subscribe', response.name, response.type)
//                                 sub_unsub_stringifier.write({ ...response, operation: 'Subscribe', error: null });
//                                 ws.send(JSON.stringify({ message: { ...response, operation: 'Subscribe' } }))
//                                 InstrumentNameId[response.exchangeInstrumentID] = response.name
//                                 // console.log(InstrumentNameId)
//                             }).catch((errorObj) => {
//                                 console.log('Subscribe error', errorObj.name, errorObj.type)
//                                 sub_unsub_stringifier.write({ ...errorObj, operation: 'Subscribe' });
//                                 ws.send(JSON.stringify({ message: { ...errorObj, operation: 'Subscribe' } }))
//                             })
//                         })
//                     })

//                     break;
//                 case "unsubscribe":
//                     // UnSubscribe(payload["list"])
//                     payload["list"].forEach((instrument) => {
//                         // console.log(instrument)
//                         GetInstrumentId(instrument).then((instrumentObjectFull) => {
//                             // console.log('instrumentOjFull', instrumentObjectFull)
//                             UnSubscribe(instrumentObjectFull).then((response) => {
//                                 console.log('unsubscribe', response.name, response.type)
//                                 sub_unsub_stringifier.write({ ...response, operation: 'Unsubscribe', error: null });
//                                 ws.send(JSON.stringify({ message: { ...response, operation: 'Unsubscribe' } }))
//                                 delete InstrumentNameId[response.exchangeInstrumentID]
//                                 // console.log(InstrumentNameId)
//                             }).catch((errorObj) => {
//                                 console.log('Unsubscribe error', errorObj.name, errorObj.type)
//                                 sub_unsub_stringifier.write({ ...errorObj, operation: 'Unsubscribe' });

//                                 ws.send(JSON.stringify({ message: { ...errorObj, operation: 'Unsubscribe' } }))
//                             })
//                         })
//                     })
//                     break;
//                 default:
//                     break;
//             }
//         });

//         // Handle disconnection
//         ws.on('close', () => {
//             // clients.delete(ws); 
//             console.log(`Client disconnected: `);
//         });
//     })
// }

// To manage active subscriptions and broker requests


// Structure: { `${name}_${eventCode}_${segment}`: { clients: Set<ws>, isSubscribed: boolean } }
const subscriptions = {};

export function ws_server_init(port) {

    console.log(`Setting Websocket Server ${port}`)

    const wss = new WebSocketServer({ port: port })

    wss.on('connection', (ws) => {

        if (process.env.NODE_ENV === 'development') {
            console.log('sending dummy data...')
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_spot }))
            }, 9990);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_strikes_price }))
            }, 14990);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_missing_strikes_price }))
            }, 19990);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_spot_nearest_future_change }))
            }, 24990);
            setTimeout(() => {
                ws.send(JSON.stringify({ marketdata: dummy_nearest_future_change }))
            }, 29990);
        }

        // Handle incoming messages
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                if (!data.type) {
                    ws.send(JSON.stringify({ error: 'Invalid message format. Must include type.' }));
                    return;
                }

                const { type } = data;

                switch (type) {
                    case 'subscribe':

                        if (data.segment && data.name && data.eventCode) {
                            await handleSubscription(ws, data.segment, data.name, data.eventCode);
                        } else {
                            ws.send(JSON.stringify({ error: 'Invalid subscribe request. Must include name, eventCode, and segment.' }));
                        }

                        break;
                    case 'unsubscribe':

                        if (data.segment && data.name && data.eventCode) {
                            await handleUnsubscription(ws, data.segment, data.name, data.eventCode);
                        } else {
                            ws.send(JSON.stringify({ error: 'Invalid Unsubscribe request. Must include name, eventCode, and segment.' }));
                        }

                        break;
                    case 'placeOrder':
                        if (data.segment && data.name) {
                            await handlePlaceOrder(ws, data.segment, data.name);
                        } else {
                            ws.send(JSON.stringify({ error: 'Invalid placeOrder request. Must include name, and segment.' }));
                        }
                        break;
                    case 'modifyOrder':
                        if (data.segment && data.name) {
                            await handleModifyOrder(ws, data.segment, data.name);
                        } else {
                            ws.send(JSON.stringify({ error: 'Invalid modifyOrder request. Must include name, and segment.' }));
                        }
                        break;
                    case 'cancelOrder':
                        if (data.segment && data.name) {
                            await handleCancelOrder(ws, data.segment, data.name);
                        } else {
                            ws.send(JSON.stringify({ error: 'Invalid cancelOrder request. Must include name, and segment.' }));
                        }
                        break;
                    case 'message':

                        // if (data.content) {
                        //     handleClientMessage(ws, data.content);
                        // } else {
                        //     ws.send(JSON.stringify({ error: 'Invalid message request. Must include content.' }));
                        // }

                        break;
                    default:
                        ws.send(JSON.stringify({ error: 'Unsupported operation.' }));
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ error: 'Error processing message' }));
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            console.log('Client disconnected.');
            cleanupSubscriptions(ws);
        });
    });
}

async function handleSubscription(ws, segment, name, eventCode) {
    const key = `${name}_${eventCode}_${segment}`;

    if (!subscriptions[key]) {
        // First client subscribing to this combination
        subscriptions[key] = { clients: new Set(), isSubscribed: false };
    }

    // Add the client to the subscription set
    subscriptions[key].clients.add(ws);

    if (!subscriptions[key].isSubscribed) {
        // If broker subscription hasn't been made yet, make the call
        try {
            // Get the ExchangeInstrumentId
            GetInstrumentId({ segment: segment, name: name, eventCode: eventCode })
                .then(async (instrumentObjectFull) => {
                    await axios.post(`${apiUrl}/apimarketdata/instruments/subscription`, {
                        instruments: [{
                            exchangeSegment: instrumentObjectFull.exchangeSegment,
                            exchangeInstrumentID: instrumentObjectFull.exchangeInstrumentID
                        }],
                        xtsMessageCode: instrumentObjectFull.eventCode,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': process.env.token
                        }
                    }).then(response => {
                        if (response.data.type === 'success') {

                            InstrumentNameId[instrumentObjectFull.exchangeInstrumentID] = name

                            sub_unsub_stringifier.write({
                                eventCode: instrumentObjectFull.eventCode,
                                name: instrumentObjectFull.name,
                                operation: 'Subscribe',
                                type: 'success',
                                error: null
                            });
                            ws.send(JSON.stringify({
                                message: {
                                    eventCode: instrumentObjectFull.eventCode,
                                    name: instrumentObjectFull.name,
                                    operation: 'Subscribe',
                                    type: 'success'
                                }
                            }))
                        }

                    }).catch(error => {
                        sub_unsub_stringifier.write({
                            error: error,
                            eventCode: instrumentObjectFull.eventCode,
                            name: instrumentObjectFull.name,
                            operation: 'Subscribe',
                            type: 'failed'
                        });

                        ws.send(JSON.stringify({
                            message: {
                                error: error,
                                eventCode: instrumentObjectFull.eventCode,
                                name: instrumentObjectFull.name,
                                operation: 'Subscribe',
                                type: 'failed'
                            }
                        }))
                    });
                })
        } catch (error) {
            console.error(`Error subscribing to broker for ${name} with eventCode ${eventCode}:`, error.message);
            ws.send(JSON.stringify({ error: `Failed to subscribe to ${name} with eventCode ${eventCode}` }));
            return;
        }
    } else {
        console.log(`Client already subscribed to ${name} with eventCode ${eventCode}.`);
    }
    // Notify the client of successful subscription
    ws.send(JSON.stringify({ success: `Subscribed to ${name} with eventCode ${eventCode}` }));
}


async function handleUnsubscription(ws, segment, name, eventCode) {

    const key = `${name}_${eventCode}_${segment}`;

    if (!subscriptions[key] || !subscriptions[key].clients.has(ws)) {
        ws.send(JSON.stringify({ error: `Not subscribed to ${name} with eventCode ${eventCode}` }));
        return;
    }

    // Remove the client from the subscription set
    subscriptions[key].clients.delete(ws);

    if (subscriptions[key].clients.size === 0) {
        // If no more clients are subscribed, send unsubscription request to the broker
        try {
            // Get the ExchangeInstrumentId
            GetInstrumentId({ segment: segment, name: name, eventCode: eventCode })
                .then(async (instrumentObjectFull) => {
                    await axios.put(`${apiUrl}/apimarketdata/instruments/subscription`, {
                        instruments: [{
                            exchangeSegment: instrumentObjectFull.exchangeSegment,
                            exchangeInstrumentID: instrumentObjectFull.exchangeInstrumentID
                        }],
                        xtsMessageCode: instrumentObjectFull.eventCode,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': process.env.token
                        }
                    }).then(response => {
                        if (response.data.type === 'success') {
                            console.log(`Unsubscribed from broker for ${name} with eventCode ${eventCode}`);
                            delete subscriptions[key]; // Clean up the subscription
                            sub_unsub_stringifier.write({
                                eventCode: eventCode,
                                name: name,
                                operation: 'Unsubscribe',
                                type: 'success',
                                error: null
                            });
                            ws.send(JSON.stringify({
                                message: {
                                    eventCode: eventCode,
                                    name: name,
                                    operation: 'Unsubscribe',
                                    type: 'success'
                                }
                            }))
                        }
                    }).catch(error => {

                        // throw new Error(`Broker unsubscription failed for ${name} with eventCode ${eventCode}`);
                        sub_unsub_stringifier.write({
                            error: error,
                            eventCode: eventCode,
                            name: name,
                            operation: 'Unsubscribe',
                            type: 'failed'
                        });

                        ws.send(JSON.stringify({
                            message: {
                                error: error,
                                eventCode: eventCode,
                                name: name,
                                operation: 'Unsubscribe',
                                type: 'failed'
                            }
                        }))

                    });
                })
        } catch (error) {
            console.error(`Error unsubscribing from broker for ${name} with eventCode ${eventCode}:`, error.message);
            ws.send(JSON.stringify({ error: `Failed to subscribe to ${name} with eventCode ${eventCode}` }));
            return;
        }

    } else {
        // If other clients are still subscribed, do not unsubscribe from the broker
        console.log(`Client unsubscribed from ${name} with eventCode ${eventCode}, but other clients are still subscribed.`);
    }
    // Notify the client of successful unsubscription
    ws.send(JSON.stringify({ success: `Unsubscribed from ${name} with eventCode ${eventCode}` }));
}

function cleanupSubscriptions(ws) {
    for (const key in subscriptions) {
        if (subscriptions[key].clients.has(ws)) {
            subscriptions[key].clients.delete(ws);

            if (subscriptions[key].clients.size === 0) {
                const [name, eventCode, segment] = key.split('_');
                unsubscribeFromBroker(name, eventCode, segment);
                delete subscriptions[key];
            }
        }
    }
}


async function unsubscribeFromBroker(name, eventCode, segment) {
    try {

        // Get the ExchangeInstrumentId
        GetInstrumentId({ segment: segment, name: name, eventCode: eventCode })
            .then(async (instrumentObjectFull) => {
                await axios.put(`${apiUrl}/apimarketdata/instruments/subscription`, {
                    instruments: [{
                        exchangeSegment: instrumentObjectFull.exchangeSegment,
                        exchangeInstrumentID: instrumentObjectFull.exchangeInstrumentID
                    }],
                    xtsMessageCode: instrumentObjectFull.eventCode,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': process.env.token
                    }
                }).then(response => {
                    if (response.data.type === 'success') {
                        console.log(`Broker unsubscribed from ${name} with eventCode ${eventCode}`);
                    }
                }).catch(error => {
                    console.error(`Failed to unsubscribe from broker for ${name} with eventCode ${eventCode}`);
                });
            })
    } catch (error) {
        console.error(`Error unsubscribing from broker for ${name} with eventCode ${eventCode}:`, error.message);
    }
}



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

        // incomingMessages.push(data); // Always add to incoming queue
    });

    // process.env.NODE_ENV != 'development' && socket.on("1505-json-full", async function (data) {
    //     const result = JSON.parse(data)

    //     candle_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });

    //     clients.forEach((value, key) => {
    //         clients.get(key)["ws"].send(JSON.stringify({
    //             marketdata:
    //                 [{
    //                     ...result,
    //                     name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`]
    //                 }]
    //         }));
    //     });
    // });

    process.env.NODE_ENV != 'development' && socket.on("1505-json-full", async function (data) {
        const result = JSON.parse(data);

        candle_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });

        const instrumentId = result["ExchangeInstrumentID"];
        const instrumentName = InstrumentNameId[instrumentId];
        const exchangeSegment = result['ExchangeSegment'];
        const eventCode = result['MessageCode']

        let segment = null
        if (exchangeSegment === 1) {
            segment = 'nsecm'
        }
        if (exchangeSegment === 2) {
            segment = 'nsefo'
        }

        // Write to candle stringifier (if needed)
        candle_stringifier.write({ ...result, name: instrumentName });

        // Send updates only to subscribed clients
        if (subscriptions[`${instrumentId}_${eventCode}_${segment}`]) {
            subscriptions[`${instrumentId}_${eventCode}_${segment}`].forEach((clientWs) => {
                clientWs.send(JSON.stringify({
                    marketdata: [{ ...result, name: instrumentName }]
                }));
            });
        }
    });


    // socket.on("1507-json-full", function (data) {
    //     console.log("Market Status" + data);
    // });

    socket.on("1510-json-full", function (data) {
        console.log("Open Interest" + data);
    });

    // process.env.NODE_ENV != 'development' && socket.on("1512-json-full", function (data) {
    //     // console.log("LTP" + data);
    //     const result = JSON.parse(data)
    //     // console.log(result.BarTime, ' ', InstrumentNameId[`${result["ExchangeInstrumentID"]}`], '  ', result.Close)

    //     ltp_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });

    //     clients.forEach((value, key) => {
    //         clients.get(key)["ws"].send(JSON.stringify({
    //             marketdata:
    //                 [{
    //                     ...result,
    //                     name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`]
    //                 }]
    //         })); // sending array as payload instead on object
    //     });
    // });

    process.env.NODE_ENV != 'development' && socket.on("1512-json-full", function (data) {

        const result = JSON.parse(data)

        ltp_stringifier.write({ ...result, name: InstrumentNameId[`${result["ExchangeInstrumentID"]}`] });

        const instrumentId = result["ExchangeInstrumentID"];
        const instrumentName = InstrumentNameId[instrumentId];
        const exchangeSegment = result['ExchangeSegment'];
        const eventCode = result['MessageCode']

        let segment = null
        if (exchangeSegment === 1) {
            segment = 'nsecm'
        }
        if (exchangeSegment === 2) {
            segment = 'nsefo'
        }

        // Send updates only to subscribed clients
        if (subscriptions[`${instrumentId}_${eventCode}_${segment}`]) {
            subscriptions[`${instrumentId}_${eventCode}_${segment}`].forEach((clientWs) => {
                clientWs.send(JSON.stringify({
                    marketdata: [{ ...result, name: instrumentName }]
                }));
            });
        }
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

export function interactiveStreaming(token, userID) {
    const socket = socketIoClient(apiUrl, {
        path: "/interactive/socket.io",
        reconnectionDelayMax: 10000,
        reconnection: true,
        query: {
            token: token,
            userID: userID,
            transports: ["websocket"],
            apiType: 'INTERACTIVE',
            EIO: 3,
        }
    });
    socket.on('connect', function () {
        console.log("interactive socket connected successfully!");
    });

    socket.on('joined', function (data) {
        console.log("interactive socket joined successfully!", JSON.parse(data));
    });
    socket.on('error', function (data) {
        console.log("interactive error:", JSON.parse(data));
    });
    socket.on('disconnect', function () {
        console.log("interactive disconnect");
    });
    socket.on('order', function (data) {
        console.log("interactive order!", JSON.parse(data));
    });
    socket.on('trade', function (data) {
        console.log("interactive trade", JSON.parse(data));
    });
    socket.on('position', function (data) {
        console.log("interactive position!", JSON.parse(data));
    });
    socket.on('tradeConversion', function (data) {
        console.log("interactive tradeConversion!", JSON.parse(data));
    });
    socket.on('logout', function () {
        console.log("interactive logged out!");
    });
}