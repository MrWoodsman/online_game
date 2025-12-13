import { useEffect } from "react"
import { useParams, useNavigate, replace } from "react-router-dom"

import socket from "../socket"

export const InRoom = () => {
    const navigate = useNavigate();

    const { id } = useParams()

    useEffect(() => {
        socket.emit("get_room_data", (response) => {

            const serverRoomId = response?.gameData?.id;

            if (serverRoomId != id) {
                console.log(response)
                navigate(`/`, replace);
            }
        })
    }, [id, navigate])

    return (
        <div>
            Jesteś w pokoju {id}
        </div>
    )
}