import { useState } from 'react'
import { Pregame } from './Pregame'
import { Ingame } from './Ingame'
import { Postgame } from './Postgame'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState("pregame")
  const [playerName, setPlayerName] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)


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
      screenToDisplay = <Ingame setCurrentScreen="{setCurrentScreen}"/>;
      break;
    case "postgame":
      screenToDisplay = <Postgame setCurrentScreen="{setCurrentScreen}"/>;
      break;
    default:
      screenToDisplay = <div>Error: Unknown Screen</div>
  }

  return (
      <div className="min-h-screen bg-[#2a636d] flex items-center justify-center font-sans">
        {screenToDisplay}
      </div>
    );
  }

  export default App;
