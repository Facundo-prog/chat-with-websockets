/* eslint-disable no-undef */

import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { dirname, join } from 'path';
import { writeFile, mkdir } from 'fs';

import config from "./config/config.js";
import { hashBcrypt, compareBcrypt } from './cryptography/bcrypt.js';
import { verifyJwt, signJwt } from './cryptography/jwt.js';
import { deleteOldMessages } from './webchatFunctions.js';


const db = new PrismaClient();
let listUsersConnected = {};

export default function initWebsoketServer(httpServer) {
  const io = new Server(httpServer);

  io.on('connection', socket => {

    // Disconnect socket
    socket.on('disconnect', async () => {
      const currentSockets = await io.fetchSockets();
      let newListUsersConnected = {};

      for(const socket of currentSockets){
        if(listUsersConnected[socket.id]){
          newListUsersConnected = {
            ...newListUsersConnected,
            [socket.id]: listUsersConnected[socket.id]
          }
        }
      }
      
      if(Object.keys(listUsersConnected).length !== Object.keys(newListUsersConnected).length){
        io.emit('usersConnected', newListUsersConnected);
        listUsersConnected = newListUsersConnected;
      }
    });

    // Get user
    socket.on('getUser', async (token) => {
      const sub = verifyJwt(token, config.jwtSecret)?.sub;
      if(!sub) return socket.emit('newMessage', { error: "Ocurrió un error al validar su identidad" });

      const user = await db.webchatUser.findUnique({ where: { id: sub }}).catch((e) => console.log("[ERROR DB]:", e.message));
      if(!user) return socket.emit('getUser', { error: 'El usuario no existe' });
      
      listUsersConnected = {
        ...listUsersConnected,
        [socket.id]: {
          username: user.username,
          image: user.image
        }
      }

      io.emit('usersConnected', listUsersConnected);

      socket.emit('getUser', {
        username: user.username,
        image: user.image,
        token,
      });
    });
    
    // Signin
    socket.on('signin', async (data, callback) => {
      const { username, password } = data;
      const user = await db.webchatUser.findUnique({ where: { username }}).catch((e) => console.log("[ERROR DB]:", e.message));
      if(user) return callback({ error: 'El usuario ya existe. Utilice uno distinto' });

      const hash = await hashBcrypt(password);
      const newUser = await db.webchatUser.create({
        data: {
          username,
          password: hash,
          image: '/static/icons/userDefault.png'
        }
      }).catch((e) => console.log("[ERROR DB]:", e.message));
      if(!newUser) return callback({ error: 'Ocurrió un error al registrar su usuario' });

      const token = signJwt({ sub: newUser.id }, config.jwtSecret, '1d');
      callback({ token });
    });

    // Login
    socket.on('login', async (data) => {
      const { username, password } = data;
      const user = await db.webchatUser.findUnique({ 
        where: { username }
      }).catch((e) => console.log("[ERROR DB]:", e.message));
      if(!user) return socket.emit('login', { error: 'El usuario no existe' });
      
      const validatePassword = await compareBcrypt(password, user.password);
      if(!validatePassword) return socket.emit('login', { error: 'La contraseña es incorrecta' });

      const token = signJwt({ sub: user.id }, config.jwtSecret, '1d');
      socket.emit('login', { token });
    });

    // Upload file
    socket.on("upload", (token, file, imageType, username, callback) => {
      const sub = verifyJwt(token, config.jwtSecret)?.sub;
      if(!sub) return callback({ error: "Ocurrió un error al validar su identidad" });
      if(imageType !== "image/png" && imageType !== "image/jpg" && imageType !== "image/jpeg") return;
      
      const nameImage = `${username}.${imageType.split('/')[1]}`;
      const pathImage = join(config.rootPath, `/protectedFiles/images/${nameImage}`);

      mkdir(dirname(pathImage), { recursive: true}, function (err) {
        if(err) return callback({ error: 'Error mkdir', message: err });
      
        writeFile(pathImage, file, async (err) => {
          if(err) return callback({ error: 'Error write file', message: err });
          const updateUser = await db.webchatUser.update({
            data: { image: `images/${nameImage}`},
            where: { id: sub },
          }).catch((e) => console.log("[ERROR DB]:", e.message));

          callback({ error: updateUser === null, message: 'Error save user' });
        });
      });
    });

    // New message
    socket.on('sendMessage', async (data) => {
      const { token, message, date } = data;
      const sub = verifyJwt(token, config.jwtSecret)?.sub;
      if(!token) return socket.emit('newMessage', { error: "Ocurrió un error al validar su identidad" });

      const newMessage = await db.webchatMessage.create({
        data: {
          userId: sub, 
          message, 
          date,
        },
        include: {
          user: true
        }
      }).catch((e) => console.log("[ERROR DB]:", e.message));
      if(!newMessage) return socket.emit('newMessage', { error: 'Ocurrió un error al guardar el mensaje' });

      await deleteOldMessages(db);

      io.emit('newMessage', { 
        date,
        message,
        username: newMessage.user.username,
        image: newMessage.user.image, 
      });
    });

    // Get all messages
    socket.on('getMessages', async (token) => {
      const data = verifyJwt(token, config.jwtSecret);
      if(!data) return socket.emit('getMessages', { error: "Ocurrió un error al validar su identidad" });

      const messages = await db.webchatMessage.findMany({
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          }
        },
      }).catch((e) => console.log("[ERROR DB]:", e.message));

      if(!messages) return socket.emit('getMessages', { error: 'Uups. Error interno!' });
      socket.emit('getMessages', messages);
    });
  });
}