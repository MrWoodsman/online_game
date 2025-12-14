const logger = require("../utils/logger");
const { connectedUsers } = require("../gameState");
const { brodcastOnlineCount } = require("../utils/socketFunctions");

module.exports = (io, socket) => {
  const sendWelcomeData = () => {
    // Sprawdzamy czy user istnieje
    if (!connectedUsers[socket.id]) return;

    // Przesyłanie danych jakie otrzymał
    socket.emit("after_connection", {
      status: "OK",
      userData: defaultUserData,
    });

    socket.emit("players_online", Object.values(connectedUsers).length);
  };

  // --- LOGIKA TWORZENIA USERA ---
  const defaultNickname = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

  const defaultUserData = {
    id: socket.id,
    nickname: defaultNickname,
    role: "PLAYER",
    status: "LOBBY",
    rooms: [],
    gameId: null,
  };

  // Dodanie użytkownika do puli wszystkich użytkowników
  connectedUsers[socket.id] = defaultUserData;

  sendWelcomeData();

  // Powiadomienie INNYCH ze liczba się zmieniła
  brodcastOnlineCount(io);

  // Logger w console
  logger.player(`Nowe połączenie: ${defaultNickname} - ${socket.id}`);

  socket.on("get_init_data", () => {
    // logger.player(`Gracz ${socket.id} poprosił o dane startowe`);
    sendWelcomeData();
  });
};
