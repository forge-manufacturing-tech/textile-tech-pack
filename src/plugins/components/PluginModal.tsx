import React from 'react';
import { Plugin, PluginContext } from '../types';

interface PluginModalProps {
    plugin: Plugin;
    context: PluginContext;
    onClose: () => void;
}

export const PluginModal: React.FC<PluginModalProps> = ({ plugin, context, onClose }) => {
    const { Component } = plugin;

    return (
        <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="industrial-panel rounded-sm p-6 w-full max-w-4xl h-[80vh] flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6 border-b border-industrial-concrete pb-4">
                    <div className="flex items-center gap-3">
                        {plugin.icon && <div className="text-industrial-copper-500">{plugin.icon}</div>}
                        <div>
                            <h3 className="industrial-headline text-xl">{plugin.name}</h3>
                            <p className="text-xs text-industrial-steel-400 font-mono">{plugin.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-industrial-steel-500 hover:text-industrial-copper-500 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <Component context={context} onClose={onClose} />
                </div>
            </div>
        </div>
    );
};
