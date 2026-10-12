import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// The draggable statement card
function DraggableItem({ id, text }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            className="bg-white p-3 mb-2 rounded border-2 border-[#9f895c] shadow-sm cursor-grab z-50 relative"
        >
            {text}
        </div>
    );
}

// The drop zones (Fact, Myth, or Unassigned list)
function DroppableContainer({ id, title, items }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    
    return (
        <div 
            ref={setNodeRef} 
            className={`p-4 rounded-xl min-h-[250px] border-2 transition-colors ${
                isOver ? 'border-[#358b9a] bg-teal-50' : 'border-gray-300 bg-gray-50'
            }`}
        >
            <h3 className="font-bold text-center mb-4 text-[#0c272c]">{title}</h3>
            {items.map(item => (
                <DraggableItem key={item.id} id={item.id} text={item.text} />
            ))}
        </div>
    );
}

// Main component
export function Ingame({ setCurrentScreen }) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    // State now tracks where each item currently lives using the "container" property
    const [statements, setStatements] = useState([
        { id: "1", text: "تجربة 1", correctAnswer: "myth", container: "unassigned" },
        { id: "2", text: "تجربة 2", correctAnswer: "fact", container: "unassigned" },
        { id: "3", text: "تجربة 3", correctAnswer: "fact", container: "unassigned" },
        { id: "4", text: "تجربة 4", correctAnswer: "myth", container: "unassigned" },
    ]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed((prevTime) => prevTime + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // This function fires exactly when the user lets go of the mouse button
    function handleDragEnd(event) {
        const { active, over } = event;
        
        // If dropped outside a valid container, do nothing
        if (!over) return;

        // Update the state to change the item's container to the box it was dropped into
        setStatements((prev) => 
            prev.map(statement => 
                statement.id === active.id ? { ...statement, container: over.id } : statement
            )
        );
    }

    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
    const seconds = String(timeElapsed % 60).padStart(2, '0');

    return (
        <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-xl shadow-lg p-6 flex flex-col m-4">
            <div className="flex justify-between items-center border-b-2 border-[#9f895c] pb-4 mb-6">
                <h2 className="text-2xl font-bold text-[#358b9a]">حقيقة أم خرافة؟</h2>
                <div className="text-xl font-mono bg-[#0c272c] text-white px-4 py-2 rounded" dir="ltr">
                    {minutes}:{seconds}
                </div>
            </div>
            
            {/* DndContext wraps everything that needs to handle drag-and-drop */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                    
                    {/* The list of unassigned statements */}
                    <div className="md:col-span-1">
                        <DroppableContainer 
                            id="unassigned" 
                            title="المعلومات" 
                            items={statements.filter(s => s.container === "unassigned")} 
                        />
                    </div>

                    {/* The drop zones */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <DroppableContainer 
                            id="fact" 
                            title="حقيقة" 
                            items={statements.filter(s => s.container === "fact")} 
                        />
                        <DroppableContainer 
                            id="myth" 
                            title="خرافة" 
                            items={statements.filter(s => s.container === "myth")} 
                        />
                    </div>

                </div>
            </DndContext>

            <button 
                className="mt-8 bg-[#2a636d] text-white px-8 py-3 rounded text-lg font-bold hover:bg-[#0c272c] self-center transition-colors"
                onClick={() => setCurrentScreen("postgame")}
            >
                تسليم
            </button>
        </div>
    );
}