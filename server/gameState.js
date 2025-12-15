const AVILABLE_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

// --- WSZYSCY POŁACZENI GRACZE (STAN GLOBALNY) ---
const connectedUsers = {};

// --- WSZYSTKIE GRY ---
const games = {};

const createPlayerInGame = (id, nickname) => ({
  id: id,
  nickname: nickname,
  color: null,
});

// Model Gry
const createGame = () => ({
  id: null,
  name: null,
  ownerId: null,
  maxPlayers: 4,
  players: [],
  currentPlayerIndex: 0,
  status: "LOBBY",
});

module.exports = {
  AVILABLE_COLORS,
  connectedUsers,
  games,
  createPlayerInGame,
  createGame,
};
