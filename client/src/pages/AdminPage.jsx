import { useEffect, useState } from "react";
import socket from "../socket";

export const AdminPage = () => {
    // === STANY LOGOWANIA ===
    const [isAdmin, setIsAdmin] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [loginError, setLoginError] = useState("");

    // === STANY DANYCH ===
    const [playersData, setPlayersData] = useState({});
    const [roomsData, setRoomsData] = useState({});

    // Dodajemy z powrotem stan licznika, bo on jest naszym "wyzwalaczem" odświeżania
    const [triggerUpdate, setTriggerUpdate] = useState(0);

    // === LOGOWANIE ===
    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError("");

        socket.emit("admin_login", pinInput, (response) => {
            if (response && response.status === 'ok') {
                setIsAdmin(true);
                setPinInput("");
            } else {
                setLoginError(response.msg || "Błędny PIN!");
                setIsAdmin(false);
            }
        });
    };

    // === WYLOGOWANIE ===
    const handleLogout = () => {
        setIsAdmin(false);
        setPlayersData({});
        setRoomsData({});
        socket.emit("user_leave_room", "ADMIN_ROOM");
        socket.emit("user_update_status", "LOBBY");
    };

    // === 1. GLÓWNA LOGIKA POŁĄCZENIA (Tylko raz po zalogowaniu) ===
    useEffect(() => {
        if (!isAdmin) return;

        const joinAdminRoom = () => {
            socket.emit("user_update_status", "IN_ADMIN");
            socket.emit("user_join_room", "ADMIN_ROOM");
        };

        if (socket.connected) joinAdminRoom();
        socket.on("connect", joinAdminRoom);

        return () => {
            socket.off("connect", joinAdminRoom);
            socket.emit("user_leave_room", "ADMIN_ROOM");
        };
    }, [isAdmin]);

    // === 2. MECHANIZM ODŚWIEŻANIA DANYCH ===
    // To jest to, co przywróciłem. Nasłuchujemy na małe zmiany, żeby pobrać duże dane.
    useEffect(() => {
        if (!isAdmin) return;

        // Funkcja pobierająca wszystko
        const fetchAllData = () => {
            socket.emit("admin_get_all", (response) => {
                if (response) {
                    setPlayersData(response.users || {});
                    setRoomsData(response.rooms || {});
                }
            });
        };

        // Pobierz dane na start
        fetchAllData();

        // 1. Jeśli serwer wysyła sam z siebie pełne dane
        const handleFullUpdate = (data) => {
            if (data.users) setPlayersData(data.users);
            if (data.rooms) setRoomsData(data.rooms);
        };

        // 2. Jeśli serwer wysyła tylko info "ktoś wszedł/wyszedł" (players_online)
        // To używamy tego jako sygnału: "Ej, pobierz wszystko od nowa!"
        const handleTrigger = () => {
            // Zmieniamy stan tylko po to, żeby wymusić odświeżenie (można też wywołać fetchAllData bezpośrednio)
            fetchAllData();
        };

        socket.on("users_all_data", handleFullUpdate);
        socket.on("players_online", handleTrigger); // <--- TO PRZYWRÓCIŁEM

        return () => {
            socket.off("users_all_data", handleFullUpdate);
            socket.off("players_online", handleTrigger);
        };
    }, [isAdmin, triggerUpdate]); // triggerUpdate w dependency array, choć fetchAllData wywołujemy w środku listenera


    // === WIDOKI (Bez zmian) ===
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-96">
                    <h1 className="text-2xl font-bold mb-4 text-center">Panel Administratora</h1>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="password"
                            placeholder="Wprowadź PIN"
                            className="border p-2 rounded focus:outline-blue-500"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            inputMode="numeric"
                            autoFocus
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                            Zaloguj
                        </button>
                    </form>
                    {loginError && <p className="text-red-500 mt-2 text-center">{loginError}</p>}
                </div>
            </div>
        );
    }

    const onlineCount = Object.keys(playersData).length;
    const roomCount = Object.keys(roomsData).length;

    return (
        <div className="p-4 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold">Admin Dashboard 🛠️</h1>
                <div className="flex gap-4 items-center">
                    <span className="font-bold text-green-600">Online: {onlineCount}</span>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Wyloguj
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* === KOLUMNA GRACZY === */}
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        Gracze ({onlineCount})
                    </h2>
                    <div className="flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
                        {Object.values(playersData).map((player) => (
                            <div key={player.id} className={`border p-3 rounded text-sm ${socket.id === player.id ? "bg-blue-50 border-blue-300" : "bg-gray-50"}`}>
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg">{player.nickname} {socket.id === player.id ? "(TY)" : ""}</span>
                                    <span className="text-xs text-gray-500">{player.id}</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-1 text-gray-700">
                                    <span>Role: <b>{player.role}</b></span>
                                    <span>Status: <b>{player.status}</b></span>
                                    <span>GameID: <b>{player.gameId || '-'}</b></span>
                                    <span>Rooms: <b>{player.rooms?.length || 0}</b></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* === KOLUMNA POKOI === */}
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        Pokoje ({roomCount})
                    </h2>
                    <div className="flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
                        {Object.values(roomsData).map((room) => (
                            <div key={room.id} className="border border-orange-200 bg-orange-50 p-3 rounded text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-lg">{room.name}</span>
                                    <span className="text-xs bg-white px-2 py-1 rounded border">{room.status}</span>
                                </div>
                                <div className="text-gray-600 mb-2">
                                    ID: {room.id} <br />
                                    Host: <b>{playersData[room.ownerId]?.nickname || room.ownerId}</b> <br />
                                    Players: {room.players.length} / {room.maxPlayers}
                                </div>
                                <div className="bg-white p-2 rounded border text-xs">
                                    <strong>In Room:</strong>
                                    {room.players.length === 0 && <span className="text-gray-400 italic"> Empty</span>}
                                    {room.players.map((p, idx) => (
                                        <div key={idx} className="flex justify-between border-b last:border-0 py-1">
                                            <span>{p.nickname}</span>
                                            <span className={p.isConnected ? "text-green-500" : "text-red-500"}>
                                                {p.isConnected ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};