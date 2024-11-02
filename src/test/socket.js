
import { WS } from "xts-marketdata-api";
import { configDotenv } from "dotenv";
configDotenv()


var xtsMarketDataWS = new WS('https://mtrade.arhamshare.com/');

var socketInitRequest = {

    token: process.env.token,
    userID: process.env.userID,
    publishFormat: "JSON",
    broadcastMode: "Full"
};

xtsMarketDataWS.init(socketInitRequest);

var registerEvents = async function () {
    //instantiating the listeners for all event related data

    //"connect" event listener
    xtsMarketDataWS.onConnect((connectData) => {
        console.log(connectData);
    });
    //"joined" event listener
    xtsMarketDataWS.onJoined((joinedData) => {
        console.log('joinedData', joinedData);
    });

    //"error" event listener
    xtsMarketDataWS.onError((errorData) => {
        console.log(errorData);
    });

    //"disconnect" event listener
    xtsMarketDataWS.onDisconnect((disconnectData) => {
        console.log(disconnectData);
    });

    //"marketDepthEvent" event listener
    xtsMarketDataWS.onMarketDepthEvent((marketDepthData) => {
        console.log('marketDepthData', marketDepthData);
    });

    xtsMarketDataWS.onLTPEvent((ltpEvent) => {
        console.log('ltpEvent', ltpEvent);
    });

    //"openInterestEvent" event listener
    xtsMarketDataWS.onOpenInterestEvent((openInterestData) => {
        console.log('openInterestData', openInterestData);
    });

    //"indexDataEvent" event listener
    xtsMarketDataWS.onIndexDataEvent((indexData) => {
        console.log('indexData', indexData);
    });

    //"marketDepth100Event" event listener
    xtsMarketDataWS.onMarketDepth100Event((marketDepth100Data) => {
        console.log('marketDepth100Data', marketDepth100Data);
    });

    //"instrumentPropertyChangeEvent" event listener
    xtsMarketDataWS.onInstrumentPropertyChangeEvent((propertyChangeData) => {
        // console.log('propertyChangeData', propertyChangeData);
    });

    //"candleDataEvent" event listener
    xtsMarketDataWS.onCandleDataEvent((candleData) => {
        console.log('candleData', candleData);
    });

    // //"logout" event listener
    xtsMarketDataWS.onLogout((logoutData) => {
        console.log('logoutData', logoutData);
    });
};

registerEvents()

