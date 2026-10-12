export function Pregame ({setCurrentScreen, playerName, setPlayerName}){
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-[#0c272c]">Welcome to Fact or Myth!</h1>

            <input type="text"
            placeholder="أدخل إسمك..." 
            className="border-2 border-[#9f895c] rounded px-4 py-2 text-black"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            />
            <button 
                className="bg-[#358b9a] text-white px-6 py-2 rounded font-bold hover:bg-[#2a636d]"
                onClick={() => setCurrentScreen("ingame")}
            >
                Start
            </button>
        </div>
    )
}