import io from "socket.io-client";

const isDev = import.meta.env.MODE === "development";

const URL = isDev ? "http://localhost:3001" : "https://mrwoodsman.pl";

const socket = io(URL, {
  autoConnect: true,
  transports: ["polling"],
  path: "/boardv2/socket.io/",
  reconnection: true,
});

console.log(`[SOCKET SETUP] Connecting to ${URL} with path: /boardv2/socket.io/`);

export default socket;
