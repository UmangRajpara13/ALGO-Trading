import { WebSocket } from "ws";
import ExcelJS from "exceljs";

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format

const filePath = `./${today}.xlsx`
let barTime = null

const handleExit = async () => {
    console.log('Ctrl+C pressed. Saving data to Excel...');
    await workbook.xlsx.writeFile(filePath);
    console.log(`Data saved to ${filePath}. Exiting...`);
    process.exit(); // Exit the process
};

process.on('SIGINT', handleExit);

const socket = new WebSocket("ws://localhost:3000");
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Staddler');

// Freeze the first row
worksheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 1 }
];

const nifty_bank_columns = [

    { header: 'Time', key: 'time', width: 15 },
    { header: 'Nifty 50 Spot', key: 'nifty_50_spot', width: 15 },

    { header: 'Future CE', key: 'n_nf_CE', width: 15 },
    { header: 'Future PE', key: 'n_nf_PE', width: 15 },

    { header: '-250 CE', key: 'n_m_250_CE', width: 15 },
    { header: '-250 PE', key: 'n_m_250_PE', width: 15 },
    { header: '-200 CE', key: 'n_m_200_CE', width: 15 },
    { header: '-200 PE', key: 'n_m_200_PE', width: 15 },
    { header: '-150 CE', key: 'n_m_150_CE', width: 15 },
    { header: '-150 PE', key: 'n_m_150_PE', width: 15 },
    { header: '-100 CE', key: 'n_m_100_CE', width: 15 },
    { header: '-100 PE', key: 'n_m_100_PE', width: 15 },
    { header: '-50 CE', key: 'n_m_50_CE', width: 15 },
    { header: '-50 PE', key: 'n_m_50_PE', width: 15 },

    { header: '+50 CE', key: 'n_p_50_CE', width: 15 },
    { header: '+50 PE', key: 'n_p_50_PE', width: 15 },
    { header: '+100 CE', key: 'n_p_100_CE', width: 15 },
    { header: '+100 PE', key: 'n_p_100_PE', width: 15 },
    { header: '+150 CE', key: 'n_p_150_CE', width: 15 },
    { header: '+150 PE', key: 'n_p_150_PE', width: 15 },
    { header: '+200 CE', key: 'n_p_200_CE', width: 15 },
    { header: '+200 PE', key: 'n_p_200_PE', width: 15 },
    { header: '+250 CE', key: 'n_p_250_CE', width: 15 },
    { header: '+250 PE', key: 'n_p_250_PE', width: 15 },
];

worksheet.columns = nifty_bank_columns;

socket.onopen = () => {
    console.log("Connected to server");
    socket.send(
        JSON.stringify({
            clientId: {
                id: "strategy_1"
            }
        })
    )
    socket.send(
        JSON.stringify({
            subscribe: {
                id: "strategy_1",
                list: [
                    {
                        segment: "index", instrument: "NIFTY 50", eventCode: 1505
                    },
                    {
                        segment: "index", instrument: "NIFTY BANK", eventCode: 1505
                    }
                ]
            }
        })
    )
};

// add error messages for instrument not found

let nearest_future = null;
let strikeList = [];
let row = {}
let strike_price;

socket.onmessage = (event) => {

    const data = JSON.parse(event.data);
    const key = Object.keys(data)[0]
    const payload = data[key]

    switch (key) {
        case "marketdata":
            payload.forEach(data => {

                const candleHour = new Date(data.BarTime * 1000).getUTCHours()
                const candleMinute = new Date(data.BarTime * 1000).getUTCMinutes()
                console.log(barTime, ' ', Object.keys(row).length, ')', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ', data.BarTime)

                if (barTime === null) { barTime = data.BarTime }
                if (barTime != data.BarTime || (candleHour === '15' & candleMinute === '29')) {  // bartime change occours or market ends
                    console.log('row added for time', barTime)
                    worksheet.addRow(row)
                    barTime = data.BarTime
                    row = {}
                };

                if (data.MessageCode === 1505 & data.name === "NIFTY 50") {

                    const candleHour = new Date(data.BarTime * 1000).getUTCHours()
                    const candleMinute = new Date(data.BarTime * 1000).getUTCMinutes()

                    row = {
                        nifty_50_spot: data.Close || null,
                        time: `${candleHour}:${candleMinute}`
                    }

                    const types = ['CE', 'PE']; // Array to hold option types
                    console.log('nf', nearest_future)

                    if (nearest_future === null
                        || nearest_future != Math.round(data.Close / 50) * 50) {

                        nearest_future = Math.round(data.Close / 50) * 50

                        console.log('Initializing Future or Future Changed!')

                        // Unsubscribing +5,1,-5 CE/PE contracts
                        if (strikeList.length != 0) {
                            for (let j = 0; j < types.length; j++) {

                                strike_price = 250

                                for (let i = 0; i < 11; i++) {
                                    console.log('unsubscribing')
                                    socket.send(
                                        JSON.stringify({
                                            unsubscribe: {
                                                id: "strategy_1",
                                                list: [
                                                    {
                                                        segment: "nsefo", instrument: `NIFTY24NOV${nearest_future + strike_price}${types[j]}`, eventCode: 1505
                                                    },
                                                ]
                                            }
                                        })
                                    )
                                    strike_price -= 50;
                                }
                            }
                            strikeList = []
                        }

                        // subscribing +5,1,-5 CE/PE contracts
                        for (let j = 0; j < types.length; j++) {

                            strike_price = 250

                            for (let i = 0; i < 11; i++) {
                                strikeList.push(`NIFTY24NOV${nearest_future + strike_price}${types[j]}`)

                                if (strike_price > 0) {
                                    row[`n_p_${strike_price}_${types[j]}`] = nearest_future + strike_price
                                }
                                if (strike_price < 0) {
                                    row[`n_m_${Math.abs(strike_price)}_${types[j]}`] = nearest_future + strike_price
                                }
                                if (strike_price == 0) {
                                    row[`n_nf_${types[j]}`] = nearest_future
                                }

                                socket.send(
                                    JSON.stringify({
                                        subscribe: {
                                            id: "strategy_1",
                                            list: [
                                                {
                                                    segment: "nsefo", instrument: `NIFTY24NOV${nearest_future + strike_price}${types[j]}`, eventCode: 1505
                                                },
                                            ]
                                        }
                                    })
                                )
                                strike_price -= 50;
                            }
                        }
                        // concluding row here since we only need nifty50
                        worksheet.addRow(row).eachCell((cell) => {
                            cell.style.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                            };
                        })
                        row = {}
                    }
                }

                if (data.MessageCode === 1505 & strikeList.includes(data.name)) {
                    const contractPrice = Number(data.name.match(/NOV(\d+)(PE|CE)/)[1])
                    const contractType = data.name.match(/NOV(\d+)(PE|CE)/)[2]
                    // console.log('contractPrice', contractPrice, 'nf', nearest_future)
                    if (nearest_future < contractPrice) {
                        row[`n_p_${contractPrice - nearest_future}_${contractType}`] = data.Close
                    }
                    if (nearest_future > contractPrice) {
                        row[`n_m_${nearest_future - contractPrice}_${contractType}`] = data.Close
                    }
                    if (nearest_future == contractPrice) {
                        row[`n_nf_${contractType}`] = data.Close
                    }
                }
            });
            break;
        case "message":
            console.log(payload)
            break;
        default:
            break;
    }

}

// if (data.MessageCode === 1505 & data.name)
//     if (data.MessageCode === 1505 & data.name === "NIFTY BANK") {
//         const nearest_future = Math.round(data.LastTradedPrice / 50) * 50
//         console.log(data.LastTradedPrice, 'nifty Bank', nearest_future)
//     }

// row = {
//     date: Date.now(),
//     nifty_50_spot: values[15] || null,
//     n_nearest_future: values[18] || null,

//     n_p_250: values[16] || null,
//     n_p_200: values[16] || null,
//     n_p_150: values[16] || null,
//     n_p_100: values[17] || null,
//     n_p_50: values[17] || null,

//     n_m_50: values[19] || null,
//     n_m_100: values[19] || null,
//     n_m_150: values[19] || null,
//     n_m_200: values[19] || null,
//     n_m_250: values[20] || null
// }

// row = {
//     ...row,
//     nifty_bank_spot: values[15] || null,
//     nb_nearest_future: values[18] || null,

//     nb_p_500: values[16] || null,
//     nb_p_400: values[17] || null,
//     nb_p_300: values[17] || null,
//     nb_p_200: values[17] || null,
//     nb_p_100: values[17] || null,

//     nb_m_100: values[19] || null,
//     nb_m_200: values[20] || null,
//     nb_m_300: values[20] || null,
//     nb_m_400: values[20] || null,
//     nb_m_500: values[20] || null
// }

// { header: 'Nifty Bank Spot', key: 'nifty_bank_spot', width: 15 },
// { header: 'nb_nearest_future', key: 'nb_nearest_future', width: 15 },
// { header: 'nb_p_500', key: 'nb_p_500', width: 15 },
// { header: 'nb_p_400', key: 'nb_p_400', width: 15 },
// { header: 'nb_p_300', key: 'nb_p_300', width: 15 },
// { header: 'nb_p_200', key: 'nb_p_200', width: 15 },
// { header: 'nb_p_100', key: 'nb_p_100', width: 15 },
// { header: 'nb_m_100', key: 'nb_m_100', width: 15 },
// { header: 'nb_m_200', key: 'nb_m_200', width: 15 },
// { header: 'nb_m_300', key: 'nb_m_300', width: 15 },
// { header: 'nb_m_400', key: 'nb_m_400', width: 15 },
// { header: 'nb_m_500', key: 'nb_m_500', width: 15 },
