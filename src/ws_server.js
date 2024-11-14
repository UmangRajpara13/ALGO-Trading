import { WebSocketServer } from "ws";
import { Subscribe, UnSubscribe } from "./market_functions.js";
import { GetInstrumentIds } from "./master.js";


export function ws_server_init(port) {

    const wss = new WebSocketServer({ port: port })
    const clients = new Map();

    wss.on('connection', (ws) => {

        // Handle incoming messages
        ws.on('message', async (message) => {
            const data = JSON.parse(message);
            const key = Object.keys(data)[0]
            const payload = data[key]

            console.log(data)

            switch (key) {
                case "clientId":
                    clients.set(payload["id"], { ws: ws })
                    break;
                case "subscribe":
                    const instruments = await GetInstrumentIds(payload["list"])
                    console.log(instruments)
                    Subscribe(instruments)
                        .then((response) => {
                            console.log('sub res', response)
                            const client = clients.get(payload["id"])
                            client["subscribedTo"] = payload["list"]

                        })
                        .catch((error) => { console.log('sub err', error) })
                    break;
                case "unsubscribe":
                    UnSubscribe(payload["list"])
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