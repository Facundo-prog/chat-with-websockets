/* eslint-disable react/prop-types */

import { createContext } from "react";
import io from "socket.io-client";

export const WebsocketContext = createContext();

export function WebsocketProvider({ children }) {
  const socket = io();

  return (
    <WebsocketContext.Provider value={socket}>
      {children}
    </WebsocketContext.Provider>
  );
}