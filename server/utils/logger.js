// server/logger.js

// Kody kolorów w konsoli
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Kolory tekstu
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Pomocnik do czasu
const getTime = () => {
  const now = new Date();
  return now.toLocaleTimeString();
};

const logger = {
  // [SYSTEM] - Ogólne informacje serwera (na biało/szaro)
  sys: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.bright}[SYSTEM]${colors.reset} ${msg}`
    );
  },

  // [GRACZ] - Dołączanie, wychodzenie, nicki (na niebiesko/cyjan)
  player: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.cyan}${colors.bright}[GRACZ]${
        colors.reset
      }  ${msg}`
    );
  },

  // [POKÓJ] - Tworzenie pokoi, start gry (na zielono)
  room: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.green}${colors.bright}[POKÓJ]${
        colors.reset
      }  ${msg}`
    );
  },

  // [GRA] - Rzuty kością, ruchy, kupno (na żółto/złoto)
  game: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.yellow}${colors.bright}[GRA]${
        colors.reset
      }    ${msg}`
    );
  },

  // [BŁĄD] - Coś poszło nie tak (na czerwono)
  error: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.red}${colors.bright}[BŁĄD]${
        colors.reset
      }   ${msg}`
    );
  },

  // [ADMIN] - Informacje o rzeczach wykonywanych przez admina
  admin: (msg) => {
    console.log(
      `${colors.dim}[${getTime()}]${colors.reset} ${colors.magenta}${colors.bright}[ADMIN]${
        colors.reset
      }   ${msg}`
    );
  },
};

module.exports = logger;
