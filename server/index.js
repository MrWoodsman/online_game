const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const logger = require("./utils/logger");
const socketHandler = require("./socketHandler");

const app = express();
app.use(cors());

const server = http.createServer(app);

// === 1. KONFIGURACJA SOCKET.IO ===
const io = new Server(server, {
  path: "/boardv2/socket.io",
  cors: {
    origin: ["https://mrwoodsman.pl", "http://localhost:5173"],
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
});

socketHandler(io);

// === 2. OBSŁUGA REACTA (PRODUKCJA) ===
const buildPath = path.join(__dirname, "dist");

// Tworzymy router dla podkatalogu
const boardRouter = express.Router();

// A. Pliki statyczne
boardRouter.use(express.static(buildPath));

// B. SPA Fallback (NAPRAWIONE DLA NOWEGO EXPRESSA)
// Zamiast "*", używamy Regexa: /(.*)/ - to oznacza "dopasuj cokolwiek"
boardRouter.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) {
      res
        .status(500)
        .send("Błąd: Nie znaleziono plików klienta. Zrób 'npm run build' w folderze client.");
    }
  });
});

// Podpinamy router
app.use("/boardv2", boardRouter);

// === 3. START SERWERA ===
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.sys(`SERWER URUCHOMIONY NA PORCIE ${PORT}`);
  logger.sys(`Aplikacja React dostępna pod adresem: http://localhost:${PORT}/boardv2`);
});
