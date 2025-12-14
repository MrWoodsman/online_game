const { connectedUsers, games } = require("../gameState");

const brodcastOnlineCount = (io) => {
  const count = Object.values(connectedUsers).length;
  io.emit("players_online", count);
};

const brodcastUsersUpdateToAdmin = (io) => {
  io.to("ADMIN_ROOM").emit("users_all_data", {
    users: connectedUsers,
    rooms: games,
  });
};

module.exports = { brodcastOnlineCount, brodcastUsersUpdateToAdmin };
