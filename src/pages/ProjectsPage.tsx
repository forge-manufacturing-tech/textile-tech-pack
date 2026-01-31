import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ControllersProjectsService, ProjectResponse } from '../api/generated';
import { useAuth } from '../contexts/AuthContext';

export function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await ControllersProjectsService.list();
            setProjects(data);
        } catch (error: any) {
            if (error.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ControllersProjectsService.create({
                name: newProjectName,
                description: newProjectDescription || undefined,
            });
            setShowCreateModal(false);
            setNewProjectName('');
            setNewProjectDescription('');
            loadProjects();
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const openProject = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await ControllersProjectsService.remove(projectId);
                loadProjects();
            } catch (error) {
                console.error('Failed to delete project:', error);
                alert('Failed to delete project');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 metal-texture">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="industrial-headline text-2xl">INTERLOCK</h1>
                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="text-sm text-industrial-copper-500 hover:text-industrial-copper-400 font-bold uppercase tracking-wider mr-4 transition-colors"
                            >
                                Admin Panel
                            </button>
                        )}
                        <span className="text-sm text-industrial-steel-400 font-mono">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-xs bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm transition-colors uppercase tracking-wide font-mono"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 scanlines">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="industrial-headline text-2xl mb-2">PROJECTS</h2>
                        <p className="text-industrial-steel-400 text-sm font-mono">Manage your workspaces</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 industrial-btn rounded-sm font-medium"
                    >
                        + New Project
                    </button>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="p-16 border border-dashed border-industrial-concrete bg-industrial-steel-900/20 text-center rounded-sm">
                        <p className="text-industrial-steel-500 text-sm uppercase tracking-widest font-bold">No projects found</p>
                        <p className="text-industrial-steel-600 text-xs mt-2 font-mono">Create your first project to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => openProject(project.id)}
                                className="industrial-card group flex items-center justify-between p-6 rounded-sm cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-industrial-steel-950 border border-industrial-concrete group-hover:border-industrial-copper-500/50 rounded-sm transition-colors">
                                        <svg className="w-6 h-6 text-industrial-steel-500 group-hover:text-industrial-copper-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-200 group-hover:text-industrial-copper-400 transition-colors tracking-wide">{project.name}</h3>
                                        <p className="text-sm text-industrial-steel-500 font-mono">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        className="p-2 text-industrial-steel-600 hover:text-red-500 transition-colors rounded-sm hover:bg-red-500/10"
                                        title="Delete Project"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                    <svg className="w-5 h-5 text-industrial-steel-600 group-hover:text-industrial-copper-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="industrial-panel rounded-sm p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="industrial-headline text-xl mb-4">Create New Project</h3>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required
                                    autoFocus
                                    placeholder="Enter project name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm resize-none"
                                    rows={3}
                                    placeholder="Enter description"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm transition-colors uppercase tracking-wide text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 industrial-btn rounded-sm"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
