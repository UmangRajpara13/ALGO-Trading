import { WebSocket } from "ws";


const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
    console.log("Connected to server");
    socket.send(
        JSON.stringify({
            clientId: {
                id: "strategy_1"
            }
        })
    )
    socket.send(
        JSON.stringify({
            subscribe: {
                id: "strategy_1",
                list: [
                    {
                        segment: "nsecm", instrument: "TATAMOTORS"
                    },
                    {
                        segment: "index", instrument: "NIFTY BANK"
                    }
                ]
            }
        })
    )
};

socket.onmessage = (event) => {

};
