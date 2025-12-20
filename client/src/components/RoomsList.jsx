import { useEffect, useState } from "react"; // <--- Dodaj useRef
import socket from "../socket";
import { RoomCard } from "./RoomCard";

export const RoomsList = ({ selectedRoom, setSelectedRoom }) => {
    const [gamesData, setGamesData] = useState({});


    useEffect(() => {
        const handleGetAllGames = (response) => {
            const data = response?.games ? response.games : response;
            if (data) setGamesData(data);
        };

        socket.emit('games_get_all', (response) => {
            if (response && response.status === 'ok') setGamesData(response.games);
        });

        socket.on("games_list_update", handleGetAllGames);
        return () => socket.off("games_list_update", handleGetAllGames);
    }, []);

    // === 2. NOWOŚĆ: AUTO-ODZNACZANIE (Fix na znikanie) ===
    useEffect(() => {
        // Jeśli nie mamy wybranego pokoju, to nic nie robimy
        if (!selectedRoom) return;

        // Jeśli mamy dane o grach...
        if (gamesData) {
            // ...sprawdzamy czy wybrany pokój nadal istnieje w tych danych
            const roomStillExists = !!gamesData[selectedRoom];

            // Jeśli pokój został usunięty z serwera -> Odznacz go u klienta
            if (!roomStillExists) {
                console.log("Wybrany pokój przestał istnieć. Resetuję wybór.");
                setSelectedRoom(null);
            }
        }
    }, [gamesData, selectedRoom, setSelectedRoom]);

    const validRooms = Object.values(gamesData || {}).filter(room => {
        return room && room.id; // Pokój musi istnieć i mieć ID
    });

    const hasRooms = validRooms && validRooms.length > 0;

    return (
        <div
            className="overflow-y-auto flex-1 py-2 my-2 custom-scrollbar flex flex-col gap-3 relative"
        >
            {hasRooms ? (
                validRooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onSelect={setSelectedRoom}
                        isSelected={selectedRoom === room.id}
                    />
                ))
            ) : (
                <div className="flex items-center justify-center h-full opacity-50 font-bold italic">
                    Brak aktywnych pokoi...
                </div>
            )}
        </div>
    );
};