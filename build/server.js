"use strict";

var _path = require("path");

var _express = _interopRequireDefault(require("express"));

var _socket = _interopRequireDefault(require("socket.io"));

var _morgan = _interopRequireDefault(require("morgan"));

var _helmet = _interopRequireDefault(require("helmet"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _socketController = _interopRequireDefault(require("./socketController"));

var _event = _interopRequireDefault(require("./event"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var PORT = process.env.PORT || 4000;
var app = (0, _express["default"])();
app.use((0, _helmet["default"])());
app.set("view engine", "pug");
app.set("views", (0, _path.join)(__dirname, "views"));
app.use((0, _morgan["default"])("dev"));
app.use(_express["default"]["static"]((0, _path.join)(__dirname, "static")));
app.get("/", function (req, res) {
  return res.render("home", {
    events: JSON.stringify(_event["default"])
  });
});

var handleListening = function handleListening() {
  return console.log("\u261E Server running: http://localhost:".concat(PORT));
};

var server = app.listen(PORT, handleListening);

var io = _socket["default"].listen(server);

io.on("connection", function (socket) {
  return (0, _socketController["default"])(socket, io);
});