import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SessionsPage } from './pages/SessionsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DesignerDashboard } from './pages/DesignerDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    return token ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { token, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    if (!token) return <Navigate to="/login" />;

    if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    // Don't redirect here - let the LoginPage handle navigation via useEffect
    return <>{children}</>;
}

function DashboardRedirect() {
    const { viewMode } = useAuth();

    if (viewMode === 'designer') {
        return <Navigate to="/designer" />;
    }

    return <ProjectsPage />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <HomePage />
                    </PublicRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardRedirect />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer"
                element={
                    <ProtectedRoute>
                        <DesignerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects/:projectId"
                element={
                    <ProtectedRoute>
                        <SessionsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
