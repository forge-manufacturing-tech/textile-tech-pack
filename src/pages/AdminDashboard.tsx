import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ControllersAdminService, ControllersAuthService, UserResponse } from '../api/generated';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Form states
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [resetPasswordValue, setResetPasswordValue] = useState('');

    const { logout, user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await ControllersAdminService.listUsers();
            setUsers(data);
        } catch (error: any) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (userId: string) => {
        try {
            await ControllersAdminService.promote(userId);
            loadUsers();
        } catch (error) {
            console.error('Failed to promote user', error);
            alert('Failed to promote user');
        }
    };

    const handleDemote = async (userId: string) => {
        if (confirm('Are you sure you want to demote this admin?')) {
            try {
                await ControllersAdminService.demote(userId);
                loadUsers();
            } catch (error) {
                console.error('Failed to demote user', error);
                alert('Failed to demote user');
            }
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ControllersAuthService.register({
                email: newUserEmail,
                name: newUserName,
                password: newUserPassword
            });
            setShowAddUserModal(false);
            setNewUserEmail('');
            setNewUserName('');
            setNewUserPassword('');
            loadUsers();
            alert('User added successfully');
        } catch (error) {
            console.error('Failed to add user', error);
            alert('Failed to add user');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            await ControllersAdminService.resetPassword(selectedUser.pid, {
                password: resetPasswordValue
            });
            setShowResetModal(false);
            setResetPasswordValue('');
            setSelectedUser(null);
            alert('Password reset successfully');
        } catch (error) {
            console.error('Failed to reset password', error);
            alert('Failed to reset password');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUserIds(users.map(u => u.pid));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            await ControllersAdminService.deleteUser(userId);
            setSelectedUserIds(prev => prev.filter(id => id !== userId));
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            alert('Failed to delete user');
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} users? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete sequentially to avoid overwhelming the server (or parallel if preferred)
            // Using Promise.all for parallel deletion as it's usually better for UX if server handles it
            await Promise.all(selectedUserIds.map(id => ControllersAdminService.deleteUser(id)));
            setSelectedUserIds([]);
            loadUsers();
            alert('Users deleted successfully');
        } catch (error) {
            console.error('Failed to delete users', error);
            alert('Failed to delete some users');
            loadUsers(); // Reload to see who was deleted
        }
    };

    const openResetModal = (user: UserResponse) => {
        setSelectedUser(user);
        setShowResetModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading Users...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 metal-texture">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="industrial-headline text-2xl cursor-pointer" onClick={() => navigate('/dashboard')}>INTERLOCK</h1>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-industrial-copper-900 text-industrial-copper-400 border border-industrial-copper-700/50 uppercase tracking-wider">Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-sm text-industrial-steel-400 hover:text-industrial-copper-400 font-mono transition-colors"
                        >
                            Back to Projects
                        </button>
                        <span className="text-sm text-industrial-steel-400 font-mono">{currentUser?.email}</span>
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
                        <h2 className="industrial-headline text-2xl mb-2">USER MANAGEMENT</h2>
                        <p className="text-industrial-steel-400 text-sm font-mono">System administration and user control</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedUserIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-6 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-800 text-red-200 rounded-sm font-medium transition-colors uppercase tracking-wide text-sm"
                            >
                                Delete Selected ({selectedUserIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="px-6 py-2 industrial-btn rounded-sm font-medium"
                        >
                            + Add User
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="industrial-panel overflow-hidden rounded-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-industrial-steel-900 border-b border-industrial-concrete text-xs uppercase tracking-wider text-industrial-steel-400">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={users.length > 0 && selectedUserIds.length === users.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-industrial-concrete bg-industrial-steel-800 text-industrial-copper-500 focus:ring-industrial-copper-500/50"
                                    />
                                </th>
                                <th className="p-4 font-mono">Name</th>
                                <th className="p-4 font-mono">Email</th>
                                <th className="p-4 font-mono">Role</th>
                                <th className="p-4 font-mono">Status</th>
                                <th className="p-4 font-mono text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-industrial-concrete/30">
                            {users.map((u) => (
                                <tr key={u.pid} className="hover:bg-industrial-steel-800/50 transition-colors">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(u.pid)}
                                            onChange={() => handleSelectUser(u.pid)}
                                            className="rounded border-industrial-concrete bg-industrial-steel-800 text-industrial-copper-500 focus:ring-industrial-copper-500/50"
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-neutral-200">{u.name}</td>
                                    <td className="p-4 font-mono text-sm text-industrial-steel-400">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-sm uppercase tracking-wide font-bold ${
                                            u.role === 'admin'
                                                ? 'bg-industrial-copper-900/50 text-industrial-copper-400 border border-industrial-copper-900'
                                                : 'bg-industrial-steel-800 text-industrial-steel-400 border border-industrial-steel-700'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-industrial-steel-500">
                                        Active
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => openResetModal(u)}
                                            className="px-3 py-1 text-xs bg-industrial-steel-800 hover:bg-industrial-steel-700 text-industrial-steel-300 border border-industrial-concrete rounded-sm transition-colors uppercase"
                                        >
                                            Reset Password
                                        </button>
                                        {u.role !== 'admin' ? (
                                            <button
                                                onClick={() => handlePromote(u.pid)}
                                                className="px-3 py-1 text-xs bg-industrial-steel-800 hover:bg-green-900/30 hover:text-green-400 text-industrial-steel-300 border border-industrial-concrete hover:border-green-800/50 rounded-sm transition-colors uppercase"
                                            >
                                                Promote
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDemote(u.pid)}
                                                className="px-3 py-1 text-xs bg-industrial-steel-800 hover:bg-red-900/30 hover:text-red-400 text-industrial-steel-300 border border-industrial-concrete hover:border-red-800/50 rounded-sm transition-colors uppercase"
                                            >
                                                Demote
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(u.pid)}
                                            className="px-3 py-1 text-xs bg-industrial-steel-800 hover:bg-red-900/30 hover:text-red-400 text-industrial-steel-300 border border-industrial-concrete hover:border-red-800/50 rounded-sm transition-colors uppercase"
                                            title="Delete User"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    onClick={() => setShowAddUserModal(false)}
                >
                    <div
                        className="industrial-panel rounded-sm p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="industrial-headline text-xl mb-4">Add New User</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm transition-colors uppercase tracking-wide text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 industrial-btn rounded-sm"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && selectedUser && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    onClick={() => setShowResetModal(false)}
                >
                    <div
                        className="industrial-panel rounded-sm p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="industrial-headline text-xl mb-4">Reset Password</h3>
                        <p className="text-industrial-steel-400 text-sm mb-4 font-mono">
                            Resetting password for: <span className="text-white">{selectedUser.name}</span>
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={resetPasswordValue}
                                    onChange={(e) => setResetPasswordValue(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required
                                    placeholder="Enter new password"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm transition-colors uppercase tracking-wide text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 industrial-btn rounded-sm"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
