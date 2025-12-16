import { useEffect, useState } from "react";
import { replace, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

export const InRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [gameData, setGameData] = useState()
    const [roomNameInput, setRoomNameInput] = useState("")

    const roomId = location.state?.roomId;

    useEffect(() => {
        if (!roomId) {
            console.log("Brak roomId - wyrzucam");
            navigate("/", { replace: true });
            return;
        }

        const verifyAccess = () => {
            console.log("Weryfikacja dostępu do pokoju...");

            socket.emit("check_room_access", roomId, (response) => {
                // Jeśli serwer się zresetował, response.access będzie false (bo pokój zniknął)
                if (!response || !response.access) {
                    console.log("Brak dostępu lub pokój nie istnieje - wyrzucam");
                    navigate("/", { replace: true });
                } else {
                    // Wszystko ok, ładujemy dane
                    console.log("Dostęp przyznany, dane pobrane");
                    setGameData(response.game);
                    setRoomNameInput(response.game.name)
                }
            });
        };

        if (socket.connected) {
            verifyAccess();
        }

        socket.on("connect", verifyAccess);

        return () => {
            socket.off("connect", verifyAccess);
        };

    }, [roomId, navigate]);
    useEffect(() => {
        const handleUpdateRoom = (gameData) => {
            setGameData(gameData)
            setRoomNameInput(gameData.name)
        }
        socket.on('game_room_update', handleUpdateRoom)

        return () => {
            socket.off('game_room_update', handleUpdateRoom)
        }
    }, [])

    // === UPDATE ROOM NAME ===
    const serverRoomName = gameData?.name;

    useEffect(() => {
        if (!roomNameInput || !roomId || !serverRoomName) return;

        // 2. Zabezpieczenie przed pętlą:
        if (roomNameInput === serverRoomName) return;

        const timer = setTimeout(() => {
            console.log(`[DEBUG] Wysyłam zmianę: ${roomNameInput} (ID: ${roomId})`);

            socket.emit("games_update_name", {
                roomId: roomId,
                newName: roomNameInput
            });

        }, 1000);

        return () => clearTimeout(timer);

    }, [roomNameInput, roomId, serverRoomName]);

    return (
        <div className="p-4">
            <h1><span>Jesteś w pokoju: </span>
                {
                    gameData?.ownerId == socket.id ? (
                        <input
                            value={roomNameInput}
                            onChange={(e) => { setRoomNameInput(e.target.value) }}
                            type="text"
                        />
                    ) : (
                        <>{gameData ? gameData.name : ""}</>
                    )
                }
                <span> ({roomId})</span></h1>
            {
                gameData && gameData.players.map((player) => (
                    <div key={player.id}>
                        <>{gameData.ownerId == player.id ? "👑" : ""} {player.nickname} {player.id == socket.id ? "(TY)" : ""}</>
                    </div>
                ))
            }
            <div className="flex gap-4">
                <button onClick={() => {
                    socket.emit('games_quit', (response) => {
                        if (!response) return

                        if (response.status == 'bad') {
                            console.error(response.msg)
                        }

                        if (response.status == 'ok') {
                            console.log(response.msg, response.room)
                            navigate('/', replace)
                        }
                    })
                }} className="w-full p-4 bg-neutral-200 cursor-pointer">QUIT</button>
                <button onClick={() => {

                }} className="w-full p-4 bg-neutral-200 cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed" disabled>START</button>

            </div>
        </div>
    );
};