const logger = require("../utils/logger");
const { connectedUsers, games } = require("../gameState");
const { brodcastOnlineCount, brodcastUsersUpdateToAdmin } = require("../utils/socketFunctions");

module.exports = (io, socket) => {
  socket.on("disconnect", () => {
    const playerData = connectedUsers[socket.id];

    if (!playerData) {
      console.error("Błąd usuwania 1");
      return;
    }

    // Jeśli jest w jakieś grze trzeba go też z tej gry usunąć
    if (playerData.gameId) {
      const gameId = playerData.gameId;
      const game = games[gameId];

      if (!game) return;

      // USUWANIE ZALEZNIE OD STANU GRY
      if (game.status == "LOBBY") {
        // 1. Usuwanie gracza z listy
        // TODO ZMIENIC NA p.id jesli przerobie jak jest użytkoiwnik w grze trzymany
        game.players = game.players.filter((p) => p.id !== socket.id);
        // 2. Sprawdzanie czy pokoj nie jest pusty
        if (game.players.length == 0) {
          delete games[gameId];
          io.emit("games_list_update", games);
        } else {
          // 3. Jeśli wyszedł HOST przekaz korone komuś innemu
          if (game.ownerId == socket.id) {
            game.ownerId = game.players[0].id;
          }
          // 4. Wyśłanie info do innych w pokoju
          io.to(gameId).emit("game_room_update", game);
          // 5. Wysłanie do wszystkich z lobby
          io.emit("games_list_update", games);
        }
      } else if (game.status == "PLAYING") {
        const palyerInGame = game.players.find((p) => p.id == socket.id);
        if (palyerInGame) {
          // Ustawiwanie statusu jako rozłączny / do wprowadzenia możliwość powrotu
          palyerInGame.isConnected = false;
          // Update dal graczy w pokoju
          io.to(gameId).emit("game_room_update", game);
          // LOG
          logger.game(
            `Gracz ${playerData.nickname} - ${socket.id} rozłączył się w trakcie gry ${gameId}`
          );
        }
      }
    }

    // == STANDARDOWE USUWANIE Z LISTY OSÓB ==
    // 1.Usuwanie z puli wszystkich użytkowników
    delete connectedUsers[socket.id];

    // 2.Informowanie wszystkich o ilości online
    brodcastOnlineCount(io);
    brodcastUsersUpdateToAdmin(io);
    // Logger w console
    logger.player(`Rozłączono: ${playerData.nickname} - ${socket.id}`);
  });
};
