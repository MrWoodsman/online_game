// === IMAGES ===
import ImgLogo from '../../assets/Logo.png'

export const MainPageNavigation = ({ playersOnline = 0, isOnline = true }) => {
    return (
        <nav className="flex justify-between items-center mb-8">
            <div className='max-w-1/2'>
                <img src={ImgLogo} alt="Bankrupt Logo" className="" />
            </div>
            <div className="players-online flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
                {playersOnline} Players <div className={`h-1.5 w-1.5 ${isOnline ? "bg-green-500" : "bg-red-500"} rounded-full`}></div>
            </div>
        </nav>
    )
}