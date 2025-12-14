import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import { RoomCard } from './components/RoomCard';

function App() {
  // const navigate = useNavigate();
  // // POPRAWKA 1: Inicjalizuj pustym stringiem, żeby input nie był 'undefined' na starcie
  // const [nickname, setNickname] = useState("");
  // const [usersOnline, setUsersOnline] = useState(0)
  // const [rooms, setRooms] = useState([]);
  // const [selectedRoom, setSelectedRoom] = useState("");
  // // const [myId, setMyId] = useState()

  // // Update nickname on server
  // useEffect(() => {
  //   // Nie wysyłamy pustego
  //   if (!nickname) return;

  //   // Oznaczamy, że użytkownik dotknął klawiatury/inputa
  //   // Dzięki temu serwer mu już tego nie nadpisze "Gościem"

  //   const timer = setTimeout(() => {
  //     socket.emit("set_nickname", nickname);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [nickname]);

  // useEffect(() => {
  //   socket.on("rooms_data", (data) => {
  //     console.log("Dane pokoji:", data);
  //     if (Array.isArray(data)) {
  //       setRooms(data);
  //     }
  //   });

  //   socket.on("user_data", (data) => {
  //     console.log("Dane użytkownika z serwera:", data);
  //     // To zadziała tylko jeśli input ma prop 'value={nickname}'
  //     if (data.nickname) setNickname(data.nickname);
  //   });

  //   socket.on("users_online", (data) => {
  //     console.log("Dane użytkowników online:", data);
  //     // To zadziała tylko jeśli input ma prop 'value={nickname}'
  //     if (data) setUsersOnline(data);
  //   });

  //   // POPRAWKA 3: Prawidłowe czyszczenie eventów (wszystko w jednej funkcji)
  //   return () => {
  //     socket.off("rooms_data");
  //     socket.off("user_data");
  //     socket.off("users_online");
  //   };
  // }, []);

  // const createNewGame = () => {
  //   socket.emit("create_game", (response) => {
  //     console.log("Odpowiedź na utworzenie pokoiu: ", response)

  //     if (response.status === "ok") {
  //       socket.emit('join_room', { room: response.roomId }, (responseJoin) => {
  //         console.log("Odpowiedź na dołączenie: ", responseJoin);

  //         if (responseJoin && !responseJoin.error) {
  //           console.log("Sukces! Jestem w pokoju.", responseJoin.gameData);
  //           navigate(`/room/${responseJoin.gameData.id}`);
  //         } else {
  //           console.error("Błąd dołączania:", responseJoin?.error);
  //         }
  //       })
  //     }
  //   })
  // }

  const [userData, setUserData] = useState()
  const [playersOnline, setPlayersOnline] = useState(0)
  const [nicknameInput, setNicknameInput] = useState('Guest_0000')

  // Obsługa socket.io
  useEffect(() => {
    // Obsługa danych po połączeniu
    const handleAfterConnection = (data) => {
      if (data && data.status == "OK") {
        setUserData(data.userData)
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

  // Zmiana nickname
  useEffect(() => {
    // Nie wysyłamy pustego
    if (!nicknameInput) return;

    // Oznaczamy, że użytkownik dotknął klawiatury/inputa
    // Dzięki temu serwer mu już tego nie nadpisze "Gościem"

    const timer = setTimeout(() => {
      socket.emit("user_set_nickname", nicknameInput, (response) => {
        if (!response) {
          return
        }

        console.log(`Pomyślnie zmieniono nickname na serwerze`);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [nicknameInput]);

  return (
    <div className="App p-10 font-sans">
      <input
        type="text"
        value={nicknameInput}
        onChange={(e) => setNicknameInput(e.target.value)}
      />
      {/* <h1>{nicknameInput && nicknameInput}</h1> */}
      <h1 className='text-neutral-400 font-normal'>{playersOnline} Users Online</h1>
      {/* <button onClick={() => createNewGame()}>Make a room</button>
      <h2 className='absolute bottom-0 left-1/2 translate-x-[-50%] text-neutral-950/25'>{usersOnline} Online</h2>
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center">Wybierz pokój</h1>
        <input
          className="border border-neutral-200 p-2 rounded-lg bg-neutral-100 focus:border-blue-500 focus:bg-blue-100 outline-none"
          placeholder="Twój Nick"
          // POPRAWKA 4: Kluczowa zmiana! Input musi wiedzieć co wyświetlać
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value)
          }}
        />
        <div className='rooms-list bg-neutral-100 w-full aspect-square rounded-lg p-4 overflow-y-auto'>
          {rooms.length === 0 ? (
            // WERSJA 1: BRAK POKOI
            <div className='w-full h-full flex flex-col items-center justify-center text-center'>
              <h1 className='text-2xl font-bold text-neutral-600'>Nie znaleziono pokoi</h1>
              <h2 className='text-neutral-500 text-sm mt-2'>Stwórz własny, aby zagrać!</h2>
            </div>
          ) : (
            // WERSJA 2: LISTA POKOI
            <div className="flex flex-col gap-2">
              {rooms && rooms.map((room, index) => (
                <RoomCard
                  key={index}
                  room={room}
                  // Sprawdzamy, czy nazwa tego pokoju jest taka sama jak wybranego w stanie
                  isSelected={selectedRoom === room.name}
                  // Funkcja zmieniająca stan wybranego pokoju
                  onSelect={(name) => setSelectedRoom(name)}
                />
              ))}
            </div>
          )}
        </div>
        <button
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          DOŁĄCZ DO GRY
        </button>
      </div> */}
    </div >
  );
}

export default App;