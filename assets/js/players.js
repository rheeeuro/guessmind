import {
  disableCanvas,
  hideControls,
  enableCanvas,
  showControls,
  resetCanvas
} from "./paint";
import { disableChat, enableChat } from "./chat";

const board = document.getElementById("jsPlayerBoard");
const notifs = document.getElementById("jsNotifs");

const addPlayers = players => {
  board.innerText = "";
  players.forEach(player => {
    const playerElement = document.createElement("span");
    playerElement.innerText = `${player.nickname}: ${player.points}`;
    board.appendChild(playerElement);
  });
};
const setNotifs = text => {
  notifs.innerText = "";
  notifs.innerText = text;
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);
export const handleGameStarted = () => {
  setNotifs("");
  disableCanvas();
  hideControls();
  enableChat();
};
export const handlePainterNotification = ({ word }) => {
  enableCanvas();
  showControls();
  disableChat();
  notifs.innerText = `당신이 그릴 차례입니다! 제시어: ${word}`;
};
export const handleGameEnded = () => {
  setNotifs("게임이 종료되었습니다");
  disableCanvas();
  hideControls();
  resetCanvas();
};
export const handleGameStarting = () => {
  setNotifs("게임이 곧 시작됩니다!");
};
