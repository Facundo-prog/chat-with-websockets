const socket = io('/', {
  path: '/webchat/socket.io/'
});

const formLogin = document.getElementById('login');
const errorMessage = document.getElementById('errorMessage');
const userMessage = document.getElementById('userMessage');

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = e.target.username?.value ?? null;
  const password = e.target.password?.value ?? null;

  if(!username || !password){
    return errorMessage.textContent = "Nombre de usuario o contraseña invalido!";
  }

  if(!socket.connected){
    return errorMessage.textContent = "No hay conexión";
  }
  
  errorMessage.textContent = "";
  userMessage.textContent = "Conectando...";

  socket.emit('login', { username, password });
});

socket.on('login', data => {
  if(data.error){
    userMessage.textContent = "";
    errorMessage.textContent = data.error;
    return;
  }

  if(data.token){
    document.cookie = `user=${data.token}`;
    document.location.href = '/webchat';
    return;
  }

  errorMessage.textContent = "Ocurrió un error inesperado";
});