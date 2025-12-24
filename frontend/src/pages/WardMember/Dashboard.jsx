import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Home, Activity, AlertCircle, FileDown } from 'lucide-react';

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

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Use first assigned ward or fallback to 1 if none found (fallback for older tokens or edge cases)
    const wardId = (user?.wardIds && user.wardIds.length > 0) ? user.wardIds[0] : 1;

    useEffect(() => {
        if (wardId) {
            api.get(`/api/wards/${wardId}/dashboard`)
                .then(res => { setData(res.data); setLoading(false); })
                .catch(err => {
                    console.error("Dashboard fetch error:", err);
                    setLoading(false);
                });
        }
    }, [wardId]);

    const handleExport = (type) => {
        const url = `/api/wards/${wardId}/export/${type}`;
        api.get(url, { responseType: 'blob' }).then((response) => {
            const href = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', `ward_${wardId}_data.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    if (loading) return <div className="fade-in">Loading Dashboard...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const genderData = [
        { name: 'Male', value: data.maleCount },
        { name: 'Female', value: data.femaleCount },
        { name: 'Other', value: data.otherGenderCount },
    ];

    const rationData = [
        { name: 'APL', count: data.aplCount },
        { name: 'BPL', count: data.bplCount },
        { name: 'AAY', count: data.aayCount },
    ];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Ward Overview</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                        <FileDown size={18} /> Export Excel
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
                        <FileDown size={18} /> Export PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Total Households" value={data.totalHouseholds} icon={Home} color="#2563eb" />
                <KPICard title="Population" value={data.totalPopulation} icon={Users} color="#059669" />
                <KPICard title="Reviewed" value={data.visitedHouseholds} icon={Activity} color="#7c3aed" />
                <KPICard title="Vulnerable" value={data.seniorCitizens + data.disabledPersons} icon={AlertCircle} color="#db2777" />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <a href="/ward-member/agents" style={{ textDecoration: 'none' }}>
                        <div className="card hover-scale" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '50%', color: '#2563eb' }}>
                                <Users size={32} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Manage Agents</span>
                        </div>
                    </a>
                    <a href={`/ward-member/ward/${wardId}/households`} style={{ textDecoration: 'none' }}>
                        <div className="card hover-scale" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '50%', color: '#059669' }}>
                                <Home size={32} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Manage Households</span>
                        </div>
                    </a>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Ration Card Distribution</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={rationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Gender Composition</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                            {genderData.map((entry, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: 10, height: 10, background: COLORS[index] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
