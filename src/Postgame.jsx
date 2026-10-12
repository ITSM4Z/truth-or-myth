import { useEffect } from 'react'
import { supabase } from './supabaseClient'

export function Postgame({ playerName, finalScore, finalTime, playerAnswers }) {
    useEffect(() => {
        async function saveScore() {
            // DEPLOYMENT INSTRUCTIONS: 
            // Just uncomment this block AFTER putting the creds in the .env file and update 'leaderboard' to match the actual table name
            
            /*
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([
                    { 
                        player_name: playerName, 
                        score: finalScore, 
                        time_seconds: finalTime 
                    }
                ]);

            if (error) console.error("Error saving score:", error);
            else console.log("Score saved successfully!", data);
            */
           console.log("Placeholder: Score ready to be sent to DB");
        }

        saveScore();
    }, [playerName, finalScore, finalTime]);

    const minutes = String(Math.floor(finalTime / 60)).padStart(2, '0');
    const seconds = String(finalTime % 60).padStart(2, '0');

    return (
        <div className="w-full max-w-4xl min-h-[80vh] bg-white rounded-xl shadow-lg p-6 flex flex-col items-center overflow-y-auto m-4">
            <h1 className="text-3xl font-bold text-[#0c272c] mb-6">النتيجة النهائية</h1>
            
            {/* Player Stats Card */}
            <div className="bg-[#2a636d] text-white p-6 rounded-lg w-full mb-8 flex justify-between items-center shadow-md">
                <p className="text-xl font-bold">اللاعب: {playerName}</p>
                <p className="text-xl font-bold">النتيجة: {finalScore} / {playerAnswers.length}</p>
                <p className="text-xl font-mono bg-white/20 px-3 py-1 rounded" dir="ltr">
                    ⏱ {minutes}:{seconds}
                </p>
            </div>

            {/* Corrections List */}
            <div className="w-full space-y-4">
                <h2 className="text-2xl font-bold text-[#9f895c] mb-4">تصحيح الإجابات:</h2>
                
                {playerAnswers.map((answer) => {
                    // Our ternary logic to check if they got it right
                    const isCorrect = answer.container === answer.correctAnswer;
                    
                    return (
                        <div 
                            key={answer.id} 
                            className={`p-4 rounded border-2 ${
                                isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                            }`}
                        >
                            <p className="font-bold text-lg mb-2">{answer.text}</p>
                            <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect ? '✅ إجابة صحيحة' : '❌ إجابة خاطئة'}
                                
                                {/* If wrong, show them what the right answer was */}
                                {!isCorrect && (
                                    <span className="text-gray-600 font-normal mr-2">
                                        (الصحيح: {answer.correctAnswer === 'fact' ? 'حقيقة' : 'خرافة'})
                                    </span>
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}