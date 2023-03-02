const express = require('express');
const { createServer } = require('http');
const routes = require('../src/routes');
const createWebsocketServer = require('../src/websocketServer');
const cookieParser = require('cookie-parser');
const config = require('../config');

const app = express();
const httpServer = createServer(app);

app.use(express.json());

// Settings
app.use(cookieParser());

// Routes
app.use('/webchat', routes);

// Static 
app.use('/public', express.static(`${__dirname}/public`));

// Websocket server
createWebsocketServer(httpServer);

httpServer.listen(config.port, config.host, () => {
  console.log('Webchat run in port ' + config.port);
});