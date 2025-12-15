const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const logger = require("./utils/logger");
const socketHandler = require("./socketHandler");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Konfiguracja Socket.io z CORS (react porst 5173 rozmawia z serwerem na 3001)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Podłączamy handler (przeniesiona logika Socket.IO)
socketHandler(io);

server.listen(3001, () => {
  logger.sys("SERWER URUCHOMIONY NA PORCIE 3001");
});
