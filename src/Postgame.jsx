import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Leaderboard } from './Leaderboard';

export function Postgame({ playerName, finalScore, finalTime, playerAnswers, setCurrentScreen, setPlayerName }) {
    const [activeTab, setActiveTab] = useState("leaderboard"); // Default to leaderboard for booth experience
    const [saveDone, setSaveDone] = useState(false);
    const saveAttemptedRef = useRef(false);

    useEffect(() => {
        // Prevent React StrictMode or re-renders from executing saveScore twice
        if (saveAttemptedRef.current) return;
        saveAttemptedRef.current = true;

        async function saveScore() {
            if (!supabase || !playerName) {
                setSaveDone(true);
                return;
            }

            const cleanName = playerName.trim();
            if (!cleanName) {
                setSaveDone(true);
                return;
            }

            try {
                // Check if player already exists in leaderboard (case-insensitive check)
                const { data: existingRecords, error: fetchErr } = await supabase
                    .from('leaderboard')
                    .select('*')
                    .ilike('player_name', cleanName);

                if (fetchErr) {
                    console.error("Error checking existing player:", fetchErr);
                }

                if (existingRecords && existingRecords.length > 0) {
                    // Find their existing best record
                    const bestRecord = existingRecords.reduce((best, curr) => {
                        if (curr.score > best.score) return curr;
                        if (curr.score === best.score && curr.time_seconds < best.time_seconds) return curr;
                        return best;
                    }, existingRecords[0]);

                    // Check if current attempt is strictly better (higher score, or same score with faster time)
                    const isCurrentBetter = finalScore > bestRecord.score ||
                        (finalScore === bestRecord.score && finalTime < bestRecord.time_seconds);

                    if (isCurrentBetter) {
                        await supabase
                            .from('leaderboard')
                            .update({
                                score: finalScore,
                                time_seconds: finalTime,
                                created_at: new Date().toISOString()
                            })
                            .eq('id', bestRecord.id);
                    }

                    // Clean up any old duplicate records for this player name
                    const duplicateIds = existingRecords
                        .filter((r) => r.id !== bestRecord.id)
                        .map((r) => r.id);

                    if (duplicateIds.length > 0) {
                        await supabase
                            .from('leaderboard')
                            .delete()
                            .in('id', duplicateIds);
                    }
                } else {
                    // First time player: insert single clean record
                    await supabase
                        .from('leaderboard')
                        .insert([
                            { 
                                player_name: cleanName, 
                                score: finalScore, 
                                time_seconds: finalTime 
                            }
                        ]);
                }
            } catch (err) {
                console.error("Error saving score to database:", err);
            } finally {
                setSaveDone(true);
            }
        }

        saveScore();
    }, [playerName, finalScore, finalTime]);

    const minutes = String(Math.floor(finalTime / 60)).padStart(2, '0');
    const seconds = String(finalTime % 60).padStart(2, '0');

    function handleReturn() {
        if (setPlayerName) setPlayerName("");
        setCurrentScreen("pregame");
    }

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

            {/* Navigation Tabs (Leaderboard vs Answer Review) */}
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "leaderboard"
                            ? "bg-[#006471] text-white shadow-sm"
                            : "text-[#0c272c] hover:bg-gray-200"
                    }`}
                >
                    <span>🏆</span>
                    <span>لوحة المتصدرين</span>
                </button>
                <button
                    onClick={() => setActiveTab("corrections")}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "corrections"
                            ? "bg-[#006471] text-white shadow-sm"
                            : "text-[#0c272c] hover:bg-gray-200"
                    }`}
                >
                    <span>📋</span>
                    <span>تصحيح الإجابات والتفسيرات</span>
                </button>
            </div>

            {/* Tab 1: Leaderboard */}
            {activeTab === "leaderboard" && (
                <div className="w-full flex-grow">
                    <Leaderboard key={saveDone ? "saved" : "pending"} highlightPlayerName={playerName} />
                </div>
            )}

            {/* Tab 2: Corrections List */}
            {activeTab === "corrections" && (
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
            )}

            {/* Return to Menu Button */}
            <div className="mt-6 mb-2 flex justify-center w-full">
                <button
                    onClick={handleReturn}
                    className="bg-[#006471] text-white px-8 py-2.5 rounded-xl text-base sm:text-lg font-bold hover:bg-[#0c272c] active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <span>↩</span>
                    <span>الرجوع للقائمة الرئيسية</span>
                </button>
            </div>
        </div>
    );
}