"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _event = _interopRequireDefault(require("./event"));

var _words = require("./words");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var sockets = [];
var inProgress = false;
var word = null;
var painter = null;
var timeout = null;
var timeInterval = null;
var timeCount = null;

var choosePainter = function choosePainter() {
  return sockets[Math.floor(Math.random() * sockets.length)];
};

var socketController = function socketController(socket, io) {
  var broadcast = function broadcast(event, data) {
    return socket.broadcast.emit(event, data);
  };

  var superBroadcast = function superBroadcast(event, data) {
    return io.emit(event, data);
  };

  var sendPlayerUpdate = function sendPlayerUpdate() {
    return superBroadcast(_event["default"].playerUpdate, {
      sockets: sockets
    });
  };

  var startGame = function startGame() {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        painter = choosePainter();
        word = (0, _words.chooseWord)();
        superBroadcast(_event["default"].gameStarting);
        setTimeout(function () {
          superBroadcast(_event["default"].gameStarted);
          io.to(painter.id).emit(_event["default"].painterNotification, {
            word: word
          });
          timeout = setTimeout(function () {
            superBroadcast(_event["default"].newMsg, {
              message: "\uC2DC\uAC04\uC774 \uCD08\uACFC\uB418\uC5C8\uC2B5\uB2C8\uB2E4, \uC815\uB2F5\uC740 ".concat(word, "\uC785\uB2C8\uB2E4"),
              nickname: "서버"
            });
            endGame();
          }, 31000);
          timeCount = 30;
          timeInterval = setInterval(function () {
            superBroadcast(_event["default"].timeRefresh, {
              timeCount: timeCount
            });
            timeCount -= 1;
          }, 1000);
        }, 5000);
      }
    }
  };

  var endGame = function endGame() {
    inProgress = false;
    superBroadcast(_event["default"].gameEnded);

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    if (timeInterval !== null) {
      clearInterval(timeInterval);
      timeCount = 30;
    }

    setTimeout(function () {
      return startGame();
    }, 2000);
  };

  var addPoints = function addPoints(id) {
    sockets = sockets.map(function (socket) {
      if (socket.id === id) {
        socket.points += 10;
      }

      return socket;
    });
    sendPlayerUpdate();
    endGame();
  };

  socket.on(_event["default"].setNickname, function (_ref) {
    var nickname = _ref.nickname;
    socket.nickname = nickname;
    sockets.push({
      id: socket.id,
      points: 0,
      nickname: nickname
    });
    broadcast(_event["default"].newUser, {
      nickname: nickname
    });
    sendPlayerUpdate();
    startGame();
  });
  socket.on(_event["default"].disconnect, function () {
    sockets = sockets.filter(function (aSocket) {
      return aSocket.id !== socket.id;
    });

    if (sockets.length === 1) {
      endGame();
    } else if (painter) {
      if (painter.id === socket.id) {
        endGame();
      }
    }

    broadcast(_event["default"].disconnected, {
      nickname: socket.nickname
    });
    sendPlayerUpdate();
  });
  socket.on(_event["default"].sendMsg, function (_ref2) {
    var message = _ref2.message;
    broadcast(_event["default"].newMsg, {
      message: message,
      nickname: socket.nickname
    });

    if (message === word) {
      superBroadcast(_event["default"].newMsg, {
        message: "".concat(socket.nickname, "\uB2D8\uC774 \uC815\uB2F5\uC744 \uB9DE\uCDC4\uC2B5\uB2C8\uB2E4!, \uC815\uB2F5\uC740 ").concat(word, "\uC785\uB2C8\uB2E4"),
        nickname: "서버"
      });
      addPoints(socket.id);
    }
  });
  socket.on(_event["default"].beginPath, function (_ref3) {
    var x = _ref3.x,
        y = _ref3.y;
    return broadcast(_event["default"].beganPath, {
      x: x,
      y: y
    });
  });
  socket.on(_event["default"].strokePath, function (_ref4) {
    var x = _ref4.x,
        y = _ref4.y,
        color = _ref4.color;
    broadcast(_event["default"].strokedPath, {
      x: x,
      y: y,
      color: color
    });
  });
  socket.on(_event["default"].fill, function (_ref5) {
    var color = _ref5.color;
    broadcast(_event["default"].filled, {
      color: color
    });
  });
};

var _default = socketController;
exports["default"] = _default;