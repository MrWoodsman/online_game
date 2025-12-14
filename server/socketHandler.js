// const logger = require("./utils/logger");
// const { createUniqueId } = require("./utils/idGenerator");
// const { connectedUsers, games, getNewGamePlayerState, createGame } = require("./gameState");
// Handlers
const disconnectHandler = require("./handlers/disconnectHandler");
const connectionHandler = require("./handlers/connectionHandler");
const usersHandler = require("./handlers/usersHandler");
const gamesHandler = require("./handlers/gamesHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    connectionHandler(io, socket);
    disconnectHandler(io, socket);
    usersHandler(io, socket);
    gamesHandler(io, socket);
  });
};

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     // A. Rejestracja nowego połaczenia
//     const randomId = Math.floor(1000 + Math.random() * 9000);
//     const defaultNick = `Gość_${randomId}`;

//     logger.player(`Nowe połączenie: ${defaultNick} - ${socket.id}`);

//     connectedUsers[socket.id] = {
//       id: socket.id,
//       nickname: defaultNick,
//       status: "LOBBY",
//     };

//     socket.emit("user_data", connectedUsers[socket.id]);
//     socket.emit("rooms_data", Object.values(games));

//     // Wysyłamy do wszystkich info o liczbie graczy online (opcjonalnie)
//     io.emit("users_online", Object.values(connectedUsers).length);

//     socket.on("create_game", (callback) => {
//       const newRoomId = createUniqueId(games);

//       const newRoom = {
//         id: newRoomId,
//         name: `${connectedUsers[socket.id].nickname} room`,
//         createdAt: Date.now(),
//         owner: socket.id,
//         players: [],
//         maxPlayers: 4,
//       };

//       games[newRoomId] = newRoom;

//       socket.join(newRoomId);
//       connectedUsers[socket.id].status = "IN_ROOM";

//       logger.room(`Stworzono pokoój o id: ${newRoomId}`);
//       socket.emit("rooms_data", Object.values(games));

//       callback({
//         status: "ok",
//         roomId: newRoomId,
//       });
//     });

//     // B. USTAWIANIE NICKU (Zanim wejdzie do gry)
//     socket.on("set_nickname", (nickname) => {
//       const user = connectedUsers[socket.id];

//       if (!user || user.nickname === nickname) {
//         return;
//       }

//       const oldNick = user.nickname;
//       user.nickname = nickname;

//       logger.player(`Gracz zmienił nick: ${oldNick} -> ${nickname}`);
//     });

//     // C. DOŁĄCZANIE DO POKOJU
//     socket.on("join_room", ({ room }, callback) => {
//       const user = connectedUsers[socket.id];
//       if (!user) return;

//       // console.log(games);

//       if (!games[room]) {
//         games[room] = createGame();
//         logger.room(`Stworzono pokój: ${room}`);
//       }

//       const game = games[room];

//       if (game.status === "PLAYING") {
//         socket.emit("error_message", "Gra już trwa!");
//         return;
//       }
//       if (game.players.length >= 4) {
//         socket.emit("error_message", "Pokój jest pełny!");
//         return;
//       }
//       const alreadyInGame = game.players.find((p) => p.id === socket.id);
//       if (alreadyInGame) return;

//       const newGamePlayer = getNewGamePlayerState(socket.id, user.nickname);

//       game.players.push(socket.id);
//       socket.join(room);

//       connectedUsers[socket.id].status = "IN_ROOM";
//       connectedUsers[socket.id].room = room;

//       // console.log(games);

//       logger.game;

//       callback({
//         status: "ok",
//         gameData: game,
//       });

//       socket.emit("rooms_data", Object.values(games));

//       io.to(room).emit("room_data", {
//         players: game.players,
//         room: room,
//       });
//     });

//     // D. ROZŁACZENIE
//     socket.on("disconnect", () => {
//       logger.player(`Rozłączono: ${socket.id}`);

//       // 1. Najpierw pobierz ID pokoju, w którym był gracz
//       const roomId = connectedUsers[socket.id];

//       // 2. Usuń gracza z ogólnej listy online
//       delete connectedUsers[socket.id];
//       io.emit("users_online", Object.values(connectedUsers).length);

//       // 3. Jeśli gracz nie był w żadnym pokoju (był w lobby), kończymy
//       if (!roomId) return;

//       // 4. Pobierz obiekt pokoju z bazy gier
//       const room = games[roomId];

//       if (room) {
//         // --- USUWANIE GRACZA ---

//         // METODA A: Filter (Stwórz nową tablicę bez tego ID) - najczytelniejsza
//         room.players = room.players.filter((id) => id !== socket.id);

//         // LUB METODA B: Splice (Modyfikuj istniejącą) - wydajniejsza
//         /*
//         const index = room.players.indexOf(socket.id);
//         if (index !== -1) {
//             room.players.splice(index, 1);
//         }
//         */

//         // --- OBSŁUGA PUSTEGO POKOJU ---
//         if (room.players.length === 0) {
//           // Jeśli nikogo nie ma, usuwamy pokój, żeby nie śmiecić w pamięci
//           logger.room(`Usuwanie pustego pokoju: ${roomId}`);
//           delete games[roomId];
//         } else {
//           // --- POWIADOMIENIE POZOSTAŁYCH ---
//           // Jeśli ktoś został, musimy im powiedzieć, że lista graczy się zmieniła
//           // Opcjonalnie: Jeśli wyszedł właściciel (owner), przekaż koronę komuś innemu
//           if (room.owner === socket.id) {
//             room.owner = room.players[0]; // Nowym szefem zostaje pierwszy z listy
//           }

//           io.to(roomId).emit("room_data", {
//             // lub "player_left"
//             players: room.players,
//             owner: room.owner,
//             roomId: roomId,
//           });
//         }
//       }
//     });

//     // Pobierz dane pokoju na podstawie id użytkownika
//     socket.on("get_room_data", (callback) => {
//       callback({
//         gameData: games[connectedUsers[socket.id].room],
//       });
//     });
//   });
// };
