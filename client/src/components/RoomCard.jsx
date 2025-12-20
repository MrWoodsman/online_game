import { Container3D } from "./design/Container3D";

export const RoomCard = ({ room, isSelected, onSelect }) => {

    // 1. Sprawdzamy czy pokój jest pełny
    const isFull = room.players?.length >= room.maxPlayers;

    const Container3DStyles = {
        default: {
            color: "#E5E5E5", // Jasny szary
            shadow: "#A3A3A3", // Ciemny szary (cień)
        },
        selected: {
            color: "#60A5FA", // Niebieski (Tailwind blue-400)
            shadow: "#2563EB", // Ciemny niebieski (Tailwind blue-600)
        },
        full: {
            color: "#FDBA74", // Pomarańczowy
            shadow: "#EA580C", // Ciemny pomarańczowy
        }
    };

    const variantKey = isSelected ? 'selected' : (isFull ? 'full' : 'default');
    const activeStyle = Container3DStyles[variantKey];

    return (
        <Container3D
            color={activeStyle.color}
            shadow={activeStyle.shadow}
            textColor="black"
            className="mt-[-5px]"
        >
            <div className="flex w-full justify-between cursor-pointer" onClick={() => !isFull && onSelect(room.id)}>
                <span className="font-semibold text-left">
                    {room.name}
                    {/* {room.id} */}
                </span>
                <span className={`font-mono font-bold`}>
                    {room.players?.length}/{room.maxPlayers}
                </span>
            </div>
        </Container3D>
    )

    // return (
    //     <div
    //         // 4. Obsługa kliknięcia: jeśli pełny, nie rób nic
    //         onClick={() => !isFull && onSelect(room.id)}
    //         className={`
    //             p-3 rounded-md border-2 transition-all duration-200 flex justify-between items-center 
    //             ${styles[state]}
    //         `}
    //     >
    //         <div className="flex flex-col">
    //             <span className="font-semibold">
    //                 {room.name} {room.id}
    //             </span>
    //             {/* Opcjonalnie: Dodatkowy tekst informacyjny */}
    //             {/* {state === 'full' && <span className="text-xs text-red-400 font-bold">PEŁNY</span>}
    //             {state === 'selected' && <span className="text-xs text-green-600 font-bold">WYBRANY</span>} */}
    //         </div>

    //         {/* Licznik graczy */}
    //         <span className={`font-mono font-bold ${isFull ? "text-neutral-400" : ""}`}>
    //             {room.players.length}/{room.maxPlayers}
    //         </span>
    //     </div>
    // )
}