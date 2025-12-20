import React from 'react';

export const Container3D = ({
    children,           // Treść (dla przycisku)
    color = '#ffffff',  // Kolor tła
    shadow = '#cccccc', // Kolor cienia (głębi)
    textColor = '#000', // Kolor tekstu
    className = '',     // Klasy dla kontenera zewnętrznego

    // Opcje wyglądu
    animate = false,
    squar = false,      // literówka w oryginale (square), zostawiam tak jak masz
    centerContent = false,

    // NOWOŚĆ: Tryb inputa
    isInput = false,

    // Logika animacji (Twoja oryginalna)
    animateClass = animate
        ? `transition-all duration-200 ease-in-out hover:shadow-[0_5px_0_rgba(0,0,0,0.1)] hover:translate-y-[-2px]`
        : '',

    // Reszta propsów (onClick, onChange, value, type, placeholder itp.)
    ...props
}) => {

    // Wspólne style dla Inputa i Buttona
    const commonStyles = `
        w-full h-[50px] px-4 
        rounded-[7px] border-2 border-white/25 
        font-semibold text-lg
        focus:outline-none  /* Ważne dla inputa, żeby nie było niebieskiej ramki */
        ${squar ? "aspect-square flex items-center justify-center" : ""}
        ${centerContent ? 'text-center flex items-center justify-center' : 'flex items-center'}
    `;

    return (
        <div
            style={{
                backgroundColor: shadow, // To robi za ten "bok" 3D
                color: textColor,
            }}
            className={`
                rounded-lg
                transition-all duration-100 ease-in-out 
                pb-2.5 
                border border-black
                shadow-[0px_10px_0px_0px_rgba(0,0,0,0.1)]
                ${className}
                ${animateClass}
            `}
        >
            {isInput ? (
                // === WERSJA INPUT ===
                <input
                    style={{ backgroundColor: color }}
                    className={`${commonStyles} placeholder:text-black/40`} // Dodatkowy styl dla placeholdera
                    {...props} // Tutaj wpada value, onChange, placeholder, type itp.
                />
            ) : (
                // === WERSJA BUTTON ===
                <button
                    style={{ backgroundColor: color }}
                    className={`${commonStyles}`}
                    {...props} // Tutaj wpada onClick itp.
                >
                    {children}
                </button>
            )}
        </div>
    );
};