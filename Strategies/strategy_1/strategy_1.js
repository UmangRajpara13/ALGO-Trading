import { WebSocket } from "ws";
import ExcelJS from "exceljs";
import fs from 'fs';
import { finished } from "stream/promises";
import { stringify } from "csv-stringify";

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format

const init_strategy_file_folders = async () => {
    return new Promise((resolve, reject) => {
        fs.mkdir(`./logs`, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating directory: ${err.message}`);
                // reject()
                process.exit(1)
            } else {
                console.log(`Directory './logs' created or already exists.`);
                fs.mkdir(`./logs/${today}`, { recursive: true }, (err) => {
                    if (err) {
                        console.error(`Error creating directory: ${err.message}`);
                        // reject()
                        process.exit(1)
                    } else {
                        console.log(`Directory ./logs/${today} created or already exists.`);
                        resolve()
                    }
                });
            }
        });
    })
}

await init_strategy_file_folders();

const candle_log_stream = fs.createWriteStream(`./logs/${today}/candle.csv`, { flags: 'a', encoding: 'utf8' });
const marketdepth_log_stream = fs.createWriteStream(`./logs/${today}/marketdepth.csv`, { flags: 'a', encoding: 'utf8' });
const code_activity_log_stream = fs.createWriteStream(`./logs/${today}/activity.txt`, { flags: 'a', encoding: 'utf8' });

const nifty_50_excel_file_path = `./${today}_NIFTY_50.xlsx`
const nifty_bank_excel_file_path = `./${today}_NIFTY_BANK.xlsx`

const socket = new WebSocket("ws://localhost:3000");

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Staddler');

const workbook_bank = new ExcelJS.Workbook();
const worksheet_bank = workbook_bank.addWorksheet('Staddler');

// Freeze the first row and first column
worksheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
worksheet_bank.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];


const nifty_columns = [

    { header: 'Time', key: 'time', width: 15 },
    { header: 'Nifty 50 Spot', key: 'nifty_50_spot', width: 15 },

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

    { header: 'Future CE', key: 'n_nf_CE', width: 15 },
    { header: 'Future PE', key: 'n_nf_PE', width: 15 },

    { header: '', key: 'blank', width: 15 },

    // sum of CE & PE
    { header: '-250 CE+PE', key: 'n_m_250_CE_PE', width: 15 },
    { header: '-200 CE+PE', key: 'n_m_200_CE_PE', width: 15 },
    { header: '-150 CE+PE', key: 'n_m_150_CE_PE', width: 15 },
    { header: '-100 CE+PE', key: 'n_m_100_CE_PE', width: 15 },
    { header: '-50 CE+PE', key: 'n_m_50_CE_PE', width: 15 },

    { header: 'ATM', key: 'n_lowest', width: 15 },

    { header: '+50 CE+PE', key: 'n_p_50_CE_PE', width: 15 },
    { header: '+100 CE+PE', key: 'n_p_100_CE_PE', width: 15 },
    { header: '+150 CE+PE', key: 'n_p_150_CE_PE', width: 15 },
    { header: '+200 CE+PE', key: 'n_p_200_CE_PE', width: 15 },
    { header: '+250 CE+PE', key: 'n_p_250_CE_PE', width: 15 },

    { header: 'FUTURE CE+PE', key: 'n_nf_CE_PE', width: 15 },

];

const nifty_bank_columns = [
    { header: 'Time', key: 'time', width: 15 },

    { header: 'NIFTY BANK Spot', key: 'nifty_bank_spot', width: 15 },

    { header: '-500 CE', key: 'nb_m_500_CE', width: 15 },
    { header: '-500 PE', key: 'nb_m_500_PE', width: 15 },
    { header: '-400 CE', key: 'nb_m_400_CE', width: 15 },
    { header: '-400 PE', key: 'nb_m_400_PE', width: 15 },
    { header: '-300 CE', key: 'nb_m_300_CE', width: 15 },
    { header: '-300 PE', key: 'nb_m_300_PE', width: 15 },
    { header: '-200 CE', key: 'nb_m_200_CE', width: 15 },
    { header: '-200 PE', key: 'nb_m_200_PE', width: 15 },
    { header: '-100 CE', key: 'nb_m_100_CE', width: 15 },
    { header: '-100 PE', key: 'nb_m_100_PE', width: 15 },

    { header: '+100 CE', key: 'nb_p_100_CE', width: 15 },
    { header: '+100 PE', key: 'nb_p_100_PE', width: 15 },
    { header: '+200 CE', key: 'nb_p_200_CE', width: 15 },
    { header: '+200 PE', key: 'nb_p_200_PE', width: 15 },
    { header: '+300 CE', key: 'nb_p_300_CE', width: 15 },
    { header: '+300 PE', key: 'nb_p_300_PE', width: 15 },
    { header: '+400 CE', key: 'nb_p_400_CE', width: 15 },
    { header: '+400 PE', key: 'nb_p_400_PE', width: 15 },
    { header: '+500 CE', key: 'nb_p_500_CE', width: 15 },
    { header: '+500 PE', key: 'nb_p_500_PE', width: 15 },

    { header: 'Bank Future CE', key: 'nb_nf_CE', width: 15 },
    { header: 'Bank Future PE', key: 'nb_nf_PE', width: 15 },

    { header: '', key: 'bank_blank', width: 15 },

    // sum of CE & PE
    { header: '-500 CE+PE', key: 'nb_m_500_CE_PE', width: 15 },
    { header: '-400 CE+PE', key: 'nb_m_400_CE_PE', width: 15 },
    { header: '-300 CE+PE', key: 'nb_m_300_CE_PE', width: 15 },
    { header: '-200 CE+PE', key: 'nb_m_200_CE_PE', width: 15 },
    { header: '-100 CE+PE', key: 'nb_m_100_CE_PE', width: 15 },

    { header: 'ATM', key: 'nb_lowest', width: 15 },

    { header: '+100 CE+PE', key: 'nb_p_100_CE_PE', width: 15 },
    { header: '+200 CE+PE', key: 'nb_p_200_CE_PE', width: 15 },
    { header: '+300 CE+PE', key: 'nb_p_300_CE_PE', width: 15 },
    { header: '+400 CE+PE', key: 'nb_p_400_CE_PE', width: 15 },
    { header: '+500 CE+PE', key: 'nb_p_500_CE_PE', width: 15 },

    { header: 'FUTURE CE+PE', key: 'nb_nf_CE_PE', width: 15 },
]

worksheet.columns = nifty_columns
worksheet_bank.columns = nifty_bank_columns

let bigObject = {}
let NB_Big_Object = {}

const handleExit = async () => {
    // console.log(Object.keys(bbigObject))
    return new Promise(async (resolve, reject) => {
        if (Object.entries(bigObject).length > 0) {
            for (const [key, value] of Object.entries(bigObject)) {
                // console.log(value)

                const candleHour = new Date(key * 1000).getUTCHours()
                const candleMinute = new Date(key * 1000).getUTCMinutes()

                if (value.showStrikes) {
                    worksheet.addRow({
                        time: `${candleHour}:${candleMinute}`,

                        nifty_50_spot: value.nifty_50_spot,

                        ...value.strikes,

                        n_m_250_CE_PE: value.strikes.n_m_250_CE,
                        n_m_200_CE_PE: value.strikes.n_m_200_CE,
                        n_m_150_CE_PE: value.strikes.n_m_150_CE,
                        n_m_100_CE_PE: value.strikes.n_m_100_CE,
                        n_m_50_CE_PE: value.strikes.n_m_50_CE,

                        n_lowest: null,

                        n_p_50_CE_PE: value.strikes.n_p_50_CE,
                        n_p_100_CE_PE: value.strikes.n_p_100_CE,
                        n_p_150_CE_PE: value.strikes.n_p_150_CE,
                        n_p_200_CE_PE: value.strikes.n_p_200_CE,
                        n_p_250_CE_PE: value.strikes.n_p_250_CE,

                        n_nf_CE_PE: value.strikes.n_nf_CE,

                    }).eachCell((cell) => {
                        cell.style.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                        };
                    })
                } else {

                    const jodi = [value.row.n_m_250_CE + value.row.n_m_250_PE, value.row.n_m_200_CE + value.row.n_m_200_PE,
                    value.row.n_m_150_CE + value.row.n_m_150_PE, value.row.n_m_100_CE + value.row.n_m_100_PE, value.row.n_m_50_CE + value.row.n_m_50_PE,
                    value.row.n_p_50_CE + value.row.n_p_50_PE, value.row.n_p_100_CE + value.row.n_p_100_PE, value.row.n_p_150_CE + value.row.n_p_150_PE,
                    value.row.n_p_200_CE + value.row.n_p_200_PE, value.row.n_p_250_CE + value.row.n_p_250_PE, value.row.n_nf_CE + value.row.n_nf_PE
                    ]
                    worksheet.addRow({
                        time: `${candleHour}:${candleMinute}`,

                        nifty_50_spot: value.nifty_50_spot,

                        ...value.row,

                        n_m_250_CE_PE: jodi[0],
                        n_m_200_CE_PE: jodi[1],
                        n_m_150_CE_PE: jodi[2],
                        n_m_100_CE_PE: jodi[3],
                        n_m_50_CE_PE: jodi[4],

                        n_lowest: Math.min(...jodi.filter(value => !isNaN(value))),

                        n_p_50_CE_PE: jodi[5],
                        n_p_100_CE_PE: jodi[6],
                        n_p_150_CE_PE: jodi[7],
                        n_p_200_CE_PE: jodi[8],
                        n_p_250_CE_PE: jodi[9],

                        n_nf_CE_PE: jodi[10],
                    })
                }
            }
            await workbook.xlsx.writeFile(nifty_50_excel_file_path);
        }
        if (Object.entries(NB_Big_Object).length > 0) {
            for (const [key, value] of Object.entries(NB_Big_Object)) {
                // console.log(value)

                const candleHour = new Date(key * 1000).getUTCHours()
                const candleMinute = new Date(key * 1000).getUTCMinutes()

                if (value.strikes) {
                    worksheet_bank.addRow({
                        time: `${candleHour}:${candleMinute}`,

                        nifty_bank_spot: value.nifty_bank_spot,

                        ...value.strikes,

                        nb_m_500_CE_PE: value.strikes.nb_m_500_CE,
                        nb_m_400_CE_PE: value.strikes.nb_m_400_CE,
                        nb_m_300_CE_PE: value.strikes.nb_m_300_CE,
                        nb_m_200_CE_PE: value.strikes.nb_m_200_CE,
                        nb_m_100_CE_PE: value.strikes.nb_m_100_CE,

                        nb_lowest: null,

                        nb_p_100_CE_PE: value.strikes.nb_p_100_CE,
                        nb_p_200_CE_PE: value.strikes.nb_p_200_CE,
                        nb_p_300_CE_PE: value.strikes.nb_p_300_CE,
                        nb_p_400_CE_PE: value.strikes.nb_p_400_CE,
                        nb_p_500_CE_PE: value.strikes.nb_p_500_CE,

                        nb_nf_CE_PE: value.strikes.nb_nf_CE,

                    }).eachCell((cell) => {
                        cell.style.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                        };
                    })
                } else {
                    const jodi = [value.row.nb_m_500_CE + value.row.nb_m_500_PE, value.row.nb_m_400_CE + value.row.nb_m_400_PE,
                    value.row.nb_m_300_CE + value.row.nb_m_300_PE, value.row.nb_m_200_CE + value.row.nb_m_200_PE, value.row.nb_m_100_CE + value.row.nb_m_100_PE,
                    value.row.nb_p_100_CE + value.row.nb_p_100_PE, value.row.nb_p_200_CE + value.row.nb_p_200_PE, value.row.nb_p_300_CE + value.row.nb_p_300_PE,
                    value.row.nb_p_400_CE + value.row.nb_p_400_PE, value.row.nb_p_500_CE + value.row.nb_p_500_PE, value.row.nb_nf_CE + value.row.nb_nf_PE
                    ]

                    worksheet_bank.addRow({
                        time: `${candleHour}:${candleMinute}`,

                        nifty_bank_spot: value.nifty_bank_spot,

                        ...value.row,

                        nb_m_500_CE_PE: jodi[0],
                        nb_m_400_CE_PE: jodi[1],
                        nb_m_300_CE_PE: jodi[2],
                        nb_m_200_CE_PE: jodi[3],
                        nb_m_100_CE_PE: jodi[4],

                        nb_lowest: Math.min(...jodi.filter(value => !isNaN(value))),

                        nb_p_100_CE_PE: jodi[5],
                        nb_p_200_CE_PE: jodi[6],
                        nb_p_300_CE_PE: jodi[7],
                        nb_p_400_CE_PE: jodi[8],
                        nb_p_500_CE_PE: jodi[9],

                        nb_nf_CE_PE: jodi[10],
                    })
                }

            }
            await workbook_bank.xlsx.writeFile(nifty_bank_excel_file_path);
        }
        console.log(`Data saved to ${nifty_50_excel_file_path} & ${nifty_bank_excel_file_path}. Exiting...`);
        // Close the writable stream when done
        candle_log_stream.end((err) => {
            if (err) {
                console.error(`Error closing log stream: ${err}`);
            } else {
                console.log('candle_log_stream closed.');
            }
        });
        // Close the writable stream when done
        marketdepth_log_stream.end((err) => {
            if (err) {
                console.error(`Error closing log stream: ${err}`);
            } else {
                console.log('marketdepth_log_stream closed.');
            }
        });
        // Close the writable stream when done
        code_activity_log_stream.end((err) => {
            if (err) {
                console.error(`Error closing log stream: ${err}`);
            } else {
                console.log('code_activity_log_stream closed.');
            }
        });
        // Wait for all writable streams to finish
        await Promise.all([
            finished(candle_log_stream),
            finished(marketdepth_log_stream),
            finished(code_activity_log_stream)
        ]);
        resolve();
    })

};

process.on('SIGINT', async () => {
    console.log('Ctrl+C pressed. Saving data to Excel...');
    await handleExit();
    process.exit(0); // Exit the process
});

process.on('uncaughtException', async (error) => {
    // console.log(Object.keys(bigObject))
    console.error('Unhandled Exception:', error);
    await handleExit();
    process.exit(1); // Exiting is often recommended after an uncaught exception
});

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
    );
    socket.send(
        JSON.stringify({
            subscribe: {
                id: "strategy_1",
                list: [
                    {
                        segment: "index", instrument: "NIFTY 50", eventCode: 1502
                    },
                    {
                        segment: "index", instrument: "NIFTY BANK", eventCode: 1502
                    }
                ]
            }
        })
    )
};

// add error messages for instrument not found

let nearest_future = null;
let nearest_future_bank = null;
let nifty_50_strike_list = [];
let nifty_bank_strike_list = [];
let nifty_50_strike_price;
let nifty_bank_strike_price;


// Create a stringifier with headers
const candle_stringifier = stringify({ header: true });
const marketdata_stringifier = stringify({ header: true });

// Pipe the stringifier to the writable stream
candle_stringifier.pipe(candle_log_stream);
marketdata_stringifier.pipe(marketdepth_log_stream);


socket.onmessage = (event) => {

    const data = JSON.parse(event.data);
    const key = Object.keys(data)[0]
    const payload = data[key]

    switch (key) {
        case "marketdata":

            payload.forEach(data => {

                // console.log(data)
                if (data.MessageCode === 1505) candle_stringifier.write(data);

                if (data.MessageCode === 1502) marketdata_stringifier.write(data);

                const candleHour = new Date(data.BarTime * 1000).getUTCHours()
                const candleMinute = new Date(data.BarTime * 1000).getUTCMinutes()

                if (data.MessageCode === 1505 & data.name === "NIFTY 50") {
                    console.log(data.BarTime, ' ', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ')

                    bigObject = {
                        ...bigObject,
                        [data.BarTime]: {
                            ...bigObject[data.BarTime],
                            [`nifty_50_spot`]: data.Close
                        }
                    }

                    const types = ['CE', 'PE']; // Array to hold option types
                    // console.log('nf', nearest_future)

                    if (nearest_future === null
                        || nearest_future != Math.round(data.Close / 50) * 50) {

                        nearest_future = Math.round(data.Close / 50) * 50

                        console.log('NIFTY 50:Initializing Future or Future Changed! ', `nf:${nearest_future}`)

                        bigObject = {
                            ...bigObject,
                            [data.BarTime]: {
                                ...bigObject[data.BarTime],
                                strikes: {},
                                showStrikes: true
                            }
                        }

                        // Unsubscribing +5,1,-5 CE/PE contracts
                        if (nifty_50_strike_list.length != 0) {

                            for (let j = 0; j < types.length; j++) {

                                nifty_50_strike_price = 250

                                for (let i = 0; i < 11; i++) {
                                    // console.log('unsubscribing')
                                    socket.send(
                                        JSON.stringify({
                                            unsubscribe: {
                                                id: "strategy_1",
                                                list: [
                                                    {
                                                        segment: "nsefo", instrument: `NIFTY24NOV${nearest_future + nifty_50_strike_price}${types[j]}`, eventCode: 1505
                                                    },
                                                ]
                                            }
                                        })
                                    )
                                    nifty_50_strike_price -= 50;
                                }
                            }
                            nifty_50_strike_list = []
                        }

                        // subscribing +5,1,-5 CE/PE contracts
                        for (let j = 0; j < types.length; j++) {

                            nifty_50_strike_price = 250

                            for (let i = 0; i < 11; i++) {
                                nifty_50_strike_list.push(`NIFTY24NOV${nearest_future + nifty_50_strike_price}${types[j]}`)

                                if (nifty_50_strike_price > 0) {
                                    bigObject[data.BarTime].strikes = {
                                        ...bigObject[data.BarTime]?.strikes,
                                        [`n_p_${nifty_50_strike_price}_${types[j]}`]: nearest_future + nifty_50_strike_price
                                    }
                                }
                                if (nifty_50_strike_price < 0) {
                                    bigObject[data.BarTime].strikes = {
                                        ...bigObject[data.BarTime]?.strikes,
                                        [`n_m_${Math.abs(nifty_50_strike_price)}_${types[j]}`]: nearest_future + nifty_50_strike_price
                                    }
                                }
                                if (nifty_50_strike_price == 0) {
                                    bigObject[data.BarTime].strikes = {
                                        ...bigObject[data.BarTime]?.strikes,
                                        [`n_nf_${types[j]}`]: nearest_future + nifty_50_strike_price
                                    }
                                }

                                socket.send(
                                    JSON.stringify({
                                        subscribe: {
                                            id: "strategy_1",
                                            list: [
                                                {
                                                    segment: "nsefo", instrument: `NIFTY24NOV${nearest_future + nifty_50_strike_price}${types[j]}`, eventCode: 1505
                                                },
                                            ]
                                        }
                                    })
                                )
                                nifty_50_strike_price -= 50;
                            }
                        }
                    }
                }

                if (data.MessageCode === 1505 & nifty_50_strike_list.includes(data.name)) {

                    console.log(data.BarTime, ' ', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ')

                    const contractPrice = Number(data.name.match(/NOV(\d+)(PE|CE)/)[1])
                    const contractType = data.name.match(/NOV(\d+)(PE|CE)/)[2]
                    // console.log('contractPrice', contractPrice, 'nf', nearest_future)

                    if (!bigObject[data.BarTime]) {
                        bigObject[data.BarTime] = { row: {} }; // Initialize if undefined
                    }

                    if (nearest_future < contractPrice) {

                        bigObject[data.BarTime].row = {
                            ...bigObject[data.BarTime].row,
                            [`n_p_${contractPrice - nearest_future}_${contractType}`]: data.Close
                        }
                    }
                    if (nearest_future > contractPrice) {
                        bigObject[data.BarTime].row = {
                            ...bigObject[data.BarTime].row,
                            [`n_m_${nearest_future - contractPrice}_${contractType}`]: data.Close
                        }
                    }
                    if (nearest_future == contractPrice) {
                        bigObject[data.BarTime].row = {
                            ...bigObject[data.BarTime].row,
                            [`n_nf_${contractType}`]: data.Close
                        }
                    }
                }

                if (data.MessageCode === 1505 & data.name === "NIFTY BANK") {

                    console.log(data.BarTime, ' ', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ')

                    // const candleHour = new Date(data.BarTime * 1000).getUTCHours()
                    // const candleMinute = new Date(data.BarTime * 1000).getUTCMinutes()

                    // console.log(data.BarTime, ' ', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ')

                    NB_Big_Object = {
                        ...NB_Big_Object,
                        [data.BarTime]: {
                            ...NB_Big_Object[data.BarTime],
                            [`nifty_bank_spot`]: data.Close
                        }
                    }

                    const types = ['CE', 'PE']; // Array to hold option types
                    // console.log('nf', nearest_future)

                    if (nearest_future_bank === null
                        || nearest_future_bank != Math.round(data.Close / 100) * 100) {

                        nearest_future_bank = Math.round(data.Close / 100) * 100

                        console.log('NIFTY BANK :Initializing Future or Future Changed! ', `nf_bank:${nearest_future_bank}`)

                        NB_Big_Object = {
                            ...NB_Big_Object,
                            [data.BarTime]: {
                                ...NB_Big_Object[data.BarTime],
                                strikes: {},
                                showStrikes: true
                            }
                        }

                        // Unsubscribing +5,1,-5 CE/PE contracts
                        if (nifty_bank_strike_list.length != 0) {
                            for (let j = 0; j < types.length; j++) {

                                nifty_bank_strike_price = 500

                                for (let i = 0; i < 11; i++) {
                                    // console.log('unsubscribing')
                                    socket.send(
                                        JSON.stringify({
                                            unsubscribe: {
                                                id: "strategy_1",
                                                list: [
                                                    {
                                                        segment: "nsefo", instrument: `BANKNIFTY24NOV${nearest_future_bank + nifty_bank_strike_price}${types[j]}`, eventCode: 1505
                                                    },
                                                ]
                                            }
                                        })
                                    )
                                    nifty_bank_strike_price -= 100;
                                }
                            }
                            nifty_bank_strike_list = []
                        }

                        // subscribing +5,1,-5 CE/PE contracts
                        for (let j = 0; j < types.length; j++) {

                            nifty_bank_strike_price = 500

                            for (let i = 0; i < 11; i++) {
                                nifty_bank_strike_list.push(`BANKNIFTY24NOV${nearest_future_bank + nifty_bank_strike_price}${types[j]}`)
                                if (nifty_bank_strike_price > 0) {
                                    NB_Big_Object[data.BarTime].strikes = {
                                        ...NB_Big_Object[data.BarTime]?.strikes,
                                        [`nb_p_${nifty_bank_strike_price}_${types[j]}`]: nearest_future_bank + nifty_bank_strike_price
                                    }
                                }
                                if (nifty_bank_strike_price < 0) {
                                    NB_Big_Object[data.BarTime].strikes = {
                                        ...NB_Big_Object[data.BarTime]?.strikes,
                                        [`nb_m_${Math.abs(nifty_bank_strike_price)}_${types[j]}`]: nearest_future_bank + nifty_bank_strike_price
                                    }
                                }
                                if (nifty_bank_strike_price == 0) {
                                    NB_Big_Object[data.BarTime].strikes = {
                                        ...NB_Big_Object[data.BarTime]?.strikes,
                                        [`nb_nf_${types[j]}`]: nearest_future_bank + nifty_bank_strike_price
                                    }
                                }
                                // console.log(`subscribing   BANKNIFTY24NOV${nearest_future_bank + nifty_bank_strike_price}${types[j]}`)

                                socket.send(
                                    JSON.stringify({
                                        subscribe: {
                                            id: "strategy_1",
                                            list: [
                                                {
                                                    segment: "nsefo", instrument: `BANKNIFTY24NOV${nearest_future_bank + nifty_bank_strike_price}${types[j]}`, eventCode: 1505
                                                },
                                            ]
                                        }
                                    })
                                )
                                nifty_bank_strike_price -= 100;
                            }
                        }
                    }
                }

                if (data.MessageCode === 1505 & nifty_bank_strike_list.includes(data.name)) {
                    console.log(data.BarTime, ' ', `${candleHour}:${candleMinute}`, ' ', data.name, '  ', data.Close, ' ')

                    const contractPrice = Number(data.name.match(/NOV(\d+)(PE|CE)/)[1])
                    const contractType = data.name.match(/NOV(\d+)(PE|CE)/)[2]
                    // console.log('contractPrice', contractPrice, 'nf', nearest_future_bank)
                    if (!NB_Big_Object[data.BarTime]) {
                        NB_Big_Object[data.BarTime] = { row: {} }; // Initialize if undefined
                    }
                    if (nearest_future_bank < contractPrice) {

                        NB_Big_Object[data.BarTime].row = {
                            ...NB_Big_Object[data.BarTime].row,
                            [`nb_p_${contractPrice - nearest_future_bank}_${contractType}`]: data.Close
                        }
                    }
                    if (nearest_future_bank > contractPrice) {
                        NB_Big_Object[data.BarTime].row = {
                            ...NB_Big_Object[data.BarTime].row,
                            [`nb_m_${nearest_future_bank - contractPrice}_${contractType}`]: data.Close
                        }
                    }
                    if (nearest_future_bank == contractPrice) {
                        NB_Big_Object[data.BarTime].row = {
                            ...NB_Big_Object[data.BarTime].row,
                            [`nb_nf_${contractType}`]: data.Close
                        }
                    }
                }

                if (data.MessageCode === 1502) {
                    // console.log('BIDS',data.Bids,'ASKS', data.Asks)
                }
            });
            break;
        case "message":
            console.log(payload?.operation, payload?.name, payload?.type, payload?.eventCode)
            break;
        default:
            break;
    }
}
