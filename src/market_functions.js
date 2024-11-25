import axios from 'axios';

const apiUrl = 'https://mtrade.arhamshare.com/';

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
            // console.log('axios res', response.data)
            if (response.data.type === 'success')
                resolve({ ...subObj, type: 'success' }); // Resolve with data
        }).catch(error => {
            // console.log('axios error', error)
            reject({ error: error, ...subObj, type: 'failed' }); // Resolve with data
        });
    })

}


export async function UnSubscribe(unsubObj) {
    // Subscribe to Instruments
    return new Promise(async (resolve, reject) => {
        await axios.put(`${apiUrl}/apimarketdata/instruments/subscription`, {
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
            // console.log('axios unsub res', response.data)
            if (response.data.type === 'success')
                resolve({ ...unsubObj, type: 'success' }); // Resolve with data
        }).catch(error => {
            // console.log('axios error', error)
            reject({ error: error, ...unsubObj, type: 'failed' }); // Resolve with data

        });
    })

}