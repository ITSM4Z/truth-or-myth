import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    MouseSensor,
    TouchSensor,
    pointerWithin,
    closestCenter,
    rectIntersection,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { initialStatementsData } from './statementsData';

// Utility to randomize the statements order
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Custom collision detection: pointer directly inside a box takes highest priority,
// with closestCenter as a smooth fallback.
function customCollisionDetection(args) {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    const centerCollisions = closestCenter(args);
    if (centerCollisions.length > 0) {
        return centerCollisions;
    }
    return rectIntersection(args);
}

// Flashcard view component used in deck and DragOverlay
function FlashcardView({ text, isDragging = false, isPlaceholder = false }) {
    return (
        <div
            className={`w-full min-h-[130px] p-4 sm:p-5 rounded-2xl border-2 bg-white flex items-center justify-center text-center font-bold text-sm sm:text-base text-[#0c272c] select-none leading-relaxed transition-all ${
                isDragging
                    ? 'shadow-2xl border-[#358b9a] cursor-grabbing ring-4 ring-[#358b9a]/20'
                    : isPlaceholder
                    ? 'opacity-0 pointer-events-none'
                    : 'border-[#9f895c] shadow-md hover:shadow-lg cursor-grab active:cursor-grabbing'
            }`}
            style={{ touchAction: 'none' }}
            dir="rtl"
        >
            {text}
        </div>
    );
}

// Draggable flashcard in the central deck
function DraggableFlashcard({ id, text, isTop }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        disabled: !isTop,
    });

    return (
        <div
            ref={setNodeRef}
            {...(isTop ? listeners : {})}
            {...(isTop ? attributes : {})}
            className="w-full relative z-10"
            style={{ touchAction: 'none' }}
        >
            <FlashcardView text={text} isPlaceholder={isDragging} />
        </div>
    );
}


// Droppable deck container so users can drag cards back to the deck from piles
function DroppableDeck({ unassigned, currentCard, nextCard }) {
    const { isOver, setNodeRef } = useDroppable({ id: 'unassigned' });

    return (
        <div
            ref={setNodeRef}
            className={`p-4 sm:p-5 rounded-2xl min-h-[340px] md:min-h-[380px] border-2 transition-all flex flex-col justify-between items-center ${
                isOver
                    ? 'border-[#358b9a] bg-teal-50/70 scale-[1.01] ring-2 ring-[#358b9a]/20'
                    : 'border-gray-200 bg-gray-50/80'
            }`}
        >
            <div className="flex justify-between items-center w-full mb-3 px-1">
                <h3 className="font-bold text-[#0c272c] text-base sm:text-lg">البطاقة الحالية</h3>
                <span className="text-xs font-semibold bg-[#9f895c]/20 text-[#0c272c] px-3 py-1 rounded-full">
                    متبقي: {unassigned.length}
                </span>
            </div>

            <div className="relative w-full flex-grow flex items-center justify-center min-h-[160px] my-auto">
                {currentCard ? (
                    <>
                        {/* Preview card stacked underneath */}
                        {nextCard && (
                            <div
                                className="absolute w-full min-h-[130px] p-4 sm:p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-sm flex items-center justify-center text-center font-bold text-sm sm:text-base text-[#0c272c]/40 select-none scale-[0.96] translate-y-2 z-0 pointer-events-none"
                                dir="rtl"
                            >
                                {nextCard.text}
                            </div>
                        )}

                        {/* Top active card in deck */}
                        <DraggableFlashcard
                            key={currentCard.id}
                            id={currentCard.id}
                            text={currentCard.text}
                            isTop={true}
                        />
                    </>
                ) : (
                    <div className="text-center text-green-700 font-bold p-5 bg-green-50 rounded-2xl border border-green-200 text-sm">
                        ✓ تم تصنيف جميع البطاقات!
                        <p className="text-xs text-gray-500 font-normal mt-1.5">
                            يمكنك سحب أي بطاقة من الصناديق لإعادة ترتيبها
                        </p>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-400 text-center mt-2 font-normal">
                {currentCard ? "اسحب البطاقة إلى حقيقة أو خرافة" : "يمكنك تعديل الإجابات بالسحب"}
            </div>
        </div>
    );
}

// Droppable pile zone (حقيقة or خرافة) with stacked flashcard pile
function DroppablePile({ id, title, items }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    const [showModal, setShowModal] = useState(false);

    const latestCard = items[0] || null;
    const secondCard = items[1] || null;
    const thirdCard = items[2] || null;

    return (
        <div
            ref={setNodeRef}
            className={`p-4 sm:p-5 rounded-2xl min-h-[340px] md:min-h-[380px] border-2 transition-all flex flex-col justify-between items-center ${
                isOver
                    ? 'border-[#358b9a] bg-teal-50/70 scale-[1.01] ring-2 ring-[#358b9a]/20'
                    : 'border-2 border-dashed border-[#9f895c]/50 bg-gray-50/60'
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center w-full mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-[#0c272c]">{title}</h3>
                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="text-[11px] text-[#358b9a] hover:text-[#0c272c] hover:underline font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-[#358b9a]/20 shadow-xs cursor-pointer transition-colors"
                            title="استعراض جميع البطاقات في هذا الصندوق"
                        >
                            عرض الكل ({items.length})
                        </button>
                    )}
                </div>
                <span className="text-xs font-bold text-[#358b9a] bg-white px-2.5 py-0.5 rounded-full border border-[#358b9a]/30 shadow-xs">
                    {items.length} {items.length === 1 ? 'بطاقة' : 'بطاقات'}
                </span>
            </div>

            {/* Stack Area */}
            <div className="relative w-full flex-grow flex items-center justify-center min-h-[160px] my-auto">
                {items.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-xs sm:text-sm py-10 select-none">
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 text-lg text-gray-400 font-bold">
                            +
                        </div>
                        اسحب البطاقة إلى هنا
                    </div>
                ) : (
                    <>
                        {/* 3rd card in stack (deep depth layer when 3+ elements) */}
                        {thirdCard && (
                            <div
                                className="absolute w-full min-h-[130px] p-4 sm:p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-xs flex items-center justify-center text-center font-bold text-sm sm:text-base text-[#0c272c]/30 select-none scale-[0.92] translate-y-4 z-0 pointer-events-none"
                                dir="rtl"
                            >
                                {thirdCard.text}
                            </div>
                        )}

                        {/* 2nd card in stack (depth layer when 2+ elements) */}
                        {secondCard && (
                            <div
                                className="absolute w-full min-h-[130px] p-4 sm:p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-sm flex items-center justify-center text-center font-bold text-sm sm:text-base text-[#0c272c]/50 select-none scale-[0.96] translate-y-2 z-10 pointer-events-none"
                                dir="rtl"
                            >
                                {secondCard.text}
                            </div>
                        )}

                        {/* Top active card in stack (LATEST card - draggable) */}
                        <div className="w-full relative z-20">
                            <DraggableFlashcard
                                key={latestCard.id}
                                id={latestCard.id}
                                text={latestCard.text}
                                isTop={true}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Footer hint */}
            <div className="text-xs text-gray-400 text-center mt-2 font-normal">
                {latestCard
                    ? "آخر بطاقة مضافة (اسحب لتعديل التصنيف)"
                    : `صندوق ${title}`}
            </div>

            {/* Modal to view all cards in this pile */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border-2 border-[#9f895c] max-w-md w-full max-h-[80vh] flex flex-col p-5"
                        onClick={(e) => e.stopPropagation()}
                        dir="rtl"
                    >
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                            <h4 className="font-bold text-lg text-[#0c272c]">
                                بطاقات {title} ({items.length})
                            </h4>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2 py-0.5 rounded cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-2.5 flex-grow pr-1">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`p-3 rounded-xl border text-sm font-bold text-[#0c272c] ${
                                        idx === 0
                                            ? 'border-[#358b9a] bg-teal-50/50 shadow-xs'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-gray-400 font-normal">
                                            {idx === 0 ? '★ آخر بطاقة مضافة' : `بطاقة #${items.length - idx}`}
                                        </span>
                                    </div>
                                    <p className="leading-snug">{item.text}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 bg-[#006471] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#0c272c] transition-colors self-center text-sm"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main Ingame component
export function Ingame({ setCurrentScreen, setFinalTime, setFinalScore, setPlayerAnswers }) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [activeId, setActiveId] = useState(null);
    const [submitError, setSubmitError] = useState("");

    // Sensors setup: multi-sensor support ensures smooth dragging on touch, pointer, and mouse
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            },
        })
    );

    // Initialize statements with randomized order
    const [statements, setStatements] = useState(() => shuffleArray(initialStatementsData));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed((prevTime) => prevTime + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;
        const targetContainer = over.id; // 'fact', 'myth', or 'unassigned'

        if (targetContainer !== 'fact' && targetContainer !== 'myth' && targetContainer !== 'unassigned') {
            return;
        }

        if (submitError) setSubmitError("");

        setStatements((prev) => {
            const activeItem = prev.find((s) => s.id === active.id);
            if (!activeItem || activeItem.container === targetContainer) return prev;

            // Place activeItem at the front so it is ALWAYS the latest card on top of the target container
            const others = prev.filter((s) => s.id !== active.id);
            return [{ ...activeItem, container: targetContainer }, ...others];
        });
    }

    function handleDragCancel() {
        setActiveId(null);
    }

    function handleSubmit() {
        const unclassifiedCount = statements.filter((s) => s.container === "unassigned").length;

        if (unclassifiedCount > 0) {
            setSubmitError(`الرجاء تصنيف جميع المعلومات أولاً (متبقي ${unclassifiedCount} ${unclassifiedCount === 1 ? 'بطاقة' : 'بطاقات'})`);
            return;
        }

        const score = statements.filter(
            (statement) => statement.container === statement.correctAnswer
        ).length;

        setFinalScore(score);
        setFinalTime(timeElapsed);
        setPlayerAnswers(statements);

        setCurrentScreen("postgame");
    }

    const unassigned = statements.filter((s) => s.container === "unassigned");
    const currentCard = unassigned[0] || null;
    const nextCard = unassigned[1] || null;
    const activeStatement = statements.find((s) => s.id === activeId) || null;

    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
    const seconds = String(timeElapsed % 60).padStart(2, '0');

    return (
        <div className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl shadow-2xl border-2 border-[#9f895c]/40 p-5 sm:p-7 flex flex-col my-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-center border-b-2 border-[#9f895c]/40 pb-3.5 mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#358b9a]">حقيقة أم خرافة؟</h2>
                <div className="text-base sm:text-lg font-mono bg-[#0c272c] text-white px-4 py-1.5 rounded-xl shadow-inner tracking-wider" dir="ltr">
                    {minutes}:{seconds}
                </div>
            </div>

            {/* DndContext with custom collision detection & DragOverlay */}
            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-grow">
                    {/* The Flashcard Deck (Droppable & Draggable) */}
                    <DroppableDeck
                        unassigned={unassigned}
                        currentCard={currentCard}
                        nextCard={nextCard}
                    />

                    {/* The Droppable Fact and Myth piles */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <DroppablePile
                            id="fact"
                            title="حقيقة"
                            items={statements.filter((s) => s.container === "fact")}
                        />
                        <DroppablePile
                            id="myth"
                            title="خرافة"
                            items={statements.filter((s) => s.container === "myth")}
                        />
                    </div>
                </div>

                {/* DragOverlay rendered in portal to escape all containing blocks */}
                {typeof document !== 'undefined'
                    ? createPortal(
                          <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
                              {activeStatement ? (
                                  <div className="w-full pointer-events-none select-none">
                                      <FlashcardView text={activeStatement.text} isDragging={true} />
                                  </div>
                              ) : null}
                          </DragOverlay>,
                          document.body
                      )
                    : null}
            </DndContext>

            {/* Submission Section */}
            <div className="mt-6 flex flex-col items-center gap-2 self-center">
                {submitError && (
                    <div 
                        role="alert" 
                        dir="rtl"
                        className="bg-red-50 text-red-700 border border-red-300 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm animate-pulse"
                    >
                        ⚠️ {submitError}
                    </div>
                )}
                <button
                    className="bg-[#006471] text-white px-8 py-2.5 rounded-xl text-base sm:text-lg font-bold hover:bg-[#0c272c] active:scale-[0.99] transition-all shadow-md hover:shadow-lg"
                    onClick={handleSubmit}
                >
                    تسليم الإجابات
                </button>
            </div>
        </div>
    );
}