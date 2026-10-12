import { Leaderboard } from './Leaderboard';
import ecCcTcLogo from './assets/EC_CC_TC.png';

export function LeaderboardScreen({ setCurrentScreen }) {
    return (
        <div className="w-full max-w-3xl min-h-[70vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#9f895c]/40 p-4 sm:p-6 flex flex-col items-center overflow-y-auto m-3">
            {/* Top Club Branding */}
            <div className="flex items-center justify-center p-2 px-5 rounded-xl bg-[#256770] border border-[#9f895c]/40 shadow-md mb-4">
                <img
                    src={ecCcTcLogo}
                    alt="أندية جامعة أم القرى و Tuwaiq Club"
                    className="h-9 sm:h-11 w-auto object-contain"
                />
            </div>

            <div className="w-full flex-grow">
                <Leaderboard />
            </div>

            {/* Back Button to Main Menu */}
            <div className="mt-6 mb-2 flex justify-center w-full">
                <button
                    onClick={() => setCurrentScreen("pregame")}
                    className="bg-[#006471] text-white px-8 py-2.5 rounded-xl text-base sm:text-lg font-bold hover:bg-[#0c272c] active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <span>↩</span>
                    <span>الرجوع للقائمة الرئيسية</span>
                </button>
            </div>
        </div>
    );
}
