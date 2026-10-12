import { useState } from 'react';
import gatheringIcon from './assets/GatheringIcon.png';
import ecCcTcLogo from './assets/EC_CC_TC.png';

export function Pregame({ setCurrentScreen, playerName, setPlayerName }) {
    const [nameError, setNameError] = useState("");

    function handleStart() {
        const trimmedName = playerName.trim();

        if (!trimmedName) {
            setNameError("الرجاء إدخال اسمك قبل البدء");
            return;
        }

        setPlayerName(trimmedName);
        setCurrentScreen("ingame");
    }

    return (
        <div className="w-full max-w-xl flex flex-col items-center gap-6 my-4">
            {/* Top Partner / Club Branding */}
            <div className="flex items-center justify-center p-3 px-6 rounded-2xl bg-[#256770] border border-[#9f895c]/40 shadow-lg">
                <img
                    src={ecCcTcLogo}
                    alt="أندية جامعة أم القرى و Tuwaiq Club"
                    className="h-12 sm:h-14 w-auto object-contain"
                />
            </div>

            {/* Main Interactive Card */}
            <div className="w-full bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border-2 border-[#9f895c]/50 flex flex-col items-center text-center">
                {/* Gathering Logo / Theme Banner */}
                <div className="mb-4 flex justify-center">
                    <img
                        src={gatheringIcon}
                        alt="لكل صوت أثر - ملتقى الصحة النفسية"
                        className="h-20 sm:h-24 w-auto object-contain rounded-xl shadow-sm"
                    />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#0c272c] mb-2" dir="rtl">
                    لعبة حقيقة أم خرافة
                </h1>
                <p className="text-sm sm:text-base text-[#358b9a] font-medium mb-6" dir="rtl">
                    اختبر معلوماتك وتعرّف على الحقائق والمفاهيم الشائعة في الصحة النفسية
                </p>

                {/* Input with inline error handling */}
                <div className="w-full max-w-sm flex flex-col items-center gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="أدخل اسمك الكريم..."
                        className={`w-full text-center text-lg border-2 rounded-xl px-5 py-3 text-[#0c272c] bg-gray-50 focus:bg-white focus:outline-none transition-all shadow-inner ${
                            nameError
                                ? 'border-red-600 ring-2 ring-red-200'
                                : 'border-[#9f895c] focus:border-[#358b9a] focus:ring-2 focus:ring-[#358b9a]/20'
                        }`}
                        value={playerName}
                        onChange={(e) => {
                            setPlayerName(e.target.value);
                            if (nameError) setNameError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStart();
                        }}
                        aria-invalid={Boolean(nameError)}
                        aria-describedby={nameError ? "name-error" : undefined}
                        dir="rtl"
                    />
                    {nameError && (
                        <p id="name-error" role="alert" dir="rtl" className="text-sm font-bold text-red-600">
                            {nameError}
                        </p>
                    )}
                </div>

                {/* Start Button */}
                <button
                    className="w-full max-w-sm bg-[#006471] text-white py-3.5 px-8 rounded-xl text-lg font-bold hover:bg-[#0c272c] active:scale-[0.99] transition-all shadow-md hover:shadow-lg"
                    onClick={handleStart}
                >
                    ابدأ اللعبة
                </button>
            </div>
        </div>
    );
}