const logger = require("../utils/logger");
const { connectedUsers } = require("../gameState");
const { brodcastOnlineCount } = require("../utils/socketFunctions");
const ADMIN_PIN = process.env.ADMIN_PIN || "0000";

module.exports = (io, socket) => {
  // === LOGOWANIE ADMINA ===
  socket.on("admin_login", (inputPin, callback) => {
    if (inputPin === ADMIN_PIN) {
      // Oznaczamy to połączenie jako "Administrator"
      socket.isAdmin = true;
      connectedUsers[socket.id].role = "ADMIN";

      logger.admin(
        `${connectedUsers[socket.id]?.nickname} - ${socket.id} zalogował się jako ADMIN.`
      );
      callback({ status: "ok", msg: "Zalogowano pomyślnie" });
    } else {
      callback({ status: "bad", msg: "Błędny PIN" });
    }
  });
};
