const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// Funkcja losowania kodu
function generateRandomCode(length) {
    let result = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * ALPHABET.length)
        result += ALPHABET.charAt(randomIndex)
    }
    return result
}

// Główna funkcja
function createUniqueId(games) {
    let id;
    let attempts = 0

    do {
        id = generateRandomCode(4)
        attempts++

        if (attempts > 100) {
            throw new Error("Nie można wygenerować unikalnego ID!")
        }
    } while (games[id])

    return id
}

module.exports = {createUniqueId}