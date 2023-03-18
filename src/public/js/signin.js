const socket = io('/', {
  path: '/webchat/socket.io/'
});

const formSignin = document.getElementById('signin');
const errorMessage = document.getElementById('errorMessage');
const userMessage = document.getElementById('userMessage');

formSignin.addEventListener('submit', async (e) => {
  const username = e.target.username?.value ?? null;
  const password = e.target.password?.value ?? null;
  const image = e.target.image?.files ?? null;

  e.preventDefault();

  if(!username || !password)return errorMessage.textContent = "Nombre de usuario o contraseña invalido!"
  if(!socket.connected) return errorMessage.textContent = "No hay conexión"
  if(image.length <= 0) return errorMessage.textContent = "Foto de perfil invalida!"
  if(image.length >= 1 && image[0].size >= 980000) return errorMessage.textContent = "La foto de perfil es muy grande, elija otra"

  errorMessage.textContent = "";
  userMessage.textContent = "Registrando usuario...";

  const imageName = username.replace(/ /g, "");
  socket.emit("upload", image[0], image[0].type, imageName, (status) => {
    if(status.error){
      userMessage.textContent = "";
      return errorMessage.textContent = status.message;
    }
    socket.emit('signin', { username, password, userImage: status.message });
  });
});


socket.on('signin', data => {
  if(data.error){
    userMessage.textContent = "";
    errorMessage.textContent = data.error;
    return;
  }

  if(data.token){
    document.cookie = `user=${data.token}`;
    location.href = '/webchat';
    return;
  }

  errorMessage.textContent = "Ocurrió un error inesperado";
});