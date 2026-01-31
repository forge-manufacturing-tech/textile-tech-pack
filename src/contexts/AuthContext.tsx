import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ControllersAuthService } from '../api/generated';
import { OpenAPI } from '../api/generated/core/OpenAPI';

interface User {
    email: string;
    name: string;
    role?: string;
    pid?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    viewMode: 'designer' | 'manufacturer';
    lastLogin: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    setViewMode: (mode: 'designer' | 'manufacturer') => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const parsed = JSON.parse(jsonPayload);
        return parsed;
    } catch (e) {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [viewMode, setViewModeState] = useState<'designer' | 'manufacturer'>(() => {
        return (localStorage.getItem('view_mode') as 'designer' | 'manufacturer') || 'manufacturer';
    });
    const [lastLogin, setLastLogin] = useState<string | null>(localStorage.getItem('last_login'));

    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken) {
            if (storedUser) {
                try {
                    return JSON.parse(storedUser);
                } catch (e) {
                    localStorage.removeItem('user_data');
                }
            }

            const decoded = parseJwt(storedToken);
            return decoded ? {
                email: decoded.email || '',
                name: decoded.name || '',
                role: decoded.role || 'user',
                pid: decoded.pid || decoded.sub || ''
            } : { email: '', name: '' };
        }
        return null;
    });

    const [isLoading] = useState(false);

    useEffect(() => {
        if (token) {
            OpenAPI.TOKEN = token;
        } else {
            OpenAPI.TOKEN = undefined;
        }
    }, [token]);

    const setViewMode = (mode: 'designer' | 'manufacturer') => {
        localStorage.setItem('view_mode', mode);
        setViewModeState(mode);
    };

    const login = async (email: string, password: string) => {
        const response = await ControllersAuthService.login({ email, password });
        console.log('Login Response from Backend:', response);
        const newToken = response.token;
        const decoded = parseJwt(newToken);

        const newUser = {
            email,
            name: response.name,
            pid: response.pid,
            role: (response as any).role || decoded?.role || 'user'
        };

        const loginTime = new Date().toISOString();
        localStorage.setItem('token', newToken);
        localStorage.setItem('user_data', JSON.stringify(newUser));
        localStorage.setItem('last_login', loginTime);
        OpenAPI.TOKEN = newToken;

        setUser(newUser);
        setToken(newToken);
        setLastLogin(loginTime);
    };

    const register = async (email: string, password: string, name: string) => {
        await ControllersAuthService.register({ email, password, name });
        // The new spec implies register does not return a token, so we login.
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        OpenAPI.TOKEN = undefined;
    };

    return (
        <AuthContext.Provider value={{ user, token, viewMode, lastLogin, login, register, logout, setViewMode, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
