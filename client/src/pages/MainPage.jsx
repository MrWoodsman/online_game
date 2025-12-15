import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"
// === COMPONENTS ===
import { RoomsList } from "../components/RoomsList"

export const MainPage = () => {
    // == REACT ==
    const navigate = useNavigate()
    // == USESTATES ==
    const [playersOnline, setPlayersOnline] = useState(0)
    const [nicknameInput, setNicknameInput] = useState('Guest_0000')
    const [selectedRoom, setSelectedRoom] = useState()

    // === OBSŁUGA SOCKET.IO ===
    useEffect(() => {
        // Obsługa danych po połączeniu
        const handleAfterConnection = (data) => {
            if (data && data.status == "ok") {
                console.log(data.userData)
                setNicknameInput(data.userData.nickname)
            }
        }
        socket.on("after_connection", handleAfterConnection)

        // Obsługa pokazania liczby połączonych
        const handlePlayersOnline = (number) => {
            if (number) {
                setPlayersOnline(number)
            }
        }
        socket.on("players_online", handlePlayersOnline)

        // Proszenie o wysłanie mi danych, zeby zawsze działało bo react ładuje
        socket.emit("get_init_data")

        return () => {
            socket.off("after_connection", handleAfterConnection)
            socket.off("players_online", handlePlayersOnline)
        }
    }, [])

    useEffect(() => {
        if (!nicknameInput) return  // Zeby nie wysłać pustego

        const timer = setTimeout(() => {
            socket.emit("user_set_nickname", nicknameInput, (response) => {
                if (!response) {
                    return
                }

                console.log(`Pomyślnie zmieniono nickname na serwerze`);
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [nicknameInput])

    return (
        <div className="App p-8">
            <h1 className="font-semibold">Twoje dane</h1>
            <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
            />
            <h1>{playersOnline} Players Online</h1>
            <h1 className="font-semibold">Dostępne pokoje</h1>
            <RoomsList selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
            <div className="flex gap-4">
                <button onClick={() => {
                    socket.emit('games_join', (selectedRoom), (response) => {
                        if (!response) return

                        if (response.status == 'bad') { console.error(response.msg) }

                        if (response.status == 'ok') {
                            console.log('Pomyślnie dołączono', response.room)
                            navigate(`/room/`, { state: { roomId: response.room.id } })
                        }
                    })
                }} className="w-full p-4 bg-neutral-200">Join</button>
                <button className="w-full p-4 bg-neutral-200">Create</button>
            </div>
        </div>
    )
}