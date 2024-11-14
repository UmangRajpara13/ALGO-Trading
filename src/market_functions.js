import axios from 'axios';
import { configDotenv } from "dotenv";
configDotenv()


const apiUrl = 'https://mtrade.arhamshare.com/';
let eventCode = 1512;
const token = process.env.token;

export async function Subscribe(list) {
    // Subscribe to Instruments

    return new Promise((resolve, reject) => {
        axios.post(`${apiUrl}/apimarketdata/instruments/subscription`, {
            instruments: list,
            xtsMessageCode: eventCode,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        }).then(response => {
            console.log('axios res', response.data)

            resolve({ data: response.data }); // Resolve with data

        }).catch(error => {
            console.log('axios error', error)
            reject({ error: error }); // Resolve with data

        });
    })

}

export async function UnSubscribe(list) {
    // Subscribe to Instruments
    const subResponse = await axios.put(`${apiUrl}/apimarketdata/instruments/subscription`, {
        instruments: list,
        xtsMessageCode: eventCode,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    console.log('UnSubscription Response:', subResponse.data);
}