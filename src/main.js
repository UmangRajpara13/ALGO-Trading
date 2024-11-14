
import { configDotenv } from "dotenv";
import { Login } from "./login.js";
import { ws_server_init } from "./ws_server.js";
import { master } from "./master.js";
configDotenv();



var loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

const port = 3000

async function main(loginRequest) {
    // Login(loginRequest)
    ws_server_init(port )
    // master()
}



main(loginRequest)
