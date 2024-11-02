import React, { StrictMode } from 'react';
import App from './App';
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import './index.css';

import store from './app/store'


createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);