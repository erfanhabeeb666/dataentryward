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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we don't have a direct aggregation API for Admin implemented yet, 
        // we will fetch lists to count for now or mock if necessary.
        // Ideally: api.get('/api/admin/stats')

        Promise.all([
            api.get('/api/wards').catch(() => ({ data: { content: [] } })),
            // Add user list fetch if available, or just mock for UI skeleton
        ]).then(([wardsRes]) => {
            setStats({
                totalWards: wardsRes.data.content ? wardsRes.data.content.length : 0,
                totalUsers: 12, // Mocked for UI demo until API ready
                totalHouseholds: 1543, // Mocked
                activeAgents: 8 // Mocked
            });
            setLoading(false);
        });
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Wards</h3>
                        <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>View All</button>
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
                            <tr>
                                <td style={{ padding: '0.6rem 0' }}>Ward 1 (North)</td>
                                <td>Municipality</td>
                                <td>450</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '0.6rem 0' }}>Ward 2 (South)</td>
                                <td>Panchayat</td>
                                <td>320</td>
                            </tr>
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
        </div>
    );
};

export default AdminDashboard;
