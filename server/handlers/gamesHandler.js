const logger = require("../utils/logger");
const { connectedUsers, games, createGame } = require("../gameState");
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

module.exports = (io, socket) => {};
