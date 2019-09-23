import { handleNewUser, handleDisconnected } from "./notifications";

let socket = null;

export const getSocket = () => socket;
export const updateSocket = newSocket => (socket = newSocket);

export const initSockets = newSocket => {
  const { events } = window;
  updateSocket(newSocket);
  newSocket.on(events.newUser, handleNewUser);
  newSocket.on(events.disconnected, handleDisconnected);
};
