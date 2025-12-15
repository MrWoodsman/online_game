import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

export const InRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [gameData, setGameData] = useState()

    const roomId = location.state?.roomId;

    useEffect(() => {
        console.log(roomId)
        // === ZABEZPIECZENIE 1: BRAK STATE (WEJŚCIE Z LINKU) ===
        if (!roomId) {
            console.log("Brak roomId w state (bezpośredni link) - wyrzucam do lobby");
            navigate("/", { replace: true }); // Używamy { replace: true }
            return;
        }

        socket.emit("check_room_access", roomId, (response) => {
            // Jeśli serwer powie "NIE" (false) -> wyrzucamy
            if (!response.access) {
                navigate("/", { replace: true });
            }

            setGameData(response.game)
            console.log(response.game)
        });
    }, [roomId, navigate]);

    useEffect(() => {
        const handleUpdateRoom = (gameData) => {
            setGameData(gameData)
        }
        socket.on('game_room_update', handleUpdateRoom)

        return () => {
            socket.off('game_room_update', handleUpdateRoom)
        }
    }, [])

    return (
        <div>
            <h1>Jesteś w pokoju: {roomId}</h1>
            {
                gameData && gameData.players.map((player) => (
                    <div key={player.id}>
                        {player.nickname}
                    </div>
                ))
            }
        </div>
    );
};