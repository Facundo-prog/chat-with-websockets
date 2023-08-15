import { useRef, useContext, useEffect } from "react";

import { WebsocketContext } from "../providers/Websocket";
import chatIcon from "../icons/chatIcon.png";

export default function Home() {
  const socket = useContext(WebsocketContext);
  const userMessage = useRef();
  const messageToSend = useRef();
  const chat = useRef();
  const usersConnected = useRef();
  const containerUsersConnected = useRef();


  useEffect(() => {
    socket.on('connect', async () => {
      const cookies = getCookies();
      const token = cookies?.webchat_user;
      if(token) socket.emit('getUser', token);
    });
    
    socket.on('getUser', data => {
      if(data.error){
        document.cookie = 'webchat_user=; path=/; max-age=0;';
        sessionStorage.removeItem("username");
        location.href = "/signin";
      }
      sessionStorage.setItem("username", data.username);
      socket.emit('getMessages', data.token);
    });
    
    socket.on('newMessage', data => {
      if(data.error) return setUserMessage(data.error, true);
      showNewMessage(data);
    });
    
    
    socket.on('getMessages', data => {
      if(data.error) return setUserMessage(data.error, true);
      showChatsHistory(data);
    });
  
  
    socket.on('usersConnected', sockets => {
      const users = usersConnected.current;
      const keys = Object.keys(sockets);
    
      users.innerHTML = "";
    
      keys.forEach(key => {
        users.innerHTML += `
          <div>
            <div class="img" style="background-image:url(${sockets[key]?.image});"></div>
            <p>${sockets[key]?.username}</p>
          </div>
        `;
      });
    
      containerUsersConnected.current.style.backgroundColor = "#4cb848";
      containerUsersConnected.current.style.maxHeight = "800px";
    
      setTimeout(() => {
        containerUsersConnected.current.style = "";
      }, 2000);
    });

    return () => {
      socket.off('connect');
      socket.off('getUser');
      socket.off('usersConnected');
      socket.off('newMessage');
      socket.off('getMessages');
    }

  }, [socket]);

  
  function handleSendMessage() {
    const message = messageToSend.current;
    if(message.value.length <= 0) return;
  
    const date = new Date();
    const formattedDate = `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }`;
    const cookies = getCookies();

    socket.emit('sendMessage', {
      token: cookies.webchat_user ?? "",
      message: message.value,
      date: formattedDate,
    });
  
    message.value = "";
    userMessage.textContent = "Enviando...";
  }


  function showNewMessage({ username, message, date, image }){
    const user = sessionStorage.getItem("username") ?? "";
    const fragment = document.createRange().createContextualFragment(
      `
        <div class="${ username === user ? 'message userSentItMessage' : 'message' }">
          <div class="image-container" style="background-image: url(${ image });"></div>
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
    
    chat.current.append(fragment);
    chat.current.scrollTo(0, chat.current.scrollHeight);
    setUserMessage("");
  }
  

  function showChatsHistory(chats){
    const user = sessionStorage.getItem("username") ?? "";
    let HTMLString = "";
  
    chats.forEach(element => {
      HTMLString += `
        <div class="${ element.user.username === user ? 'message userSentItMessage' : 'message' }">
          <div class="image-container" style="background-image: url(${ element.user.image });"></div>
          <div class="message-body">
            <div class="user-info">
              <span class="username">${element.user.username}</span>
              <span class="time">${element.date}</span>
            </div>
            <p>${element.message}</p>
          </div>
        </div>
      `
    });
    
    setUserMessage("");

    if(HTMLString.length <= 0) return setUserMessage("No hay chats almacenados", true);
  
    const fragment = document.createRange().createContextualFragment(HTMLString);
    chat.current.textContent = "";
    chat.current.append(fragment);
  
    setTimeout(() => {
      chat.current.scrollTo(0, chat.current.scrollHeight);
    }, 10);
  }


  function getCookies(){
    const array = document.cookie.split(';');
    const cookies = {};
  
    for(let cookie of array){
      const filter = cookie.split('=');
      const name = filter[0].trim();
      cookies[name] = filter[1];
    }
    return cookies;
  }

  function handleLogout(){
    document.cookie = 'webchat_user=; path=/; max-age=0;';
    sessionStorage.removeItem("username");
    location.href = "/signin";
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

        <div className="chatInformation">
          <div className="containerUsersConnected" ref={containerUsersConnected}>
            <p>Usuarios</p>
            <div className="listUsersConnected" ref={usersConnected}></div>
          </div>
          <button className="btn" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <section className="home">
        <p className="userMessage" ref={userMessage}>Cargando...</p>
      
        <div className="all-messages" ref={chat}></div>

        <div className="send-message">
          <input type="text" ref={messageToSend} />
          <button type="button" onClick={handleSendMessage} className="btn secondary">Enviar</button>
        </div>
      </section>
    </>
  )
}