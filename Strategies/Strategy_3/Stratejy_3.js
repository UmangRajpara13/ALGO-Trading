import { WebSocket } from "ws";


const socket = new WebSocket("ws://localhost:3000");


socket.onopen = () => {
    socket.send(
        JSON.stringify({
            type: 'placeOrder',
            segment: "nsecm",
            name: "RELIANCE"
        })
    )
}