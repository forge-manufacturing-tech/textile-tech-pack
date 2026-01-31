import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ControllersSessionsService, ControllersProjectsService, SessionResponse } from '../api/generated';

interface SessionWithProject extends SessionResponse {
    projectName?: string;
    lifecycleStep?: string;
    lifecycleStepsCount?: number;
    lifecycleCurrentIndex?: number;
}

export function DesignerDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionWithProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const projects = await ControllersProjectsService.list();

            const allSessions: SessionWithProject[] = [];

            await Promise.all(projects.map(async (p) => {
                try {
                    const projectSessions = await ControllersSessionsService.list(p.id);
                    projectSessions.forEach(s => {
                        let lifecycleStep = 'Pending Initiation';
                        let lifecycleStepsCount = 0;
                        let lifecycleCurrentIndex = 0;

                        try {
                            if (s.content) {
                                const content = JSON.parse(s.content);
                                if (content.lifecycle && content.lifecycle.steps && content.lifecycle.steps.length > 0) {
                                    const steps = content.lifecycle.steps;
                                    const current = content.lifecycle.currentStep || 0;
                                    lifecycleStep = steps[current] || 'Completed';
                                    lifecycleStepsCount = steps.length;
                                    lifecycleCurrentIndex = current;
                                }
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }

                        allSessions.push({
                            ...s,
                            projectName: p.name,
                            lifecycleStep,
                            lifecycleStepsCount,
                            lifecycleCurrentIndex
                        });
                    });
                } catch (e) {
                    console.error(`Failed to load sessions for project ${p.id}`, e);
                }
            }));

            // Sort by updated_at desc
            allSessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setSessions(allSessions);

        } catch (error: any) {
            console.error('Failed to load dashboard data', error);
            if (error.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    const isRecentlyUpdated = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider animate-pulse">Scanning Global Operations...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 flex flex-col metal-texture">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-industrial-copper-500 flex items-center justify-center rounded-sm">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <h1 className="industrial-headline text-xl">DESIGNER <span className="text-industrial-steel-600 mx-2">//</span> DASHBOARD</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={logout} className="text-industrial-steel-500 hover:text-industrial-copper-500 text-xs font-mono uppercase">Logout</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-bold text-industrial-steel-500 uppercase tracking-widest font-mono">Active Sessions Overview</h2>
                        <div className="text-[10px] font-mono text-industrial-steel-600 uppercase">
                            {sessions.length} Operations Monitored
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-industrial-concrete rounded-sm bg-industrial-steel-900/30">
                            <p className="text-industrial-steel-500 font-mono text-sm uppercase tracking-widest">No Active Sessions Found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => navigate(`/projects/${session.project_id}`)}
                                    className="group relative industrial-panel p-6 text-left hover:border-industrial-copper-500 transition-all duration-300 flex flex-col h-64"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-industrial-steel-800 group-hover:bg-industrial-copper-500 transition-colors"></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-industrial-steel-500 group-hover:text-industrial-copper-500/80 transition-colors">
                                            {session.projectName || 'Unknown Project'}
                                        </span>
                                        {isRecentlyUpdated(session.updated_at) && (
                                            <span className="px-2 py-0.5 bg-industrial-copper-500/10 border border-industrial-copper-500/30 text-industrial-copper-500 text-[9px] font-mono uppercase tracking-wider rounded-sm animate-pulse">
                                                Updated
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-neutral-200 mb-2 line-clamp-2 group-hover:text-white transition-colors">
                                        {session.title || 'Untitled Session'}
                                    </h3>

                                    <div className="mt-auto space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono text-industrial-steel-400 mb-1 uppercase">
                                                <span>Current Phase</span>
                                                <span>{session.lifecycleCurrentIndex + 1} / {session.lifecycleStepsCount || 1}</span>
                                            </div>
                                            <div className="text-sm font-mono text-industrial-copper-500 truncate">
                                                {session.lifecycleStep}
                                            </div>
                                            {session.lifecycleStepsCount > 0 && (
                                                <div className="w-full h-1 bg-industrial-steel-800 mt-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-industrial-copper-500"
                                                        style={{ width: `${((session.lifecycleCurrentIndex + 1) / session.lifecycleStepsCount) * 100}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-industrial-concrete/30 flex justify-between items-center text-[10px] font-mono text-industrial-steel-500">
                                            <span>Last Update:</span>
                                            <span>{formatRelativeTime(session.updated_at)}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
