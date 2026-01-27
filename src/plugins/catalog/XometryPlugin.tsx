import React, { useState } from 'react';
import { Plugin, PluginContext } from '../types';

const XometryPluginComponent: React.FC<{ context: PluginContext; onClose: () => void }> = ({ context }) => {
    const [selectedBlobs, setSelectedBlobs] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [quoteId, setQuoteId] = useState<string | null>(null);

    const relevantBlobs = context.blobs.filter(b =>
        b.file_name.endsWith('.stl') ||
        b.file_name.endsWith('.step') ||
        b.file_name.endsWith('.stp') ||
        b.file_name.endsWith('.pdf') ||
        b.file_name.endsWith('.png') // For demo purposes
    );

    const toggleBlob = (id: string) => {
        if (selectedBlobs.includes(id)) {
            setSelectedBlobs(selectedBlobs.filter(bid => bid !== id));
        } else {
            setSelectedBlobs([...selectedBlobs, id]);
        }
    };

    const handleGetQuote = async () => {
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSubmitting(false);
        setQuoteId(`Q-${Math.floor(Math.random() * 10000)}`);
    };

    if (quoteId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-900/20 border border-green-500/50 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="industrial-headline text-2xl mb-2 text-white">QUOTE GENERATED</h3>
                <p className="text-industrial-steel-400 font-mono mb-8">Quote ID: <span className="text-industrial-copper-500 font-bold">{quoteId}</span></p>
                <div className="p-4 bg-industrial-steel-900/50 border border-industrial-concrete rounded-sm mb-8 max-w-md w-full">
                    <p className="text-xs text-industrial-steel-500 font-mono mb-2 uppercase tracking-wide">Estimated Cost</p>
                    <p className="text-3xl font-bold text-white">$1,245.00</p>
                    <p className="text-xs text-industrial-steel-500 font-mono mt-1">Lead Time: 5-7 Days</p>
                </div>
                <button
                    onClick={() => setQuoteId(null)}
                    className="industrial-btn px-6 py-2 rounded-sm text-xs"
                >
                    Start New Quote
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="bg-industrial-steel-900/30 p-4 border border-industrial-concrete rounded-sm">
                <h4 className="text-sm font-bold text-industrial-copper-500 uppercase tracking-widest mb-2 font-mono">Xometry Instant Quoting Engine</h4>
                <p className="text-xs text-industrial-steel-400 font-mono leading-relaxed">
                    Select 3D files (STL, STEP, STP) or drawings from your session to generate an instant manufacturing quote.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar border border-industrial-concrete bg-industrial-steel-950/50 rounded-sm">
                <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-industrial-steel-900 sticky top-0">
                        <tr>
                            <th className="p-3 border-b border-industrial-concrete w-10">
                                <input
                                    type="checkbox"
                                    onChange={() => {
                                        if (selectedBlobs.length === relevantBlobs.length) setSelectedBlobs([]);
                                        else setSelectedBlobs(relevantBlobs.map(b => b.id));
                                    }}
                                    checked={relevantBlobs.length > 0 && selectedBlobs.length === relevantBlobs.length}
                                    className="bg-transparent border-industrial-steel-600 rounded-sm"
                                />
                            </th>
                            <th className="p-3 border-b border-industrial-concrete text-industrial-steel-400 uppercase tracking-wider">File Name</th>
                            <th className="p-3 border-b border-industrial-concrete text-industrial-steel-400 uppercase tracking-wider">Type</th>
                            <th className="p-3 border-b border-industrial-concrete text-industrial-steel-400 uppercase tracking-wider text-right">Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {relevantBlobs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-industrial-steel-600 italic">
                                    No compatible files found in this session.
                                </td>
                            </tr>
                        ) : (
                            relevantBlobs.map(blob => (
                                <tr
                                    key={blob.id}
                                    className={`border-b border-industrial-concrete/20 hover:bg-industrial-copper-500/5 transition-colors cursor-pointer ${selectedBlobs.includes(blob.id) ? 'bg-industrial-copper-500/10' : ''}`}
                                    onClick={() => toggleBlob(blob.id)}
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedBlobs.includes(blob.id)}
                                            onChange={() => toggleBlob(blob.id)}
                                            className="bg-transparent border-industrial-steel-600 rounded-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td className="p-3 text-neutral-300 font-bold">{blob.file_name}</td>
                                    <td className="p-3 text-industrial-steel-500">{blob.file_name.split('.').pop()?.toUpperCase()}</td>
                                    <td className="p-3 text-industrial-steel-500 text-right">{(blob.size / 1024).toFixed(1)} KB</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-industrial-concrete">
                <div className="flex-1 flex items-center text-xs font-mono text-industrial-steel-400">
                    {selectedBlobs.length} files selected
                </div>
                <button
                    onClick={handleGetQuote}
                    disabled={selectedBlobs.length === 0 || submitting}
                    className="industrial-btn px-8 py-3 rounded-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {submitting ? (
                        <>
                            <span className="animate-spin">⟳</span> GENERATING QUOTE...
                        </>
                    ) : (
                        <>
                            <span>GET QUOTE</span>
                            <span>→</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const XometryPlugin: Plugin = {
    id: 'xometry-integration',
    name: 'Xometry Manufacturing',
    description: 'Get instant quotes for CNC machining, 3D printing, and sheet metal fabrication.',
    icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-2-1-2 1 2 1zm0-3.5L6 6l6 1.5L18 6l-6 1.5zM2 17l10 5 10-5V7l-10 5L2 7v10z"/>
        </svg>
    ),
    Component: XometryPluginComponent
};
