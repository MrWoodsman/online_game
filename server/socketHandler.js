const logger = require("./utils/logger");
const { createUniqueId } = require("./utils/idGenerator");
const {
  connectedUsers,
  games,
  getNewGamePlayerState,
  createGame,
} = require("./gameState");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // A. Rejestracja nowego połaczenia
    const randomId = Math.floor(1000 + Math.random() * 9000);
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

    socket.on("create_game", () => {
      const newRoomId = createUniqueId(games);

      const newRoom = {
        id: newRoomId,
        name: `${connectedUsers[socket.id].nickname} room`,
        createdAt: Date.now(),
        owner: socket.id,
        players: [socket.id],
        maxPlayers: 4,
      };

      games[newRoomId] = newRoom;

      socket.join(newRoomId);
      connectedUsers[socket.id].status = "IN_ROOM";

      logger.room(`Stworzono pokoój o id: ${newRoomId}`);
      socket.emit("rooms_data", Object.values(games));
      return newRoom;
    });

    // B. USTAWIANIE NICKU (Zanim wejdzie do gry)
    socket.on("set_nickname", (nickname) => {
      const user = connectedUsers[socket.id];

      if (!user || user.nickname === nickname) {
        return;
      }

      const oldNick = user.nickname;
      user.nickname = nickname;

      logger.player(`Gracz zmienił nick: ${oldNick} -> ${nickname}`);
    });

    // C. DOŁĄCZANIE DO POKOJU
    socket.on("join_room", ({ room }) => {
      const user = connectedUsers[socket.id];
      if (!user) return;

      if (!games[room]) {
        games[room] = createGame();
        logger.room(`Stworzono pokój: ${room}`);
      }

      const game = games[room];

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

      delete connectedUsers[socket.id];
      io.emit("users_online", Object.values(connectedUsers).length);

      for (const roomId in games) {
        const game = games[roomId];
        const playerIndex = game.players.findIndex((p) => p.id === socket.id);

        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);

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
};
