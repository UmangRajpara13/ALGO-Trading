import { WebSocket } from "ws";
import ExcelJS from "exceljs";
import fs from 'fs';
import { finished } from "stream/promises";
import { stringify } from "csv-stringify";
import { Mutex } from "async-mutex";
import path from "path";

const mutex = new Mutex();

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format
const now = new Date();

const year = now.getFullYear();
const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const month = shortMonthNames[now.getMonth()]; // Get the short month name
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const date = `${year}-${month}-${day}`

const init_strategy_file_folders = async () => {
    try {
        // Create logs directory synchronously
        fs.mkdirSync('./logs', { recursive: true });
        console.log(`Directory './logs' created or already exists.`);

        // Create today's directory inside logs synchronously
        fs.mkdirSync(path.join('./logs', date), { recursive: true });

        console.log(`Directory './logs/${date}' created or already exists.`);
    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        process.exit(1); // Exit the process on error
    }
}

init_strategy_file_folders();

const ltp_log_stream = fs.createWriteStream(`./logs/${today}/ltp.csv`, { flags: 'a', encoding: 'utf8' });
const marketdepth_log_stream = fs.createWriteStream(`./logs/${today}/marketdepth.csv`, { flags: 'a', encoding: 'utf8' });
const code_activity_log_stream = fs.createWriteStream(`./logs/${today}/activity.txt`, { flags: 'a', encoding: 'utf8' });

const nifty_50_excel_file_path = `./${date}_${hours}:${minutes}:${seconds}_NIFTY_50.xlsx`
const nifty_bank_excel_file_path = `./${date}_${hours}:${minutes}:${seconds}_NIFTY_BANK.xlsx`

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

let bigObject = {
    strikes: {},
    row: {},
    nifty_50_spot: null,
    time: null
}
let NB_Big_Object = {
    strikes: {},
    row: {},
    nifty_bank_spot: null,
    time: null

}

let last_nf,
    latest_nf = null;

let last_nf_bank,
    latest_nf_bank = null;

let nearest_future = null;
let nearest_future_bank = null;

let nifty_50_strike_price;
let nifty_bank_strike_price;

const types = ['CE', 'PE']; // Array to hold option types

// Create a stringifier with headers
const ltp_stringifier = stringify({ header: true });
const marketdata_stringifier = stringify({ header: true });

// Pipe the stringifier to the writable stream
ltp_stringifier.pipe(ltp_log_stream);
marketdata_stringifier.pipe(marketdepth_log_stream);

let nifty_50_subscribe_this = []
let nifty_50_unsubscribe_this = []
let nifty_50_subscribed_list = []
let nifty_50_strikes = []
let nifty_50_nf_first_change = false

let nifty_bank_subscribe_this = []
let nifty_bank_unsubscribe_this = []
let nifty_bank_subscribed_list = []
let nifty_bank_strikes = []
let nifty_bank_nf_first_change = false

function Calculate_Strikes_For_Nifty_50() {
    // calculate strikes
    console.log('calculating strikes for nifty 50...')
    nifty_50_strikes = []
    nifty_50_subscribe_this = [] // empty subscribe list as nf changed or initialized.

    for (let j = 0; j < types.length; j++) {

        nifty_50_strike_price = 250

        for (let i = 0; i < 11; i++) {

            nifty_50_strikes.push(`NIFTY24DEC${last_nf + nifty_50_strike_price}${types[j]}`)

            if (nifty_50_strike_price > 0) {
                bigObject.strikes = {
                    ...bigObject.strikes,
                    [`n_p_${nifty_50_strike_price}_${types[j]}`]: last_nf + nifty_50_strike_price
                }
            }
            if (nifty_50_strike_price < 0) {
                bigObject.strikes = {
                    ...bigObject.strikes,
                    [`n_m_${Math.abs(nifty_50_strike_price)}_${types[j]}`]: last_nf + nifty_50_strike_price
                }
            }
            if (nifty_50_strike_price == 0) {
                bigObject.strikes = {
                    ...bigObject.strikes,
                    [`n_nf_${types[j]}`]: last_nf + nifty_50_strike_price
                }
            }
            nifty_50_strike_price -= 50;
        }
    }
    console.log('nifty_50_strikes', nifty_50_strikes)

}

function Manage_Subscriptions_For_Nifty_50() {
    if (nifty_50_subscribed_list.length > 0) {

        // Find elements in nifty_50_strikes that are not in nifty_50_subscribed_list
        nifty_50_subscribe_this = nifty_50_strikes.filter(item => !nifty_50_subscribed_list.includes(item));
        console.log('subscribe_this', nifty_50_subscribe_this); // Output: [4]

        // Find elements in nifty_50_subscribed_list that are not in nifty_50_strikes
        nifty_50_unsubscribe_this.push(...nifty_50_subscribed_list.filter(item => !nifty_50_strikes.includes(item)));
        console.log('unsubscribe_this', nifty_50_unsubscribe_this);

        // Find elements in nifty_50_unsubscribe_this that are not in nifty_50_subscribe_this
        nifty_50_unsubscribe_this = nifty_50_unsubscribe_this.filter(item => !nifty_50_subscribe_this.includes(item));
        console.log('unsubscribe_this_decluttered', nifty_50_unsubscribe_this);

        nifty_50_unsubscribe_this.forEach(item => {
            socket.send(
                JSON.stringify({
                    unsubscribe: {
                        id: "strategy_2",
                        list: [
                            {
                                segment: "nsefo", instrument: item, eventCode: 1512
                            },
                        ]
                    }
                })
            )
        })
    }
    if (nifty_50_subscribed_list.length == 0) {
        console.log('subscribing first strikes nifty 50')

        nifty_50_subscribe_this = nifty_50_strikes
        nifty_50_subscribe_this.forEach(item => {
            socket.send(
                JSON.stringify({
                    subscribe: {
                        id: "strategy_2",
                        list: [
                            {
                                segment: "nsefo", instrument: item, eventCode: 1512
                            },
                        ]
                    }
                })
            )
        })
    }
}

function Calculate_Strikes_For_Nifty_Bank() {
    // calculate strikes
    nifty_bank_strikes = []
    nifty_bank_subscribe_this = [] // empty subscribe list as nf changed.

    for (let j = 0; j < types.length; j++) {

        nifty_bank_strike_price = 500

        for (let i = 0; i < 11; i++) {
            nifty_bank_strikes.push(`BANKNIFTY24DEC${last_nf_bank + nifty_bank_strike_price}${types[j]}`)

            if (nifty_bank_strike_price > 0) {
                NB_Big_Object.strikes = {
                    ...NB_Big_Object.strikes,
                    [`nb_p_${nifty_bank_strike_price}_${types[j]}`]: last_nf_bank + nifty_bank_strike_price
                }
            }
            if (nifty_bank_strike_price < 0) {
                NB_Big_Object.strikes = {
                    ...NB_Big_Object.strikes,
                    [`nb_m_${Math.abs(nifty_bank_strike_price)}_${types[j]}`]: last_nf_bank + nifty_bank_strike_price
                }
            }
            if (nifty_bank_strike_price == 0) {
                NB_Big_Object.strikes = {
                    ...NB_Big_Object.strikes,
                    [`nb_nf_${types[j]}`]: last_nf_bank + nifty_bank_strike_price
                }
            }
            nifty_bank_strike_price -= 100;
        }
    }
    console.log('nifty_bank_strikes', nifty_bank_strikes)

}

function Manage_Subscriptions_For_Nifty_Bank() {

    if (nifty_bank_subscribed_list.length > 0) {

        // Find elements in nifty_bank_strikes that are not in nifty_bank_subscribed_list
        nifty_bank_subscribe_this = nifty_bank_strikes.filter(item => !nifty_bank_subscribed_list.includes(item));
        console.log('subscribe_this', nifty_bank_subscribe_this); // Output: [4]

        // Find elements in nifty_bank_subscribed_list that are not in nifty_bank_strikes
        nifty_bank_unsubscribe_this.push(...nifty_bank_subscribed_list.filter(item => !nifty_bank_strikes.includes(item)));
        console.log('unsubscribe_this', nifty_bank_unsubscribe_this);

        // Find elements in nifty_bank_unsubscribe_this that are not in nifty_bank_subscribe_this
        nifty_bank_unsubscribe_this = nifty_bank_unsubscribe_this.filter(item => !nifty_bank_subscribe_this.includes(item));
        console.log('unsubscribe_this_decluttered', nifty_bank_unsubscribe_this);

        nifty_bank_unsubscribe_this.forEach(item => {
            socket.send(
                JSON.stringify({
                    unsubscribe: {
                        id: "strategy_2",
                        list: [
                            {
                                segment: "nsefo", instrument: item, eventCode: 1512
                            },
                        ]
                    }
                })
            )
        })
    }

    if (nifty_bank_subscribed_list.length == 0) {
        console.log('subscribing first strikes nifty bank')

        nifty_bank_subscribe_this = nifty_bank_strikes
        nifty_bank_subscribe_this.forEach(item => {
            console.log(item)
            socket.send(
                JSON.stringify({
                    subscribe: {
                        id: "strategy_2",
                        list: [
                            {
                                segment: "nsefo", instrument: item, eventCode: 1512
                            },
                        ]
                    }
                })
            )
        })
    }
}

// Function to print the message
async function printMessage() {
    console.log("A minute has passed!");

    // APPLY MUTEX LOCK HERE
    const release = await mutex.acquire();

    try {
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() - 1);

        const jodi = [bigObject.row.n_m_250_CE + bigObject.row.n_m_250_PE, bigObject.row.n_m_200_CE + bigObject.row.n_m_200_PE,
        bigObject.row.n_m_150_CE + bigObject.row.n_m_150_PE, bigObject.row.n_m_100_CE + bigObject.row.n_m_100_PE, bigObject.row.n_m_50_CE + bigObject.row.n_m_50_PE,
        bigObject.row.n_p_50_CE + bigObject.row.n_p_50_PE, bigObject.row.n_p_100_CE + bigObject.row.n_p_100_PE, bigObject.row.n_p_150_CE + bigObject.row.n_p_150_PE,
        bigObject.row.n_p_200_CE + bigObject.row.n_p_200_PE, bigObject.row.n_p_250_CE + bigObject.row.n_p_250_PE, bigObject.row.n_nf_CE + bigObject.row.n_nf_PE
        ]

        const n_lowest = Math.min(...jodi.filter(value => !isNaN(value)))

        worksheet.addRow({
            time: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
            "nifty_50_spot": bigObject.nifty_50_spot % 1 > 0.5 ? Math.ceil(bigObject.nifty_50_spot) : Math.floor(bigObject.nifty_50_spot),

            n_m_250_CE: bigObject.row.n_m_250_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_250_CE) : Math.floor(bigObject.row.n_m_250_CE),
            n_m_250_PE: bigObject.row.n_m_250_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_250_PE) : Math.floor(bigObject.row.n_m_250_PE),
            n_m_200_CE: bigObject.row.n_m_200_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_200_CE) : Math.floor(bigObject.row.n_m_200_CE),
            n_m_200_PE: bigObject.row.n_m_200_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_200_PE) : Math.floor(bigObject.row.n_m_200_PE),
            n_m_150_CE: bigObject.row.n_m_150_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_150_CE) : Math.floor(bigObject.row.n_m_150_CE),
            n_m_150_PE: bigObject.row.n_m_150_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_150_PE) : Math.floor(bigObject.row.n_m_150_PE),
            n_m_100_CE: bigObject.row.n_m_100_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_100_CE) : Math.floor(bigObject.row.n_m_100_CE),
            n_m_100_PE: bigObject.row.n_m_100_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_100_PE) : Math.floor(bigObject.row.n_m_100_PE),
            n_m_50_CE: bigObject.row.n_m_50_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_50_CE) : Math.floor(bigObject.row.n_m_50_CE),
            n_m_50_PE: bigObject.row.n_m_50_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_m_50_PE) : Math.floor(bigObject.row.n_m_50_PE),

            n_nf_CE: bigObject.row.n_nf_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_nf_CE) : Math.floor(bigObject.row.n_nf_CE),
            n_nf_PE: bigObject.row.n_nf_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_nf_PE) : Math.floor(bigObject.row.n_nf_PE),

            n_p_50_CE: bigObject.row.n_p_50_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_50_CE) : Math.floor(bigObject.row.n_p_50_CE),
            n_p_50_PE: bigObject.row.n_p_50_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_50_PE) : Math.floor(bigObject.row.n_p_50_PE),
            n_p_100_CE: bigObject.row.n_p_100_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_100_CE) : Math.floor(bigObject.row.n_p_100_CE),
            n_p_100_PE: bigObject.row.n_p_100_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_100_PE) : Math.floor(bigObject.row.n_p_100_PE),
            n_p_150_CE: bigObject.row.n_p_150_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_150_CE) : Math.floor(bigObject.row.n_p_150_CE),
            n_p_150_PE: bigObject.row.n_p_150_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_150_PE) : Math.floor(bigObject.row.n_p_150_PE),
            n_p_200_CE: bigObject.row.n_p_200_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_200_CE) : Math.floor(bigObject.row.n_p_200_CE),
            n_p_200_PE: bigObject.row.n_p_200_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_200_PE) : Math.floor(bigObject.row.n_p_200_PE),
            n_p_250_CE: bigObject.row.n_p_250_CE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_250_CE) : Math.floor(bigObject.row.n_p_250_CE),
            n_p_250_PE: bigObject.row.n_p_250_PE % 1 > 0.5 ? Math.ceil(bigObject.row.n_p_250_PE) : Math.floor(bigObject.row.n_p_250_PE),

            n_m_250_CE_PE: jodi[0] % 1 > 0.5 ? Math.ceil(jodi[0]) : Math.floor(jodi[0]),
            n_m_200_CE_PE: jodi[1] % 1 > 0.5 ? Math.ceil(jodi[1]) : Math.floor(jodi[1]),
            n_m_150_CE_PE: jodi[2] % 1 > 0.5 ? Math.ceil(jodi[2]) : Math.floor(jodi[2]),
            n_m_100_CE_PE: jodi[3] % 1 > 0.5 ? Math.ceil(jodi[3]) : Math.floor(jodi[3]),
            n_m_50_CE_PE: jodi[4] % 1 > 0.5 ? Math.ceil(jodi[4]) : Math.floor(jodi[4]),

            n_lowest: n_lowest % 1 > 0.5 ? Math.ceil(n_lowest) : Math.floor(n_lowest),

            n_p_50_CE_PE: jodi[5] % 1 > 0.5 ? Math.ceil(jodi[5]) : Math.floor(jodi[5]),
            n_p_100_CE_PE: jodi[6] % 1 > 0.5 ? Math.ceil(jodi[6]) : Math.floor(jodi[6]),
            n_p_150_CE_PE: jodi[7] % 1 > 0.5 ? Math.ceil(jodi[7]) : Math.floor(jodi[7]),
            n_p_200_CE_PE: jodi[8] % 1 > 0.5 ? Math.ceil(jodi[8]) : Math.floor(jodi[8]),
            n_p_250_CE_PE: jodi[9] % 1 > 0.5 ? Math.ceil(jodi[9]) : Math.floor(jodi[9]),

            n_nf_CE_PE: jodi[10] % 1 > 0.5 ? Math.ceil(jodi[10]) : Math.floor(jodi[10]),


        })


        if (last_nf != latest_nf || nifty_50_nf_first_change) {

            console.log(last_nf, "N_NF_Change", latest_nf)

            last_nf = latest_nf

            if (!nifty_50_nf_first_change) {// runs for subsequent nf change
                Calculate_Strikes_For_Nifty_50();
                Manage_Subscriptions_For_Nifty_50();

                worksheet.addRow({
                    time: ``,
                    nifty_50_spot: ``,

                    ...bigObject.strikes,

                    n_m_250_CE_PE: bigObject.strikes.n_m_250_CE,
                    n_m_200_CE_PE: bigObject.strikes.n_m_200_CE,
                    n_m_150_CE_PE: bigObject.strikes.n_m_150_CE,
                    n_m_100_CE_PE: bigObject.strikes.n_m_100_CE,
                    n_m_50_CE_PE: bigObject.strikes.n_m_50_CE,

                    n_lowest: null,

                    n_p_50_CE_PE: bigObject.strikes.n_p_50_CE,
                    n_p_100_CE_PE: bigObject.strikes.n_p_100_CE,
                    n_p_150_CE_PE: bigObject.strikes.n_p_150_CE,
                    n_p_200_CE_PE: bigObject.strikes.n_p_200_CE,
                    n_p_250_CE_PE: bigObject.strikes.n_p_250_CE,

                    n_nf_CE_PE: bigObject.strikes.n_nf_CE,

                }).eachCell((cell) => {
                    cell.style.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                    };
                })
            }
            nifty_50_nf_first_change = false

        };

        const jodi_bank = [NB_Big_Object.row.nb_m_500_CE + NB_Big_Object.row.nb_m_500_PE, NB_Big_Object.row.nb_m_200_CE + NB_Big_Object.row.nb_m_200_PE,
        NB_Big_Object.row.nb_m_300_CE + NB_Big_Object.row.nb_m_300_PE, NB_Big_Object.row.nb_m_100_CE + NB_Big_Object.row.nb_m_100_PE, NB_Big_Object.row.nb_m_400_CE + NB_Big_Object.row.nb_m_400_PE,
        NB_Big_Object.row.nb_p_400_CE + NB_Big_Object.row.nb_p_400_PE, NB_Big_Object.row.nb_p_100_CE + NB_Big_Object.row.nb_p_100_PE, NB_Big_Object.row.nb_p_300_CE + NB_Big_Object.row.nb_p_300_PE,
        NB_Big_Object.row.nb_p_200_CE + NB_Big_Object.row.nb_p_200_PE, NB_Big_Object.row.nb_p_500_CE + NB_Big_Object.row.nb_p_500_PE, NB_Big_Object.row.nb_nf_CE + NB_Big_Object.row.nb_nf_PE
        ]

        const nb_lowest = Math.min(...jodi.filter(value => !isNaN(value)))

        worksheet_bank.addRow({
            time: `${currentDate.getHours()}:${currentDate.getMinutes()}`,

            "nifty_bank_spot": NB_Big_Object.nifty_bank_spot % 1 > 0.5 ? Math.ceil(NB_Big_Object.nifty_bank_spot) : Math.floor(NB_Big_Object.nifty_bank_spot),

            nb_m_500_CE: NB_Big_Object.row.nb_m_500_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_500_CE) : Math.floor(NB_Big_Object.row.nb_m_500_CE),
            nb_m_500_PE: NB_Big_Object.row.nb_m_500_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_500_PE) : Math.floor(NB_Big_Object.row.nb_m_500_PE),
            nb_m_400_CE: NB_Big_Object.row.nb_m_400_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_400_CE) : Math.floor(NB_Big_Object.row.nb_m_400_CE),
            nb_m_400_PE: NB_Big_Object.row.nb_m_400_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_400_PE) : Math.floor(NB_Big_Object.row.nb_m_400_PE),
            nb_m_300_CE: NB_Big_Object.row.nb_m_300_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_300_CE) : Math.floor(NB_Big_Object.row.nb_m_300_CE),
            nb_m_300_PE: NB_Big_Object.row.nb_m_300_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_300_PE) : Math.floor(NB_Big_Object.row.nb_m_300_PE),
            nb_m_200_CE: NB_Big_Object.row.nb_m_200_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_200_CE) : Math.floor(NB_Big_Object.row.nb_m_200_CE),
            nb_m_200_PE: NB_Big_Object.row.nb_m_200_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_200_PE) : Math.floor(NB_Big_Object.row.nb_m_200_PE),
            nb_m_100_CE: NB_Big_Object.row.nb_m_100_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_100_CE) : Math.floor(NB_Big_Object.row.nb_m_100_CE),
            nb_m_100_PE: NB_Big_Object.row.nb_m_100_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_m_100_PE) : Math.floor(NB_Big_Object.row.nb_m_100_PE),

            nb_nf_CE: NB_Big_Object.row.nb_nf_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_nf_CE) : Math.floor(NB_Big_Object.row.nb_nf_CE),
            nb_nf_PE: NB_Big_Object.row.nb_nf_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_nf_PE) : Math.floor(NB_Big_Object.row.nb_nf_PE),

            nb_p_100_CE: NB_Big_Object.row.nb_p_100_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_100_CE) : Math.floor(NB_Big_Object.row.nb_p_100_CE),
            nb_p_100_PE: NB_Big_Object.row.nb_p_100_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_100_PE) : Math.floor(NB_Big_Object.row.nb_p_100_PE),
            nb_p_200_CE: NB_Big_Object.row.nb_p_200_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_200_CE) : Math.floor(NB_Big_Object.row.nb_p_200_CE),
            nb_p_200_PE: NB_Big_Object.row.nb_p_200_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_200_PE) : Math.floor(NB_Big_Object.row.nb_p_200_PE),
            nb_p_300_CE: NB_Big_Object.row.nb_p_300_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_300_CE) : Math.floor(NB_Big_Object.row.nb_p_300_CE),
            nb_p_300_PE: NB_Big_Object.row.nb_p_300_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_300_PE) : Math.floor(NB_Big_Object.row.nb_p_300_PE),
            nb_p_400_CE: NB_Big_Object.row.nb_p_400_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_400_CE) : Math.floor(NB_Big_Object.row.nb_p_400_CE),
            nb_p_400_PE: NB_Big_Object.row.nb_p_400_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_400_PE) : Math.floor(NB_Big_Object.row.nb_p_400_PE),
            nb_p_500_CE: NB_Big_Object.row.nb_p_500_CE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_500_CE) : Math.floor(NB_Big_Object.row.nb_p_500_CE),
            nb_p_500_PE: NB_Big_Object.row.nb_p_500_PE % 1 > 0.5 ? Math.ceil(NB_Big_Object.row.nb_p_500_PE) : Math.floor(NB_Big_Object.row.nb_p_500_PE),

            nb_m_500_CE_PE: jodi_bank[0] % 1 > 0.5 ? Math.ceil(jodi_bank[0]) : Math.floor(jodi_bank[0]),
            nb_m_400_CE_PE: jodi_bank[1] % 1 > 0.5 ? Math.ceil(jodi_bank[1]) : Math.floor(jodi_bank[1]),
            nb_m_300_CE_PE: jodi_bank[2] % 1 > 0.5 ? Math.ceil(jodi_bank[2]) : Math.floor(jodi_bank[2]),
            nb_m_200_CE_PE: jodi_bank[4] % 1 > 0.5 ? Math.ceil(jodi_bank[4]) : Math.floor(jodi_bank[4]),
            nb_m_100_CE_PE: jodi_bank[3] % 1 > 0.5 ? Math.ceil(jodi_bank[3]) : Math.floor(jodi_bank[3]),

            nb_lowest: nb_lowest % 1 > 0.5 ? Math.ceil(nb_lowest) : Math.floor(nb_lowest),

            nb_p_100_CE_PE: jodi_bank[6] % 1 > 0.5 ? Math.ceil(jodi_bank[6]) : Math.floor(jodi_bank[6]),
            nb_p_200_CE_PE: jodi_bank[5] % 1 > 0.5 ? Math.ceil(jodi_bank[5]) : Math.floor(jodi_bank[5]),
            nb_p_300_CE_PE: jodi_bank[7] % 1 > 0.5 ? Math.ceil(jodi_bank[7]) : Math.floor(jodi_bank[7]),
            nb_p_400_CE_PE: jodi_bank[8] % 1 > 0.5 ? Math.ceil(jodi_bank[8]) : Math.floor(jodi_bank[8]),
            nb_p_500_CE_PE: jodi_bank[9] % 1 > 0.5 ? Math.ceil(jodi_bank[9]) : Math.floor(jodi_bank[9]),

            nb_nf_CE_PE: jodi_bank[10] % 1 > 0.5 ? Math.ceil(jodi_bank[10]) : Math.floor(jodi_bank[10]),
        })

        if (last_nf_bank != latest_nf_bank || nifty_bank_nf_first_change) {

            console.log(last_nf_bank, "N_BANK_Change", latest_nf_bank)

            last_nf_bank = latest_nf_bank

            if (!nifty_bank_nf_first_change) { // runs for subsequent nf change
                Calculate_Strikes_For_Nifty_Bank();
                Manage_Subscriptions_For_Nifty_Bank();

                worksheet_bank.addRow({
                    time: ``,
                    nifty_bank_spot: ``,

                    ...NB_Big_Object.strikes,

                    nb_m_500_CE_PE: NB_Big_Object.strikes.nb_m_500_CE,
                    nb_m_400_CE_PE: NB_Big_Object.strikes.nb_m_400_CE,
                    nb_m_300_CE_PE: NB_Big_Object.strikes.nb_m_300_CE,
                    nb_m_200_CE_PE: NB_Big_Object.strikes.nb_m_200_CE,
                    nb_m_100_CE_PE: NB_Big_Object.strikes.nb_m_100_CE,

                    nb_lowest: null,

                    nb_p_100_CE_PE: NB_Big_Object.strikes.nb_p_100_CE,
                    nb_p_200_CE_PE: NB_Big_Object.strikes.nb_p_200_CE,
                    nb_p_300_CE_PE: NB_Big_Object.strikes.nb_p_300_CE,
                    nb_p_400_CE_PE: NB_Big_Object.strikes.nb_p_400_CE,
                    nb_p_500_CE_PE: NB_Big_Object.strikes.nb_p_500_CE,

                    nb_nf_CE_PE: NB_Big_Object.strikes.nb_nf_CE,

                }).eachCell((cell) => {
                    cell.style.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                    };
                })
            }
            nifty_bank_nf_first_change = false
        };
    }
    finally {
        console.log('releasing lock')
        release();
    }
}

// Function to start the timer
function startTimer() {
    // Get the current time
    const startTime = new Date();

    // Calculate the remaining time until the next minute
    const nextMinute = new Date(startTime.getTime() + (60 - startTime.getSeconds()) * 1000);

    // Set a timeout to print the message at the end of the current minute
    setTimeout(() => {
        printMessage(); // Print message at the end of the first minute

        // Set an interval to print the message every minute thereafter
        setInterval(printMessage, 60000);
    }, nextMinute.getTime() - startTime.getTime());
    // }, 5000);
}

// Start the timer
startTimer();

const handleExit = async () => {
    return new Promise(async (resolve, reject) => {
        if (Object.entries(bigObject).length > 0) {
            await workbook.xlsx.writeFile(nifty_50_excel_file_path);
        }
        if (Object.entries(NB_Big_Object).length > 0) {

            await workbook_bank.xlsx.writeFile(nifty_bank_excel_file_path);
        }
        console.log(`Data saved to ${nifty_50_excel_file_path} & ${nifty_bank_excel_file_path}. Exiting...`);
        // Close the writable stream when done
        ltp_log_stream.end((err) => {
            if (err) {
                console.error(`Error closing log stream: ${err}`);
            } else {
                console.log('ltp_log_stream closed.');
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
            finished(ltp_log_stream),
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
                id: "strategy_2"
            }
        })
    )
    socket.send(
        JSON.stringify({
            subscribe: {
                id: "strategy_2",
                list: [
                    {
                        segment: "index", instrument: "NIFTY 50", eventCode: 1512
                    },
                    {
                        segment: "index", instrument: "NIFTY BANK", eventCode: 1512
                    }
                ]
            }
        })
    );
};

// add error messages for instrument not found

socket.onmessage = (event) => {

    const data = JSON.parse(event.data);
    const key = Object.keys(data)[0]
    const payload = data[key]

    switch (key) {
        case "marketdata":

            payload.forEach(data => {
                const now = new Date(data.LastUpdateTime)

                // console.log(data)
                if (data.MessageCode === 1512) ltp_stringifier.write({ ...data, 'HH:MM': `${now.getUTCHours()}:${now.getUTCMinutes()}` });

                if (data.MessageCode === 1502) marketdata_stringifier.write({ ...data, 'HH:MM': `${now.getUTCHours()}:${now.getUTCMinutes()}` });

                if (data.MessageCode === 1512 & data.name === "NIFTY 50") {

                    bigObject = {
                        ...bigObject,
                        time: `${now.getUTCHours()}:${now.getUTCMinutes()}`,
                        nifty_50_spot: data.LastTradedPrice
                    }

                    if (nearest_future === null
                        || nearest_future != Math.round(data.LastTradedPrice / 50) * 50) {


                        if (nearest_future === null) { // runs once at beginning.
                            nifty_50_nf_first_change = true
                            nearest_future = Math.round(data.LastTradedPrice / 50) * 50
                            last_nf = nearest_future
                            Calculate_Strikes_For_Nifty_50();
                            worksheet.addRow({
                                time: ``,
                                nifty_50_spot: ``,

                                ...bigObject.strikes,

                                n_m_250_CE_PE: bigObject.strikes.n_m_250_CE,
                                n_m_200_CE_PE: bigObject.strikes.n_m_200_CE,
                                n_m_150_CE_PE: bigObject.strikes.n_m_150_CE,
                                n_m_100_CE_PE: bigObject.strikes.n_m_100_CE,
                                n_m_50_CE_PE: bigObject.strikes.n_m_50_CE,

                                n_lowest: null,

                                n_p_50_CE_PE: bigObject.strikes.n_p_50_CE,
                                n_p_100_CE_PE: bigObject.strikes.n_p_100_CE,
                                n_p_150_CE_PE: bigObject.strikes.n_p_150_CE,
                                n_p_200_CE_PE: bigObject.strikes.n_p_200_CE,
                                n_p_250_CE_PE: bigObject.strikes.n_p_250_CE,

                                n_nf_CE_PE: bigObject.strikes.n_nf_CE,

                            }).eachCell((cell) => {
                                cell.style.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                                };
                            })
                            Manage_Subscriptions_For_Nifty_50();
                        } else {
                            // for all other changes of nearest_future
                            nearest_future = Math.round(data.LastTradedPrice / 50) * 50
                        }
                        latest_nf = nearest_future
                    }
                }

                if (data.MessageCode === 1512 & nifty_50_strikes.includes(data.name)) {

                    const contractPrice = Number(data.name.match(/DEC(\d+)(PE|CE)/)[1])
                    const contractType = data.name.match(/DEC(\d+)(PE|CE)/)[2]

                    if (last_nf < contractPrice) {
                        bigObject.row = {
                            ...bigObject.row,
                            [`n_p_${contractPrice - last_nf}_${contractType}`]: data.LastTradedPrice
                        }
                    }
                    if (last_nf > contractPrice) {
                        bigObject.row = {
                            ...bigObject.row,
                            [`n_m_${last_nf - contractPrice}_${contractType}`]: data.LastTradedPrice
                        }
                    }
                    if (last_nf == contractPrice) {
                        bigObject.row = {
                            ...bigObject.row,
                            [`n_nf_${contractType}`]: data.LastTradedPrice
                        }
                    }
                }

                if (data.MessageCode === 1512 & data.name === "NIFTY BANK") {

                    NB_Big_Object = {
                        ...NB_Big_Object,
                        time: `${now.getUTCHours()}:${now.getUTCMinutes()}`,
                        nifty_bank_spot: data.LastTradedPrice
                    }
                    // console.log('nf', nearest_future_bank)

                    if (nearest_future_bank === null
                        || nearest_future_bank != Math.round(data.LastTradedPrice / 100) * 100) {

                        if (nearest_future_bank === null) {
                            nifty_bank_nf_first_change = true
                            nearest_future_bank = Math.round(data.LastTradedPrice / 100) * 100
                            last_nf_bank = nearest_future_bank
                            Calculate_Strikes_For_Nifty_Bank();
                            worksheet_bank.addRow({
                                time: ``,
                                nifty_bank_spot: ``,

                                ...NB_Big_Object.strikes,

                                nb_m_500_CE_PE: NB_Big_Object.strikes.nb_m_500_CE,
                                nb_m_400_CE_PE: NB_Big_Object.strikes.nb_m_400_CE,
                                nb_m_300_CE_PE: NB_Big_Object.strikes.nb_m_300_CE,
                                nb_m_200_CE_PE: NB_Big_Object.strikes.nb_m_200_CE,
                                nb_m_100_CE_PE: NB_Big_Object.strikes.nb_m_100_CE,

                                nb_lowest: null,

                                nb_p_100_CE_PE: NB_Big_Object.strikes.nb_p_100_CE,
                                nb_p_200_CE_PE: NB_Big_Object.strikes.nb_p_200_CE,
                                nb_p_300_CE_PE: NB_Big_Object.strikes.nb_p_300_CE,
                                nb_p_400_CE_PE: NB_Big_Object.strikes.nb_p_400_CE,
                                nb_p_500_CE_PE: NB_Big_Object.strikes.nb_p_500_CE,

                                nb_nf_CE_PE: NB_Big_Object.strikes.nb_nf_CE,

                            }).eachCell((cell) => {
                                cell.style.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'FFFF00' } // Yellow background for every 50th row
                                };
                            })
                            Manage_Subscriptions_For_Nifty_Bank();
                        } else {
                            // for all other changes of nearest_future_bank
                            nearest_future_bank = Math.round(data.LastTradedPrice / 100) * 100
                        }
                        latest_nf_bank = nearest_future_bank
                    }
                }

                if (data.MessageCode === 1512 & nifty_bank_strikes.includes(data.name)) {

                    const contractPrice = Number(data.name.match(/DEC(\d+)(PE|CE)/)[1])
                    const contractType = data.name.match(/DEC(\d+)(PE|CE)/)[2]

                    if (last_nf_bank < contractPrice) {
                        NB_Big_Object.row = {
                            ...NB_Big_Object.row,
                            [`nb_p_${contractPrice - last_nf_bank}_${contractType}`]: data.LastTradedPrice
                        }
                    }

                    if (last_nf_bank > contractPrice) {
                        NB_Big_Object.row = {
                            ...NB_Big_Object.row,
                            [`nb_m_${last_nf_bank - contractPrice}_${contractType}`]: data.LastTradedPrice
                        }
                    }

                    if (last_nf_bank == contractPrice) {
                        NB_Big_Object.row = {
                            ...NB_Big_Object.row,
                            [`nb_nf_${contractType}`]: data.LastTradedPrice
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
            if (payload.name.startsWith('NIFTY') && payload.name !== 'NIFTY 50' && payload.name !== 'NIFTY BANK') {
                if (payload.operation === 'Unsubscribe') {
                    if (payload.type === 'success') {
                        nifty_50_subscribed_list = nifty_50_subscribed_list.filter(item => item !== payload.name);
                        nifty_50_unsubscribe_this = nifty_50_unsubscribe_this.filter(item => item !== payload.name);
                        if (nifty_50_subscribe_this.length > 0) {
                            const sub_this = nifty_50_subscribe_this[0]
                            nifty_50_subscribe_this = nifty_50_subscribe_this.slice(1)
                            socket.send(
                                JSON.stringify({
                                    subscribe: {
                                        id: "strategy_2",
                                        list: [
                                            {
                                                segment: "nsefo", instrument: sub_this, eventCode: 1512
                                            },
                                        ]
                                    }
                                })
                            )
                        }
                    }
                    if (payload.type === 'failed') {
                        console.log('nifty_50_unsubscribe_this', nifty_50_unsubscribe_this)
                        if (nifty_50_unsubscribe_this.includes(payload.name)) JSON.stringify({
                            unsubscribe: {
                                id: "strategy_2",
                                list: [
                                    {
                                        segment: "nsefo", instrument: payload.name, eventCode: 1512
                                    },
                                ]
                            }
                        })
                    }
                }
                if (payload.operation === 'Subscribe' && payload.name !== 'NIFTY 50' && payload.name !== 'NIFTY BANK') {
                    if (payload.type === 'success') {
                        nifty_50_subscribe_this = nifty_50_subscribe_this.filter(item => item !== payload.name);
                        nifty_50_subscribed_list.push(payload.name)
                    }
                    if (payload.type === 'failed') {

                        JSON.stringify({
                            subscribe: {
                                id: "strategy_2",
                                list: [
                                    {
                                        segment: "nsefo", instrument: payload.name, eventCode: 1512
                                    },
                                ]
                            }
                        })
                    }
                }
            }
            if (payload.name.startsWith('BANKNIFTY')) {
                if (payload.operation === 'Unsubscribe') {
                    if (payload.type === 'success') {
                        nifty_bank_subscribed_list = nifty_bank_subscribed_list.filter(item => item !== payload.name);
                        nifty_bank_unsubscribe_this = nifty_bank_unsubscribe_this.filter(item => item !== payload.name);
                        if (nifty_bank_subscribe_this.length > 0) {
                            const sub_this = nifty_bank_subscribe_this[0]
                            nifty_bank_subscribe_this = nifty_bank_subscribe_this.slice(1)
                            socket.send(
                                JSON.stringify({
                                    subscribe: {
                                        id: "strategy_2",
                                        list: [
                                            {
                                                segment: "nsefo", instrument: sub_this, eventCode: 1512
                                            },
                                        ]
                                    }
                                })
                            )
                        }
                    }
                    if (payload.type === 'failed') {
                        console.log('nifty_bank_unsubscribe_this', nifty_bank_unsubscribe_this)
                        if (nifty_bank_unsubscribe_this.includes(payload.name)) JSON.stringify({
                            unsubscribe: {
                                id: "strategy_2",
                                list: [
                                    {
                                        segment: "nsefo", instrument: payload.name, eventCode: 1512
                                    },
                                ]
                            }
                        })
                    }
                }
                if (payload.operation === 'Subscribe') {
                    if (payload.type === 'success') {
                        nifty_bank_subscribe_this = nifty_bank_subscribe_this.filter(item => item !== payload.name);
                        nifty_bank_subscribed_list.push(payload.name)
                    }
                    if (payload.type === 'failed') {
                        // if (nifty_bank_subscribe_this.includes(payload.name)) 
                        JSON.stringify({
                            subscribe: {
                                id: "strategy_2",
                                list: [
                                    {
                                        segment: "nsefo", instrument: payload.name, eventCode: 1512
                                    },
                                ]
                            }
                        })
                    }
                }
            }
            break;
        default:
            break;
    }
}
