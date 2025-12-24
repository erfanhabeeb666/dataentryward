import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const MyWards = () => {
    const [wards, setWards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/my-wards').then(res => setWards(res.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Assigned Wards</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {wards.map(ward => (
                    <div key={ward.id} className="card" style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ward.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', display: 'block' }}>
                                        {ward.localBody}
                                    </span>
                                </div>
                                <div style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    ID: {ward.id}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: 'var(--slate-50)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                                Target: {ward.totalHouses} Houses
                            </span>
                            <button
                                onClick={() => navigate(`/wards/${ward.id}/households`)}
                                className="btn btn-primary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                            >
                                Enter Data <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWards;
