import { useState } from 'react'
import { Pregame } from './Pregame'
import { Ingame } from './Ingame'
import { Postgame } from './Postgame'
import { LeaderboardScreen } from './LeaderboardScreen'
import bgImage from './assets/Background.png'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState("pregame")
  const [playerName, setPlayerName] = useState("")
  const [finalTime, setFinalTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState([]);


  let screenToDisplay;

  switch (currentScreen) {
    case "pregame":
      screenToDisplay = <Pregame
        setCurrentScreen={setCurrentScreen}
        playerName={playerName}
        setPlayerName={setPlayerName}
      />;
      break;
    case "ingame":
      screenToDisplay = <Ingame 
        setCurrentScreen={setCurrentScreen}
        setFinalTime={setFinalTime}
        setFinalScore={setFinalScore}
        setPlayerAnswers={setPlayerAnswers}
      />;
      break;
    case "postgame":
      screenToDisplay = <Postgame 
        playerName={playerName}
        finalScore={finalScore}
        finalTime={finalTime}
        playerAnswers={playerAnswers}
        setCurrentScreen={setCurrentScreen}
        setPlayerName={setPlayerName}
      />;
      break;
    case "leaderboard":
      screenToDisplay = <LeaderboardScreen 
        setCurrentScreen={setCurrentScreen}
      />;
      break;
    default:
      screenToDisplay = <div>خطأ: شاشة غير معروفة</div>
  }

  return (
      <div 
        className="min-h-screen w-full bg-[#2a636d] bg-cover bg-center bg-no-repeat flex items-center justify-center font-brand p-4"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {screenToDisplay}
      </div>
    );
  }

  export default App;
