import request from "request";
import socketIoClient from "socket.io-client";


// var data = {
//     // "userID": userID,
//     "secretKey": secretKey,
//     "appKey": publicKey,
//     "source": "WebAPI"
// };

// request.post({
//     url: baseURL + "/auth/login",
//     json: true,
//     headers: {
//         'Content-Type': 'application/json',
//         'Content-Length': data.length
//     },
//     body: data
// }, function (err, res, body) {
//     console.log(res)
//     if (body.type == "success") {
//         if (body.result.token) {
//             var token = body.result.token;
            
//         } else {
//             console.log(body.description);
//         }
//     }
// })
// ExchangeSegment|ExchangeInstrumentID|InstrumentType|Name|Description|Series| NameWithSeries|InstrumentID|PriceBand.High|PriceBand.Low| FreezeQty|TickSize|LotSize|Multiplier
// NSECM|1594|8|INFY|INFY-EQ|EQ|INFY-EQ|1100100001594|2049.65|1677.05|49825|0.05|1|1|INFY|INE009A01021|1|1|INFOSYS LIMITED-EQ|0|-1|-1


let baseURL = "https://mtrade.arhamshare.com";

import { configDotenv } from "dotenv";
configDotenv()


var socket = socketIoClient(baseURL, {
    path: '/apimarketdata/socket.io',
    query: {
        token: process.env.token,
        userID: process.env.userID,
        publishFormat: "JSON",
        broadcastMode: "Full"
    }
});
socket.on('connect', function () { console.log('connection established!!!') });

socket.on("1501-json-full", function (data) {
    console.log("data is " + data);
});
socket.on("1502-json-full", function (data) {
    console.log("data is " + data);
});
socket.on("1505-json-full", function (data) {
    console.log("data is " + data);
});
socket.on("1507-json-full", function (data) {
    console.log("data is " + data);
});
socket.on("1512-json-full", function (data) {
    console.log("LTP event " + data);
});
