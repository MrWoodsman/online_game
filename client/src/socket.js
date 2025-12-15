import io from "socket.io-client";

const SERVER_PORT = 3001;

const URL = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;

console.log("Łączenie z serwerem: ", URL);

// Łączymy się z naszym backendem
const socket = io(URL, {
  autoConnect: true,
});
export default socket;
