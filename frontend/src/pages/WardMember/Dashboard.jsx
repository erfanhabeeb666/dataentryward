import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Home, Activity, AlertCircle } from 'lucide-react';

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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Hardcoded ward ID for demo since user usually has 1 ward. Real app would select.
    const wardId = 1;

    useEffect(() => {
        api.get(`/api/wards/${wardId}/dashboard`)
            .then(res => { setData(res.data); setLoading(false); })
            .catch(console.error);
    }, []);

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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Ward Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Total Households" value={data.totalHouseholds} icon={Home} color="#2563eb" />
                <KPICard title="Population" value={data.totalPopulation} icon={Users} color="#059669" />
                <KPICard title="Reviewed" value={data.visitedHouseholds} icon={Activity} color="#7c3aed" />
                <KPICard title="Vulnerable" value={data.seniorCitizens + data.disabledPersons} icon={AlertCircle} color="#db2777" />
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
