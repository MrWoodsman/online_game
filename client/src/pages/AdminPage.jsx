import { useEffect } from "react";
import socket from "../socket";
import { useState } from "react";

export const AdminPage = () => {
    const [playersOnline, setPlayersOnline] = useState(0)
    const [playersData, setPlayersData] = useState()
    const [roomsData, setRoomsData] = useState()

    useEffect(() => {
        const joinAdminChannel = () => {
            console.log("Łączenie z kanałem admina...");
            socket.emit("user_update_status", "IN_ADMIN");
            socket.emit("user_join_room", "ADMIN_ROOM");
        };

        if (socket.connected) {
            joinAdminChannel();
        }

        socket.on("connect", joinAdminChannel);

        return () => {
            socket.off("connect", joinAdminChannel);
            // socket.emit("user_leave_room", "ADMIN_ROOM");
            // socket.emit("user_update_status", "LOBBY");
        };
    }, []);

    useEffect(() => {
        // Obsługa pokazania liczby połączonych
        const handlePlayersOnline = (number) => {
            if (number) {
                setPlayersOnline(number)
            }
        }
        socket.on("players_online", handlePlayersOnline)

        const updateAdminData = (data) => {
            setPlayersData(data.users)
            setRoomsData(data.rooms)
        }
        socket.on("users_all_data", updateAdminData)

        return () => {
            socket.off("players_online", handlePlayersOnline)
            socket.off("users_all_data", updateAdminData)
        }
    }, [])

    useEffect(() => {
        socket.emit("admin_get_all", (respone) => {
            if (respone) {
                setPlayersData(respone.users)
                setRoomsData(respone.rooms)
            }
        })
    }, [playersOnline])

    return (
        <div className="grid grid-cols-2">
            <div>
                <h1>Gracze ({playersData ? Object.keys(playersData).length : 0})</h1>
                {playersData && Object.values(playersData).map((player) => (

                    /* 2. Każdy element listy w React musi mieć unikalny klucz (key) */
                    <div key={player.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>

                        <b>Nick:</b> {player.nickname} {socket.id == player.id ? "(TY)" : ""} <br />
                        <b>Role:</b> {player.role} <br />
                        <b>ID:</b> {player.id} <br />
                        <b>Status:</b> {player.status} <br />
                        <b>Rooms:</b> {player.rooms.length > 0 ? player.rooms.join(" ") : '[]'} <br />
                        <b>Game ID:</b> {player.gameId ? player.gameId : 'Brak'}

                    </div>
                ))}
            </div>
            <div>
                <h1>Pokoje</h1>
                {roomsData && Object.values(roomsData).map((room) => (

                    /* 2. Każdy element listy w React musi mieć unikalny klucz (key) */
                    <div key={room.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>

                        <b>Name:</b> {room.name} <br />
                        <b>ID:</b> {room.id} <br />
                        <b>Owner ID:</b> {room.ownerId} <br />
                        <b>Owner Nickname:</b> {playersData[room.ownerId]?.nickname} <br />
                        <b>Max players:</b> {room.maxPlayers} <br />
                        <b>Status:</b> {room.status} <br />
                        <b>Players:</b> <br />
                        {
                            room.players.map((p, index) => (
                                <div key={index} className="border border-neutral-200">
                                    {
                                        Object.entries(p).map(([key, value]) => (
                                            <p key={key}><b>{key}:</b> {String(value)} </p>
                                        ))
                                    }
                                </div>
                            ))
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}