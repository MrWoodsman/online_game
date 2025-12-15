import { useEffect, useState } from "react"
// === SOCKET.IO ===
import socket from "../socket"
// === COMPONENTS ===
import { RoomCard } from "./RoomCard"

export const RoomsList = ({ selectedRoom, setSelectedRoom }) => {
    const [gamesData, setGamesData] = useState()

    useEffect(() => {
        const handleGetALlGames = () => {
            socket.emit('games_get_all', (response) => {
                if (!response) return
                if (!response.status == 'ok') return

                setGamesData(response.games)
                console.log(response.games)
            })
        }

        handleGetALlGames()

        socket.on("connect", handleGetALlGames);
        socket.on("games_list_update", handleGetALlGames);

        return () => {
            socket.off("connect", handleGetALlGames);
            socket.off("games_list_update", handleGetALlGames);
        }
    }, [])

    return (
        <div>
            {
                (gamesData && Object.values(gamesData).length > 0) ? (
                    // === SA DANE O POKOIACH ===
                    Object.values(gamesData).map((room) => (
                        <RoomCard key={room.id} room={room} onSelect={setSelectedRoom} isSelected={selectedRoom == room.id} />
                    ))
                ) : (
                    // === NIE MA DANYCH O POKOIACH ===
                    <h1>Brak aktywnych pokoi</h1>
                )
            }
        </div>
    )
}
