import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { SessionResponse, BlobResponse, ControllersBlobsService } from '../api/generated';

interface BomSessionViewProps {
    session: SessionResponse;
    blobs: BlobResponse[];
    onRefresh: () => void;
}

export const BomSessionView: React.FC<BomSessionViewProps> = ({ session, blobs, onRefresh }) => {
    const [bomData, setBomData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Row Index -> Error Message
    const [analysisFlags, setAnalysisFlags] = useState<Record<number, string>>({});
    const [analysisStats, setAnalysisStats] = useState<string[]>([]);

    // Load existing BOM if present
    useEffect(() => {
        const bomFile = blobs.find(b =>
            b.file_name.toLowerCase().endsWith('.xlsx') ||
            b.file_name.toLowerCase().endsWith('.csv') ||
            b.file_name.toLowerCase().endsWith('.xls')
        );

        if (bomFile && bomData.length === 0) {
             const token = localStorage.getItem('token');
             fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${bomFile.id}/download`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             })
             .then(res => res.arrayBuffer())
             .then(buffer => {
                 const workbook = XLSX.read(buffer, { type: 'array' });
                 const sheetName = workbook.SheetNames[0];
                 const sheet = workbook.Sheets[sheetName];
                 const data = XLSX.utils.sheet_to_json(sheet);
                 const headerList = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

                 setBomData(data);
                 setHeaders(headerList || []);
             })
             .catch(err => console.error("Failed to load BOM:", err));
        }
    }, [blobs, bomData.length]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Parse Client Side
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            const headerList = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

            setBomData(data);
            setHeaders(headerList || []);
            setAnalysisFlags({});
            setAnalysisStats([]);

            // 2. Upload to Backend
            await ControllersBlobsService.upload(session.id, { file });
            onRefresh();

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to process file');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const analyzeBOM = () => {
        const flags: Record<number, string> = {};
        const stats: string[] = [];

        // Helper to find column loosely
        const findCol = (terms: string[]) => headers.find(h => terms.some(t => h.toLowerCase().includes(t.toLowerCase())));

        const mfrCol = findCol(['Manufacturer', 'Supplier', 'Vendor', 'Mfr']);
        const priceCol = findCol(['Price', 'Cost', 'Unit Cost', 'Unit Price']);

        // 1. Single Source / Dependency Analysis
        if (mfrCol) {
            const mfrCounts: Record<string, number> = {};
            let total = 0;
            bomData.forEach(row => {
                const mfr = String(row[mfrCol] || '').trim();
                if (mfr) {
                    mfrCounts[mfr] = (mfrCounts[mfr] || 0) + 1;
                    total++;
                }
            });

            const highDependencyMfrs: string[] = [];
            Object.entries(mfrCounts).forEach(([mfr, count]) => {
                const ratio = count / total;
                if (ratio > 0.4 && total > 5) {
                    highDependencyMfrs.push(mfr);
                    stats.push(`High Dependency: ${(ratio * 100).toFixed(1)}% of parts from "${mfr}".`);
                }
            });

            if (highDependencyMfrs.length > 0) {
                bomData.forEach((row, idx) => {
                    const mfr = String(row[mfrCol] || '').trim();
                    if (highDependencyMfrs.includes(mfr)) {
                        flags[idx] = (flags[idx] ? flags[idx] + " | " : "") + `Single Source Risk (${mfr})`;
                    }
                });
            }
        } else {
            stats.push("Warning: No Manufacturer column found.");
        }

        // 2. Price Analysis
        if (priceCol) {
            const prices: number[] = [];
            const validIndices: number[] = [];

            bomData.forEach((row, idx) => {
                const val = parseFloat(String(row[priceCol] || '').replace(/[^0-9.]/g, ''));
                if (!isNaN(val) && val > 0) {
                    prices.push(val);
                    validIndices.push(idx);
                } else {
                    flags[idx] = (flags[idx] ? flags[idx] + " | " : "") + "Missing Pricing";
                }
            });

            if (prices.length > 0) {
                const sum = prices.reduce((a, b) => a + b, 0);
                const mean = sum / prices.length;
                const sqDiff = prices.map(p => Math.pow(p - mean, 2));
                const avgSqDiff = sqDiff.reduce((a, b) => a + b, 0) / prices.length;
                const stdDev = Math.sqrt(avgSqDiff);

                stats.push(`Pricing Analysis: Mean ${mean.toFixed(2)}, StdDev ${stdDev.toFixed(2)}`);

                prices.forEach((price, i) => {
                    if (price > mean + (2 * stdDev)) {
                        const originalIdx = validIndices[i];
                        flags[originalIdx] = (flags[originalIdx] ? flags[originalIdx] + " | " : "") + `High Price Outlier ($${price})`;
                    }
                });
            }
        } else {
            stats.push("Warning: No Price column found.");
        }

        setAnalysisFlags(flags);
        setAnalysisStats(stats);
        if (Object.keys(flags).length === 0 && stats.length === 0) {
             setAnalysisStats(["No significant risks detected based on available data."]);
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-6 text-neutral-100 gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="industrial-headline text-2xl">BOM Inspection</h2>
                    {bomData.length > 0 && (
                        <div className="flex gap-2">
                             <div className="text-xs font-mono px-2 py-1 bg-industrial-steel-800 rounded-sm text-industrial-steel-400">
                                {bomData.length} Items
                            </div>
                            {Object.keys(analysisFlags).length > 0 && (
                                 <div className="text-xs font-mono px-2 py-1 bg-red-900/30 border border-red-500/30 rounded-sm text-red-400">
                                    {Object.keys(analysisFlags).length} Flags
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {bomData.length > 0 && (
                     <button
                        onClick={analyzeBOM}
                        className="industrial-btn px-6 py-2 text-xs flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        RUN INSPECTION
                    </button>
                )}
            </div>

            {analysisStats.length > 0 && (
                <div className="bg-industrial-steel-900/80 border border-industrial-concrete p-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-2">Inspection Report</h4>
                    <ul className="list-disc list-inside text-xs font-mono text-industrial-steel-300 space-y-1">
                        {analysisStats.map((stat, i) => <li key={i}>{stat}</li>)}
                    </ul>
                </div>
            )}

            {bomData.length === 0 ? (
                <div className="flex-1 border border-industrial-concrete bg-industrial-steel-900/50 rounded-sm p-12 flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-full border border-industrial-copper-500/30 flex items-center justify-center">
                        <svg className="w-10 h-10 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl industrial-headline mb-2">Upload Bill of Materials</h3>
                        <p className="font-mono text-industrial-steel-500 text-sm">Supports .xlsx, .xls, .csv</p>
                    </div>
                    <label className={`industrial-btn px-8 py-3 cursor-pointer flex items-center gap-3 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span>{uploading ? 'PROCESSING...' : 'SELECT FILE'}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx,.xls,.csv" />
                    </label>
                </div>
            ) : (
                <div className="flex-1 overflow-auto border border-industrial-concrete bg-industrial-steel-900/50 rounded-sm custom-scrollbar">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-industrial-steel-950 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b border-industrial-concrete w-10"></th>
                                {headers.map((h, i) => (
                                    <th key={i} className="p-3 border-b border-industrial-concrete text-industrial-steel-400 font-bold whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bomData.map((row, i) => {
                                const hasFlag = !!analysisFlags[i];
                                return (
                                    <tr key={i} className={`border-b border-industrial-concrete/20 hover:bg-white/5 transition-colors ${hasFlag ? 'bg-red-900/10' : ''}`}>
                                        <td className="p-2 border-r border-industrial-concrete/20 text-center">
                                            {hasFlag && (
                                                <div className="group relative">
                                                    <span className="text-red-500 cursor-help">⚠️</span>
                                                    <div className="absolute left-6 top-0 w-48 p-2 bg-black border border-red-500 text-red-500 text-[10px] z-50 rounded shadow-xl hidden group-hover:block">
                                                        {analysisFlags[i]}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        {headers.map((h, j) => (
                                            <td key={j} className={`p-2 border-r border-industrial-concrete/20 last:border-0 whitespace-nowrap ${hasFlag ? 'text-red-200' : 'text-industrial-steel-300'}`}>
                                                {row[h]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
