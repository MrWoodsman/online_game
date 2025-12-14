const logger = require("../utils/logger");
const { connectedUsers, games } = require("../gameState");
const { brodcastUsersUpdateToAdmin } = require("../utils/socketFunctions");

module.exports = (io, socket) => {
  // --- Użytkownicy ---
  // Wysyłanie wszystkich użytkowników połączonych
  socket.on("admin_get_all", (callback) => {
    if (callback) {
      callback({
        users: connectedUsers,
        rooms: games,
      });
    }
  });

  // --- Użytkownik ---
  // Zmiana statusu użtkownika
  socket.on("user_update_status", (status) => {
    const userData = connectedUsers[socket.id];

    userData.status = status;
    brodcastUsersUpdateToAdmin(io);

    logger.player(`${userData.nickname} - ${socket.id} zmiana statusu na: ${status}`);
  });

  // Dołączanie do pokoju
  socket.on("user_join_room", (roomToJoin) => {
    const userData = connectedUsers[socket.id];

    socket.join(roomToJoin);

    if (!userData.rooms.includes(roomToJoin)) {
      userData.rooms.push(roomToJoin);
    }

    brodcastUsersUpdateToAdmin(io);

    logger.player(`${userData.nickname} - ${socket.id} dołącza do pokoju: ${roomToJoin}`);
  });

  // Zmiana nickname dla użytkownika
  socket.on("user_set_nickname", (newNickname, callback) => {
    const userData = connectedUsers[socket.id];
    if (!userData) return;

    const lastNickname = userData.nickname;

    if (userData.nickname == newNickname) return;

    userData.nickname = newNickname;

    logger.player(`Zmiana nickname: ${socket.id} | ${lastNickname} -> ${newNickname}`);

    // Update admin
    brodcastUsersUpdateToAdmin(io);

    if (callback) {
      callback({
        status: "ok",
      });
    }
  });
};
