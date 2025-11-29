const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const logger = require("./utils/logger");
const {createUniqueId} = require('./utils/idGenerator')

const app = express();
app.use(cors());

const server = http.createServer(app);

// Konfiguracja Socket.io z CORS (react porst 5173 rozmawia z serwerem na 3001)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// --- BAZA DANYCH W PAMIĘCI (RAM) ---

// -- KOLORY PIONKÓW ---
const AVILABLE_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

// --- WSZYSCY POŁACZENI GRACZE (STAN GLOBALNY) ---
const connectedUsers = {};

// --- WSZYSTKIE GRY ---
const games = {};

// Helper: tworzenie gracza w grze
const getNewGamePlayerState = (id, nickname) => ({
  id: id,
  nickname: nickname,
  color: "red",
  money: 1500,
  position: 0,
  isJailed: false,
  properties: [],
});

// Model Gry
const createGame = () => ({
  players: [],
  currentPlayerIndex: 0,
  status: "LOBBY",
});

// IO - SOCKET.IO
io.on("connection", (socket) => {
  // A. Rejestracja nowego połaczenia
  // Gdy ktoś wchodzi na stronę, dodajemy go jako "Gościa"
  const randomId = Math.floor(1000 + Math.random() * 9000); // Np. 4821
  const defaultNick = `Gość_${randomId}`;

  logger.player(`Nowe połączenie: ${defaultNick} - ${socket.id}`);

  connectedUsers[socket.id] = {
    id: socket.id,
    nickname: defaultNick,
    status: "LOBBY",
  };

  socket.emit("user_data", connectedUsers[socket.id]);
  socket.emit("rooms_data", Object.values(games));

  // Wysyłamy do wszystkich info o liczbie graczy online (opcjonalnie)
  io.emit("users_online", Object.values(connectedUsers).length);

  socket.on('create_game', () => {
    const newRoomId = createUniqueId(games)

    const newRoom = {
      id: newRoomId,
      name: `${connectedUsers[socket.id].nickname} room`,
      createdAt: Date.now(),
      owner: socket.id,
      players: [socket.id],
      maxPlayers: 4
    }

    games[newRoomId] = newRoom

    socket.join(newRoomId)
    connectedUsers[socket.id].status = "IN_ROOM"

    logger.room(`Stworzono pokoój o id: ${newRoomId}`)
    socket.emit("rooms_data", Object.values(games));
    return newRoom
  })

  // B. USTAWIANIE NICKU (Zanim wejdzie do gry)
  socket.on("set_nickname", (nickname) => {
    const user = connectedUsers[socket.id];

    if (!user || user.nickname === nickname) {
      return;
    }

    // Dopiero jeśli faktycznie się zmienił, logujemy i zapisujemy
    const oldNick = user.nickname;
    user.nickname = nickname;

    // Opcjonalnie: loguj zmianę tylko jeśli stary nick nie był "defaultowy" (zależnie jak wolisz)
    logger.player(`Gracz zmienił nick: ${oldNick} -> ${nickname}`);
  });

  // C. DOŁĄCZANIE DO POKOJU
  socket.on("join_room", ({ room }) => {
    // Pobieranie nicku z globalnego stanu (bo użytkownik ustawia go wcześniej)
    const user = connectedUsers[socket.id];
    if (!user) return; // Zabezpieczenie

    if (!games[room]) {
      games[room] = createGame();
      logger.room(`Stworzono pokój: ${room}`);
    }

    const game = games[room];

    // Walidacje
    if (game.status === "PLAYING") {
      socket.emit("error_message", "Gra już trwa!");
      return;
    }
    if (game.players.length >= 4) {
      socket.emit("error_message", "Pokój jest pełny!");
      return;
    }
    const alreadyInGame = game.players.find((p) => p.id === socket.id);
    if (alreadyInGame) return;

    // Logika gry
    const newGamePlayer = getNewGamePlayerState(socket.id, user.nickname);

    game.players.push(newGamePlayer);
    socket.join(room);

    connectedUsers[socket.id].status = "IN_ROOM";

    io.to(room).emit("room_data", {
      players: game.players,
      room: room,
    });
  });

  // D. ROZŁACZENIE
  socket.on("disconnect", () => {
    logger.player(`Rozłączono: ${socket.id}`);

    // Usuniecie z globalnej listy
    delete connectedUsers[socket.id];
    io.emit("users_online", Object.values(connectedUsers).length);

    // Usun z pokoju jeśli był
    for (const roomId in games) {
      const game = games[roomId];
      const playerIndex = game.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);

        // Jeśli gra trwa, to jest problem (rage quit), ale na MVP po prostu usuwamy
        io.to(roomId).emit("room_data", {
          players: game.players,
          room: roomId,
        });

        if (game.players.length === 0) {
          delete games[roomId];
        }
        break;
      }
    }
  });
});

server.listen(3001, () => {
  logger.sys("SERWER URUCHOMIONY NA PORCIE 3001");
});
