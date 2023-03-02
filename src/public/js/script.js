const socket = io();

const sendButton = document.getElementById('send-message');
const messages = document.getElementById('all-messages');
const errorMessage = document.getElementById('errorMessage');
const userMessage = document.getElementById('userMessage');
const logoutButton = document.getElementById('logout');

let userData = {};

sendButton.addEventListener('click', () => {
  const message = document.getElementById('message');
  const date = new Date();
  const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }`;

  socket.emit('sendMessage', {
    token: userData.token,
    message: message.value,
    date: formattedDate
  });

  message.value = "";
  userMessage.textContent = "Enviando...";
});

logoutButton.addEventListener('click', () => {
  document.cookie = "user=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/webchat;domain=localhost;";
  location.href = "/webchat/login";
});



socket.on('connect', async () => {
  const token = document.cookie.split('=')[1];
  userData.token = token;
  socket.emit('getUser', token);
});

socket.on('getUser', data => {
  userData = { ...userData, ...data };
  socket.emit('getMessages', userData.token);
});

socket.on('newMessage', data => {
  if(data.error){
    userMessage.textContent = "";
    return errorMessage.textContent = data.error;
  }

  const { username, message, date, image } = data;
  const fragment = document.createRange().createContextualFragment(
    `
      <div class="${ username === userData.username ? 'message userSentItMessage' : 'message' }">
        <div class="image-container">
          <img src="${ image ? image : 'public/images/default.png' }"/>
        </div>

        <div class="message-body">
          <div class="user-info">
            <span class="username">${username}</span>
            <span class="time">${date}</span>
          </div>

          <p>${message}</p>
        </div>
      </div>
    `
  );
  
  messages.append(fragment);
  messages.scrollTo(0, messages.scrollHeight);
  errorMessage.textContent = "";
  userMessage.textContent = "";
});


socket.on('getMessages', data => {
  if(data.error){
    return errorMessage.textContent = data.error;
  }
  showChatsHistory(data);
});


function showChatsHistory(chats){
  let HTMLString = "";

  chats.forEach(element => {
    HTMLString += `
      <div class="${ element.username === userData.username ? 'message userSentItMessage' : 'message' }">
        <div class="image-container">
          <img src="${ element.image ? element.image : 'public/images/default.png' }"/>
        </div>

        <div class="message-body">
          <div class="user-info">
            <span class="username">${element.username}</span>
            <span class="time">${element.date}</span>
          </div>

          <p>${element.message}</p>
        </div>
      </div>
    `
  });
  
  errorMessage.textContent = "";
  userMessage.textContent = "";

  if(HTMLString.length <= 0){
    errorMessage.textContent = "No hay chats almacenados";
  }

  const fragment = document.createRange().createContextualFragment(HTMLString);
  messages.textContent = "";
  messages.append(fragment);

  setTimeout(() => {
    messages.scrollTo(0, messages.scrollHeight);
  }, 10);
}

socket.on('usersConnected', sockets => {
  const select = document.getElementById('usersConnected');
  const keys = Object.keys(sockets);

  select.innerHTML = `<optgroup label="Usuarios conectados">`;

  for(const id in keys){
    select.innerHTML += `
      <option value="${sockets[keys[id]].username}">
        <img src="${sockets[keys[id]].image}" />
        ${sockets[keys[id]].username}
      </option>
    `;
  }

  select.innerHTML += `</optgroup>`;
});