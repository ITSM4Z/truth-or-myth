import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function Leaderboard({ highlightPlayerName }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadData() {
        if (!supabase) {
            setError("قاعدة البيانات غير مهيأة حالياً");
            setLoading(false);
            return;
        }

        try {
            const { data, error: fetchErr } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .order('time_seconds', { ascending: true });

            if (fetchErr) {
                console.error("Error fetching leaderboard:", fetchErr);
                setError("تعذر تحميل لوحة المتصدرين حالياً");
                setLoading(false);
                return;
            }

            const playerMap = new Map();
            (data || []).forEach((row) => {
                const normName = row.player_name ? row.player_name.trim().toLowerCase() : '';
                if (!normName) return;

                if (!playerMap.has(normName)) {
                    playerMap.set(normName, row);
                } else {
                    const existing = playerMap.get(normName);
                    if (
                        row.score > existing.score ||
                        (row.score === existing.score && row.time_seconds < existing.time_seconds)
                    ) {
                        playerMap.set(normName, row);
                    }
                }
            });

            const uniqueSorted = Array.from(playerMap.values()).sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.time_seconds - b.time_seconds;
            });

            setPlayers(uniqueSorted);
            setError(null);
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function init() {
            if (!supabase) {
                await Promise.resolve();
                if (isMounted) {
                    setError("قاعدة البيانات غير مهيأة حالياً");
                    setLoading(false);
                }
                return;
            }

            try {
                const { data, error: fetchErr } = await supabase
                    .from('leaderboard')
                    .select('*')
                    .order('score', { ascending: false })
                    .order('time_seconds', { ascending: true });

                if (!isMounted) return;

                if (fetchErr) {
                    console.error("Error fetching leaderboard:", fetchErr);
                    setError("تعذر تحميل لوحة المتصدرين حالياً");
                    setLoading(false);
                    return;
                }

                const playerMap = new Map();
                (data || []).forEach((row) => {
                    const normName = row.player_name ? row.player_name.trim().toLowerCase() : '';
                    if (!normName) return;

                    if (!playerMap.has(normName)) {
                        playerMap.set(normName, row);
                    } else {
                        const existing = playerMap.get(normName);
                        if (
                            row.score > existing.score ||
                            (row.score === existing.score && row.time_seconds < existing.time_seconds)
                        ) {
                            playerMap.set(normName, row);
                        }
                    }
                });

                const uniqueSorted = Array.from(playerMap.values()).sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.time_seconds - b.time_seconds;
                });

                setPlayers(uniqueSorted);
                setError(null);
            } catch (err) {
                if (isMounted) {
                    console.error("Unexpected error:", err);
                    setError("حدث خطأ أثناء تحميل البيانات");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    function handleRefresh() {
        setLoading(true);
        loadData();
    }

    const normalizedHighlight = highlightPlayerName ? highlightPlayerName.trim().toLowerCase() : '';

    return (
        <div className="w-full flex flex-col">
            {/* Header with Title and Refresh Button */}
            <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="font-bold text-base sm:text-lg text-[#0c272c]">
                        لوحة المتصدرين ({players.length} {players.length === 1 ? 'مشارك' : 'مشاركين'})
                    </h3>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="text-xs font-bold text-[#006471] bg-teal-50 hover:bg-teal-100 border border-[#006471]/30 px-3 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    title="تحديث البيانات"
                >
                    <span className={loading ? "animate-spin" : ""}>🔄</span>
                    <span>تحديث</span>
                </button>
            </div>

            {/* Content area */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 gap-2">
                    <div className="w-8 h-8 border-4 border-[#006471] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm">جاري جلب النتائج من قاعدة البيانات...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 text-sm">
                    {error}
                </div>
            ) : players.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-gray-50/60 rounded-xl border border-dashed border-gray-300 p-6">
                    <p className="text-base font-bold text-[#0c272c] mb-1">لا توجد نتائج مسجلة حتى الآن</p>
                    <p className="text-xs text-gray-400">كن أول طالب يشارك ويتصدر القائمة!</p>
                </div>
            ) : (
                <div className="w-full max-h-[380px] overflow-y-auto space-y-2 pr-1">
                    {players.map((p, index) => {
                        const rank = index + 1;
                        const isCurrent = normalizedHighlight && p.player_name.trim().toLowerCase() === normalizedHighlight;

                        let rankBadge = (
                            <span className="font-bold text-gray-500 text-sm w-7 text-center">
                                #{rank}
                            </span>
                        );

                        let rankStyle = "border-gray-200 bg-white hover:border-[#358b9a]";
                        if (rank === 1) {
                            rankBadge = <span className="text-xl w-7 text-center">🥇</span>;
                            rankStyle = "border-amber-400 bg-amber-50/40 shadow-xs";
                        } else if (rank === 2) {
                            rankBadge = <span className="text-xl w-7 text-center">🥈</span>;
                            rankStyle = "border-slate-300 bg-slate-50/60";
                        } else if (rank === 3) {
                            rankBadge = <span className="text-xl w-7 text-center">🥉</span>;
                            rankStyle = "border-amber-700/30 bg-orange-50/30";
                        }

                        if (isCurrent) {
                            rankStyle = "border-[#006471] bg-teal-50/90 shadow-md ring-2 ring-[#006471]/30";
                        }

                        const pMinutes = String(Math.floor((p.time_seconds || 0) / 60)).padStart(2, '0');
                        const pSeconds = String((p.time_seconds || 0) % 60).padStart(2, '0');

                        return (
                            <div
                                key={p.id || index}
                                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${rankStyle}`}
                                dir="rtl"
                            >
                                <div className="flex items-center gap-2.5">
                                    {rankBadge}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-sm sm:text-base text-[#0c272c]">
                                                {p.player_name}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[10px] bg-[#006471] text-white font-bold px-2 py-0.5 rounded-full">
                                                    أنت هنا ⭐
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-left font-bold text-xs sm:text-sm text-[#006471] bg-white px-2.5 py-1 rounded-lg border border-[#006471]/20 shadow-2xs">
                                        {p.score} / 15
                                    </div>
                                    <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded" dir="ltr">
                                        ⏱ {pMinutes}:{pSeconds}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
