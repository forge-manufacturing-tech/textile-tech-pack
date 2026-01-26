import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ControllersSessionsService, ControllersProjectsService, ControllersChatService, ControllersBlobsService, SessionResponse, ProjectResponse, BlobResponse, MessageResponse } from '../api/generated';
import { useAuth } from '../contexts/AuthContext';

export function SessionsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);

    // BOM Converter State
    const [blobs, setBlobs] = useState<BlobResponse[]>([]);
    const [blobsLoading, setBlobsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [processing, setProcessing] = useState(false);
    const [targetColumns, setTargetColumns] = useState('Part Number, Description, Quantity, Manufacturer, Price');
    const [systemLogOpen, setSystemLogOpen] = useState(false);

    const { logout } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (projectId) {
            loadProjectAndSessions();
        }
    }, [projectId]);

    // Session Switch
    useEffect(() => {
        if (selectedSession) {
            loadSessionData(selectedSession.id);
        } else {
            setBlobs([]);
            setMessages([]);
        }
    }, [selectedSession]);

    // Scroll Log
    useEffect(() => {
        if (messagesEndRef.current && systemLogOpen) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, systemLogOpen]);

    const loadProjectAndSessions = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [projectData, sessionsData] = await Promise.all([
                ControllersProjectsService.getOne(projectId),
                ControllersSessionsService.list(projectId),
            ]);
            setProject(projectData);
            setSessions(sessionsData);
        } catch (error: any) {
            if (error.status === 401) logout();
            else if (error.status === 403 || error.status === 404) navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const loadSessionData = async (sessionId: string) => {
        try {
            setBlobsLoading(true);
            const [blobsData, messagesData] = await Promise.all([
                ControllersBlobsService.list(sessionId),
                ControllersChatService.listMessages(sessionId)
            ]);
            setBlobs(blobsData);
            setMessages(messagesData);

            // Auto-open log if there are messages but no result file yet? 
            // Or just if actively processing.
        } catch (error) {
            console.error('Failed to load session data:', error);
        } finally {
            setBlobsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSession) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/blobs`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Upload failed');

            // Refresh
            const newBlobs = await ControllersBlobsService.list(selectedSession.id);
            setBlobs(newBlobs);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleConvert = async () => {
        if (!selectedSession || processing) return;

        setProcessing(true);
        setSystemLogOpen(true);

        const prompt = `
[SYSTEM: BOM_CONVERSION_REQUEST]
TARGET_COLUMNS: ${targetColumns}
INSTRUCTION: 
1. Analyze the uploaded BOM file(s).
2. Create a standardized Excel/CSV file containing exactly the target columns.
3. Map existing data to these columns. If data is missing, mark as "N/A" or intelligently infer.
4. If ambiguous, ask for clarification.
5. Return the file when ready.
`;

        try {
            // Optimistic update
            const tempMsg: MessageResponse = {
                id: crypto.randomUUID(),
                session_id: selectedSession.id,
                role: 'user',
                content: prompt,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);

            await ControllersChatService.chat(selectedSession.id, { message: prompt });

            // Poll for response (Simple implementation for now)
            await pollForResponse(selectedSession.id);

        } catch (error) {
            console.error('Conversion trigger failed:', error);
            alert('Failed to start conversion');
        } finally {
            setProcessing(false);
        }
    };

    const pollForResponse = async (sessionId: string) => {
        // Poll a few times to get the AI response and any new files
        // In a real app, use websockets or longer polling
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000));
            const [newMessages, newBlobs] = await Promise.all([
                ControllersChatService.listMessages(sessionId),
                ControllersBlobsService.list(sessionId)
            ]);

            setMessages(newMessages);
            setBlobs(newBlobs);

            // If AI has responded (last message is assistant), we can stop "hard" polling
            // But we might want to continue if it's a multi-step thing.
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                break;
            }
            attempts++;
        }
    };

    const handleDownload = async (blob: BlobResponse) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${blob.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed');
            const blobData = await response.blob();
            const url = window.URL.createObjectURL(blobData);
            const a = document.createElement('a');
            a.href = url;
            a.download = blob.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    // --- Renders ---

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full p-12 border-2 border-dashed border-industrial-concrete bg-industrial-steel-900/20 rounded-sm group hover:border-industrial-copper-500/50 transition-colors">
            <svg className="w-24 h-24 text-industrial-steel-600 mb-6 group-hover:text-industrial-copper-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="industrial-headline text-2xl mb-2 text-center">Upload Source BOM</h3>
            <p className="text-industrial-steel-400 font-mono text-sm mb-8 text-center max-w-md">
                Initialize session by uploading your raw materials list.
                Supported formats: .xlsx, .csv, .pdf
            </p>
            <label className="industrial-btn px-8 py-3 cursor-pointer">
                <span>Select File</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {uploading && <div className="mt-4 text-industrial-copper-500 font-mono text-xs uppercase animate-pulse">Uploading...</div>}
        </div>
    );

    const renderWorkbench = () => {
        return (
            <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-8 gap-8">
                {/* Top Section: Control Panel */}
                <div className="industrial-panel p-8 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <div className="text-[120px] font-black font-mono leading-none">BOM</div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Source Files List */}
                        <div className="flex-1 w-full">
                            <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest mb-4 font-mono">Input Sources</h3>
                            <div className="space-y-2 mb-4">
                                {blobs.map(blob => (
                                    <div key={blob.id} className="flex items-center justify-between p-3 bg-industrial-steel-950/50 border border-industrial-concrete rounded-sm">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div>
                                                <div className="text-sm font-bold text-neutral-200">{blob.file_name}</div>
                                                <div className="text-[10px] text-industrial-steel-500 font-mono uppercase">{(blob.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDownload(blob)} className="text-industrial-steel-500 hover:text-industrial-copper-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <label className="flex items-center justify-center p-3 border border-dashed border-industrial-concrete hover:border-industrial-copper-500/50 rounded-sm cursor-pointer transition-colors group">
                                    <span className="text-xs font-mono text-industrial-steel-500 group-hover:text-industrial-copper-500 uppercase">+ Add Source File</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="flex-1 w-full border-l border-industrial-concrete md:pl-8">
                            <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest mb-4 font-mono">Target Spec</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-industrial-steel-500 font-mono uppercase mb-1">Required Columns</label>
                                    <textarea
                                        value={targetColumns}
                                        onChange={(e) => setTargetColumns(e.target.value)}
                                        className="w-full h-24 industrial-input p-3 text-sm rounded-sm resize-none"
                                        placeholder="Comma separated list of columns..."
                                    />
                                </div>
                                <button
                                    onClick={handleConvert}
                                    disabled={processing || blobs.length === 0}
                                    className={`w-full py-4 industrial-btn flex items-center justify-center gap-2 text-sm tracking-widest ${processing ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {processing ? (
                                        <>
                                            <span className="animate-spin text-xl">⟳</span> PROCESSING
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-lg">⚡</span> INITIALIZE CONVERSION
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Log / Terminal */}
                <div className={`industrial-panel flex-1 flex flex-col min-h-[300px] transition-all duration-300 ${systemLogOpen ? 'flex-grow' : 'h-16 overflow-hidden'}`}>
                    <div
                        onClick={() => setSystemLogOpen(!systemLogOpen)}
                        className="p-3 bg-industrial-steel-900 border-b border-industrial-concrete flex items-center justify-between cursor-pointer hover:bg-industrial-steel-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${processing ? 'bg-industrial-alert animate-pulse' : 'bg-industrial-steel-500'}`} />
                            <span className="text-xs font-bold font-mono uppercase text-industrial-steel-300">System Log</span>
                        </div>
                        <span className="text-[10px] font-mono text-industrial-steel-500">{systemLogOpen ? '[COLLAPSE]' : '[EXPAND]'}</span>
                    </div>

                    <div className="flex-1 bg-black p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2">
                        {messages.length === 0 ? (
                            <div className="text-industrial-steel-600 italic"> System ready. Awaiting initialization... </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className={`${msg.role === 'user' ? 'text-industrial-copper-500' : 'text-green-500/80'}`}>
                                    <span className="opacity-50 mr-2">[{new Date(msg.created_at).toLocaleTimeString()}]</span>
                                    <span className="font-bold mr-2">{msg.role === 'user' ? '>' : '#'}</span>
                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Terminal Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!processing && selectedSession) {
                                const form = e.target as HTMLFormElement;
                                const input = form.elements.namedItem('termInput') as HTMLInputElement;
                                if (input.value.trim()) {
                                    const msg = input.value.trim();
                                    setMessages(prev => [...prev, {
                                        id: crypto.randomUUID(),
                                        session_id: selectedSession.id,
                                        role: 'user',
                                        content: msg,
                                        created_at: new Date().toISOString()
                                    }]);
                                    ControllersChatService.chat(selectedSession.id, { message: msg })
                                        .then(() => pollForResponse(selectedSession.id));
                                    input.value = '';
                                }
                            }
                        }}
                        className="p-2 bg-industrial-steel-900 border-t border-industrial-concrete flex gap-2"
                    >
                        <span className="text-industrial-copper-500 font-mono font-bold">{'>'}</span>
                        <input
                            name="termInput"
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-industrial-copper-500 placeholder-industrial-steel-700"
                            placeholder="Type command or reply..."
                            autoComplete="off"
                        />
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider animate-pulse">Initializing Core...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 flex flex-col metal-texture">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-industrial-steel-400 hover:text-industrial-copper-500 transition-colors font-mono text-sm uppercase">← Back</button>
                        <h1 className="industrial-headline text-xl">{project?.name} <span className="text-industrial-steel-600 mx-2">//</span> BOM CONVERTER</h1>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 industrial-btn rounded-sm text-xs">+ New Session</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Minimal History Sidebar */}
                <div className="w-64 border-r border-industrial-concrete bg-industrial-steel-900/50 hidden lg:block overflow-y-auto scanlines">
                    <div className="p-4">
                        <h2 className="text-[10px] font-bold text-industrial-steel-500 uppercase tracking-widest mb-4 font-mono">History</h2>
                        {sessions.length === 0 ? (
                            <div className="text-center py-8 text-industrial-steel-500 text-xs font-mono italic">
                                No history
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {sessions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSession(s)}
                                        className={`w-full text-left p-2 rounded-sm text-xs font-mono truncate transition-all ${selectedSession?.id === s.id
                                            ? 'bg-industrial-copper-500/10 text-industrial-copper-500 border-l-2 border-industrial-copper-500'
                                            : 'text-industrial-steel-400 hover:bg-industrial-steel-800'
                                            }`}
                                    >
                                        {s.title || 'Untitled Operation'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-industrial-steel-950 overflow-y-auto relative">
                    {!selectedSession ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-industrial-steel-500">
                                <p className="font-mono uppercase tracking-wide text-sm">Select or Create a Session to Begin</p>
                            </div>
                        </div>
                    ) : blobs.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        renderWorkbench()
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="industrial-panel rounded-sm p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="industrial-headline text-xl mb-4">New Operation</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!projectId) return;
                            ControllersSessionsService.add({ title: newSessionTitle, content: '', project_id: projectId })
                                .then(() => {
                                    setShowCreateModal(false);
                                    setNewSessionTitle('');
                                    loadProjectAndSessions();
                                });
                        }} className="space-y-4">
                            <input
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                className="w-full px-4 py-2 industrial-input rounded-sm"
                                placeholder="Operation Name"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 rounded-sm font-bold text-xs uppercase">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 industrial-btn rounded-sm text-xs">Initialize</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
