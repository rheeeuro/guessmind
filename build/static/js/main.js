"use strict";

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        throw new Error("Cannot find module '" + o + "'");
      }

      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function (e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, f, f.exports, e, t, n, r);
    }

    return n[o].exports;
  }

  var i = typeof require == "function" && require;

  for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }

  return s;
})({
  1: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.enableChat = exports.disableChat = exports.handleNewMessage = void 0;

    var _sockets = require("./sockets");

    var messages = document.getElementById("jsMessages");
    var sendMsg = document.getElementById("jsSendMsg");

    var appendMsg = function appendMsg(text, nickname) {
      var li = document.createElement("li");
      li.innerHTML = "<span class=\"author ".concat(nickname ? "out" : "self", "\">").concat(nickname ? nickname : "당신", ": </span> ").concat(text);
      messages.appendChild(li);
      var position = messages.scrollHeight;
      messages.scrollTop = position;
    };

    var handleSendMsg = function handleSendMsg(event) {
      event.preventDefault();
      var input = sendMsg.querySelector("input");
      var value = input.value;
      (0, _sockets.getSocket)().emit(window.events.sendMsg, {
        message: value
      });
      input.value = "";
      appendMsg(value);
    };

    var handleNewMessage = function handleNewMessage(_ref) {
      var message = _ref.message,
          nickname = _ref.nickname;
      appendMsg(message, nickname);
    };

    exports.handleNewMessage = handleNewMessage;

    if (sendMsg) {
      sendMsg.addEventListener("submit", handleSendMsg);
    }

    var disableChat = function disableChat() {
      return sendMsg.style.display = "none";
    };

    exports.disableChat = disableChat;

    var enableChat = function enableChat() {
      return sendMsg.style.display = "flex";
    };

    exports.enableChat = enableChat;
  }, {
    "./sockets": 7
  }],
  2: [function (require, module, exports) {
    "use strict";

    require("./login");

    require("./sockets");

    require("./chat");

    require("./paint");
  }, {
    "./chat": 1,
    "./login": 3,
    "./paint": 5,
    "./sockets": 7
  }],
  3: [function (require, module, exports) {
    "use strict";

    var _sockets = require("./sockets");

    var body = document.querySelector("body");
    var loginForm = document.getElementById("jsLogin");
    var NICKNAME = "nickname";
    var LOGGED_OUT = "loggedOut";
    var LOGGED_IN = "loggedIn";
    var nickname = localStorage.getItem(NICKNAME);

    var logIn = function logIn(nickname) {
      // eslint-disable-next-line no-undef
      var socket = io("/");
      socket.emit(window.events.setNickname, {
        nickname: nickname
      });
      (0, _sockets.initSockets)(socket);
    };

    if (nickname === null) {
      body.className = LOGGED_OUT;
    } else {
      body.className = LOGGED_IN;
      logIn(nickname);
    }

    var handleFormSubmit = function handleFormSubmit(e) {
      e.preventDefault();
      var input = loginForm.querySelector("input");
      var value = input.value;
      input.value = "";
      localStorage.setItem(NICKNAME, value);
      body.className = LOGGED_IN;
      logIn(value);
    };

    if (loginForm) {
      loginForm.addEventListener("submit", handleFormSubmit);
    }
  }, {
    "./sockets": 7
  }],
  4: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.handleDisconnected = exports.handleNewUser = void 0;
    var body = document.querySelector("body");

    var fireNotification = function fireNotification(text, color) {
      var notification = document.createElement("div");
      notification.innerText = text;
      notification.style.backgroundColor = color;
      notification.className = "notification";
      body.appendChild(notification);
    };

    var handleNewUser = function handleNewUser(_ref) {
      var nickname = _ref.nickname;
      return fireNotification("".concat(nickname, " \uB2D8\uC774 \uC785\uC7A5\uD558\uC600\uC2B5\uB2C8\uB2E4"), "rgb(0, 122, 255)");
    };

    exports.handleNewUser = handleNewUser;

    var handleDisconnected = function handleDisconnected(_ref2) {
      var nickname = _ref2.nickname;
      return fireNotification("".concat(nickname, " \uB2D8\uC774 \uD1F4\uC7A5\uD558\uC600\uC2B5\uB2C8\uB2E4"), "rgb(255, 149, 0)");
    };

    exports.handleDisconnected = handleDisconnected;
  }, {}],
  5: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetCanvas = exports.showControls = exports.hideControls = exports.enableCanvas = exports.disableCanvas = exports.handleFilled = exports.handleStrokedPath = exports.handleBeganPath = void 0;

    var _sockets = require("./sockets");

    var canvas = document.getElementById("jsCanvas");
    var controls = document.getElementById("jsControls");
    var ctx = canvas.getContext("2d");
    var colors = document.getElementsByClassName("jsColor");
    var mode = document.getElementById("jsMode");
    var clear = document.getElementById("jsClear");
    var INITIAL_COLOR = "#2c2c2c";
    var CANVAS_SIZE = 500;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = INITIAL_COLOR;
    ctx.fillStyle = INITIAL_COLOR;
    ctx.lineWidth = 2.5;
    var painting = false;
    var filling = false;

    var stopPainting = function stopPainting() {
      painting = false;
    };

    var startPainting = function startPainting() {
      painting = true;
    };

    var beginPath = function beginPath(x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    var strokePath = function strokePath(x, y) {
      var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var currentColor = ctx.strokeStyle;

      if (color != null) {
        ctx.strokeStyle = color;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.strokeStyle = currentColor;
    };

    var onMouseMove = function onMouseMove(event) {
      var x = event.offsetX;
      var y = event.offsetY;

      if (!painting) {
        beginPath(x, y);
        (0, _sockets.getSocket)().emit(window.events.beginPath, {
          x: x,
          y: y
        });
      } else {
        strokePath(x, y);
        (0, _sockets.getSocket)().emit(window.events.strokePath, {
          x: x,
          y: y,
          color: ctx.strokeStyle
        });
      }
    };

    var handleColorClick = function handleColorClick(event) {
      var color = event.target.style.backgroundColor;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    };

    var handleModeClick = function handleModeClick() {
      if (filling === true) {
        filling = false;
        mode.innerText = "채우기";
      } else {
        filling = true;
        mode.innerText = "그리기";
      }
    };

    var fill = function fill() {
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var currentColor = ctx.fillStyle;

      if (color !== null) {
        ctx.fillStyle = color;
      }

      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = currentColor;
    };

    function handleCanvasClick() {
      if (filling) {
        fill();
        (0, _sockets.getSocket)().emit(window.events.fill, {
          color: ctx.fillStyle
        });
      }
    }

    function handleCM(event) {
      event.preventDefault();
    }

    var handleClear = function handleClear() {
      fill("#fff");
      (0, _sockets.getSocket)().emit(window.events.fill, {
        color: "#fff"
      });
    };

    Array.from(colors).forEach(function (color) {
      return color.addEventListener("click", handleColorClick);
    });

    if (mode) {
      mode.addEventListener("click", handleModeClick);
    }

    if (clear) {
      clear.addEventListener("click", handleClear);
    }

    var handleBeganPath = function handleBeganPath(_ref) {
      var x = _ref.x,
          y = _ref.y;
      return beginPath(x, y);
    };

    exports.handleBeganPath = handleBeganPath;

    var handleStrokedPath = function handleStrokedPath(_ref2) {
      var x = _ref2.x,
          y = _ref2.y,
          color = _ref2.color;
      return strokePath(x, y, color);
    };

    exports.handleStrokedPath = handleStrokedPath;

    var handleFilled = function handleFilled(_ref3) {
      var color = _ref3.color;
      return fill(color);
    };

    exports.handleFilled = handleFilled;

    var disableCanvas = function disableCanvas() {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", startPainting);
      canvas.removeEventListener("mouseup", stopPainting);
      canvas.removeEventListener("mouseleave", stopPainting);
      canvas.removeEventListener("click", handleCanvasClick);
    };

    exports.disableCanvas = disableCanvas;

    var enableCanvas = function enableCanvas() {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mousedown", startPainting);
      canvas.addEventListener("mouseup", stopPainting);
      canvas.addEventListener("mouseleave", stopPainting);
      canvas.addEventListener("click", handleCanvasClick);
    };

    exports.enableCanvas = enableCanvas;

    var hideControls = function hideControls() {
      return controls.style.display = "none";
    };

    exports.hideControls = hideControls;

    var showControls = function showControls() {
      return controls.style.display = "flex";
    };

    exports.showControls = showControls;

    var resetCanvas = function resetCanvas() {
      return fill("#fff");
    };

    exports.resetCanvas = resetCanvas;

    if (canvas) {
      canvas.addEventListener("contextmenu", handleCM);
      hideControls();
    }
  }, {
    "./sockets": 7
  }],
  6: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.handleTimeRefresh = exports.handleGameStarting = exports.handleGameEnded = exports.handlePainterNotification = exports.handleGameStarted = exports.handlePlayerUpdate = void 0;

    var _paint = require("./paint");

    var _chat = require("./chat");

    var board = document.getElementById("jsPlayerBoard");
    var notifs = document.getElementById("jsNotifs");
    var timeNotif = document.getElementById("jsTimeNotif");

    var addPlayers = function addPlayers(players) {
      board.innerText = "";
      players.forEach(function (player) {
        var playerElement = document.createElement("span");
        playerElement.innerText = "".concat(player.nickname, ": ").concat(player.points);
        board.appendChild(playerElement);
      });
    };

    var setNotifs = function setNotifs(text) {
      notifs.innerText = "";
      notifs.innerText = text;
    };

    var handlePlayerUpdate = function handlePlayerUpdate(_ref) {
      var sockets = _ref.sockets;
      return addPlayers(sockets);
    };

    exports.handlePlayerUpdate = handlePlayerUpdate;

    var handleGameStarted = function handleGameStarted() {
      setNotifs("");
      (0, _paint.disableCanvas)();
      (0, _paint.hideControls)();
      (0, _chat.enableChat)();
    };

    exports.handleGameStarted = handleGameStarted;

    var handlePainterNotification = function handlePainterNotification(_ref2) {
      var word = _ref2.word;
      (0, _paint.enableCanvas)();
      (0, _paint.showControls)();
      (0, _chat.disableChat)();
      notifs.innerText = "\uB2F9\uC2E0\uC774 \uADF8\uB9B4 \uCC28\uB840\uC785\uB2C8\uB2E4! \uC81C\uC2DC\uC5B4: ".concat(word);
    };

    exports.handlePainterNotification = handlePainterNotification;

    var handleGameEnded = function handleGameEnded() {
      setNotifs("게임이 종료되었습니다");
      (0, _paint.disableCanvas)();
      (0, _paint.hideControls)();
      (0, _paint.resetCanvas)();
      timeNotif.innerText = "";
    };

    exports.handleGameEnded = handleGameEnded;

    var handleGameStarting = function handleGameStarting() {
      setNotifs("게임이 곧 시작됩니다!");
      timeNotif.innerText = "";
    };

    exports.handleGameStarting = handleGameStarting;

    var handleTimeRefresh = function handleTimeRefresh(_ref3) {
      var timeCount = _ref3.timeCount;
      timeNotif.innerText = "";
      timeNotif.innerText = " / \uB0A8\uC740 \uC2DC\uAC04: ".concat(timeCount, "\uCD08");
    };

    exports.handleTimeRefresh = handleTimeRefresh;
  }, {
    "./chat": 1,
    "./paint": 5
  }],
  7: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.initSockets = exports.getSocket = void 0;

    var _notifications = require("./notifications");

    var _chat = require("./chat");

    var _paint = require("./paint");

    var _players = require("./players");

    var socket = null;

    var getSocket = function getSocket() {
      return socket;
    };

    exports.getSocket = getSocket;

    var initSockets = function initSockets(newSocket) {
      var _window = window,
          events = _window.events;
      socket = newSocket;
      socket.on(events.newUser, _notifications.handleNewUser);
      socket.on(events.disconnected, _notifications.handleDisconnected);
      socket.on(events.newMsg, _chat.handleNewMessage);
      socket.on(events.beganPath, _paint.handleBeganPath);
      socket.on(events.strokedPath, _paint.handleStrokedPath);
      socket.on(events.filled, _paint.handleFilled);
      socket.on(events.playerUpdate, _players.handlePlayerUpdate);
      socket.on(events.gameStarted, _players.handleGameStarted);
      socket.on(events.painterNotification, _players.handlePainterNotification);
      socket.on(events.gameEnded, _players.handleGameEnded);
      socket.on(events.gameStarting, _players.handleGameStarting);
      socket.on(events.timeRefresh, _players.handleTimeRefresh);
    };

    exports.initSockets = initSockets;
  }, {
    "./chat": 1,
    "./notifications": 4,
    "./paint": 5,
    "./players": 6
  }]
}, {}, [2]);