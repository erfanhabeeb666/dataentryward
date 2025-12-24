import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Search, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HouseholdList = () => {
    const { wardId } = useParams();
    const { user } = useAuth();
    const [households, setHouseholds] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const isAgent = user.role === 'AGENT';

    useEffect(() => {
        loadData();
    }, [page, wardId]);

    const loadData = () => {
        setLoading(true);
        api.get(`/api/wards/${wardId}/households?page=${page}&size=10`)
            .then(res => {
                setHouseholds(res.data.content);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

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

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Household Registry</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Ward ID: {wardId}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isAgent && (
                        <button className="btn btn-primary" onClick={() => alert('Add Modal Placeholder')}>
                            <Plus size={18} /> Add Household
                        </button>
                    )}
                    {!isAgent && (
                        <>
                            <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                                <FileDown size={18} /> Excel
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
                                <FileDown size={18} /> PDF
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>House No</th>
                                <th>Address</th>
                                <th>Ration Card</th>
                                <th>Visit Status</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : households.map(h => (
                                <tr key={h.id}>
                                    <td style={{ fontWeight: 500 }}>{h.houseNumber}</td>
                                    <td>{h.fullAddress}</td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
                                            {h.rationCardType}
                                        </span>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{h.rationCardNumber}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            background: h.visitStatus === 'VISITED' ? 'var(--primary-100)' : '#fee2e2',
                                            color: h.visitStatus === 'VISITED' ? 'var(--primary-700)' : '#b91c1c'
                                        }}>
                                            {h.visitStatus}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                                        {new Date(h.updatedAt || h.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default HouseholdList;
