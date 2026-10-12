import { useState, useEffect } from 'react';
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
            className={`w-full min-h-[120px] p-4 rounded-xl border-2 border-[#9f895c] bg-white shadow-md flex items-center justify-center text-center font-bold text-sm sm:text-base text-[#0c272c] select-none leading-relaxed ${
                isDragging
                    ? 'shadow-2xl scale-105 rotate-1 border-[#358b9a] cursor-grabbing ring-4 ring-[#358b9a]/20'
                    : isPlaceholder
                    ? 'opacity-30 border-dashed'
                    : 'hover:shadow-lg cursor-grab active:cursor-grabbing'
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

// Draggable card inside Fact or Myth piles (allows dragging out to other pile or back to deck)
function DraggablePileCard({ item }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ touchAction: 'none' }}
            className={`w-full p-2.5 rounded-xl border-2 bg-white shadow-sm text-center font-bold text-xs sm:text-sm text-[#0c272c] select-none transition-all cursor-grab active:cursor-grabbing hover:border-[#358b9a] hover:shadow-md hover:-translate-y-0.5 ${
                isDragging
                    ? 'opacity-30 border-dashed border-[#358b9a]'
                    : 'border-[#9f895c]/60 hover:bg-teal-50/40'
            }`}
            dir="rtl"
        >
            <p className="line-clamp-2 leading-snug">{item.text}</p>
            <span className="text-[10px] text-gray-400 font-normal mt-1 block">
                اسحب لإعادة التصنيف
            </span>
        </div>
    );
}

// Droppable deck container so users can drag cards back to the deck from piles
function DroppableDeck({ unassigned, currentCard, nextCard }) {
    const { isOver, setNodeRef } = useDroppable({ id: 'unassigned' });

    return (
        <div
            ref={setNodeRef}
            className={`p-3.5 sm:p-4 rounded-2xl min-h-[290px] border-2 transition-all flex flex-col items-center ${
                isOver
                    ? 'border-[#358b9a] bg-teal-50/70 scale-[1.01] ring-2 ring-[#358b9a]/20'
                    : 'border-gray-200 bg-gray-50/80'
            }`}
        >
            <div className="flex justify-between items-center w-full mb-3 px-1">
                <h3 className="font-bold text-center text-[#0c272c] text-base">البطاقة الحالية</h3>
                <span className="text-xs font-semibold bg-[#9f895c]/20 text-[#0c272c] px-2.5 py-0.5 rounded-full">
                    متبقي: {unassigned.length}
                </span>
            </div>

            <div className="relative w-full max-w-xs flex-grow flex items-center justify-center min-h-[150px]">
                {currentCard ? (
                    <>
                        {/* Preview card stacked underneath */}
                        {nextCard && (
                            <div
                                className="absolute w-full min-h-[120px] p-4 rounded-xl border-2 border-gray-300 bg-gray-100 shadow-sm flex items-center justify-center text-center font-bold text-sm sm:text-base text-gray-400 select-none scale-[0.96] translate-y-2 z-0 pointer-events-none"
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
                    <div className="text-center text-green-700 font-bold p-4 bg-green-50 rounded-xl border border-green-200 text-sm">
                        ✓ تم تصنيف جميع البطاقات!
                        <p className="text-xs text-gray-500 font-normal mt-1">
                            يمكنك سحب أي بطاقة من الصناديق لإعادة ترتيبها
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Droppable pile zone (حقيقة or خرافة) with scrollable draggable cards
function DroppablePile({ id, title, items }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`p-3.5 sm:p-4 rounded-2xl min-h-[290px] border-2 border-dashed flex flex-col items-center transition-all ${
                isOver
                    ? 'border-[#358b9a] bg-teal-50/80 scale-[1.01] ring-2 ring-[#358b9a]/20'
                    : 'border-[#9f895c]/50 bg-gray-50/60'
            }`}
        >
            <div className="flex justify-between items-center w-full mb-3 px-1">
                <h3 className="font-bold text-base sm:text-lg text-[#0c272c]">{title}</h3>
                <span className="text-xs font-bold text-[#358b9a] bg-white px-2.5 py-0.5 rounded-full border border-[#358b9a]/30 shadow-xs">
                    {items.length} {items.length === 1 ? 'بطاقة' : 'بطاقات'}
                </span>
            </div>

            <div className="w-full flex-grow flex flex-col items-center justify-start py-1">
                {items.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-gray-400 text-xs sm:text-sm py-10">
                        اسحب البطاقة إلى هنا
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-2 max-h-[220px] overflow-y-auto px-1 py-1">
                        {items.map((item) => (
                            <DraggablePileCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
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

            // If dragged back to the deck (unassigned), place at the start so it becomes active card
            if (targetContainer === 'unassigned') {
                const others = prev.filter((s) => s.id !== active.id);
                return [{ ...activeItem, container: 'unassigned' }, ...others];
            }

            // Otherwise move between piles or from unassigned to a pile
            return prev.map((statement) =>
                statement.id === active.id ? { ...statement, container: targetContainer } : statement
            );
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
        <div className="w-full max-w-4xl min-h-[75vh] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-[#9f895c]/40 p-5 sm:p-6 flex flex-col m-3">
            {/* Top Bar */}
            <div className="flex justify-between items-center border-b-2 border-[#9f895c]/40 pb-3 mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#358b9a]">حقيقة أم خرافة؟</h2>
                <div className="text-base sm:text-lg font-mono bg-[#0c272c] text-white px-3.5 py-1.5 rounded-xl shadow-inner" dir="ltr">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    {/* The Flashcard Deck (Droppable & Draggable) */}
                    <DroppableDeck
                        unassigned={unassigned}
                        currentCard={currentCard}
                        nextCard={nextCard}
                    />

                    {/* The Droppable Fact and Myth piles */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* DragOverlay rendered in portal with pointer-events-none */}
                <DragOverlay dropAnimation={null}>
                    {activeStatement ? (
                        <div className="w-[280px] sm:w-[300px] pointer-events-none select-none">
                            <FlashcardView text={activeStatement.text} isDragging={true} />
                        </div>
                    ) : null}
                </DragOverlay>
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