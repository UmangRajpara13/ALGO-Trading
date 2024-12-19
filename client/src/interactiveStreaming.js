import socketIoClient from "socket.io-client"

const apiUrl = 'https://mtrade.arhamshare.com';


export function interactiveStreaming(token, userID) {
    console.log('con')
    const socket = socketIoClient(apiUrl, {
        path: "/interactive/socket.io",
        reconnectionDelayMax: 10000,
        reconnection: true,
        query: {
            token: token,
            userID: userID,
            transports: ["websocket"],
            apiType: 'INTERACTIVE',
            EIO: 3
        },
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