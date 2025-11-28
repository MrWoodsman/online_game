import io from "socket.io-client";

// Łączymy się z naszym backendem
const socket = io.connect("http://localhost:3001");

export default socket;
