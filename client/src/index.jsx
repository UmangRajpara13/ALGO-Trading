import './index.css';
import React, { StrictMode } from 'react';
import App from './App';
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import store from './app/store'
import { interactiveStreaming } from './interactiveStreaming';

const token = import.meta.env.VITE_INTERACTIVE_TOKEN;
const userID = import.meta.env.VITE_iNTERACTIVE_USERID;

console.log(token, userID)

interactiveStreaming(token,userID);

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,   
);   