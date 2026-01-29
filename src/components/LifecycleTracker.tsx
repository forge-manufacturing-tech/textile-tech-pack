import React, { useState } from 'react';

interface LifecycleTrackerProps {
    steps: string[];
    currentStep: number;
    isEditable: boolean;
    onUpdate: (steps: string[], currentStep: number) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export function LifecycleTracker({ steps, currentStep, isEditable, onUpdate, onGenerate, isGenerating }: LifecycleTrackerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editSteps, setEditSteps] = useState<string[]>([]);

    const handleStartEdit = () => {
        setEditSteps([...steps]);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        onUpdate(editSteps, currentStep);
        setIsEditing(false);
    };

    const handleStepClick = (index: number) => {
        if (!isEditable) return;
        onUpdate(steps, index);
    };

    const addStep = () => {
        setEditSteps([...editSteps, "New Phase"]);
    };

    const removeStep = (index: number) => {
        setEditSteps(editSteps.filter((_, i) => i !== index));
    };

    const updateStepLabel = (index: number, val: string) => {
        const newSteps = [...editSteps];
        newSteps[index] = val;
        setEditSteps(newSteps);
    };

    if (steps.length === 0 && !isEditing) {
        return (
            <div className="industrial-panel p-6 mb-6 flex flex-col items-center justify-center gap-4 border-dashed border-industrial-concrete/50">
                <div className="text-industrial-steel-500 font-mono uppercase text-xs tracking-widest">No Lifecycle Defined</div>
                {isEditable && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleStartEdit}
                            className="industrial-btn px-4 py-2 text-xs"
                        >
                            Manually Define Steps
                        </button>
                        <button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="industrial-btn px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? <span className="animate-spin">⟳</span> : <span>⚡</span>}
                            Generate with AI
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="industrial-panel p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest font-mono">Configure Lifecycle</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-xs text-industrial-steel-500 hover:text-white px-3 py-1 font-mono uppercase">Cancel</button>
                        <button onClick={handleSaveEdit} className="industrial-btn px-3 py-1 text-xs">Save Changes</button>
                    </div>
                </div>
                <div className="space-y-2">
                    {editSteps.map((step, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={step}
                                onChange={(e) => updateStepLabel(i, e.target.value)}
                                className="flex-1 industrial-input px-3 py-2 text-xs font-mono rounded-sm"
                            />
                            <button onClick={() => removeStep(i)} className="text-industrial-alert hover:text-red-400 px-2 text-lg">×</button>
                        </div>
                    ))}
                    <button onClick={addStep} className="w-full py-2 border border-dashed border-industrial-concrete text-industrial-steel-500 hover:text-industrial-copper-500 text-xs font-mono uppercase rounded-sm mt-2 transition-colors">
                        + Add Step
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="industrial-panel p-6 mb-6 relative group">
             <div className="flex justify-between items-end mb-8">
                <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <span className="w-2 h-2 bg-industrial-copper-500 rounded-full animate-pulse"></span>
                    Production Lifecycle
                </h3>
                {isEditable && (
                    <button onClick={handleStartEdit} className="text-[10px] text-industrial-steel-600 hover:text-industrial-copper-500 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        [Edit Configuration]
                    </button>
                )}
            </div>

            <div className="relative px-4">
                {/* Connecting Lines Container */}
                <div className="absolute top-4 left-4 right-4 h-0.5 z-0">
                     {/* Background Line */}
                    <div className="absolute inset-0 bg-industrial-steel-800"></div>
                     {/* Active Progress Line */}
                    <div
                        className="absolute top-0 left-0 h-full bg-industrial-copper-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min((currentStep / (Math.max(steps.length - 1, 1))) * 100, 100)}%` }}
                    ></div>
                </div>

                <div className="relative z-10 flex justify-between w-full">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;
                        const isPending = index > currentStep;

                        return (
                            <div
                                key={index}
                                className={`flex flex-col items-center gap-4 cursor-pointer group/step transition-all w-24 ${isEditable ? 'hover:-translate-y-1' : ''}`}
                                onClick={() => handleStepClick(index)}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-industrial-steel-950 relative
                                    ${isCompleted ? 'border-industrial-copper-500 text-industrial-copper-500 shadow-glow-copper' : ''}
                                    ${isActive ? 'border-industrial-copper-500 text-white shadow-glow-copper scale-110' : ''}
                                    ${isPending ? 'border-industrial-steel-800 text-industrial-steel-600' : ''}
                                `}>
                                    {isCompleted && <span className="text-lg">✓</span>}
                                    {isActive && <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>}
                                    {isPending && <span className="text-[10px] font-mono">{index + 1}</span>}
                                </div>
                                <span className={`
                                    text-[9px] font-mono uppercase tracking-wider text-center transition-colors leading-tight
                                    ${isCompleted ? 'text-industrial-copper-500' : ''}
                                    ${isActive ? 'text-white font-bold' : ''}
                                    ${isPending ? 'text-industrial-steel-600' : ''}
                                `}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
