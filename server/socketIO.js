// import { io } from "socket.io-client";
// import { configDotenv } from "dotenv";
// configDotenv()


// const socket = io("https://mtrade.arhamshare.com/", {
//     reconnectionDelayMax: 1000,
//     query: {
//         token: process.env.token,
//         userID: process.env.userID,
//         publishFormat: "JSON",
//         broadcastMode: "Full"
//     }
// });

// socket.io.on("error", (error) => {
//     // ...
//     console.log('error')
// });
// socket.io.on("ping", () => {
//     // ...
//     console.log('pinging')
// });
// socket.io.on("reconnect_attempt", (attempt) => {
//     // ...
//     console.log('recon attempt')
// });
// socket.io.on("reconnect_error", (error) => {
//     // ...
//     console.log('reconn error')
// });
// socket.on('connect', function () { console.log('connection established!!!') });

// socket.io.on("1501-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1502-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1505-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1507-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1512-json-full", function (data) {
//     console.log("LTP event " + data);
// });

// ----------------


// Import the Socket.IO client
// import io from 'socket.io-client';
// import { configDotenv } from "dotenv";
// configDotenv()


// // Connect to the Socket.IO server
// const socket = io('https://mtrade.arhamshare.com/',{
//     token: process.env.token,
//     userID: process.env.userID,
//     publishFormat: "JSON",
//     broadcastMode: "Full"
// }); // Change the URL as needed

// // Listen for the 'connect' event
// socket.on('connect', () => {
//     console.log('Connected to the server');
// });

// // Listen for a custom event from the server
// socket.on('message', (data) => {
//     console.log('Message from server:', data);
// });

// // Emit a message to the server
// const sendMessage = (msg) => {
//     socket.emit('message', msg);
// };

// socket.io.on("1501-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1502-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1505-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1507-json-full", function (data) {
//     console.log("data is " + data);
// });
// socket.io.on("1512-json-full", function (data) {
//     console.log("LTP event " + data);
// });

// // Optionally listen for disconnection
// socket.on('disconnect', () => {
//     console.log('Disconnected from the server');
// });