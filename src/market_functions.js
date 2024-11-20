import axios from 'axios';
import { configDotenv } from "dotenv";

const apiUrl = 'https://mtrade.arhamshare.com/';
const token = process.env.token;

export async function Subscribe(subObj) {
    // Subscribe to Instruments

    return new Promise((resolve, reject) => {
        axios.post(`${apiUrl}/apimarketdata/instruments/subscription`, {
            instruments: [{
                exchangeSegment: subObj.exchangeSegment,
                exchangeInstrumentID: subObj.exchangeInstrumentID
            }],
            xtsMessageCode: subObj.eventCode,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.token
            }
        }).then(response => {
            console.log('axios res', response.data)
            if (response.data.type === 'success')
                resolve(subObj); // Resolve with data

        }).catch(error => {
            console.log('axios error', error)
            reject({ error: error }); // Resolve with data
        });
    })

}

export async function UnSubscribe(unsubObj) {
    // Subscribe to Instruments
    return new Promise(async (resolve, reject) => {
        const subResponse = await axios.put(`${apiUrl}/apimarketdata/instruments/subscription`, {
            instruments: [{
                exchangeSegment: unsubObj.exchangeSegment,
                exchangeInstrumentID: unsubObj.exchangeInstrumentID
            }],
            xtsMessageCode: unsubObj.eventCode,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.token
            }
        }).then(response => {
            console.log('axios unsub res', response.data)
            if (response.data.type === 'success')
                resolve(unsubObj); // Resolve with data
        }).catch(error => {
            console.log('axios error', error)
            reject({ error: error }); // Resolve with data

        });
    })

}