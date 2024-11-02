import { WebSocket } from "ws";


const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
    console.log("Connected to the server");
};

socket.onmessage = (event) => {
    const messageElem = document.createElement('div');
    messageElem.textContent = event.data;
    document.getElementById('messages').prepend(messageElem);
};