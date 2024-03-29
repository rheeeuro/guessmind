import { join } from "path";
import express from "express";
import socketIO from "socket.io";
import logger from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import socketController from "./socketController";
import events from "./event";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "example.com"],
      },
    },
  })
);
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));
app.use(logger("dev"));
app.use(express.static(join(__dirname, "static")));
app.get("/", (req, res) =>
  res.render("home", { events: JSON.stringify(events) })
);

const handleListening = () =>
  console.log(`☞ Server running: http://localhost:${PORT}`);

const server = app.listen(PORT, handleListening);

const io = socketIO(server);

io.on("connection", (socket) => socketController(socket, io));
