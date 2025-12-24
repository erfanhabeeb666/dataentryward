import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
            { label: 'Households', path: '/ward-member/households' },
            { label: 'My Agents', path: '/ward-member/agents' }
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
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#34d399' }}>Data</span>Ward
                </h2>
                <button className="mobile-only" onClick={toggle} style={{ background: 'transparent', color: 'white' }}>
                    <X size={24} />
                </button>
            </div>

            <nav style={{ flex: 1, padding: '2rem 1rem' }}>
                {menuItems[role]?.map((item, idx) => (
                    <div key={idx}
                        onClick={() => {
                            navigate(item.path);
                            if (window.innerWidth <= 768) toggle();
                        }}
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
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

    // Close sidebar on window resize if it's mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) return null;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)' }}>
            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={toggleSidebar}
            />

            <Sidebar role={user.role} isOpen={sidebarOpen} toggle={toggleSidebar} />

            <div className="main-content" style={{
                flex: 1,
                marginLeft: sidebarOpen && window.innerWidth > 768 ? '260px' : '0',
                transition: 'margin 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}>
                {/* Navbar */}
                <header className="navbar" style={{
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
                        <button
                            onClick={toggleSidebar}
                            style={{
                                background: 'transparent',
                                color: 'var(--slate-600)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Menu size={24} />
                        </button>
                        <h3 className="desktop-only" style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {user.role.replace('_', ' ')} Portal
                        </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)' }}>
                            <div className="desktop-only" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={18} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                <span className="desktop-only">Welcome, </span>{user.name}
                            </span>
                        </div>
                        <button onClick={logout} style={{ color: 'var(--slate-400)', transition: 'color 0.2s', padding: '8px' }} title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <main style={{ padding: '1.5rem', flex: 1, overflowX: 'hidden' }}>
                    <div className="container fade-in" style={{ padding: 0 }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
