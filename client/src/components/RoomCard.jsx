export const RoomCard = ({ room, isSelected, onSelect }) => {

    // 1. Sprawdzamy czy pokój jest pełny
    const isFull = room.players.length >= 4;

    // 2. Określamy aktualny stan (priorytet: Full > Selected > Default)
    let state = 'default';
    if (isFull) {
        state = 'full';
    } else if (isSelected) {
        state = 'selected';
    }

    // 3. Definicje stylów dla każdego stanu
    const styles = {
        default: "bg-white border-transparent hover:border-green-200 hover:shadow-md cursor-pointer text-neutral-800",
        selected: "bg-green-50 border-green-500 shadow-md cursor-pointer text-green-900",
        full: "bg-neutral-100 border-transparent text-neutral-400 cursor-not-allowed opacity-70"
    };

    return (
        <div
            // 4. Obsługa kliknięcia: jeśli pełny, nie rób nic
            onClick={() => !isFull && onSelect(room.name)}
            className={`
                p-3 rounded-md border-2 transition-all duration-200 flex justify-between items-center 
                ${styles[state]}
            `}
        >
            <div className="flex flex-col">
                <span className="font-semibold">
                    {room.name}
                </span>
                {/* Opcjonalnie: Dodatkowy tekst informacyjny */}
                {state === 'full' && <span className="text-xs text-red-400 font-bold">PEŁNY</span>}
                {state === 'selected' && <span className="text-xs text-green-600 font-bold">WYBRANY</span>}
            </div>

            {/* Licznik graczy */}
            <span className={`font-mono font-bold ${isFull ? "text-red-400" : ""}`}>
                {room.players.length}/4
            </span>
        </div>
    )
}