import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Home, Map as MapIcon, Activity } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: color + '20', color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1.2 }}>{value}</div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalWards: 0,
        totalUsers: 0,
        totalHouseholds: 0,
        activeAgents: 0
    });
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [wardsRes, statsRes] = await Promise.all([
                    api.get('/api/wards').catch(() => ({ data: { content: [] } })),
                    api.get('/api/admin/stats')
                ]);

                setStats({
                    totalWards: statsRes.data.totalWards,
                    totalUsers: statsRes.data.totalUsers,
                    totalHouseholds: statsRes.data.totalHouseholds,
                    activeAgents: statsRes.data.activeAgents
                });
                setWards(wardsRes.data.content || []);
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="fade-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>System Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Total Wards" value={stats.totalWards} icon={MapIcon} color="#2563eb" />
                <KPICard title="Total Users" value={stats.totalUsers} icon={Users} color="#059669" />
                <KPICard title="Total Households" value={stats.totalHouseholds} icon={Home} color="#7c3aed" />
                <KPICard title="Active Agents" value={stats.activeAgents} icon={Activity} color="#db2777" />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Management Console</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <a href="/admin/wards" style={{ textDecoration: 'none' }}>
                        <div className="card hover-scale" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '50%', color: '#2563eb' }}>
                                <MapIcon size={32} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Manage Wards</span>
                        </div>
                    </a>
                    <a href="/admin/ward-members" style={{ textDecoration: 'none' }}>
                        <div className="card hover-scale" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '50%', color: '#059669' }}>
                                <Users size={32} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Manage Ward Members</span>
                        </div>
                    </a>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Wards</h3>
                        <a href="/admin/wards" className="btn btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>View All</a>
                    </div>
                    <table style={{ fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--slate-500)' }}>
                                <th style={{ paddingBottom: '0.5rem' }}>Name</th>
                                <th style={{ paddingBottom: '0.5rem' }}>Local Body</th>
                                <th style={{ paddingBottom: '0.5rem' }}>Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wards.slice(0, 5).map(ward => (
                                <tr key={ward.id}>
                                    <td style={{ padding: '0.6rem 0' }}>{ward.name}</td>
                                    <td>{ward.localBody}</td>
                                    <td>{ward.totalHouses}</td>
                                </tr>
                            ))}
                            {wards.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No wards found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>System Health</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--slate-600)' }}>Database Status</span>
                            <span style={{ color: '#059669', fontWeight: 500, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>Healthy</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--slate-600)' }}>API Latency</span>
                            <span style={{ fontWeight: 500 }}>45ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--slate-600)' }}>Last Backup</span>
                            <span style={{ fontWeight: 500 }}>2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;
