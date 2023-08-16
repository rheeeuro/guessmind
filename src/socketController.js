import events from "./event";
import { chooseWord } from "./words";

let sockets = [];
let inProgress = false;
let word = null;
let painter = null;
let timeout = null;
let timeInterval = null;
let timeCount = null;

const choosePainter = () => sockets[Math.floor(Math.random() * sockets.length)];

const socketController = (socket, io) => {
  const broadcast = (event, data) => socket.broadcast.emit(event, data);
  const superBroadcast = (event, data) => io.emit(event, data);
  const sendPlayerUpdate = () =>
    superBroadcast(events.playerUpdate, { sockets });
  const startGame = () => {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        painter = choosePainter();
        word = chooseWord();
        superBroadcast(events.gameStarting);
        setTimeout(() => {
          superBroadcast(events.gameStarted);
          io.to(painter.id).emit(events.painterNotification, { word });
          timeout = setTimeout(() => {
            superBroadcast(events.newMsg, {
              message: `시간이 초과되었습니다, 정답은 ${word}입니다`,
              nickname: "서버"
            });
            endGame();
          }, 31000);
          timeCount = 45;
          timeInterval = setInterval(() => {
            superBroadcast(events.timeRefresh, { timeCount });
            timeCount -= 1;
          }, 1000);
        }, 5000);
      }
    }
  };
  const endGame = () => {
    inProgress = false;
    superBroadcast(events.gameEnded);
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    if (timeInterval !== null) {
      clearInterval(timeInterval);
      timeCount = 45;
    }
    setTimeout(() => startGame(), 2000);
  };
  const addPoints = id => {
    sockets = sockets.map(socket => {
      if (socket.id === id) {
        socket.points += 10;
      }
      return socket;
    });
    sendPlayerUpdate();
    endGame();
  };

  socket.on(events.setNickname, ({ nickname }) => {
    socket.nickname = nickname;
    sockets.push({ id: socket.id, points: 0, nickname: nickname });
    broadcast(events.newUser, { nickname });
    sendPlayerUpdate();
    startGame();
  });

  socket.on(events.disconnect, () => {
    sockets = sockets.filter(aSocket => aSocket.id !== socket.id);
    if (sockets.length === 1) {
      endGame();
    } else if (painter) {
      if (painter.id === socket.id) {
        endGame();
      }
    }
    broadcast(events.disconnected, { nickname: socket.nickname });
    sendPlayerUpdate();
  });

  socket.on(events.sendMsg, ({ message }) => {
    broadcast(events.newMsg, { message, nickname: socket.nickname });
    if (message === word) {
      superBroadcast(events.newMsg, {
        message: `${socket.nickname}님이 정답을 맞췄습니다!, 정답은 ${word}입니다`,
        nickname: "서버"
      });
      addPoints(socket.id);
    }
  });

  socket.on(events.beginPath, ({ x, y }) =>
    broadcast(events.beganPath, { x, y })
  );

  socket.on(events.strokePath, ({ x, y, color }) => {
    broadcast(events.strokedPath, { x, y, color });
  });

  socket.on(events.fill, ({ color }) => {
    broadcast(events.filled, { color });
  });
};

export default socketController;
