import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ role, isOpen, toggle }) => {
    const navigate = useNavigate();

    const menuItems = {
        'SUPER_ADMIN': [
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Wards', path: '/admin/wards' },
            { label: 'Users', path: '/admin/users' }
        ],
        'WARD_MEMBER': [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Households', path: '/households' },
            { label: 'My Agents', path: '/ward-agents' }
        ],
        'AGENT': [
            { label: 'My Wards', path: '/my-wards' },
        ]
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
            width: '260px',
            background: '#064e3b',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            transition: 'transform 0.3s ease',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#34d399' }}>Data</span>Ward
                </h2>
            </div>

            <nav style={{ flex: 1, padding: '2rem 1rem' }}>
                {menuItems[role]?.map((item, idx) => (
                    <div key={idx}
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: '12px 16px',
                            marginBottom: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: 'rgba(255,255,255,0.9)',
                            background: window.location.pathname.startsWith(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => {
                            if (!window.location.pathname.startsWith(item.path))
                                e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </nav>
        </div>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)' }}>
            <Sidebar role={user.role} isOpen={sidebarOpen} />

            <div style={{
                flex: 1,
                marginLeft: sidebarOpen ? '260px' : '0',
                transition: 'margin 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Navbar */}
                <header style={{
                    height: '64px',
                    background: 'white',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 900
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {user.role.replace('_', ' ')} Portal
                        </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={18} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
                        </div>
                        <button onClick={logout} style={{ color: 'var(--slate-400)', transition: 'color 0.2s' }} title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    <div className="container fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
