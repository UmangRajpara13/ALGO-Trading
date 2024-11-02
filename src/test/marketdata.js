import axios from 'axios';
import socketIoClient from "socket.io-client"
import { configDotenv } from "dotenv";
configDotenv()

const apiUrl = 'https://mtrade.arhamshare.com/';

const loginRequest = {
    secretKey: '',
    appKey: '',
    source: "WebAPI"
};

let publishFormat = 'JSON';
let broadcastMode = 'Full';
let eventCode = 1512;
let Instruments = [
    { exchangeSegment: 1, exchangeInstrumentID: 3456 },
    { exchangeSegment: 1, exchangeInstrumentID: 26000 }
];
let token = '';
let userId = '';
let disconnectTimeout = 600000; // Time in milliseconds (e.g., 60000ms = 60 seconds)

// Function to initialize the WebSocket connection
const initializeWebSocket = (token, userId) => {
    const wsUrl = apiUrl;

    const socket = socketIoClient(wsUrl, {
        path: "/apimarketdata/socket.io",
        reconnectionDelayMax: 10000,
        reconnection: true,
        query: {
            token: token,
            userID: userId,
            publishFormat: publishFormat,
            broadcastMode: broadcastMode,
            transports: ["websocket"],
            EIO: 3,
        }
    });

    console.log("Socket-->", socket);


    socket.on('connect', () => {
        console.log('WebSocket Connected', Date.now());

        // Schedule socket disconnect after the specified timeout
        setTimeout(() => {
            console.log('Disconnecting WebSocket after timeout...');
            socket.disconnect();
        }, disconnectTimeout);
    });

    socket.on('message', (data) => {
        console.log('Message received:', data);
    });

    socket.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });

    socket.on('joined', (data) => {
        console.log('Joined event:', data);
    });

    socket.on(`${eventCode}-json-full`, (data) => {
        console.log('MarketDepth:', JSON.parse(data));
    });

    socket.on(`${eventCode}-json-partial`, (data) => {
        console.log('MarketDepth partial:', data);
    });

    socket.on('disconnect', () => {
        console.log('WebSocket Disconnected', Date.now());
    });

    return socket;
};

const main = async () => {
    try {
        // Login request
        // const logInResponse = await axios.post(`${apiUrl}/apimarketdata/auth/login`, loginRequest, {
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });

        // console.log('Login Response:', logInResponse.data);
        // token = logInResponse.data.result.token;
        // userId = logInResponse.data.result.userID;

        token = process.env.token;
        userId = process.env.userID;

        // Subscribe to Instruments
        // const subResponse = await axios.post(`${apiUrl}/apimarketdata/instruments/subscription`, {
        //     instruments: Instruments,
        //     xtsMessageCode: eventCode,
        // }, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': token
        //     }
        // });

        // console.log('Subscription Response:', subResponse.data);

        const socket = initializeWebSocket(token, userId);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

main();
