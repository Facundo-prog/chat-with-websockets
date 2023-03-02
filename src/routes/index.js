const { Router } = require('express');
const path = require('path');
const checkLogin = require('../middlewares/checkLogin');

const routesApi = Router();
const viewsPath = path.join(__dirname, '/../views');

routesApi.get('/', checkLogin,  (req, res) => {
  res.sendFile(viewsPath + '/index.html');
});

routesApi.get('/login', (req, res) => {
  res.sendFile(viewsPath + '/login.html');
});

routesApi.get('/signin', (req, res) => {
  res.setHeader('message', 'error');
  res.sendFile(viewsPath + '/signin.html');
});

module.exports = routesApi;