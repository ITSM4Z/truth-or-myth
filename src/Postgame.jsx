import { useEffect } from 'react'
// import { supabase } from './supabaseClient'

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
        <div className="w-full max-w-3xl min-h-[70vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#9f895c]/40 p-4 sm:p-6 flex flex-col items-center overflow-y-auto m-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0c272c] mb-4">النتيجة النهائية</h1>
            
            {/* Player Stats Card */}
            <div className="bg-[#256770] text-white p-3 sm:p-4 rounded-xl w-full mb-5 flex flex-wrap justify-between items-center gap-3 shadow-md border border-[#9f895c]/30">
                <p className="text-sm sm:text-base font-bold">اللاعب: {playerName}</p>
                <p className="text-sm sm:text-base font-bold">النتيجة: {finalScore} / {playerAnswers.length}</p>
                <p className="text-xs sm:text-sm font-mono bg-white/20 px-2.5 py-1 rounded" dir="ltr">
                    ⏱ {minutes}:{seconds}
                </p>
            </div>

            {/* Corrections List */}
            <div className="w-full space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#9f895c] mb-2">تصحيح الإجابات:</h2>
                
                {playerAnswers.map((answer) => {
                    const isCorrect = answer.container === answer.correctAnswer;
                    
                    return (
                        <div 
                            key={answer.id} 
                            className={`p-3 sm:p-3.5 rounded-xl border ${
                                isCorrect ? 'border-green-400 bg-green-50/70' : 'border-red-400 bg-red-50/70'
                            }`}
                        >
                            <p className="font-bold text-sm sm:text-base mb-1.5 text-[#0c272c] leading-snug">
                                {answer.text}
                            </p>
                            <p className={`font-bold text-xs sm:text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect ? '✅ إجابة صحيحة' : '❌ إجابة خاطئة'}
                                
                                {!isCorrect && (
                                    <span className="text-gray-600 font-normal mr-2">
                                        (الصحيح: {answer.correctAnswer === 'fact' ? 'حقيقة' : 'خرافة'})
                                    </span>
                                )}
                            </p>

                            {/* Statement Explanation & Source */}
                            {answer.explanation && (
                                <div className="mt-2 pt-2 border-t border-gray-200/80 text-xs sm:text-sm text-[#0c272c] bg-white/80 p-2.5 rounded-lg leading-relaxed flex flex-col gap-1">
                                    <p>
                                        <span className="font-bold text-[#358b9a] ml-1">التفسير:</span>
                                        {answer.explanation}
                                    </p>
                                    {answer.source && (
                                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                                            <span className="font-bold text-[#9f895c] ml-1">المصدر:</span>
                                            {answer.source}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}