import { main } from "./main";
import { configDotenv } from "dotenv";
configDotenv();


const loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};

main(loginRequest)