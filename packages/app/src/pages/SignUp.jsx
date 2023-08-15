import { useContext, useRef } from "react";
import { Link } from "react-router-dom";

import { WebsocketContext } from "../providers/Websocket";
import chatIcon from "../icons/chatIcon.png";

export default function SignUp() {
  const socket = useContext(WebsocketContext);
  const userMessage = useRef();


  async function handelFormSignIn(e){
    const username = e.target.username?.value ?? null;
    const password = e.target.password?.value ?? null;
    const image = e.target.image?.files ?? null;

    e.preventDefault();

    if(!username || !password) return setUserMessage("Nombre de usuario o contraseña invalido!", true);
    if(!socket.connected) return setUserMessage("No hay conexión", true);
    if(image.length >= 1 && image[0].size >= 980000) return setUserMessage("La foto de perfil es muy grande, elija otra", true);
    if(image.length >= 1 && image[0].type !== "image/png" && image[0].type !== "image/jpg" && image[0].type !== "image/jpeg"){
      return setUserMessage("Formato de la foto de perfil no soportada!", true);
    }

    setUserMessage("Registrando usuario...");
    
    socket.emit('signin', { username, password }, (status) => {
      if(status.error) return setUserMessage(status.error, true);

      const date = new Date();
      date.setTime(date.getTime() + (24 * 60 * 60 * 1000));// Expires after 1 day
      document.cookie = `webchat_user=${status.token}; path=/; expires=${date.toUTCString()};`;
      if(image.length <= 0) location.href = '/';

      const imageName = username.replace(/ /g, "");
      socket.emit("upload", status.token, image[0], image[0].type, imageName, () => {
        location.href = '/';
      });
    });
  }


  function setUserMessage(message = "", error = false){
    userMessage.current.textContent = message;
    userMessage.current.classList = "userMessage";
    if(error) userMessage.current.classList = "errorMessage";
  }



  return (
    <>
      <header>
        <img className="icon" src={chatIcon} width={20} height={20} alt="chat icon" />
        <h1>Registrarme</h1>
      </header>

      <section className="auth">
        <form className="card" onSubmit={handelFormSignIn}>
          <p className="userMessage" ref={userMessage}></p>

          <div className="input-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input type="text" name="username" minLength="4" maxLength="20" required /><br/>

            <label htmlFor="password">Contraseña</label>
            <input type="password" name="password" minLength="4" maxLength="20" required /><br/>

            <label htmlFor="image">Foto de perfil</label>
            <input type="file" name="image" />
          </div>

          <div className="button-container">
            <input type="submit" className="btn primary" value="Registrar" />
          </div>
        </form>

        <div className="link-container">
          <Link to="/signin" className="btn">Ya tengo cuenta. Iniciar sesion</Link>
        </div>
      </section>
    </>
  )
}