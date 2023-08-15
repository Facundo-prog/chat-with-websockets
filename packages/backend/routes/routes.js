import { Router } from 'express';
import path from 'path';
import config from '../config/config.js';
import authWebchat from '../middlewares/authWebchat.js';

const router = Router();
const root = path.join(config.rootPath, './views/index.html');

router.get('/', authWebchat,  (req, res) => {
  res.sendFile(root);
});

router.get('/login', (req, res) => {
  res.sendFile(root);
});

router.get('/signin', (req, res) => {
  res.sendFile(root);
});

export default router;