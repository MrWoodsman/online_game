const logger = require("../utils/logger");
const {
  connectedUsers,
  games,
  createGame,
  createPlayerInGame,
  AVILABLE_COLORS,
} = require("../gameState");
const { createUniqueId } = require("../utils/idGenerator");
const { brodcastUsersUpdateToAdmin } = require("../utils/socketFunctions");

const initDummyGames = () => {
  for (let i = 0; i < 2; i++) {
    const roomId = createUniqueId(games);
    const newGame = createGame();
    newGame.id = roomId;
    newGame.ownerId = "SYSTEM_TEST"; // Użyj specjalnego ID
    newGame.name = `${connectedUsers[newGame.ownerId]?.nickname}'s room`;
    newGame.maxPlayers = 4;

    // Dodajemy do bazy
    games[roomId] = newGame;

    logger.room(`[SYSTEM] Utworzono dummy room: ${roomId}`);
  }
};

initDummyGames();

module.exports = (io, socket) => {
  // === POBIERANIE WSZYSTKICH POKOI ===
  socket.on("games_get_all", (callback) => {
    if (callback) {
      callback({
        status: "ok",
        games: games,
      });
    }
  });

  // === DOŁACZANIE DO POKOIU ===
  socket.on("games_join", (roomToJoin, callback) => {
    const userData = connectedUsers[socket.id];
    const gameData = games[roomToJoin];

    if (!callback) {
      logger.error("Brak calback w emit('games_join')");
      return;
    }

    if (!userData) {
      logger.error(`Błąd dołączania pokoju brak danych użytkownika ${socket.id}`);
      callback({
        status: "bad",
        msg: "Błąd danych użytkownika",
      });
      return;
    }

    if (!gameData) {
      callback({
        status: "bad",
        msg: "Nie znaleziono takiej gry",
      });
      logger.error(`Błąd dołączania pokoju brak danych gry ${roomToJoin}`);
      return;
    }

    if (gameData.players.length >= gameData.maxPlayers) {
      callback({
        status: "bad",
        msg: "Gra jest pełna",
      });
      logger.player(
        `Próba dołączenia do pełnego pokoju ${roomToJoin} | ${userData.nickname} - ${socket.id}`
      );
      return;
    }

    socket.join(roomToJoin);

    // Sprawdzanie czy juz przypadkiem nie ma go w tym pokoj
    if (!userData.rooms.includes(roomToJoin)) {
      userData.rooms.push(roomToJoin);
    }

    userData.gameId = roomToJoin;

    // Dodawanie gracza do pokoju ze sprawdzeniem
    const alreadyInGame = gameData.players.some((player) => player.id == socket.id);

    if (!alreadyInGame) {
      // 2. Generowanie bazowego obiektu gracza
      const newPlayer = createPlayerInGame(socket.id, userData.nickname);
      // 3. Przydzielanie koloru
      const usedColors = gameData.players.map((p) => p.color);
      // Wybieramy pierwszy dostępny kolor
      const assignedColor = AVILABLE_COLORS.find((c) => !usedColors.includes(c));
      // Przypisanie koloru dla gracza
      newPlayer.color = assignedColor;
      // 4. Dodajemy pełen obiekt do tablicy
      gameData.players.push(newPlayer);
    }

    callback({
      status: "ok",
      room: gameData,
    });

    // = INFORMOWANIE INNYCH W POKOJU =
    io.to(roomToJoin).emit("game_room_update", gameData);
    // = INFORMOWANIE INNYCH POZA POKOJEM =
    io.emit("games_list_update", games);
    // = LOG =
    logger.player(`Dołączono do pokoju ${roomToJoin} | ${userData.nickname} - ${socket.id}`);
    // = UPDATE ADMIN =
    brodcastUsersUpdateToAdmin(io);
  });

  // === OPUSZCZANIE POKOJU
  socket.on("games_quit", (callback) => {
    const userData = connectedUsers[socket.id];
    const roomToQuit = games[userData.gameId];
    // Sprawdzanie danych
    if (!userData) {
      logger.error(`Błąd dołączania pokoju brak danych użytkownika ${socket.id}`);
      callback({
        status: "bad",
        msg: "Błąd danych użytkownika",
      });
      return;
    }
    // Sprawdzanie danych
    if (!roomToQuit) {
      logger.error(`Błąd nie znaleziono pokoju do opuszczenia ${userData.nickname} - ${socket.id}`);
      callback({
        status: "bad",
        msg: "Błąd danych o pokoju do opuszczenia",
      });
      return;
    }

    // 1. Usuwanie użytkownika z pokoju
    roomToQuit.players = roomToQuit.players.filter((p) => p.id !== socket.id);
    // 2. Sprawdzanie czy pokoj jest pusty
    if (roomToQuit.players.length == 0) {
      delete games[roomToQuit.id];
    } else {
      // 3. Jeśli wyszedł HOST przekaz korone komus innemu
      if (roomToQuit.ownerId == socket.id) {
        roomToQuit.ownerId = roomToQuit.players[0].id;
      }
      // 4. Wysłanie info do innych w pokoju
      io.to(roomToQuit.id).emit("game_room_update", roomToQuit);
      // 5. Wysłanie do wszystkich z lobby
      io.emit("games_list_update", roomToQuit);
    }

    callback({
      status: "ok",
      msg: `Pomyślnie opuszczono pokój ${roomToQuit.id}`,
      room: roomToQuit,
    });

    // // = INFORMOWANIE INNYCH W POKOJU =
    // io.to(roomToJoin).emit("game_room_update", gameData);
    // // = INFORMOWANIE INNYCH POZA POKOJEM =
    // io.emit("games_list_update", games);
    // = LOG =
    logger.room(`${userData.nickname} - ${socket.id} opuszcza pokój ${roomToQuit.id}`);
    // = UPDATE ADMIN =
    brodcastUsersUpdateToAdmin(io);
  });

  // === TWORZENIE POKOJU ===
  socket.on("games_create", (data, callback) => {
    const userData = connectedUsers[socket.id];

    if (!callback) {
      logger.error("Brak calback w emit('games_create')");
      return;
    }

    if (!userData) {
      logger.error(`Błąd tworzenia pokoju brak danych użytkownika ${socket.id}`);
      callback({
        status: "bad",
        msg: "Błąd danych użytkownika",
      });
      return;
    }

    const roomId = createUniqueId(games);
    const newGame = createGame();
    newGame.id = roomId;
    newGame.ownerId = socket.id; // Użyj specjalnego ID
    newGame.name = `${connectedUsers[newGame.ownerId]?.nickname}'s room`;
    newGame.maxPlayers = 4;

    // Dodajemy do bazy
    games[roomId] = newGame;

    callback({
      status: "ok",
      msg: `Pomyślnie utworzono pokój o id: ${roomId}`,
      room: games[roomId],
    });

    // = INFORMOWANIE INNYCH POZA POKOJEM =
    io.emit("games_list_update", games);
    // = LOG =
    logger.room(`Utworzono pokój: ${roomId} / Właściciel ${userData?.nickname} - ${socket.id}`);
    // = UPDATE ADMIN =
    brodcastUsersUpdateToAdmin(io);
  });

  socket.on("check_room_access", (roomId, callback) => {
    const game = games[roomId];
    // Jeśli gry nie ma LUB gracza nie ma na liście tej gry -> return false
    if (!game || !game.players.some((p) => p.id === socket.id)) {
      callback({
        access: false,
        game: game,
      });
      logger.room(
        `Sprawdzanie czy ${connectedUsers[socket.id].nickname} - ${
          socket.id
        } może być w ${roomId} | ${false}`
      );
    } else {
      callback({
        access: true,
        game: game,
      });
      logger.room(
        `Sprawdzanie czy ${connectedUsers[socket.id].nickname} - ${
          socket.id
        } może być w ${roomId} | ${true}`
      );
    }
  });
};
