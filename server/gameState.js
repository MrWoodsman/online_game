const AVILABLE_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

// --- WSZYSCY POŁACZENI GRACZE (STAN GLOBALNY) ---
const connectedUsers = {};

// --- WSZYSTKIE GRY ---
const games = {};

// Helper: tworzenie gracza w grze
const getNewGamePlayerState = (id, nickname) => ({
  id: id,
  nickname: nickname,
  color: "red",
  money: 1500,
  position: 0,
  isJailed: false,
  properties: [],
});

// Model Gry
const createGame = () => ({
  players: [],
  currentPlayerIndex: 0,
  status: "LOBBY",
});

module.exports = {
  AVILABLE_COLORS,
  connectedUsers,
  games,
  getNewGamePlayerState,
  createGame,
};
