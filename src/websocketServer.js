const { Server } = require('socket.io');
const pg = require('./db/postgres');
const path = require('path');
const { writeFile } = require('fs');
const { passwordHash, verifyPassword } = require('./cryptography/hash');
const { verifyToken, newToken } = require('./cryptography/jwt');

let listUsersConnected = {};

const createServer = (httpServer) => {
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
      listUsersConnected = newListUsersConnected;
      io.emit('usersConnected', listUsersConnected);
    });

    // Get user
    socket.on('getUser', async (token) => {
      const uid = verifyToken(token)?.uid;
      const user = await pg.getCustomWhere('users', `id = ${uid}`);
      if(user.length <= 0) return socket.emit('getUser', { error: 'El usuario no existe' });
      
      listUsersConnected = {
        ...listUsersConnected,
        [socket.id]: {
          username: user[0].username,
          image: user[0].image
        }
      }

      io.emit('usersConnected', listUsersConnected);

      socket.emit('getUser', { 
        id: uid,
        username: user[0].username,
        image: user[0].image
      });
    });
    
    // Signin
    socket.on('signin', async (data) => {
      const { username, password, userImage } = data;
      const user = await pg.getCustomWhere('users', `username = '${username}'`);
      if(user.length >= 1) return socket.emit('signin', { error: 'El usuario ya existe. Use otro' });

      const hash = await passwordHash(password);
      const createUser = await pg.create('users', {
        columns: ['username', 'password', 'image'],
        values: [username, hash, userImage]
      });
      if(createUser <= 0) return socket.emit('signin', { error: 'Ocurrió un error al registrar su usuario' })

      const newUser = await pg.getCustomWhere('users', `username = '${username}'`);
      if(newUser.length <= 0) return socket.emit('signin', { error: 'Ocurrió un error de validacion' });

      const token = newToken({ uid: newUser[0].id });
      socket.emit('signin', { token });
    });

    // Login
    socket.on('login', async (data) => {
      const { username, password } = data;
      const user = await pg.getCustomWhere('users', `username = '${username}'`);
      if(user.length <= 0) return socket.emit('login', { error: 'El usuario no existe' });
      
      const validatePassword = await verifyPassword(password, user[0].password);
      if(!validatePassword) return socket.emit('login', { error: 'La contraseña es incorrecta' });

      const token = newToken({ uid: user[0].id });
      socket.emit('login', { token });
    });

    // Upload file
    socket.on("upload", (file, imageType, username, callback) => {
      if(imageType !== "image/png" && imageType !== "image/jpg" && imageType !== "image/jpeg"){
        return callback({ error: true, message: "Formato de la foto de perfil invalida!" });
      }
      const nameImage = `${username}.${imageType.split('/')[1]}`;

      writeFile(path.join(__dirname, `./public/images/${nameImage}`), file, (err) => {
        callback({ error: err ? true : false, message: err ? err : `public/images/${nameImage}` });
      });
    });

    // New message
    socket.on('sendMessage', async (data) => {
      const token = verifyToken(data.token);
      if(!token) return socket.emit('newMessage', { error: "Ocurrió un error al validar su identidad" });

      const newMessage = await pg.create('chats', {
        columns: ['username', 'message', 'date'],
        values: [data.username, data.message, data.date]
      });
      if(newMessage <= 0) return socket.emit('newMessage', { error: 'Ocurrió un error al guardar el mensaje' })

      await pg.deleteOldMessages();

      delete data.token;
      io.emit('newMessage', { ...data });
    });

    // Get all messages
    socket.on('getMessages', async (token) => {
      const data = verifyToken(token);
      if(!data) return socket.emit('getMessages', { error: "Ocurrió un error al validar su identidad" });

      const chats = await pg.getAllChats();
      socket.emit('getMessages', chats);
    });
  });

  return io;
}

module.exports = createServer;