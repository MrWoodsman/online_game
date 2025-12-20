import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"
// === COMPONENTS ===
import { RoomsList } from "../components/RoomsList"
import { Container3D } from "../components/design/Container3D"
import { MainPageNavigation } from "../components/MainPage/MainPageNavigation"


export const MainPage = () => {
    // == REACT ==
    const navigate = useNavigate()
    // == USESTATES ==
    // const [playersOnline, setPlayersOnline] = useState(0)
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
        // const handlePlayersOnline = (number) => {
        //     if (number) {
        //         setPlayersOnline(number)
        //     }
        // }
        // socket.on("players_online", handlePlayersOnline)

        // Proszenie o wysłanie mi danych, zeby zawsze działało bo react ładuje
        socket.emit("get_init_data")

        return () => {
            socket.off("after_connection", handleAfterConnection)
            // socket.off("players_online", handlePlayersOnline)
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

    // background-patern
    return (
        <div className="App p-8 flex flex-col select-none">
            {/* === NAWIGACJA LOGO I LICZBA DOSTEPNYCH === */}
            {/* <MainPageNavigation playersOnline={playersOnline} isOnline={true} /> */}
            {/* === TYTUŁ I MENU === */}
            <div className="flex w-full justify-between relative z-1">
                <Container3D
                    color="#2DD4BF"
                    shadow="#0D9488"
                    textColor="white"
                >
                    Room's
                </Container3D>
                <Container3D
                    color="#2DD4BF"
                    shadow="#0D9488"
                    textColor="white"
                    squar
                    centerContent
                >

                </Container3D>
            </div>
            {/* === LISTA POKOI === */}
            {/* <div className="rooms-list flex-1 overflow-auto relative z-2"> */}
            <RoomsList selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
            {/* </div> */}
            {/* === USER NICKNAME === */}
            <div className="flex flex-col items-start pb-8 relative z-3">
                <Container3D
                    color="#C084FC"
                    shadow="#9333EA"
                    textColor="white"
                >
                    Nickname
                </Container3D>
                <Container3D
                    // 1. Włączasz tryb inputa
                    isInput={true}
                    // 2. Style wizualne (3D)
                    color="#E5E5E5"
                    shadow="#A3A3A3"
                    textColor="black"
                    className="mt-[-5px] w-full"
                    // 3. Właściwości Inputa (Wrzucasz je tutaj, a nie do środka!)
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onBlur={() => {
                        // Czekamy 100ms aż klawiatura zjedzie i brutalnie przewijamy stronę do góry
                        setTimeout(() => {
                            window.scrollTo(0, 0);
                            document.body.scrollTop = 0;
                        }, 100);
                    }}
                />
            </div>
            {/* === PRZYCISKI === */}
            <div className="flex gap-4 relative z-4 w-full">
                <Container3D
                    color="#4ADE80"
                    shadow="#16A34A"
                    textColor="white"
                    className="w-full"
                    centerContent
                    onClick={() => {
                        socket.emit('games_create', (null), (response) => {
                            if (!response) return

                            if (response.status == 'bad') { console.error(response.msg) }

                            if (response.status == 'ok') {
                                console.log('Pomyślnie utworzono', response.room)
                                // PO UTWORZENIU AUTOMATYCZNE DOŁAACZANIE
                                socket.emit('games_join', (response.room.id), (response) => {
                                    if (!response) return

                                    if (response.status == 'bad') { console.error(response.msg) }

                                    if (response.status == 'ok') {
                                        console.log('Pomyślnie dołączono', response.room)
                                        navigate(`/room/`, { state: { roomId: response.room.id } })
                                    }
                                })
                            }
                        })
                    }}
                >
                    Create Game
                </Container3D>
                <Container3D
                    color={!selectedRoom ? 'gray' : "#60A5FA"}
                    shadow={!selectedRoom ? 'gray' : "#2563EB"}
                    textColor="white"
                    className="w-full cursor-pointer"
                    centerContent
                    disabled={!selectedRoom}
                    onClick={() => {
                        socket.emit('games_join', (selectedRoom), (response) => {
                            if (!response) return

                            if (response.status == 'bad') { console.error(response.msg) }

                            if (response.status == 'ok') {
                                console.log('Pomyślnie dołączono', response.room)
                                navigate(`/room/`, { state: { roomId: response.room.id } })
                            }
                        })
                    }}
                >
                    Join Game
                </Container3D>
            </div>
        </div>
    )
}