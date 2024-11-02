import axios from 'axios';
import { configDotenv } from "dotenv";
configDotenv()

let Instruments = [
    // { exchangeSegment: 1, exchangeInstrumentID: 3456 },
    { exchangeSegment: 1, exchangeInstrumentID: 26000 }
];

const apiUrl = 'https://mtrade.arhamshare.com/';
let eventCode = 1512;

const token = process.env.token;
const userId = process.env.userID;

// Subscribe to Instruments
const subResponse = await axios.post(`${apiUrl}/apimarketdata/instruments/subscription`, {
    instruments: Instruments,
    xtsMessageCode: eventCode,
}, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token
    }
});

console.log('Subscription Response:', subResponse.data);