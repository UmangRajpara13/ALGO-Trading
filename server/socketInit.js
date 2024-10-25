





// var XtsMarketDataWS = require('xts-marketdata-api').WS;
import { WS } from 'xts-marketdata-api';

var xtsMarketDataWS = new WS('https://developers.symphonyfintech.in/apimarketdata');

var socketInitRequest = {
  userID: 'XYZ',
  publishFormat: 'JSON',
  broadcastMode: 'Full',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJBMzM2Ml9jOTBiODQ2ZmJhZGEzYjdkNGRjMTk5IiwicHVibGljS2V5IjoiYzkwYjg0NmZiYWRhM2I3ZDRkYzE5OSIsImlhdCI6MTcyOTgzMjA0NywiZXhwIjoxNzI5OTE4NDQ3fQ.aggjZnjoDGPqrOoj2qmJKqEqWw2Oz3JWYShFDXd6CAY', // Token Generated after successful LogIn
};
xtsMarketDataWS.init(socketInitRequest);