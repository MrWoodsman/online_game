const logger = require("../utils/logger");
const { connectedUsers } = require("../gameState");
const { brodcastOnlineCount } = require("../utils/socketFunctions");

module.exports = (io, socket) => {
  socket.on("disconnect", () => {
    const playerData = connectedUsers[socket.id];

    if (!playerData) {
      console.error("Błąd usuwania 1");
      return;
    }

    // Jeśli jest w jakieś grze trzeba go też z tej gry usunąć
    if (playerData.gameId) {
      // TODO rozroznienie w jakiej fazie jest gra bo myśle ze jesli juz trwa to mozna go zostawic ale np ze statusem offline zeby zostały dane pieniadze itp, ewentualnie dodać potem funkcjonalność powracania
    }

    // Usuwanie z puli wszystkich użytkowników
    delete connectedUsers[socket.id];

    // Informowanie wszystkich o ilości online
    brodcastOnlineCount(io);

    // Logger w console
    logger.player(`Rozłączono: ${playerData.nickname} - ${socket.id}`);
  });
};
