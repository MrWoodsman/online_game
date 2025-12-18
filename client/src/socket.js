import io from "socket.io-client";

const isDev = import.meta.env.MODE === "development";

// ZMIANA: Używamy window.location.hostname zamiast "localhost"
// Dzięki temu zadziała i na kompie (localhost) i na telefonie (192.168.x.x)
const URL = isDev ? `http://${window.location.hostname}:3001` : "https://mrwoodsman.pl";

const socket = io(URL, {
  autoConnect: true,
  transports: ["polling"],
  path: "/boardv2/socket.io/",
  reconnection: true,
});

console.log(`[SOCKET SETUP] Connecting to ${URL} with path: /boardv2/socket.io/`);

export default socket;
