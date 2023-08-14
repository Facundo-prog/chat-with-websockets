import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from './config/config.js';
import errorsMiddlewar from './middlewares/errors.js';
import initWebsocket from './websocketServer.js';
import authWebchat from './middlewares/authWebchat.js';
import { verifyJwt } from './cryptography/jwt.js';
import router from './routes/routes.js';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

if(config.env === 'dev') app.use('/', express.static('./static'));

app.use('/images', authWebchat, express.static('./protectedFiles/images'));
app.use('/', router);


initWebsocket(httpServer);

app.use(errorsMiddlewar);

httpServer.listen(config.port, () => {
  console.log(`Webchat run in port ${config.port}`);
});
