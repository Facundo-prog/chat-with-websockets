import React from 'react'
import ReactDOM from 'react-dom/client'

import { WebsocketProvider } from './providers/Websocket';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WebsocketProvider>
      <App />
    </WebsocketProvider>
  </React.StrictMode>,
)
