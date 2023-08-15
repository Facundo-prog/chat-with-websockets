import { useRef, useContext } from "react";
import { Link } from "react-router-dom";

import { WebsocketContext } from "../providers/Websocket";
import chatIcon from "../icons/chatIcon.png";

export default function SignIn() {
  const socket = useContext(WebsocketContext);
  const userMessage = useRef();

  socket.on('login', data => {
    if(data.error) return setUserMessage(data.error, true);
    if(!data?.token) setUserMessage("Ocurrió un error inesperado", true);

    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));// Expires after 1 day
    document.cookie = `webchat_user=${data.token}; path=/; expires=${date.toUTCString()};`;
    document.location.href = '/';
  });

  async function handleFormLogin(e){
    const username = e.target.username?.value ?? null;
    const password = e.target.password?.value ?? null;
    
    e.preventDefault();
  
    if(!username || !password) return setUserMessage("Nombre de usuario o contraseña invalido!", true);
    if(!socket.connected) return setUserMessage("No hay conexión", true);

    setUserMessage("Conectando...");
  
    socket.emit('login', { username, password });
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
        <h1>Iniciar sesion</h1>
      </header>

      <section className="auth">
        <form className="card" onSubmit={handleFormLogin}>
          <p className="userMessage" ref={userMessage}></p>

          <div className="input-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input type="text" name="username" minLength="4" maxLength="20" required /><br/>

            <label htmlFor="password">Contraseña</label>
            <input type="password" name="password" minLength="4" maxLength="20" required />
          </div>

          <div className="button-container">
            <input type="submit" className="btn primary" value="Entrar al chat" />
          </div>
        </form>

        <div className="link-container">
          <Link to="/signup" className="btn">No tengo cuenta. Registrarse</Link>
        </div>
      </section>
    </>
  )
}